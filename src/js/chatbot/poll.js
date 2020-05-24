const database     = require('./database');
const moment       = require('moment');
const {v4: uuidv4} = require('uuid');

const poll = {
    addPoll: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let time = moment().unix();
            let values = {
                channelId: chatbot.channels[args.channel].id,
                name: args.poll.name,
                active: true,
                multipleChoice: args.poll.multipleChoice,
                start: args.poll.start,
                end: args.poll.end,
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

            database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
                // If the user has not yet selected an option
                if (!rows.length) {
                    let time = moment().unix();
                    let values = {
                        uuid: uuidv4(),
                        pollId: chatbot.activePolls[args.channel].id,
                        optionId: chatbot.activePolls[args.channel].options[args.choice - 1].id,
                        userId: args.userstate['user-id'],
                        user: args.userstate['display-name'],
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
            let multipleChoice = chatbot.activePolls[args.channel].multipleChoice ? 'Yes' : 'No';
            let options = chatbot.activePolls[args.channel].options;
            let results =  '';

            for (var i = 0; i < options.length; i++) {
                results += ` !poll ${i + 1} - ${options[i].name} |`;
            }

            chatbot.client.say('#' + args.channel, `Poll: ${name} |${results} Multiple Choice: ${multipleChoice}`);
        }
    },
    closePoll: function(chatbot, args) {
        if (typeof chatbot.activePolls[args.channel].id !== 'undefined') {
            let from = 'poll';
            let set = {active: false, end: moment().unix(), updatedAt: moment().unix()};
            let where = [`id = '${chatbot.activePolls[args.channel].id}'`];

            database.update(from, set, where, function(update) {
                poll.getActivePoll(chatbot, args);
                poll.getPolls(chatbot, args);
            });
        }
    },
    getActivePoll: function(chatbot, args) {
        let select = 'p.id, p.name, active, multiple_choice, start, end, p.updated_at, p.created_at, o.id AS o_id, o.name AS o_name, COUNT(uc.option_id) AS o_votes,';
        select += '(SELECT COUNT(*) FROM (SELECT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_votes, ';
        select += '(SELECT COUNT(*) FROM (SELECT DISTINCT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_attendees, ';
        select += 'CASE WHEN COUNT(uc.option_id) > 0 THEN ROUND((COUNT(uc.option_id) + 0.0) / (SELECT COUNT(uc.poll_id) AS uc_amount '; // case first line
        select += 'FROM user_choice AS uc WHERE uc.poll_id = p.id GROUP BY uc.poll_id) * 100, 0) ELSE 0.0 END AS o_avg'; // case last line
        let from = 'poll AS p';
        let join = 'JOIN option AS o ON p.id = o.poll_id ';
        join += 'LEFT JOIN user_choice AS uc ON o.id = uc.option_id';
        let where = ['active = ?', 'channel_id = ?'];
        let group = 'o.name';
        let order = 'p.created_at DESC, o.id';
        let prepare = [1, chatbot.channels[args.channel].id];

        database.find(select, from, join, where, group, order, 0, prepare, function(rows) {
            chatbot.activePolls[args.channel] = {};

            // if active poll found
            if (rows.length) {
                chatbot.activePolls[args.channel] = {
                    id: rows[0].id,
                    name: rows[0].name,
                    active: !!rows[0].active,
                    multipleChoice: !!rows[0].multiple_choice,
                    start: rows[0].start,
                    end: rows[0].end,
                    votes: rows[0].uc_votes,
                    attendees: rows[0].uc_attendees,
                    updatedAt: rows[0].updated_at,
                    createdAt: rows[0].created_at,
                    options: []
                };

                for (let i = 0; i < rows.length; i++) {
                    chatbot.activePolls[args.channel].options.push({
                        id: rows[i].o_id,
                        name: rows[i].o_name,
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
        let select = 'p.id, p.name, active, multiple_choice, start, end, p.updated_at, p.created_at, o.id AS o_id, o.name AS o_name, COUNT(uc.option_id) AS o_votes,';
        select += '(SELECT COUNT(*) FROM (SELECT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_votes, ';
        select += '(SELECT COUNT(*) FROM (SELECT DISTINCT uc.user_id FROM user_choice AS uc WHERE uc.poll_id = p.id)) AS uc_attendees, ';
        select += 'CASE WHEN COUNT(uc.option_id) > 0 THEN ROUND((COUNT(uc.option_id) + 0.0) / (SELECT COUNT(uc.poll_id) AS uc_amount '; // case first line
        select += 'FROM user_choice AS uc WHERE uc.poll_id = p.id GROUP BY uc.poll_id) * 100, 0) ELSE 0.0 END AS o_avg'; // case last line
        let from = 'poll AS p';
        let join = 'JOIN option AS o ON p.id = o.poll_id ';
        join += 'LEFT JOIN user_choice AS uc ON o.id = uc.option_id';
        let where = ['channel_id = ?'];
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
                            name: rows[i].name,
                            active: !!rows[i].active,
                            multipleChoice: !!rows[i].multiple_choice,
                            start: rows[i].start,
                            end: rows[i].end,
                            votes: rows[i].uc_votes,
                            attendees: rows[i].uc_attendees,
                            updatedAt: rows[i].updated_at,
                            createdAt: rows[i].created_at,
                            options: []
                        };

                        for (let j = i; j < rows.length; j++) {
                            // if options belongs to poll
                            if (polls[index].id === rows[j].id) {
                                polls[index].options.push({
                                    id: rows[j].o_id,
                                    name: rows[j].o_name,
                                    votes: rows[j].o_votes,
                                    average: rows[j].o_avg
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
            let set = {start: moment().unix(), updatedAt: moment().unix()};
            let where = [`id = '${chatbot.activePolls[args.channel].id}'`];

            database.update(from, set, where, function(update) {
                poll.getActivePoll(chatbot, args);
            });
        }
    }
};

module.exports = poll;
