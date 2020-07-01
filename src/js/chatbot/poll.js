const database     = require('./database');
const moment       = require('moment');
const {v4: uuidv4} = require('uuid');

const poll = {
    addPoll: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let time = moment().unix();
            let values = {
                channelId: chatbot.channels[args.channel].id,
                raffleId: args.poll.raffleId,
                audioId: typeof args.poll.audio.id === 'number' && args.poll.audio.id > 0 ? args.poll.audio.id : null,
                name: args.poll.name,
                active: true,
                multipleChoice: args.poll.multipleChoice,
                start: args.poll.start,
                end: args.poll.end,
                audioVolume: typeof args.poll.audio.volume === 'number' ? args.poll.audio.volume : 50,
                updatedAt: time,
                createdAt: time
            };

            database.insert('poll', [values], function(insert) {
                values = [];
                for (let i = 0; i < args.poll.options.length; i++) {
                    values.push({
                        pollId: insert.lastID,
                        name: args.poll.options[i],
                        updatedAt: time,
                        createdAt: time
                    });
                }
                database.insert('option', values, function(insertOption) {
                    poll.getActivePoll(chatbot, args);

                    if (typeof args.poll.raffleId === 'number') {
                        let from = 'raffle';
                        let set = {
                            keyword: null
                        };
                        let where = [`id = ${args.poll.raffleId}`];

                        database.update(from, set, where, function(update) {
                            chatbot.getActiveRaffle(chatbot, args);
                        });
                    }
                });
                console.log(`* Added poll "${args.poll.name}"`);
            });
        }
    },
    addUserChoice: function(chatbot, args) {
        if (typeof chatbot.activePolls[args.channel].options[args.choice - 1] !== 'undefined') {
            let select = 'uc.uuid';
            let from = 'poll AS p';
            let join = 'JOIN user_choice AS uc ON p.id = uc.poll_id';
            let where = ['poll_id = ?', 'user_id = ?'];
            let prepare = [
                chatbot.activePolls[args.channel].id,
                args.userstate['user-id']
            ];

            if (chatbot.activePolls[args.channel].multipleChoice) {
                where.push('option_id = ?');
                prepare.push(chatbot.activePolls[args.channel].options[args.choice - 1].id);
            }

            if (chatbot.activePolls[args.channel].raffleId) {
                chatbot.addAttendee(chatbot, args);
            }

            database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
                // If the user has not yet selected an option
                if (!rows.length) {
                    let time = moment().unix();
                    let values = {
                        uuid: uuidv4(),
                        pollId: chatbot.activePolls[args.channel].id,
                        optionId: chatbot.activePolls[args.channel].options[args.choice - 1].id,
                        userId: args.userstate['user-id'],
                        updatedAt: time,
                        createdAt: time
                    };

                    database.insert('user_choice', [values], function(insert) {
                        poll.getActivePoll(chatbot, args);
                    });
                }
            });
        }
    },
    announcePollToChat: function(chatbot, args) {
        if (typeof chatbot.activePolls[args.channel].id !== 'undefined') {
            let name = chatbot.activePolls[args.channel].name;
            let raffle = chatbot.activePolls[args.channel].raffleId ? ' | Raffle: ' + chatbot.activePolls[args.channel].raffleName : '';
            let multipleChoice = chatbot.activePolls[args.channel].multipleChoice ? 'Yes' : 'No';
            let options = chatbot.activePolls[args.channel].options;
            let results =  '';

            for (var i = 0; i < options.length; i++) {
                results += ` !vote ${i + 1} - ${options[i].name} |`;
            }

            chatbot.client.say('#' + args.channel, `Poll: ${name} |${results} Multiple Choice: ${multipleChoice}${raffle}`);
        }
    },
    closePoll: function(chatbot, args) {
        if (typeof chatbot.activePolls[args.channel].id !== 'undefined') {
            let from = 'poll';
            let set = {
                active: false,
                end: moment().unix(),
                updatedAt: moment().unix()
            };
            let where = [`id = ${chatbot.activePolls[args.channel].id}`];

            database.update(from, set, where, function(update) {
                poll.getActivePoll(chatbot, args);
                poll.getPolls(chatbot, args);
            });
        }
    },
    getActivePoll: function(chatbot, args) {
        let select = 'p.id, p.name, p.active, p.multiple_choice, p.start, p.end, p.updated_at, p.created_at, o.id AS o_id, o.name AS o_name, winner, COUNT(uc.option_id) AS o_votes, ';
        select += 'pa.id AS pa_id, pa.name AS pa_name, pa.file AS pa_file, pa.duration AS pa_duration, p.audio_volume AS pa_volume, ';
        select += 'pr.id AS pr_id, pr.name AS pr_name, ';
        //select += 'oa.id AS oa_id, oa.name AS oa_name, oa.file AS oa_file, oa.duration AS oa_duration, o.audio_volume AS oa_volume, ';
        select += '(SELECT COUNT(*) FROM (SELECT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_votes, ';
        select += '(SELECT COUNT(*) FROM (SELECT DISTINCT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_attendees, ';
        select += 'CASE WHEN COUNT(uc.option_id) > 0 THEN ROUND((COUNT(uc.option_id) + 0.0) / (SELECT COUNT(uc.poll_id) AS uc_amount '; // case first line
        select += 'FROM user_choice AS uc WHERE uc.poll_id = p.id GROUP BY uc.poll_id) * 100, 0) ELSE 0.0 END AS o_avg'; // case last line
        let from = 'poll AS p';
        let join = 'JOIN option AS o ON p.id = o.poll_id ';
        join += 'LEFT JOIN user_choice AS uc ON o.id = uc.option_id ';
        join += 'LEFT JOIN raffle AS pr ON p.raffle_id = pr.id ';
        join += 'LEFT JOIN audio AS pa ON p.audio_id = pa.id ';
        //join += 'LEFT JOIN audio AS oa ON o.audio_id = oa.id';
        let where = ['p.active = ?', 'p.channel_id = ?'];
        let group = 'o.name';
        let order = 'p.created_at DESC, o.id';
        let prepare = [1, chatbot.channels[args.channel].id];

        database.find(select, from, join, where, group, order, 0, prepare, function(rows) {
            chatbot.activePolls[args.channel] = {};

            // if active poll found
            if (rows.length) {
                chatbot.activePolls[args.channel] = {
                    id: rows[0].id,
                    raffleId: rows[0].pr_id,
                    raffleName: rows[0].pr_name,
                    name: rows[0].name,
                    active: true,
                    multipleChoice: !!rows[0].multiple_choice,
                    start: rows[0].start,
                    end: rows[0].end,
                    votes: rows[0].uc_votes,
                    attendees: rows[0].uc_attendees,
                    updatedAt: rows[0].updated_at,
                    createdAt: rows[0].created_at,
                    options: [],
                    audio: {
                        id: rows[0].pa_id,
                        name: rows[0].pa_name,
                        file: rows[0].pa_file,
                        type: rows[0].pa_type,
                        duration: rows[0].pa_duration,
                        volume: rows[0].pa_volume
                    }
                };

                for (let i = 0; i < rows.length; i++) {
                    chatbot.activePolls[args.channel].options.push({
                        id: rows[i].o_id,
                        name: rows[i].o_name,
                        winner: !!rows[i].winner,
                        votes: rows[i].o_votes,
                        average: rows[i].o_avg
                    });
                }
            }

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        poll: chatbot.activePolls[args.channel]
                    },
                    method: 'setActivePoll',
                    ref: 'poll',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));

                if (chatbot.socketPoll !== null) {
                    chatbot.socketPoll.write(JSON.stringify(call));
                }
            }
        });
    },
    getPolls: function(chatbot, args) {
        let select = 'p.id, p.name, p.active, p.multiple_choice, p.start, p.end, p.updated_at, p.created_at, o.id AS o_id, o.name AS o_name, winner, COUNT(uc.option_id) AS o_votes, ';
        select += 'pa.id AS pa_id, pa.name AS pa_name, pa.file AS pa_file, pa.duration AS pa_duration, p.audio_volume AS pa_volume, ';
        select += 'oa.id AS oa_id, oa.name AS oa_name, oa.file AS oa_file, oa.duration AS oa_duration, o.audio_volume AS oa_volume, ';
        select += 'pr.id AS pr_id, pr.name AS pr_name, ';
        select += '(SELECT COUNT(*) FROM (SELECT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_votes, ';
        select += '(SELECT COUNT(*) FROM (SELECT DISTINCT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_attendees, ';
        select += 'CASE WHEN COUNT(uc.option_id) > 0 THEN ROUND((COUNT(uc.option_id) + 0.0) / (SELECT COUNT(uc.poll_id) AS uc_amount '; // case first line
        select += 'FROM user_choice AS uc WHERE uc.poll_id = p.id GROUP BY uc.poll_id) * 100, 0) ELSE 0.0 END AS o_avg'; // case last line
        let from = 'poll AS p';
        let join = 'JOIN option AS o ON p.id = o.poll_id ';
        join += 'LEFT JOIN user_choice AS uc ON o.id = uc.option_id ';
        join += 'LEFT JOIN raffle AS pr ON p.raffle_id = pr.id ';
        join += 'LEFT JOIN audio AS pa ON p.audio_id = pa.id ';
        join += 'LEFT JOIN audio AS oa ON o.audio_id = oa.id';
        let where = ['p.channel_id = ?'];
        let group = 'o.name';
        let order = 'p.created_at DESC, o.id';
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, from, join, where, group, order, 0, prepare, function(rows) {
            let polls = [];
            let currentPollId = 0;
            let index = 0;

            if (rows.length) {
                for (let i = 0; i < rows.length; i++) {
                    // if its an another poll
                    if (currentPollId !== rows[i].id) {
                        polls[index] = {
                            id: rows[i].id,
                            raffleId: rows[i].pr_id,
                            raffleName: rows[i].pr_name,
                            name: rows[i].name,
                            active: !!rows[i].active,
                            multipleChoice: !!rows[i].multiple_choice,
                            start: rows[i].start,
                            end: rows[i].end,
                            votes: rows[i].uc_votes,
                            attendees: rows[i].uc_attendees,
                            updatedAt: rows[i].updated_at,
                            createdAt: rows[i].created_at,
                            options: [],
                            audio: {
                                id: rows[i].pa_id,
                                name: rows[i].pa_name,
                                file: rows[i].pa_file,
                                type: rows[i].pa_type,
                                duration: rows[i].pa_duration,
                                volume: rows[i].pa_volume
                            }
                        };

                        for (let j = i; j < rows.length; j++) {
                            // if options belongs to poll
                            if (polls[index].id === rows[j].id) {
                                polls[index].options.push({
                                    id: rows[j].o_id,
                                    name: rows[j].o_name,
                                    winner: !!rows[j].winner,
                                    votes: rows[j].o_votes,
                                    average: rows[j].o_avg,
                                    audio: {
                                        id: rows[j].oa_id,
                                        name: rows[j].oa_name,
                                        file: rows[j].oa_file,
                                        type: rows[j].oa_type,
                                        duration: rows[j].oa_duration,
                                        volume: rows[j].oa_volume
                                    }
                                });
                            }
                        }

                        currentPollId = rows[i].id;
                        index++;
                    }
                }
            }

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        polls: polls
                    },
                    method: 'setPolls',
                    ref: 'poll',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    getPollWinner: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let winner = {
                id: 0,
                name: '',
                chat: args.chat,
                audio: args.audio
            };
            let winners = [];
            let options = chatbot.activePolls[args.channel].options;

            // if poll is open
            if (!args.close) {
                for (var i = 0; i < options.length; i++) {
                    // if no winner picked
                    if (!winners.length) {
                        winners.push(options[i]);
                    } else if (winners.length && winners[0].votes < options[i].votes) {
                        // if current option is greater than current winner
                        winners = [];
                        winners.push(options[i]);
                    } else if (winners[0].votes === options[i].votes) {
                        // collect all options that are equal
                        winners.push(options[i]);
                    }
                }
                // pick random winner
                winner = winners[Math.floor(Math.random() * winners.length)];
                winner.audio = args.audio;
                winner.chat = args.chat;

                // if winner should be announced to chat
                if (winner.chat) {
                    chatbot.client.say('#' + args.channel, `Poll Winner: ${winner.name} ${winner.average}% (${winner.votes} Votes)`);
                }

                let from = 'option';
                let set = {
                    audioId: null,
                    audioVolume: 50,
                    winner: 0,
                    updatedAt: moment().unix()
                };
                let where = [`poll_id = ${chatbot.activePolls[args.channel].id}`];

                database.update(from, set, where, function(updateAll) {
                    set = {
                        audioId: typeof args.audio.id === 'number' && args.audio.id > 0 ? args.audio.id : null,
                        audioVolume: typeof args.audio.volume === 'number' ? args.audio.volume : 50,
                        winner: 1
                    };
                    where = [`id = ${winner.id}`];

                    database.update(from, set, where, function(updateWinner) {
                        poll.getPolls(chatbot, args);
                    });
                });
            }

            const call = {
                args: {
                    channel: args.channel,
                    winner: winner
                },
                method: 'setPollWinner',
                ref: 'poll',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));

            if (chatbot.socketPoll !== null) {
                chatbot.socketPoll.write(JSON.stringify(call));
            }
        }
    },
    pollResultToChat: function(chatbot, args) {
        if (typeof chatbot.activePolls[args.channel].id !== 'undefined') {
            let name = chatbot.activePolls[args.channel].name;
            let attendees = chatbot.activePolls[args.channel].attendees;
            let votes = chatbot.activePolls[args.channel].votes;
            let options = chatbot.activePolls[args.channel].options;
            let results =  '';

            for (var i = 0; i < options.length; i++) {
                results += ` ${options[i].name} ${options[i].average}% |`;
            }

            chatbot.client.say('#' + args.channel, `Poll: ${name} |${results} Attendees: ${attendees} | Votes: ${votes}`);
        }
    },
    removePoll: function(chatbot, args) {
        if (args.poll.active === false) {
            database.remove('poll', ['id = ?'], [args.poll.id], function(remove) {
                database.remove('option', ['poll_id = ?'], [args.poll.id]);
                database.remove('user_choice', ['poll_id = ?'], [args.poll.id]);
                poll.getPolls(chatbot, args);
                console.log(`* Removed poll "${args.poll.name}"`);
            });
        }
    },
    startPoll: function(chatbot, args) {
        if (typeof chatbot.activePolls[args.channel].id !== 'undefined') {
            let from = 'poll';
            let set = {
                start: moment().unix(),
                updatedAt: moment().unix()
            };
            let where = [`id = ${chatbot.activePolls[args.channel].id}`];

            database.update(from, set, where, function(update) {
                poll.getActivePoll(chatbot, args);
            });
        }
    }
};

module.exports = poll;
