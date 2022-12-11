const database     = require('./database');
const locales      = require('./locales');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4} = require('uuid');

const attendee = {
    /**
     * Adds attendee to raffle
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    add: function(chatbot, args) {
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

                let oauthToken = chatbot.getOauthToken();
                // if oauthToken found
                if (oauthToken.length) {
                    let options = {
                        url: `https://api.twitch.tv/helix/users/follows?from_id=${args.userstate['user-id']}&to_id=${args.userstate['room-id']}`,
                        method: 'GET',
                        json: true,
                        headers: {
                            'Authorization': `Bearer ${oauthToken}`,
                            'Client-ID': chatbot.config.clientIdToken
                        }
                    };

                    // check user is follower from channel
                    request(options, (err, res, body) => {
                        if (err) {
                            return console.log(err);
                        }

                        if (typeof body.data !== 'undefined' && body.data.length) {
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
                                chatbot.getActiveRaffle(chatbot, args);
                            });
                        }
                    });
                }
            }
        });
    }
};

module.exports = attendee;
