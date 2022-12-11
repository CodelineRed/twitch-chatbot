const database = require('./database');
const moment   = require('moment');
const request  = require('request');

const channel = {
    lists: {},
    /**
     * Sends all configured channels to frontend
     * 
     * @param {object} chatbot
     * @returns {undefined}
     */
    getList: function(chatbot) {
        if (chatbot.socket !== null) {
            const call = {
                args: {
                    list: chatbot.config.channels.join(';').replace(/#/g, '')
                },
                method: 'setChannels',
                ref: 'channels',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Returns channel display name
     * 
     * @param {type} chatbot
     * @param {type} channelName
     * @returns {string}
     */
    getDisplayName: function(chatbot, channelName) {
        channelName = channelName.toLowerCase();

        for (let i = 0; i < chatbot.config.channels.length; i++) {
            if (chatbot.config.channels[i].toLowerCase() === channelName) {
                channelName = chatbot.config.channels[i];
            }
        }

        return channelName;
    },
    /**
     * Sends token to frontend
     * 
     * @param {object} chatbot
     * @returns {undefined}
     */
    getToken: function(chatbot, args) {
        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    token: typeof channel.lists[args.channel][args.name] === 'string' ? channel.lists[args.channel][args.name] : '',
                    name: args.name
                },
                method: 'setChannelToken',
                ref: 'channel',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Saves OAuth token to channel and sends status to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    saveToken: function(chatbot, args) {
        if (chatbot.config.clientIdToken.length) {
            let options = {
                url: 'https://api.twitch.tv/helix/users',
                method: 'GET',
                json: true,
                headers: {
                    'Authorization': `Bearer ${args.token}`,
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get channel id and name
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.data !== 'undefined' && body.data.length) {
                    let data = body.data[0];
                    let set = {
                        updatedAt: moment().unix()
                    };
                    set[args.name] = args.token;
                    let where = [`id = '${data.id}'`];

                    database.update('channel', set, where, function(update) {
                        channel.lists[data.login][args.name] = args.token;

                        if (chatbot.socket !== null) {
                            const call = {
                                args: {
                                    status: 1
                                },
                                method: 'setChannelTokenStatus',
                                ref: 'token',
                                env: 'browser'
                            };

                            chatbot.socket.write(JSON.stringify(call));
                        }
                    });
                } else {
                    if (chatbot.socket !== null) {
                        const call = {
                            args: {
                                status: -1
                            },
                            method: 'setChannelTokenStatus',
                            ref: 'token',
                            env: 'browser'
                        };

                        chatbot.socket.write(JSON.stringify(call));
                    }
                }
            });
        }
    }
};

module.exports = channel;
