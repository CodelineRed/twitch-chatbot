const database = require('./database');
const moment   = require('moment');
const request  = require('request');
const {v4: uuidv4, validate: uuidValid} = require('uuid');

const viewerCount = {
    addViewerCount: function(chatbot) {
        let oauthToken = '';
        let query = '';
        let channels = Object.keys(chatbot.channels);

        // get oauthToken by any channel
        for (let i = 0; i < channels.length; i++) {
            if (typeof chatbot.channels[channels[i]].oauthToken === 'string' 
                && chatbot.channels[channels[i]].oauthToken.length && !oauthToken.length) {
                oauthToken = chatbot.channels[channels[i]].oauthToken;
            }

            query += (query.length ? '&' : '') + 'user_id=' + chatbot.channels[channels[i]].id;
        }

        // if oauthToken found and query build
        if (oauthToken.length && query.length) {
            let options = {
                url: `https://api.twitch.tv/helix/streams?${query}`,
                method: 'GET',
                json: true,
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Authorization': `Bearer ${oauthToken}`,
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get list of live streamers from query
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.data !== 'undefined') {
                    for (let i = 0; i < body.data.length; i++) {
                        let time = moment().unix();
                        let count = body.data[i].viewer_count;
                        let channelId = body.data[i].user_id;
                        options = {
                            url: `https://api.twitch.tv/kraken/channels/${body.data[i].user_id}`,
                            method: 'GET',
                            json: true,
                            headers: {
                                'Accept': 'application/vnd.twitchtv.v5+json',
                                'Client-ID': chatbot.config.clientIdToken
                            }
                        };

                        // get current game from live stream
                        request(options, (errGame, resGame, bodyGame) => {
                            if (errGame) {
                                return console.log(errGame);
                            }

                            if (typeof bodyGame.game !== 'undefined') {
                                let values = {
                                    uuid: uuidv4(),
                                    channelId: channelId,
                                    count: count,
                                    game: bodyGame.game,
                                    updatedAt: time,
                                    createdAt: time
                                };

                                database.insert('viewer_count', [values]);
                            }
                        });
                    }
                }
            });
        }
    }
};

module.exports = viewerCount;
