const database = require('./database');
const moment   = require('moment');

const user = {
    addUser: function(chatbot, args, callback) {
        // if is message from own chatbot
        if (args.userstate['display-name'].toLowerCase() === chatbot.config.username.toLowerCase()) {
            args.userstate['room-id'] = chatbot.channels[args.channel].id;
            args.userstate['user-id'] = 'chatbot';
        }

        let allowedMsgTypes = ['chat', 'action'];
        let badges = args.userstate.badges === null ? '' : JSON.stringify(args.userstate.badges);
        let badgeInfo = args.userstate['badge-info'] === null ? '' : JSON.stringify(args.userstate['badge-info']);
        let time = moment().unix();
        let from = 'user';
        let where = ['id = ?'];
        let prepare = [args.userstate['user-id']];

        database.find('*', from, '', where, '', '', 1, prepare, function(rows) {
            // if user found
            if (rows.length) {
                from = 'channel_user_join';
                where = [
                    'channel_id = ?',
                    'user_id = ?'
                ];
                prepare = [
                    args.userstate['room-id'],
                    args.userstate['user-id']
                ];

                database.find('*', from, '', where, '', '', 1, prepare, function(rowsCuj) {
                    // if user not in channel
                    if (!rowsCuj.length) {
                        let values = {
                            channelId: args.userstate['room-id'],
                            userId: args.userstate['user-id'],
                            badges: badges,
                            badgeInfo: badgeInfo,
                            updatedAt: time,
                            createdAt: time
                        };

                        database.insert('channel_user_join', [values], function(insertUser) {
                            callback();
                        });
                    } else if (rows[0].name !== args.userstate['display-name'] 
                        || typeof args.userstate.color === 'string' && rows[0].color !== args.userstate.color) {
                        // if user name or color has changed
                        let set = {
                            name: args.userstate['display-name'],
                            updatedAt: time
                        };
                        where = [`id = '${args.userstate['user-id']}'`];

                        database.update('user', set, where, function(updateUser) {
                            callback();
                        });
                    } else if (allowedMsgTypes.indexOf(args.userstate['message-type']) >= 0 
                        && (rowsCuj[0].badges !== badges || rowsCuj[0].badge_info !== badgeInfo)) {
                        // if user badges has changed
                        let set = {
                            badges: badges,
                            badgeInfo: badgeInfo,
                            updatedAt: time
                        };
                        where = [
                            `channel_id = '${args.userstate['room-id']}'`,
                            `user_id = '${args.userstate['user-id']}'`
                        ];

                        database.update('channel_user_join', set, where, function(updateUser) {
                            callback();
                        });
                    } else {
                        // if user found and up to date
                        callback();
                    }
                });
            } else {
                // if user not found
                let values = {
                    id: args.userstate['user-id'],
                    name: args.userstate['display-name'],
                    color: args.userstate.color === null || typeof args.userstate.color === 'undefined' ? '' : args.userstate.color,
                    updatedAt: time,
                    createdAt: time
                };

                database.insert('user', [values], function(insertUser) {
                    values = {
                        channelId: args.userstate['room-id'],
                        userId: args.userstate['user-id'],
                        badges: badges,
                        badgeInfo: badgeInfo,
                        updatedAt: time,
                        createdAt: time
                    };

                    database.insert('channel_user_join', [values], function(insertCuj) {
                        callback();
                    });
                });
            }
        });
    }
};

module.exports = user;
