const database     = require('./database');
const locales      = require('./locales');
const fs           = require('fs');
const mediainfo    = require('mediainfo-wrapper');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4} = require('uuid');

const playlist = {
    /**
     * Adds active playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    addPlaylist: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let time = moment().unix();
            let values = {
                channelId: chatbot.channels[args.channel].id,
                name: args.playlist.name,
                active: args.playlist.active,
                updatedAt: time,
                createdAt: time
            };

            database.insert('playlist', [values], function(insert) {
                // if new playlist is active playlist
                if (args.playlist.active) {
                    let where = [
                        `channel_id = '${chatbot.channels[args.channel].id}'`,
                        `id != ${insert.lastID}`
                    ];

                    database.update('playlist', {active: 0, updatedAt: time}, where, function(update) {
                        playlist.getActivePlaylist(chatbot, args);
                        playlist.getPlaylists(chatbot, args);
                    });
                } else {
                    playlist.getPlaylists(chatbot, args);
                }
                console.log(locales.t('playlist-added', [args.playlist.name]));
            });
        }
    },
    /**
     * Adds a video
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    addVideo: function(chatbot, args) {
        if (chatbot.socket !== null) {
            delete args.video.durationHours;
            delete args.video.durationMin;
            delete args.video.durationSec;
            delete args.video.autofill;
            let time = moment().unix();

            let values = {
                channelId: chatbot.channels[args.channel].id,
                name: args.video.name,
                subName: args.video.subName,
                file: args.video.file,
                duration: args.video.duration, // unix timestamp (seconds)
                player: args.video.player,
                updatedAt: time, // unix timestamp (seconds)
                createdAt: time // unix timestamp (seconds)
            };

            let select = 'v.id, p.name, pvj.sort';
            let from = 'playlist AS p';
            let join = 'LEFT JOIN playlist_video_join AS pvj ON p.id = pvj.playlist_id ';
            join += 'LEFT JOIN video AS v ON pvj.video_id = v.id';
            let where = ['p.id = ?'];

            // find videos from playlist
            database.find(select, from, join, where, '', 'sort', 0, [args.video.playlistId], function(rows) {
                // if video.id is defined, just add playlist relation
                if (args.video.id) {
                    values = {
                        uuid: uuidv4(),
                        playlistId: args.video.playlistId,
                        videoId: args.video.id,
                        played: args.video.played,
                        skipped: args.video.skipped,
                        titleCmd: args.video.titleCmd,
                        gameCmd: args.video.gameCmd,
                        start: 0,
                        end: 0,
                        sort: rows[0].sort === null ? 0 : 1 * (rows[rows.length - 1].sort + 1),
                        updatedAt: time, // unix timestamp (seconds)
                        createdAt: time // unix timestamp (seconds)
                    };

                    database.insert('playlist_video_join', [values], function() {
                        if (args.video.playlistId === chatbot.activePlaylists[args.channel].id) {
                            values.id = values.videoId;
                            values.name = args.video.name;
                            values.subName = args.video.subName;
                            values.file = args.video.file;
                            values.duration = args.video.duration; // unix timestamp (seconds)
                            values.player = args.video.player;
                            playlist.getActivePlaylist(chatbot, args);
                        }

                        playlist.getPlaylists(chatbot, args);
                        console.log(locales.t('video-added', [args.video.name, rows[0].name]));
                    });
                } else {
                    database.insert('video', [values], function(insert) {
                        values = {
                            uuid: uuidv4(),
                            playlistId: args.video.playlistId,
                            videoId: insert.lastID,
                            played: args.video.played,
                            skipped: args.video.skipped,
                            titleCmd: args.video.titleCmd,
                            gameCmd: args.video.gameCmd,
                            start: 0,
                            end: 0,
                            sort: rows[0].sort === null ? 0 : 1 * (rows[rows.length - 1].sort + 1),
                            updatedAt: time,
                            createdAt: time
                        };

                        database.insert('playlist_video_join', [values], function() {
                            if (args.video.playlistId === chatbot.activePlaylists[args.channel].id) {
                                values.id = values.videoId;
                                values.name = args.video.name;
                                values.subName = args.video.subName;
                                values.file = args.video.file;
                                values.duration = args.video.duration; // unix timestamp (seconds)
                                values.player = args.video.player;
                                playlist.getActivePlaylist(chatbot, args);
                            }

                            playlist.getPlaylists(chatbot, args);
                            console.log(locales.t('video-added', [args.video.name, rows[0].name]));
                        });
                    });
                }
            });
        }
    },
    /**
     * Removes all videos from playlisz
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    clearActivePlaylist: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let from = 'playlist_video_join';
            let where = ['playlist_id = ?'];
            let prepare = [chatbot.activePlaylists[args.channel].id];

            database.remove(from, where, prepare, function(remove) {
                playlist.getActivePlaylist(chatbot, args);
                console.log(locales.t('playlist-cleared', [chatbot.activePlaylists[args.channel].name]));
            });
        }
    },
    /**
     * Sends active playlist to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getActivePlaylist: function(chatbot, args) {
        let select = 'p.id AS p_id, p.name AS p_name, p.updated_at AS p_updated_at, p.created_at AS p_created_at, ';
        select += 'v.id, v.name, v.sub_name, v.file, v.duration, v.player, v.updated_at, v.created_at, ';
        select += 'pvj.uuid, pvj.start, pvj.end, pvj.played, pvj.uuid, pvj.start, pvj.end, pvj.played, ';
        select += 'pvj.skipped, pvj.title_cmd, pvj.game_cmd, pvj.sort';
        let from = 'playlist AS p';
        let join = 'LEFT JOIN playlist_video_join AS pvj ON p.id = pvj.playlist_id ';
        join += 'LEFT JOIN video AS v ON pvj.video_id = v.id ';
        let where = ['p.channel_id = ?', 'p.active = 1'];
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, from, join, where, '', 'sort', 0, prepare, function(rows) {
            if (rows.length) {
                chatbot.activePlaylists[args.channel] = {
                    id: rows[0].p_id,
                    name: rows[0].p_name,
                    updatedAt: rows[0].p_updated_at, // unix timestamp (seconds)
                    createdAt: rows[0].p_created_at, // unix timestamp (seconds)
                    active: true,
                    videoQuantity: 0,
                    videos: []
                };

                // if any video found
                if (rows[0].name !== null) {
                    chatbot.activePlaylists[args.channel].videoQuantity = rows.length;

                    rows.forEach(function(row) {
                        chatbot.activePlaylists[args.channel].videos.push({
                            id: row.id,
                            uuid: row.uuid,
                            playlistId: row.p_id,
                            name: row.name,
                            subName: row.sub_name,
                            file: row.file,
                            duration: row.duration, // unix timestamp (seconds)
                            player: row.player,
                            start: row.start,
                            end: row.end,
                            played: !!row.played,
                            skipped: !!row.skipped,
                            titleCmd: row.title_cmd,
                            gameCmd: row.game_cmd,
                            sort: row.sort,
                            updatedAt: row.updated_at, // unix timestamp (seconds)
                            createdAt: row.created_at // unix timestamp (seconds)
                        });
                    });
                }

                if (chatbot.socket !== null) {
                    let currentTime = chatbot.currentVideoStart[args.channel];

                    // sets start and end timestamp
                    for (let i = 0; i < chatbot.activePlaylists[args.channel].videos.length; i++) {
                        // if video is skipped
                        if (chatbot.activePlaylists[args.channel].videos[i].skipped) {
                            chatbot.activePlaylists[args.channel].videos[i].start = 0;
                            chatbot.activePlaylists[args.channel].videos[i].end = 0;
                            continue;
                        }

                        // if video not played or is last video in list and currentTime is set
                        if ((!chatbot.activePlaylists[args.channel].videos[i].played 
                            || (i + 1) === chatbot.activePlaylists[args.channel].videos.length) && currentTime > 0) {
                            chatbot.activePlaylists[args.channel].videos[i].start = currentTime;
                            chatbot.activePlaylists[args.channel].videos[i].end = currentTime + chatbot.activePlaylists[args.channel].videos[i].duration;
                            currentTime += chatbot.activePlaylists[args.channel].videos[i].duration;
                        } else {
                            // if video played
                            let currentVideoFile = '';
                            chatbot.activePlaylists[args.channel].videos[i].start = 0;
                            chatbot.activePlaylists[args.channel].videos[i].end = 0;

                            if (currentTime === 0) {
                                continue;
                            }

                            // find currentVideoFile
                            for (let j = chatbot.activePlaylists[args.channel].videos.length - 1; j >= 0; j--) {
                                if (chatbot.activePlaylists[args.channel].videos[j].played 
                                        || (!chatbot.activePlaylists[args.channel].videos[j].played && j === 0)) {
                                    currentVideoFile = chatbot.activePlaylists[args.channel].videos[j].file;
                                    break;
                                }
                            }

                            // if file is currently played
                            if (currentVideoFile === chatbot.activePlaylists[args.channel].videos[i].file 
                                && typeof currentTime !== 'undefined') {
                                chatbot.activePlaylists[args.channel].videos[i].start = currentTime;
                                chatbot.activePlaylists[args.channel].videos[i].end = currentTime + chatbot.activePlaylists[args.channel].videos[i].duration;
                                currentTime += chatbot.activePlaylists[args.channel].videos[i].duration;
                            }
                        }
                    }

                    const call = {
                        args: {
                            channel: args.channel,
                            activePlaylist: chatbot.activePlaylists[args.channel]
                        },
                        method: 'setActivePlaylist',
                        ref: 'playlist',
                        env: 'browser'
                    };

                    chatbot.socket.write(JSON.stringify(call));
                }
            }
        });
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
                    let format = chatbot.t['date'];
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
     * Sends playlist to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getPlaylist: function(chatbot, args) {
        let selectedPlaylist = {};
        let select = 'id, name, active, updated_at AS updatedAt, created_at AS createdAt';
        let from = 'playlist';
        let where = ['id = ?', 'channel_id = ?'];
        let prepare = [args.playlist.id, chatbot.channels[args.channel].id];

        database.find(select, from, '', where, '', '', 1, prepare, function(rows) {
            if (rows.length) {
                selectedPlaylist = rows[0];

                select = 'v.id, v.name, v.file, v.duration, v.player, ';
                select += 'v.updated_at AS updatedAt, v.created_at AS createdAt, v.sub_name AS subName, ';
                select += 'pvj.uuid, pvj.start, pvj.end, pvj.played, pvj.skipped, pvj.sort, ';
                select += 'pvj.title_cmd AS titleCmd, pvj.game_cmd AS gameCmd, pvj.playlist_id AS playlistId';
                from = 'playlist_video_join AS pvj';
                where = ['pvj.playlist_id = ?'];
                let join = 'LEFT JOIN video AS v ON pvj.video_id = v.id';
                prepare = [args.playlist.id];

                // find videos from target playlist
                database.find(select, from, join, where, '', 'pvj.sort', 0, prepare, function(rowsVideo) {
                    if (chatbot.socket !== null) {
                        selectedPlaylist.videos = rowsVideo;
                        const call = {
                            args: {
                                channel: args.channel,
                                playlist: selectedPlaylist
                            },
                            method: 'setPlaylist',
                            ref: 'playlist',
                            env: 'browser'
                        };

                        chatbot.socket.write(JSON.stringify(call));
                    }
                });
            }
        });
    },
    /**
     * Sends information about tokens and video folder to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getPlaylistConfig: function(chatbot, args) {
        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    config: {
                        hasClientIdToken: !!chatbot.config.clientIdToken.length,
                        hasVideosFolder: fs.existsSync(chatbot.config.videosFolder),
                        hasYoutubeToken: !!chatbot.config.youtubeToken.length
                    }
                },
                method: 'setPlaylistConfig',
                ref: 'playlist',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Sends all playlists to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getPlaylists: function(chatbot, args) {
        let select = 'p.id, p.name, p.active, p.updated_at AS updatedAt, ';
        select += 'p.created_at AS createdAt, COUNT(pvj.playlist_id) AS videoQuantity';
        let from = 'playlist AS p';
        let join = 'LEFT JOIN playlist_video_join AS pvj ON p.id = pvj.playlist_id ';
        let where = ['p.channel_id = ?'];
        let group = 'p.id';
        let order = 'p.name';
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, from, join, where, group, order, 100, prepare, function(rows) {
            if (chatbot.socket !== null) {
                chatbot.playlists[args.channel] = rows;
                const call = {
                    args: {
                        channel: args.channel,
                        playlists: chatbot.playlists[args.channel]
                    },
                    method: 'setPlaylists',
                    ref: 'playlist',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sends playlists by given playlistSearch to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getPlaylistSearchResults: function(chatbot, args) {
        let search = args.playlistSearch.replace(/ /g, '%');
        let select = 'p.id, p.name, p.active, p.updated_at AS updatedAt, ';
        select += 'p.created_at AS createdAt, COUNT(pvj.playlist_id) AS videoQuantity';
        let from = 'playlist AS p';
        let join = 'LEFT JOIN playlist_video_join AS pvj ON p.id = pvj.playlist_id ';
        let where = ['channel_id = ?', 'name LIKE ?'];
        let group = 'p.name';
        let order = group;
        let prepare = [chatbot.channels[args.channel].id, `%${search}%`];

        database.find(select, from, join, where, group, order, 30, prepare, function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        playlists: rows
                    },
                    method: 'setPlaylistSearchResults',
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
        if (/^[A-Z][A-Za-z0-9]+$/.test(args.file) && chatbot.config.clientIdToken.length) {
            let options = {
                url: `https://api.twitch.tv/kraken/clips/${args.file}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get single twitch video
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                body = JSON.parse(body);

                if (typeof body.error === 'undefined') {
                    let duration = (body.duration -.5).toFixed(0);
                    let format = chatbot.t['date'];
                    let name = body.title;
                    let subName = (body.game.length ? `${body.game} - ` : '') + 'Clip';
                    subName += ` (${moment(body.created_at).format(format)})`;

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
     * Sends meta information from twitch video to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getTwitchVideoMeta: function(chatbot, args) {
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
        if (/^[0-9]+$/.test(args.file) && chatbot.config.clientIdToken.length) {
            let options = {
                url: `https://api.twitch.tv/kraken/videos/${args.file}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get single twitch video
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                body = JSON.parse(body);

                if (typeof body.error === 'undefined' 
                    && body.status === 'recorded') {
                    let duration = body.length;
                    let format = chatbot.t['date'];
                    let name = body.title;
                    let subName = body.game.length ? `${body.game} (${moment(body.created_at).format(format)})` : moment(body.created_at).format(format);

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
     * Sends the next video to frontend and changes stream title and/or game
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getVideo: function(chatbot, args) {
        if (chatbot.socketVideo !== null) {
            let match = false;
            let matchUuid = '';
            let uuidArray = [];

            let video = {
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
                    video = chatbot.activePlaylists[args.channel].videos[i];
                    chatbot.activePlaylists[args.channel].videos[i].played = true;
                    chatbot.currentVideoStart[args.channel] = moment().unix();
                    matchUuid = chatbot.activePlaylists[args.channel].videos[i].uuid;
                    match = true;
                }
            }

            if (chatbot.channels[args.channel].oauthToken.length) {
                let set = {'channel': {}};

                // if titleCmd is set, change stream titel
                if (typeof video.titleCmd !== 'undefined' && video.titleCmd.length) {
                    set.channel.status = video.titleCmd;
                }

                // if gameCmd is set, change stream game
                if (typeof video.gameCmd !== 'undefined' && video.gameCmd.length) {
                    set.channel.game = video.gameCmd;
                }

                if (Object.keys(set.channel).length) {
                    let options = {
                        url: `https://api.twitch.tv/v5/channels/${chatbot.channels[args.channel].id}`,
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/vnd.twitchtv.v5+json',
                            'Authorization': `OAuth ${chatbot.channels[args.channel].oauthToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(set)
                    };

                    // change stream game and/ or title
                    request(options, (err, res, body) => {
                        if (err) {
                            return console.log(err);
                        }
                        body = JSON.parse(body);

                        if (typeof body.error === 'undefined') {
                            if (typeof set.channel.status !== 'undefined' && typeof set.channel.game !== 'undefined' ) {
                                locales.t('change-channel-1', [set.channel.status, set.channel.game]);
                            } else if (typeof set.channel.status !== 'undefined') {
                                locales.t('change-channel-2', [set.channel.status]);
                            } else {
                                locales.t('change-channel-3', [set.channel.game]);
                            }
                        } else {
                            if (typeof set.channel.status !== 'undefined' && typeof set.channel.game !== 'undefined' ) {
                                locales.t('could-not-change-channel-1', [set.channel.status, set.channel.game]);
                            } else if (typeof set.channel.status !== 'undefined') {
                                locales.t('could-not-change-channel-2', [set.channel.status]);
                            } else {
                                locales.t('could-not-change-channel-3', [set.channel.game]);
                            }
                        }
                    });
                }
            } else {
                // if titleCmd is set, change stream titel
                if (typeof video.titleCmd !== 'undefined' && video.titleCmd.length) {
                    chatbot.client.say('#' + args.channel, `!title ${video.titleCmd}`);
                }

                // if gameCmd is set, change stream game
                if (typeof video.gameCmd !== 'undefined' && video.gameCmd.length) {
                    chatbot.client.say('#' + args.channel, `!game ${video.gameCmd}`);
                }
            }

            const call = {
                args: {
                    channel: args.channel,
                    video: video
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
                            playlist.getActivePlaylist(chatbot, args);
                        });
                    } else {
                        playlist.getActivePlaylist(chatbot, args);
                    }
                });
            } else {
                playlist.getActivePlaylist(chatbot, args);
            }
        }
    },
    /**
     * Returns index of given video in videos
     * 
     * @param {object} videos
     * @param {object} video
     * @returns {number}
     */
    getVideoIndexFromVideos: function(videos, video) {
        for (let i = 0; i < videos.length; i++) {
            if (video.uuid === videos[i].uuid) {
                return i;
            }
        }
        return -1;
    },
    /**
     * Sends video by given videoSearch to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getVideoSearchResults: function(chatbot, args) {
        let search = args.videoSearch.replace(/ /g, '%');
        let select = 'id, name, sub_name AS subName, file, ';
        select += 'duration, player, updated_at AS updatedAt, created_at AS createdAt';
        let where = ['channel_id = ?', '(name LIKE ? OR file LIKE ?)'];
        let prepare = [chatbot.channels[args.channel].id, `%${search}%`, `%${search}%`];

        database.find(select, 'video', '', where, '', 'name', 30, prepare, function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        videos: rows
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
        if (/^[a-z0-9_-]{11}$/i.test(args.file) && chatbot.config.youtubeToken.length) {
            // get single youtube video
            request(`https://www.googleapis.com/youtube/v3/videos?id=${args.file}&key=${chatbot.config.youtubeToken}&part=snippet,contentDetails,statistics,status`, {json: true}, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (body.items.length) {
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
     * Merges 2 playlists
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    mergePlaylists: function(chatbot, args) {
        let select = 'v.id, v.name, v.file, v.duration, v.player, ';
        select += 'v.updated_at AS updatedAt, v.created_at AS createdAt, v.sub_name AS subName, ';
        select += 'pvj.uuid, pvj.start, pvj.end, pvj.played, pvj.skipped, pvj.sort, ';
        select += 'pvj.title_cmd AS titleCmd, pvj.game_cmd AS gameCmd, pvj.playlist_id AS playlistId';
        let from = 'playlist_video_join AS pvj';
        let join = 'LEFT JOIN video AS v ON pvj.video_id = v.id';
        let where = ['pvj.playlist_id = ?'];
        let order = 'pvj.sort';
        let limit = 0; // equal to: args.merge.from === 0 && args.merge.to === 0
        let prepare = [args.merge.target.id];

        if (args.merge.from > 0 && args.merge.to > 0) {
            limit = (args.merge.from - 1) + ',' + (args.merge.to - args.merge.from) + 1;
        } else if (args.merge.from === 0 && args.merge.to > 0) {
            limit = '0,' + args.merge.to;
        } else if (args.merge.from > 0 && args.merge.to === 0) {
            limit = (args.merge.from - 1) + ',9999';
        }

        // find videos from target playlist
        database.find(select, from, join, where, '', order, 0, prepare, function(rowsTarget) {
            prepare = [args.merge.source.id];

            // find videos from source playlist
            database.find(select, from, join, where, '', order, limit, prepare, function(rowsSource) {
                let values = [];
                let counter = 0;
                let sort = 0;

                rowsSource.forEach(function(row) {
                    sort = 1 * counter++;

                    if (args.merge.method === 1 
                        && typeof rowsTarget[rowsTarget.length - 1] !== 'undefined') {
                        sort = 1 * (rowsTarget[rowsTarget.length - 1].sort + counter);
                    }

                    values.push({
                        uuid: uuidv4(),
                        playlistId: args.merge.target.id,
                        videoId: row.id,
                        played: 0,
                        skipped: 0,
                        start: 0,
                        end: 0,
                        titleCmd: '',
                        gameCmd: '',
                        sort: sort,
                        updatedAt: row.updatedAt,
                        createdAt: row.createdAt
                    });
                });

                // append playlist
                if (args.merge.method === 1) {
                    database.insert('playlist_video_join', values, function(insert) {
                        if (args.merge.target.id === chatbot.activePlaylists[args.channel].id) {
                            playlist.getActivePlaylist(chatbot, args);
                        }

                        playlist.getPlaylists(chatbot, args);
                        console.log(locales.t('playlist-merged', [rowsSource.length, locales.t('video', {count: rowsSource.length}), args.merge.source.name, args.merge.target.name]));
                    });
                } else {
                    // prepend playlist
                    rowsTarget.forEach(function(row) {
                        values.push({
                            uuid: uuidv4(),
                            playlistId: args.merge.target.id,
                            videoId: row.id,
                            played: row.played,
                            skipped: row.skipped,
                            start: row.start,
                            end: row.end,
                            titleCmd: row.titleCmd,
                            gameCmd: row.gameCmd,
                            sort: 1 * counter++,
                            updatedAt: moment().unix(),
                            createdAt: moment().unix()
                        });
                    });

                    // remove current relations
                    database.remove('playlist_video_join', ['playlist_id = ?'], [args.merge.target.id], function(remove) {
                        // insert new relations
                        database.insert('playlist_video_join', values, function(insert) {
                            if (args.merge.target.id === chatbot.activePlaylists[args.channel].id) {
                                playlist.getActivePlaylist(chatbot, args);
                            }

                            playlist.getPlaylists(chatbot, args);
                            console.log(locales.t('playlist-merged', [rowsSource.length, args.merge.source.name, args.merge.target.name]));
                        });
                    });
                }
            });
        });
    },
    /**
     * Moves a video in sorting order
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    moveVideo: function(chatbot, args) {
        let time = moment().unix();
        let from = 'playlist_video_join';
        let direction = args.direction > 0 ? 'down' : 'up';
        let where = ['playlist_id = ?'];
        let prepare = [args.playlist.id];

        database.find('*', from, '', where, '', 'sort', 0, prepare, function(rows) {
            let videoIndex = playlist.getVideoIndexFromVideos(rows, args.video);

            if (videoIndex < 0) {
                return false;
            }

            let sort = rows[videoIndex].sort;
            rows[videoIndex].sort = rows[videoIndex + args.direction].sort;
            rows[videoIndex + args.direction].sort = sort;
            let set = {
                updatedAt: time,
                sort: rows[videoIndex].sort
            };
            where = [`uuid = '${rows[videoIndex].uuid}'`];

            database.update(from, set, where, function() {
                set = {
                    updatedAt: time,
                    sort: rows[videoIndex + args.direction].sort
                };
                where = [`uuid = '${rows[videoIndex + args.direction].uuid}'`];

                database.update(from, set, where, function() {
                    if (args.playlist.id === chatbot.activePlaylists[args.channel].id) {
                        playlist.getActivePlaylist(chatbot, args);
                    }
                    playlist.getPlaylist(chatbot, args);
                    console.log(locales.t('video-moved', [args.video.name, locales.t(direction), args.playlist.name]));
                });
            });
        });
    },
    /**
     * Resets all videos in active playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    resetActivePlaylist: function(chatbot, args) {
        if (chatbot.socket !== null) {
            chatbot.currentVideoStart[args.channel] = 0;
            let set = {
                played: 0,
                skipped: 0,
                start: 0,
                end: 0,
                updatedAt: moment().unix()
            };
            let where = [`playlist_id = ${chatbot.activePlaylists[args.channel].id}`];

            database.update('playlist_video_join', set, where, function(update) {
                playlist.getActivePlaylist(chatbot, args);
                console.log(locales.t('playlist-resetted', [chatbot.activePlaylists[args.channel].name]));
            });
        }
    },
    /**
     * Removes playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    removePlaylist: function(chatbot, args) {
        if (chatbot.socket !== null && args.playlist.name.toLowerCase() !== 'general') {
            database.remove('playlist', ['id = ?'], [args.playlist.id], function(remove) {
                playlist.getPlaylists(chatbot, args);

                if (args.playlist.active) {
                    let playlistId = chatbot.playlists[args.channel][0].id;

                    if (chatbot.playlists[args.channel][0].id === args.playlist.id) {
                        playlistId = chatbot.playlists[args.channel][1].id;
                    }

                    let from = 'playlist';
                    let set = {
                        active: 1,
                        updatedAt: moment().unix()
                    };
                    let where = [`id = ${playlistId}`];

                    database.update(from, set, where, function(update) {
                        playlist.getActivePlaylist(chatbot, args);
                        console.log(locales.t('playlist-removed', [args.playlist.name]));
                    });
                } else {
                    console.log(locales.t('playlist-removed', [args.playlist.name]));
                }
            });
        }
    },
    /**
     * Removes video
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    removeVideo: function(chatbot, args) {
        database.remove('playlist_video_join', ['uuid = ?'], [args.video.uuid], function(remove) {
            playlist.getPlaylists(chatbot, args);

            // if is active playlist
            if (args.playlist.id === chatbot.activePlaylists[args.channel].id) {
                playlist.getActivePlaylist(chatbot, args);
            }

            playlist.getPlaylist(chatbot, args);
            console.log(locales.t('video-removed', [args.video.name, args.playlist.name]));
        });
    },
    /**
     * Removes videos from active playlist which flaged as "skipped" or "played"
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    removeVideosByFlagFromActivePlaylist: function(chatbot, args) {
        let uuidArray = [];
        let videos = chatbot.activePlaylists[args.channel].videos;

        for (let i = 0; i < videos.length; i++) {
            // convert to boolean and compare
            if (!!videos[i][args.flag] === !!args.value) {
                uuidArray.push(videos[i].uuid);
            }
        }

        if (uuidArray.length) {
            database.remove('playlist_video_join', [`uuid IN ('${uuidArray.join('\', \'')}')`], [], function(remove) {
                playlist.getActivePlaylist(chatbot, args);
                playlist.getPlaylists(chatbot, args);
                console.log(locales.t('videos-removed', [remove.changes, locales.t('video', {count: remove.changes}), chatbot.activePlaylists[args.channel].name]));
            });
        } else {
            playlist.getActivePlaylist(chatbot, args);
        }
    },
    /**
     * Switches the active playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    switchPlaylist: function(chatbot, args) {
        let time = moment().unix();

        // reset playlists to active = 0
        database.update('playlist', {active: 0, updatedAt: time}, [`channel_id = '${chatbot.channels[args.channel].id}'`], function(updateAll) {
            // set playlist to active = 1
            database.update('playlist', {active: 1, updatedAt: time}, [`id = ${args.playlist.id}`], function(update) {
                playlist.getActivePlaylist(chatbot, args);
                playlist.getPlaylists(chatbot, args);
                console.log(locales.t('playlist-switched', [args.playlist.name]));
            });
        });
    },
    /**
     * Updates playlist name
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    updatePlaylist: function(chatbot, args) {
        if (args.playlist.name.toLowerCase() !== 'general') {
            let set = {
                name: args.playlist.name,
                updatedAt: moment().unix()
            };
            let where = [
                `id = ${args.playlist.id}`,
                `channel_id = '${chatbot.channels[args.channel].id}'`
            ];

            database.update('playlist', set, where, function(update) {
                if (args.playlist.id === chatbot.activePlaylists[args.channel].id) {
                    playlist.getActivePlaylist(chatbot, args);
                }

                playlist.getPlaylists(chatbot, args);
                console.log(locales.t('playlist-updated', [args.playlist.name]));
            });
        }
    },
    /**
     * Updates video properties
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    updateVideo: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let reloadActivePlaylist = false;
            let deleteProperties = ['durationHours', 'durationMin', 'durationSec', 'autofill'];
            args.video.updatedAt = moment().unix(); // unix timestamp (seconds)

            // delete properties which are not in database
            for (let i = 0; i < deleteProperties.length; i++) {
                if (typeof args.video[deleteProperties[i]] !== 'undefined') {
                    delete args.video[deleteProperties[i]];
                    reloadActivePlaylist = true;
                }
            }

            let set = {
                name: args.video.name,
                subName: args.video.subName,
                file: args.video.file,
                duration: args.video.duration, // unix timestamp (seconds)
                player: args.video.player,
                updatedAt: args.video.updatedAt
            };

            database.update('video', set, [`id = ${args.video.id}`], function() {
                set = {
                    played: args.video.played,
                    skipped: args.video.skipped,
                    titleCmd: args.video.titleCmd,
                    gameCmd: args.video.gameCmd,
                    start: 0,
                    end: 0,
                    updatedAt: args.video.updatedAt
                };

                database.update('playlist_video_join', set, [`uuid = '${args.video.uuid}'`], function() {
                    // if is active playlist
                    if (args.video.playlistId === chatbot.activePlaylists[args.channel].id) {
                        let videoIndex = playlist.getVideoIndexFromVideos(chatbot.activePlaylists[args.channel].videos, args.video);
                        chatbot.activePlaylists[args.channel].videos[videoIndex] = args.video;

                        if (reloadActivePlaylist) {
                            playlist.getActivePlaylist(chatbot, args);
                        }
                    }

                    console.log(locales.t('video-updated', [args.video.name, args.playlist.name]));
                });
            });
        }
    }
};

module.exports = playlist;
