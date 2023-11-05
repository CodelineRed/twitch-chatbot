const database     = require('./database');
const locales      = require('./locales');
const fs           = require('fs');
const mediainfo    = require('mediainfo-wrapper');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4} = require('uuid');

const video = {
    currentStarts: {}, // unix timestamp (seconds)
    /**
     * Adds a video
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    add: function(chatbot, args) {
        if (chatbot.socket !== null) {
            delete args.item.durationHours;
            delete args.item.durationMin;
            delete args.item.durationSec;
            delete args.item.autofill;
            let time = moment().unix();

            let values = {
                channelId: chatbot.channels[args.channel].id,
                name: args.item.name,
                subName: args.item.subName,
                file: args.item.file,
                duration: args.item.duration, // unix timestamp (seconds)
                player: args.item.player,
                updatedAt: time, // unix timestamp (seconds)
                createdAt: time // unix timestamp (seconds)
            };

            let select = 'v.id, p.name, pvj.sort';
            let from = 'playlist AS p';
            let join = 'LEFT JOIN playlist_video_join AS pvj ON p.id = pvj.playlist_id ';
            join += 'LEFT JOIN video AS v ON pvj.video_id = v.id';
            let where = ['p.id = ?'];

            // find videos from playlist
            database.find(select, from, join, where, '', 'sort', 0, [args.item.playlistId], function(rows) {
                // if video.id is defined, just add playlist relation
                if (args.item.id) {
                    values = {
                        uuid: uuidv4(),
                        playlistId: args.item.playlistId,
                        videoId: args.item.id,
                        played: args.item.played,
                        skipped: args.item.skipped,
                        titleCmd: args.item.titleCmd,
                        gameCmd: args.item.gameCmd,
                        start: 0,
                        end: 0,
                        sort: rows[0].sort === null ? 0 : 1 * (rows[rows.length - 1].sort + 1),
                        updatedAt: time, // unix timestamp (seconds)
                        createdAt: time // unix timestamp (seconds)
                    };

                    database.insert('playlist_video_join', [values], function() {
                        if (args.item.playlistId === chatbot.activePlaylists[args.channel].id) {
                            values.id = values.videoId;
                            values.name = args.item.name;
                            values.subName = args.item.subName;
                            values.file = args.item.file;
                            values.duration = args.item.duration; // unix timestamp (seconds)
                            values.player = args.item.player;
                            chatbot.getActivePlaylist(chatbot, args);
                        }

                        chatbot.getPlaylists(chatbot, args);
                        console.log(locales.t('video-added', [args.item.name, rows[0].name]));
                    });
                } else {
                    database.insert('video', [values], function(insert) {
                        values = {
                            uuid: uuidv4(),
                            playlistId: args.item.playlistId,
                            videoId: insert.lastID,
                            played: args.item.played,
                            skipped: args.item.skipped,
                            titleCmd: args.item.titleCmd,
                            gameCmd: args.item.gameCmd,
                            start: 0,
                            end: 0,
                            sort: rows[0].sort === null ? 0 : 1 * (rows[rows.length - 1].sort + 1),
                            updatedAt: time,
                            createdAt: time
                        };

                        database.insert('playlist_video_join', [values], function() {
                            if (args.item.playlistId === chatbot.activePlaylists[args.channel].id) {
                                values.id = values.videoId;
                                values.name = args.item.name;
                                values.subName = args.item.subName;
                                values.file = args.item.file;
                                values.duration = args.item.duration; // unix timestamp (seconds)
                                values.player = args.item.player;
                                chatbot.getActivePlaylist(chatbot, args);
                            }

                            chatbot.getPlaylists(chatbot, args);
                            console.log(locales.t('video-added', [args.item.name, rows[0].name]));
                        });
                    });
                }
            });
        }
    },
    /**
     * Sends the next video to frontend and changes stream title and/or game
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    get: function(chatbot, args) {
        if (chatbot.socketVideo !== null) {
            let match = false;
            let matchUuid = '';
            let uuidArray = [];

            let videoItem = {
                name: '',
                subName: '',
                file: '',
                played: false,
                skipped: false,
                duration: 0,
                player: 'empty'
            };

            for (let i = 0; i < chatbot.activePlaylists[args.channel].videos.length; i++) {
                // set all videos after match to played = false
                if (chatbot.activePlaylists[args.channel].videos[i].skipped || match) {
                    chatbot.activePlaylists[args.channel].videos[i].played = false;
                    uuidArray.push(chatbot.activePlaylists[args.channel].videos[i].uuid);

                    // if video is skipped
                    if (chatbot.activePlaylists[args.channel].videos[i].skipped) {
                        continue;
                    }
                }

                // find next video to play
                if (!chatbot.activePlaylists[args.channel].videos[i].played && !match) {
                    videoItem = chatbot.activePlaylists[args.channel].videos[i];
                    chatbot.activePlaylists[args.channel].videos[i].played = true;
                    video.currentStarts[args.channel] = moment().unix();
                    matchUuid = chatbot.activePlaylists[args.channel].videos[i].uuid;
                    match = true;
                }
            }

            if (chatbot.channels[args.channel].oauthToken.length) {
                let set = {};

                // if titleCmd is set, change stream titel
                if (typeof videoItem.titleCmd !== 'undefined' && videoItem.titleCmd.length) {
                    set['title'] = videoItem.titleCmd;
                }

                // if gameCmd is set, change stream game
                if (typeof videoItem.gameCmd !== 'undefined' && videoItem.gameCmd.length) {
                    let options = {
                        url: `https://api.twitch.tv/helix/search/categories?query=${videoItem.gameCmd}`,
                        method: 'GET',
                        json: true,
                        headers: {
                            'Authorization': `Bearer ${chatbot.channels[args.channel].oauthToken}`,
                            'Client-ID': chatbot.config.clientIdToken
                        }
                    };

                    // search game by name
                    request(options, (err, res, body) => {
                        if (err) {
                            return console.log(err);
                        }

                        if (typeof body.data !== 'undefined' && body.data.length) {
                            let gameExp = new RegExp(videoItem.gameCmd.toLowerCase());
                            set['game_id'] = body.data[0].id;
                            args.gameCmd = body.data[0].name;
                            
                            // find matching game
                            for (let i = 0; i < body.data.length; i++) {
                                if (videoItem.gameCmd.toLowerCase() === body.data[i].name.toLowerCase()) {
                                    set['game_id'] = body.data[i].id;
                                    args.gameCmd = body.data[i].name;
                                    break;
                                } else if (gameExp.test(body.data[i].name.toLowerCase())) {
                                    set['game_id'] = body.data[i].id;
                                    args.gameCmd = body.data[i].name;
                                }
                            }

                            video.modifyChannel(chatbot, args, set);
                        }
                    });
                } else if (Object.keys(set).length) {
                    video.modifyChannel(chatbot, args, set);
                }
            } else {
                // if titleCmd is set, change stream titel
                if (typeof videoItem.titleCmd !== 'undefined' && videoItem.titleCmd.length) {
                    chatbot.client.say('#' + args.channel, `!title ${videoItem.titleCmd}`);
                }

                // if gameCmd is set, change stream game
                if (typeof videoItem.gameCmd !== 'undefined' && videoItem.gameCmd.length) {
                    chatbot.client.say('#' + args.channel, `!game ${videoItem.gameCmd}`);
                }
            }

            const call = {
                args: {
                    channel: args.channel,
                    item: videoItem
                },
                method: 'setVideo',
                ref: 'player',
                env: 'browser'
            };

            chatbot.socketVideo.write(JSON.stringify(call));

            if (matchUuid.length) {
                let from = 'playlist_video_join';
                let set = {played: true, start: 0, end: 0};
                let where = [`uuid = '${matchUuid}'`];

                database.update(from, set, where, function(update) {
                    if (uuidArray.length) {
                        set = {played: false, start: 0, end: 0};
                        where = [`uuid IN ('${uuidArray.join('\', \'')}')`];

                        database.update(from, set, where, function(updateNotPlayed) {
                            chatbot.getActivePlaylist(chatbot, args);
                        });
                    } else {
                        chatbot.getActivePlaylist(chatbot, args);
                    }
                });
            } else {
                chatbot.getActivePlaylist(chatbot, args);
            }
        }
    },
    /**
     * Gets game informations by game id
     * 
     * @param {object} chatbot
     * @param {object} args
     * @param {function} callback
     * @param {object} cbArgs
     * @returns {undefined}
     */
    getGameById: function(chatbot, args, callback, cbArgs) {
        let oauthToken = chatbot.getOauthToken();
        let options = {
            url: `https://api.twitch.tv/helix/games?id=${args.gameId}`,
            method: 'GET',
            json: true,
            headers: {
                'Authorization': `Bearer ${oauthToken}`,
                'Client-ID': chatbot.config.clientIdToken
            }
        };

        // get game by id
        request(options, (err, res, body) => {
            if (err) {
                return console.log(err);
            }

            if (typeof body.data !== 'undefined' && body.data.length) {
                cbArgs.game = body.data[0].name;
                cbArgs.gameId = body.data[0].id;
                cbArgs.boxArtUrl = body.data[0].box_art_url;
                cbArgs.igdbId = body.data[0].igdb_id;
                callback(cbArgs);
            }
        });
    },
    /**
     * Returns index of given video in videos
     * 
     * @param {object} videos
     * @param {object} videoItem
     * @returns {number}
     */
    getIndexFromVideos: function(videos, videoItem) {
        for (let i = 0; i < videos.length; i++) {
            if (videoItem.uuid === videos[i].uuid) {
                return i;
            }
        }
        return -1;
    },
    /**
     * Sends meta information from local file to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getLocalVideoMeta: function(chatbot, args) {
        let localRegExp = /(.*)(\.mp4)$/i;
        let call = {
            args: {
                channel: args.channel,
                name: '',
                subName: '',
                duration: 0
            },
            method: 'setVideoMetaToForm',
            ref: 'playlist',
            env: 'browser'
        };

        // if ending with .mp4 and file exists
        if (localRegExp.test(args.file) && fs.existsSync(chatbot.config.videosFolder + args.file)) {
            mediainfo(chatbot.config.videosFolder + args.file).then(function(data) {
                if (data.length && typeof data[0].general !== 'undefined') {
                    // milliseconds to seconds
                    let duration = ((data[0].general.duration[0] / 1000) -.5).toFixed(0);
                    let format = locales.t('date');
                    let name = args.file
                        .split('/').pop()
                        .replace(localRegExp, '$1')
                        .replace(/(-|_| )([a-z])/gi, function($0, $1, $2) {
                            let prefix = ' ';

                            if ($1 === '-') {
                                prefix = ' - ';
                            }

                            return prefix + $2.toUpperCase();
                        });
                    name = name[0].toUpperCase() + name.slice(1);
                    let isoDate = data[0].general.file_last_modification_date[0].replace(/^(UTC )([0-9-]+) ([0-9:.]+)$/, '$2T$3Z');
                    let subName = moment(isoDate).format(format);

                    // if duration greater than 23:59:59 hours
                    if (duration > 86399) {
                        duration = 0;
                    }

                    if (chatbot.socket !== null && duration) {
                        call.args.name = name;
                        call.args.subName = subName;
                        call.args.duration = duration;
                        chatbot.socket.write(JSON.stringify(call));
                    }
                }
            }).catch(function(e) {
                console.error(e);
            });
        } else if (chatbot.socket !== null) {
            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Sends video by given videoSearch to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getSearchResults: function(chatbot, args) {
        let search = args.item.replace(/ /g, '%');
        let select = 'id, name, sub_name AS subName, file, ';
        select += 'duration, player, updated_at AS updatedAt, created_at AS createdAt';
        let where = ['channel_id = ?', '(name LIKE ? OR file LIKE ?)'];
        let prepare = [chatbot.channels[args.channel].id, `%${search}%`, `%${search}%`];

        database.find(select, 'video', '', where, '', 'name', 30, prepare, function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        list: rows
                    },
                    method: 'setVideoSearchResults',
                    ref: 'playlist',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sends meta information from twitch clip to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getTwitchClipMeta: function(chatbot, args) {
        let oauthToken = chatbot.getOauthToken();
        let call = {
            args: {
                channel: args.channel,
                name: '',
                subName: '',
                duration: 0
            },
            method: 'setVideoMetaToForm',
            ref: 'playlist',
            env: 'browser'
        };

        // if file fits pattern and token is defined
        if (/^[A-Z][A-Za-z0-9-_]+$/.test(args.item) && oauthToken.length
            && chatbot.config.clientIdToken.length) {
            let options = {
                url: `https://api.twitch.tv/helix/clips?id=${args.item}`,
                method: 'GET',
                json: true,
                headers: {
                    'Authorization': `Bearer ${oauthToken}`,
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get single twitch clip
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.data !== 'undefined' && body.data.length) {
                    let data = body.data[0];
                    args['gameId'] = data.game_id;
                    
                    let callback = function(cbData) {
                        let duration = (cbData.duration -.5).toFixed(0);
                        let subName = (cbData.game.length ? `${cbData.game} - ` : '') + 'Clip';
                        subName += ` (${moment(cbData.created_at).format(locales.t('date'))})`;

                        if (chatbot.socket !== null && duration) {
                            call.args.name = cbData.title;
                            call.args.subName = subName;
                            call.args.duration = duration;
                            chatbot.socket.write(JSON.stringify(call));
                        }
                    };
                    video.getGameById(chatbot, args, callback, data);
                }
            });
        } else if (chatbot.socket !== null) {
            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Sends meta information from twitch video to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getTwitchVideoMeta: function(chatbot, args) {
        let oauthToken = chatbot.getOauthToken();
        let call = {
            args: {
                channel: args.channel,
                name: '',
                subName: '',
                duration: 0
            },
            method: 'setVideoMetaToForm',
            ref: 'playlist',
            env: 'browser'
        };

        // if file fits pattern and token is defined
        if (/^[0-9]+$/.test(args.item) && oauthToken.length
            && chatbot.config.clientIdToken.length) {
            let options = {
                url: `https://api.twitch.tv/helix/videos?id=${args.item}`,
                method: 'GET',
                json: true,
                headers: {
                    'Authorization': `Bearer ${oauthToken}`,
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get single twitch video
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.data !== 'undefined' && body.data.length) {
                    let data = body.data[0];
                    let durationArr = data.duration.replace('s', '').replace(/([hm])/g, '-').split('-').reverse();
                    let hours = typeof durationArr[2] !== 'undefined' ? parseInt(durationArr[2]) : 0;
                    let minutes = typeof durationArr[1] !== 'undefined' ? parseInt(durationArr[1]) : 0;
                    let seconds= typeof durationArr[0] !== 'undefined' ? parseInt(durationArr[0]) : 0;
                    let duration = seconds + (minutes * 60) + (hours * 3600);
                    let format = locales.t('date');
                    let name = data.title;
                    let subName = moment(data.created_at).format(format);

                    // if duration greater than 23:59:59 hours
                    if (duration > 86399) {
                        duration = 0;
                    }

                    if (chatbot.socket !== null && duration) {
                        call.args.name = name;
                        call.args.subName = subName;
                        call.args.duration = duration;
                        chatbot.socket.write(JSON.stringify(call));
                    }
                }
            });
        } else if (chatbot.socket !== null) {
            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Sends meta information from youtube video to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getYoutubeVideoMeta: function(chatbot, args) {
        let call = {
            args: {
                channel: args.channel,
                name: '',
                subName: '',
                duration: 0
            },
            method: 'setVideoMetaToForm',
            ref: 'playlist',
            env: 'browser'
        };

        // if file is 11 chars long, fits pattern and token is defined
        if (/^[a-z0-9_-]{11}$/i.test(args.item) && chatbot.config.youtubeToken.length) {
            let options = {
                url: `https://www.googleapis.com/youtube/v3/videos?id=${args.item}&key=${chatbot.config.youtubeToken}&part=snippet,contentDetails,statistics,status`,
                method: 'GET',
                json: true
            };

            // get single youtube video
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.items !== 'undefined' && body.items.length) {
                    let duration = 0;
                    let durationRegExp = /^PT([0-9]+H)?([0-9]+M)?([0-9]+S)?/;
                    let durationString = body.items[0].contentDetails.duration;
                    let format = locales.t('date');
                    let multiplier = 60 * 60;
                    let name = body.items[0].snippet.title;
                    let subName = typeof body.items[0].snippet.tags === 'undefined' ? '' : body.items[0].snippet.tags[0];
                    subName += subName.length ? ` (${moment(body.items[0].snippet.publishedAt).format(format)})` : moment(body.items[0].snippet.publishedAt).format(format);

                    // if duration fits pattern
                    if (durationRegExp.test(durationString)) {
                        let match = durationString.match(durationRegExp);

                        for (let i = 1; i <= 3; i++) {
                            if (typeof match[i] === 'string') {
                                duration += parseInt(match[i]) * multiplier;
                            }
                            multiplier /= 60;
                        }

                        // if duration greater than 23:59:59 hours
                        if (duration > 86399) {
                            duration = 0;
                        }

                        if (chatbot.socket !== null) {
                            call.args.name = name;
                            call.args.subName = subName;
                            call.args.duration = duration;
                            chatbot.socket.write(JSON.stringify(call));
                        }
                    }
                }
            });
        } else if (chatbot.socket !== null) {
            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Modifies channel category and title
     * 
     * @param {object} chatbot
     * @param {object} args
     * @param {object} set
     * @returns {undefined}
     */
    modifyChannel: function(chatbot, args, set) {
        let options = {
            url: `https://api.twitch.tv/helix/channels?broadcaster_id=${chatbot.channels[args.channel].id}`,
            method: 'PATCH',
            json: true,
            headers: {
                'Authorization': `Bearer ${chatbot.channels[args.channel].oauthToken}`,
                'Client-ID': chatbot.config.clientIdToken
            },
            body: set
        };

        // change stream game and/ or title
        request(options, (err, res, body) => {
            if (err) {
                return console.log(err);
            }

            if (typeof body === 'undefined') {
                if (typeof set.title !== 'undefined' && typeof args.gameCmd !== 'undefined' ) {
                    console.log(locales.t('change-channel-1', [set.title, args.gameCmd]));
                } else if (typeof set.title !== 'undefined') {
                    console.log(locales.t('change-channel-2', [set.title]));
                } else {
                    console.log(locales.t('change-channel-3', [args.gameCmd]));
                }
            } else {
                if (typeof set.title !== 'undefined' && typeof args.gameCmd !== 'undefined' ) {
                    console.log(locales.t('could-not-change-channel-1', [set.title, args.gameCmd]));
                } else if (typeof set.title !== 'undefined') {
                    console.log(locales.t('could-not-change-channel-2', [set.title]));
                } else {
                    console.log(locales.t('could-not-change-channel-3', [args.gameCmd]));
                }
            }
        });
    },
    /**
     * Moves a video in sorting order
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    move: function(chatbot, args) {
        let time = moment().unix();
        let from = 'playlist_video_join';
        let direction = args.direction > 0 ? 'down' : 'up';
        let where = ['playlist_id = ?'];
        let prepare = [args.playlist.id];

        database.find('*', from, '', where, '', 'sort', 0, prepare, function(rows) {
            let index = video.getIndexFromVideos(rows, args.item);

            if (index < 0) {
                return false;
            }

            let sort = rows[index].sort;
            rows[index].sort = rows[index + args.direction].sort;
            rows[index + args.direction].sort = sort;
            let set = {
                updatedAt: time,
                sort: rows[index].sort
            };
            where = [`uuid = '${rows[index].uuid}'`];

            database.update(from, set, where, function() {
                set = {
                    updatedAt: time,
                    sort: rows[index + args.direction].sort
                };
                where = [`uuid = '${rows[index + args.direction].uuid}'`];

                database.update(from, set, where, function() {
                    if (args.playlist.id === chatbot.activePlaylists[args.channel].id) {
                        chatbot.getActivePlaylist(chatbot, args);
                    }
                    chatbot.getPlaylist(chatbot, args);
                    console.log(locales.t('video-moved', [args.item.name, locales.t(direction), args.playlist.name]));
                });
            });
        });
    },
    /**
     * Removes video
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    remove: function(chatbot, args) {
        database.remove('playlist_video_join', ['uuid = ?'], [args.item.uuid], function(remove) {
            chatbot.getPlaylists(chatbot, args);

            // if is active playlist
            if (args.playlist.id === chatbot.activePlaylists[args.channel].id) {
                chatbot.getActivePlaylist(chatbot, args);
            }

            chatbot.getPlaylist(chatbot, args);
            console.log(locales.t('video-removed', [args.item.name, args.playlist.name]));
        });
    },
    /**
     * Updates video properties
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    update: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let reloadActivePlaylist = false;
            let deleteProperties = ['durationHours', 'durationMin', 'durationSec', 'autofill'];
            args.item.updatedAt = moment().unix(); // unix timestamp (seconds)

            // delete properties which are not in database
            for (let i = 0; i < deleteProperties.length; i++) {
                if (typeof args.item[deleteProperties[i]] !== 'undefined') {
                    delete args.item[deleteProperties[i]];
                    reloadActivePlaylist = true;
                }
            }

            let set = {
                name: args.item.name,
                subName: args.item.subName,
                file: args.item.file,
                duration: args.item.duration, // unix timestamp (seconds)
                player: args.item.player,
                updatedAt: args.item.updatedAt
            };

            database.update('video', set, [`id = ${args.item.id}`], function() {
                set = {
                    played: args.item.played,
                    skipped: args.item.skipped,
                    titleCmd: args.item.titleCmd,
                    gameCmd: args.item.gameCmd,
                    start: 0,
                    end: 0,
                    updatedAt: args.item.updatedAt
                };

                database.update('playlist_video_join', set, [`uuid = '${args.item.uuid}'`], function() {
                    // if is active playlist
                    if (args.item.playlistId === chatbot.activePlaylists[args.channel].id) {
                        let index = video.getIndexFromVideos(chatbot.activePlaylists[args.channel].videos, args.item);
                        chatbot.activePlaylists[args.channel].videos[index] = args.item;

                        if (reloadActivePlaylist) {
                            chatbot.getActivePlaylist(chatbot, args);
                        }
                    }

                    console.log(locales.t('video-updated', [args.item.name, args.playlist.name]));
                });
            });
        }
    }
};

module.exports = video;
