const database = require('./database');
const moment   = require('moment');

const user = {
    addUser: function(chatbot, args, callback) {
        // if is message from own chatbot
        if (args.userstate['display-name'].toLowerCase() === chatbot.config.username.toLowerCase()) {
            args.userstate['room-id'] = chatbot.channels[args.channel].id;
            args.userstate['user-id'] = 'chatbot';
        }

        let time = moment().unix();
        let select = 'id, name, color';
        let from = 'user';
        let where = ['id = ?'];
        let prepare = [args.userstate['user-id']];

        database.find(select, from, '', where, '', '', 1, prepare, function(rows) {
            // if user found
            if (rows.length) {
                select = 'user_id';
                from = 'channel_user_join';
                where = ['channel_id = ?'];
                prepare = [args.userstate['room-id']];

                database.find(select, from, '', where, '', '', 1, prepare, function(rowsCuj) {
                    // if user not in channel
                    if (!rowsCuj.length) {
                        let values = {
                            channelId: args.userstate['room-id'],
                            userId: args.userstate['user-id'],
                            updatedAt: time,
                            createdAt: time
                        };

                        database.insert('channel_user_join', [values], function(insertUser) {
                            callback();
                        });
                    } else if (rows[0].name !== args.userstate['display-name']) {
                        // if user name has changed
                        let set = {
                            name: args.userstate['display-name'],
                            updatedAt: time
                        };
                        where = [`id = '${args.userstate['user-id']}'`];

                        database.update('user', set, where, function(updateUser) {
                            callback();
                        });
                    } else if (typeof args.userstate.color === 'string' && rows[0].color !== args.userstate.color) {
                        // if user color has changed
                        let set = {
                            color: args.userstate.color,
                            updatedAt: time
                        };
                        where = [`id = '${args.userstate['user-id']}'`];

                        database.update('user', set, where, function(updateUser) {
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
