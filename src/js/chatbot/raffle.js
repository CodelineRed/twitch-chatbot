const database     = require('./database');
const locales      = require('./locales');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4} = require('uuid');

const raffle = {
    /**
     * Adds attendee to raffle
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    addAttendee: function(chatbot, args) {
        let select = 'DISTINCT u.name';
        let from = 'attendee AS a';
        let join = 'JOIN user AS u ON a.user_id = u.id';
        let where = ['a.raffle_id = ?', 'a.user_id = ?'];
        let prepare = [
            chatbot.activeRaffles[args.channel].id,
            args.userstate['user-id']
        ];

        database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
            // If the user has not yet attended the raffle
            if (!rows.length) {
                let badges = args.userstate.badges === null ? {} : args.userstate.badges;
                let multiplicator = 0;
                let time = moment().unix();
                let values = [];
                let value = {
                    raffleId: chatbot.activeRaffles[args.channel].id,
                    userId: args.userstate['user-id'],
                    updatedAt: time,
                    createdAt: time
                };

                var options = {
                    url: `https://api.twitch.tv/kraken/users/${args.userstate['user-id']}/follows/channels/${args.userstate['room-id']}`,
                    method: 'GET',
                    headers: {
                        'Client-ID': chatbot.config.clientIdToken,
                        'Accept': 'application/vnd.twitchtv.v5+json'
                    }
                };

                // check user is follower from channel
                request(options, (err, res, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    body = JSON.parse(body);

                    if (typeof body.error === 'undefined') {
                        badges.follower = 'yes';
                    }

                    if (typeof badges.partner === 'string' && chatbot.activeRaffles[args.channel].multiplicators.partner >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.partner;
                    } else if (typeof badges.moderator === 'string' && chatbot.activeRaffles[args.channel].multiplicators.moderator >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.moderator;
                    } else if (typeof badges.vip === 'string' && chatbot.activeRaffles[args.channel].multiplicators.vip >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.vip;
                    } else if (typeof badges.subscriber === 'string' && chatbot.activeRaffles[args.channel].multiplicators.subscriber >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.subscriber;
                    } else if (typeof badges.turbo === 'string' && chatbot.activeRaffles[args.channel].multiplicators.turbo >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.turbo;
                    } else if (typeof badges.premium === 'string' && chatbot.activeRaffles[args.channel].multiplicators.prime >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.prime;
                    } else if (typeof badges.follower === 'string' && chatbot.activeRaffles[args.channel].multiplicators.follower >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.follower;
                    } else if (chatbot.activeRaffles[args.channel].multiplicators.guest >= 0) {
                        multiplicator = chatbot.activeRaffles[args.channel].multiplicators.guest;
                    }

                    // generate entries by value of multiplicator
                    for (let i = 0; i < multiplicator; i++) {
                        value.uuid = uuidv4();
                        values.push(Object.assign({}, value));
                    }

                    if (values.length) {
                        database.insert('attendee', values, function(insert) {
                            raffle.getActiveRaffle(chatbot, args);
                        });
                    }
                });
            }
        });
    },
    /**
     * Adds an active raffle
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    addRaffle: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let time = moment().unix();
            let values = {
                channelId: chatbot.channels[args.channel].id,
                audioId: typeof args.raffle.audio.id === 'number' && args.raffle.audio.id > 0 ? args.raffle.audio.id : null,
                name: args.raffle.name,
                keyword: args.raffle.keyword,
                active: true,
                start: args.raffle.start,
                end: args.raffle.end,
                audioVolume: typeof args.raffle.audio.volume === 'number' ? args.raffle.audio.volume : 50,
                multiplicatorPartner: args.raffle.multiplicators.partner,
                multiplicatorModerator: args.raffle.multiplicators.moderator,
                multiplicatorVip: args.raffle.multiplicators.vip,
                multiplicatorSubscriber: args.raffle.multiplicators.subscriber,
                multiplicatorTurbo: args.raffle.multiplicators.turbo,
                multiplicatorPrime: args.raffle.multiplicators.prime,
                multiplicatorFollower: args.raffle.multiplicators.follower,
                multiplicatorGuest: args.raffle.multiplicators.guest,
                updatedAt: time,
                createdAt: time
            };

            database.insert('raffle', [values], function(insert) {
                raffle.getActiveRaffle(chatbot, args);
                console.log(locales.t('raffle-added', [args.raffle.name]));
            });
        }
    },
    /**
     * Sends an annoucement to the chat
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    announceRaffleToChat: function(chatbot, args) {
        if (typeof chatbot.activeRaffles[args.channel].id !== 'undefined') {
            let keyword = '!raffle';
            let name = chatbot.activeRaffles[args.channel].name;

            if (chatbot.activeRaffles[args.channel].keyword.length) {
                keyword = chatbot.activeRaffles[args.channel].keyword;
            }

            chatbot.client.say('#' + args.channel, locales.t('raffle-announcement', [name, keyword]));
        }
    },
    /**
     * Closes active raffle
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    closeRaffle: function(chatbot, args) {
        if (typeof chatbot.activeRaffles[args.channel].id !== 'undefined') {
            let from = 'raffle';
            let set = {
                active: false,
                end: moment().unix(),
                updatedAt: moment().unix()
            };
            let where = [`id = ${chatbot.activeRaffles[args.channel].id}`];

            database.update(from, set, where, function(update) {
                raffle.getActiveRaffle(chatbot, args);
                raffle.getRaffles(chatbot, args);
            });
        }
    },
    /**
     * Sends active raffle to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getActiveRaffle: function(chatbot, args) {
        let select = 'r.id, r.name, r.keyword, r.active, r.start, r.end, r.updated_at, r.created_at, ';
        select += 'r.multiplicator_partner, r.multiplicator_moderator, r.multiplicator_vip, r.multiplicator_subscriber, ';
        select += 'r.multiplicator_turbo, r.multiplicator_prime, r.multiplicator_follower, r.multiplicator_guest, ';
        select += 'ra.id AS ra_id, ra.name AS ra_name, ra.file AS ra_file, ra.duration AS ra_duration, r.audio_volume AS ra_volume, ';
        select += '(SELECT GROUP_CONCAT(name, \', \') FROM (SELECT DISTINCT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id ORDER BY u.name COLLATE NOCASE ASC)) AS attendees, ';
        select += '(SELECT COUNT(*) FROM (SELECT DISTINCT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id)) AS attendee_count, ';
        select += '(SELECT COUNT(*) FROM (SELECT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id)) AS entries';
        //select += '(SELECT DISTINCT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id AND winner = 1 LIMIT 1) AS winner';
        let from = 'raffle AS r';
        let join = 'LEFT JOIN audio AS ra ON r.audio_id = ra.id';
        let where = ['r.channel_id = ?', 'r.active = 1'];
        let order = 'r.created_at DESC';
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, from, join, where, '', order, 0, prepare, function(rows) {
            chatbot.activeRaffles[args.channel] = {};

            // if active raffle found
            if (rows.length) {
                chatbot.activeRaffles[args.channel] = {
                    id: rows[0].id,
                    name: rows[0].name,
                    keyword: rows[0].keyword,
                    active: true,
                    start: rows[0].start,
                    end: rows[0].end,
                    attendees: rows[0].attendees,
                    attendeeCount: rows[0].attendee_count,
                    entries: rows[0].entries,
                    //winner: rows[0].winner,
                    updatedAt: rows[0].updated_at,
                    createdAt: rows[0].created_at,
                    audio: {
                        id: rows[0].pa_id,
                        name: rows[0].pa_name,
                        file: rows[0].pa_file,
                        type: rows[0].pa_type,
                        duration: rows[0].pa_duration,
                        volume: rows[0].pa_volume
                    },
                    multiplicators: {
                        partner: rows[0].multiplicator_partner,
                        moderator: rows[0].multiplicator_moderator,
                        vip: rows[0].multiplicator_vip,
                        subscriber: rows[0].multiplicator_subscriber,
                        turbo: rows[0].multiplicator_turbo,
                        prime: rows[0].multiplicator_prime,
                        follower: rows[0].multiplicator_follower,
                        guest: rows[0].multiplicator_guest
                    }
                };
            }

            if (chatbot.socket !== null) {
                let call = {
                    args: {
                        channel: args.channel,
                        raffle: chatbot.activeRaffles[args.channel]
                    },
                    method: 'setActiveRaffle',
                    ref: 'raffle',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));

                call.ref = 'poll';
                chatbot.socket.write(JSON.stringify(call));

                if (chatbot.socketRaffle !== null) {
                    chatbot.socketRaffle.write(JSON.stringify(call));
                }
            }
        });
    },
    /**
     * Sends all past raffles to frontend
     * 
     * @param {type} chatbot
     * @param {type} args
     * @returns {undefined}
     */
    getRaffles: function(chatbot, args) {
        let select = 'r.id, r.name, r.keyword, r.active, r.start, r.end, r.updated_at, r.created_at, ';
        select += 'r.multiplicator_partner, r.multiplicator_moderator, r.multiplicator_vip, r.multiplicator_subscriber, ';
        select += 'r.multiplicator_turbo, r.multiplicator_prime, r.multiplicator_follower, r.multiplicator_guest, ';
        select += 'ra.id AS ra_id, ra.name AS ra_name, ra.file AS ra_file, ra.duration AS ra_duration, r.audio_volume AS ra_volume, ';
        select += '(SELECT GROUP_CONCAT(name, \', \') FROM (SELECT DISTINCT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id ORDER BY u.name COLLATE NOCASE ASC)) AS attendees, ';
        select += '(SELECT COUNT(*) FROM (SELECT DISTINCT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id)) AS attendee_count, ';
        select += '(SELECT COUNT(*) FROM (SELECT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id)) AS entries, ';
        select += '(SELECT DISTINCT u.name FROM attendee AS a JOIN user AS u ON a.user_id = u.id WHERE raffle_id = r.id AND winner = 1 LIMIT 1) AS winner, ';
        select += '(SELECT name FROM attendee LEFT JOIN audio ON audio_id = id WHERE raffle_id = r.id AND winner = 1) AS winner_audio';
        let from = 'raffle AS r';
        let join = 'LEFT JOIN audio AS ra ON r.audio_id = ra.id';
        let where = ['r.channel_id = ?'];
        let order = 'r.created_at DESC';
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, from, join, where, '', order, 100, prepare, function(rows) {
            let raffles = [];

            if (rows.length) {
                for (let i = 0; i < rows.length; i++) {
                    raffles[i] = {
                        id: rows[i].id,
                        name: rows[i].name,
                        keyword: rows[i].keyword,
                        active: !!rows[i].active,
                        start: rows[i].start,
                        end: rows[i].end,
                        attendees: rows[i].attendees,
                        attendeeCount: rows[i].attendee_count,
                        entries: rows[i].entries,
                        winner: rows[i].winner,
                        winnerAudio: rows[i].winner_audio,
                        updatedAt: rows[i].updated_at,
                        createdAt: rows[i].created_at,
                        audio: {
                            id: rows[i].ra_id,
                            name: rows[i].ra_name,
                            file: rows[i].ra_file,
                            type: rows[i].ra_type,
                            duration: rows[i].ra_duration,
                            volume: rows[i].ra_volume
                        },
                        multiplicators: {
                            partner: rows[i].multiplicator_partner,
                            moderator: rows[i].multiplicator_moderator,
                            vip: rows[i].multiplicator_vip,
                            subscriber: rows[i].multiplicator_subscriber,
                            turbo: rows[i].multiplicator_turbo,
                            prime: rows[i].multiplicator_prime,
                            follower: rows[i].multiplicator_follower,
                            guest: rows[i].multiplicator_guest
                        }
                    };
                }
            }

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        raffles: raffles
                    },
                    method: 'setRaffles',
                    ref: 'raffle',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Picks a random raffle winner and sends to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getRaffleWinner: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let winner = {
                id: 0,
                name: '',
                chat: args.chat,
                audio: args.audio
            };
            let winners = [];

            // if raffle is not closed
            if (!args.close) {
                let select = 'u.name';
                let from = 'attendee AS a';
                let join = 'JOIN user AS u ON a.user_id = u.id';
                let where = ['raffle_id = ?'];
                let prepare = [chatbot.activeRaffles[args.channel].id];

                database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
                    for (let i = 0; i < rows.length; i++) {
                        winners.push(rows[i].name);
                    }

                    // pick random winner
                    winner.id = 1;
                    winner.name = winners[Math.floor(Math.random() * winners.length)];
                    winner.audio = args.audio;
                    winner.chat = args.chat;

                    // if winner should be announced to chat
                    if (winner.chat) {
                        chatbot.client.say('#' + args.channel, locales.t('raffle-winner', [winner.name]));
                    }

                    from = 'attendee';
                    let set = {
                        audioId: null,
                        audioVolume: 50,
                        winner: 0,
                        updatedAt: moment().unix()
                    };
                    where = [`raffle_id = ${chatbot.activeRaffles[args.channel].id}`];

                    database.update(from, set, where, function(updateAll) {
                        set = {
                            audioId: typeof args.audio.id === 'number' && args.audio.id > 0 ? args.audio.id : null,
                            audioVolume: typeof args.audio.volume === 'number' ? args.audio.volume : 50,
                            winner: 1
                        };
                        where = [
                            `'${winner.name}' IN (SELECT name FROM user WHERE attendee.user_id = user.id)`,
                            `raffle_id = ${chatbot.activeRaffles[args.channel].id}`
                        ];

                        database.update(from, set, where, function(updateWinner) {
                            raffle.getRaffles(chatbot, args);
                        });
                    });

                    const call = {
                        args: {
                            channel: args.channel,
                            winner: winner
                        },
                        method: 'setRaffleWinner',
                        ref: 'raffle',
                        env: 'browser'
                    };

                    chatbot.socket.write(JSON.stringify(call));

                    if (chatbot.socketRaffle !== null) {
                        chatbot.socketRaffle.write(JSON.stringify(call));
                    }
                });
            } else {
                const call = {
                    args: {
                        channel: args.channel,
                        winner: winner
                    },
                    method: 'setRaffleWinner',
                    ref: 'raffle',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));

                if (chatbot.socketRaffle !== null) {
                    chatbot.socketRaffle.write(JSON.stringify(call));
                }
            }
        }
    },
    /**
     * Sends result from active raffle to chat
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    raffleResultToChat: function(chatbot, args) {
        if (typeof chatbot.activeRaffles[args.channel].id !== 'undefined') {
            let name = chatbot.activeRaffles[args.channel].name;
            let attendees = chatbot.activeRaffles[args.channel].attendeeCount;
            let entries = chatbot.activeRaffles[args.channel].entries;

            let select = 'u.name';
            let from = 'attendee AS a';
            let join = 'JOIN user AS u ON a.user_id = u.id';
            let where = [
                'raffle_id = ?',
                'winner = 1'
            ];
            let prepare = [chatbot.activeRaffles[args.channel].id];

            database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
                if (rows.length) {
                    chatbot.client.say('#' + args.channel, locales.t('raffle-result-1', [name, rows[0].name, attendees, entries]));
                } else {
                    chatbot.client.say('#' + args.channel, locales.t('raffle-result-2', [name, attendees, entries]));
                }
            });
        }
    },
    /**
     * Removes a raffle
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    removeRaffle: function(chatbot, args) {
        if (args.raffle.active === false) {
            database.remove('raffle', ['id = ?'], [args.raffle.id], function(remove) {
                database.remove('attendee', ['raffle_id = ?'], [args.raffle.id]);
                raffle.getRaffles(chatbot, args);
                console.log(locales.t('raffle-removed', [args.raffle.name]));
            });
        }
    },
    /**
     * Starts a raffle instantly
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    startRaffle: function(chatbot, args) {
        if (typeof chatbot.activeRaffles[args.channel].id !== 'undefined') {
            let from = 'raffle';
            let set = {
                start: moment().unix(),
                updatedAt: moment().unix()
            };
            let where = [`id = ${chatbot.activeRaffles[args.channel].id}`];

            database.update(from, set, where, function(update) {
                raffle.getActiveRaffle(chatbot, args);
            });
        }
    }
};

module.exports = raffle;
