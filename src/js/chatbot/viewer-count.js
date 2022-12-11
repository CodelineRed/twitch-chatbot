const database     = require('./database');
const locales      = require('./locales');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4} = require('uuid');

const viewerCount = {
    error: false,
    add: function(chatbot) {
        let channels = Object.keys(chatbot.channels);
        let oauthToken = chatbot.getOauthToken();
        let query = '';

        // generate query
        for (let i = 0; i < channels.length; i++) {
            query += (query.length ? '&' : '') + 'user_id=' + chatbot.channels[channels[i]].id;
        }

        // if oauthToken found and query build
        if (oauthToken.length && query.length && !viewerCount.error) {
            let options = {
                url: `https://api.twitch.tv/helix/streams?${query}`,
                method: 'GET',
                json: true,
                headers: {
                    'Authorization': `Bearer ${oauthToken}`,
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get list of live streams from query
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.data !== 'undefined' && body.data.length) {
                    for (let i = 0; i < body.data.length; i++) {
                        let time = moment().unix();
                        let count = body.data[i].viewer_count;
                        let channelId = body.data[i].user_id;
                        options = {
                            url: `https://api.twitch.tv/helix/search/channels?query=${body.data[i].user_login}&live_only=1`,
                            method: 'GET',
                            json: true,
                            headers: {
                                'Authorization': `Bearer ${oauthToken}`,
                                'Client-ID': chatbot.config.clientIdToken
                            }
                        };

                        // get current game from live stream
                        request(options, (errGame, resGame, bodyGame) => {
                            if (errGame) {
                                return console.log(errGame);
                            }

                            if (typeof bodyGame.data !== 'undefined' && bodyGame.data.length) {
                                let values = {
                                    uuid: uuidv4(),
                                    channelId: channelId,
                                    count: count,
                                    game: bodyGame.data[0].game_name,
                                    updatedAt: time,
                                    createdAt: time
                                };

                                database.insert('viewer_count', [values]);
                            }
                        });
                    }
                } else if (!viewerCount.error) {
                    viewerCount.error = true;
                    console.log(locales.t('viewer-count-error', [body.message]));
                    console.log(locales.t('viewer-count-fix'));
                }
            });
        }
    }
};

module.exports = viewerCount;
