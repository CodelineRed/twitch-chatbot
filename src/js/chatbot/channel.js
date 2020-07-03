const database = require('./database');
const moment   = require('moment');
const request  = require('request');

const channel = {
    getChannels: function(chatbot) {
        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channels: chatbot.config.channels.join(';').replace(/#/g, '')
                },
                method: 'setChannels',
                ref: 'channels',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    getChannelDisplayName: function(chatbot, channelName) {
        channelName = channelName.toLowerCase();

        for (let i = 0; i < chatbot.config.channels.length; i++) {
            if (chatbot.config.channels[i].toLowerCase() === channelName) {
                channelName = chatbot.config.channels[i];
            }
        }

        return channelName;
    },
    saveChannelToken: function(chatbot, args) {
        if (chatbot.config.clientIdToken.length) {
            let options = {
                url: 'https://api.twitch.tv/kraken/user',
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Authorization': `OAuth ${args.channel.token}`,
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get channel id and name
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                body = JSON.parse(body);

                if (typeof body.error === 'undefined') {
                    let set = {
                        updatedAt: moment().unix()
                    };
                    set[args.channel.property] = args.channel.token;
                    let where = [`id = '${body._id}'`];

                    database.update('channel', set, where, function(update) {
                        chatbot.channels[body.name][args.channel.property] = args.channel.token;

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
