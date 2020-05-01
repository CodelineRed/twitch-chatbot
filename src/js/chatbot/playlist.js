const database     = require('./database');
const fs           = require('fs');
const latinize     = require('latinize');
const mediainfo    = require('mediainfo-wrapper');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4} = require('uuid');

Object.assign(latinize.characters, {
    'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ä': 'ae', 
    'ö': 'oe', 'ü': 'ue', 'ẞ': 'S'
});

const playlist = {
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
                if (args.playlist.active) {
                    chatbot.activePlaylists[args.channel] = {
                        id: insert.lastID,
                        name: args.playlist.name,
                        active: true,
                        updatedAt: time,
                        createdAt: time,
                        videoQuantity: 0,
                        videos: []
                    };
                    playlist.getActivePlaylist(chatbot, args);

                    let where = [
                        'channel_id = ' + chatbot.channels[args.channel].id,
                        'id != ' + insert.lastID
                    ];

                    database.update('playlist', {active: 0, updatedAt: time}, where, function(update) {
                        playlist.getPlaylists(chatbot, args);
                    });
                } else {
                    playlist.getPlaylists(chatbot, args);
                }
            });
        }
    },
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
                platform: args.video.platform,
                updatedAt: time, // unix timestamp (seconds)
                createdAt: time // unix timestamp (seconds)
            };

            let select = 'id, uuid, sort';
            let from = 'playlist_video_join AS pvj';
            let join = 'LEFT JOIN video AS v ON pvj.video_id = v.id';

            // find videos from playlist
            database.find(select, from, join, ['pvj.playlist_id = ' + args.video.playlistId], '', 'sort', 0, function(rows) {
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
                        sort: rows.length === 0 ? rows.length : 1 * (rows[rows.length - 1].sort + 1),
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
                            values.platform = args.video.platform;
                            chatbot.activePlaylists[args.channel].videos.push(values);
                            chatbot.activePlaylists[args.channel].videoQuantity = chatbot.activePlaylists[args.channel].videos.length;
                            playlist.getActivePlaylist(chatbot, args);
                        }

                        playlist.getPlaylists(chatbot, args);
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
                            sort: rows.length === 0 ? rows.length : 1 * (rows[rows.length - 1].sort + 1),
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
                                values.platform = args.video.platform;
                                chatbot.activePlaylists[args.channel].videoQuantity = chatbot.activePlaylists[args.channel].videos.length;
                                chatbot.activePlaylists[args.channel].videos.push(values);
                                playlist.getActivePlaylist(chatbot, args);
                            }

                            playlist.getPlaylists(chatbot, args);
                        });
                    });
                }
            });
        }
    },
    clearActivePlaylist: function(chatbot, args) {
        if (chatbot.socket !== null) {
            chatbot.activePlaylists[args.channel].videos = [];
            playlist.getActivePlaylist(chatbot, args);
            database.remove('playlist_video_join', ['playlist_id = ' + chatbot.activePlaylists[args.channel].id]);
        }
    },
    getActivePlaylist: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let currentTime = chatbot.currentVideoStart[args.channel];

            // sets start and end timestamp
            for (let i = 0; i < chatbot.activePlaylists[args.channel].videos.length; i++) {
                if (chatbot.activePlaylists[args.channel].videos[i].skipped) {
                    chatbot.activePlaylists[args.channel].videos[i].start = 0;
                    chatbot.activePlaylists[args.channel].videos[i].end = 0;
                    continue;
                }

                if ((!chatbot.activePlaylists[args.channel].videos[i].played 
                    || (i + 1) === chatbot.activePlaylists[args.channel].videos.length) && currentTime > 0) {
                    chatbot.activePlaylists[args.channel].videos[i].start = currentTime;
                    chatbot.activePlaylists[args.channel].videos[i].end = currentTime + chatbot.activePlaylists[args.channel].videos[i].duration;
                    currentTime += chatbot.activePlaylists[args.channel].videos[i].duration;
                } else {
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
    },
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

                    // if duration greater than 23:59:59 hours
                    if (duration > 86399) {
                        duration = 0;
                    }

                    if (chatbot.socket !== null && duration) {
                        call.args.name = name;
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
    getPlaylist: function(chatbot, args) {
        let selectedPlaylist = {};
        let select = 'id, name, active, updated_at AS updatedAt, created_at AS createdAt';
        let where = [
            'id = ' + args.playlist.id,
            'channel_id = ' + chatbot.channels[args.channel].id
        ];

        database.find(select, 'playlist', '', where, '', '', 1, function(rows) {
            if (rows.length) {
                selectedPlaylist = rows[0];

                select = 'id, uuid, name, file, duration, platform, start, end, played, skipped, sort, ';
                select += 'title_cmd AS titleCmd, game_cmd AS gameCmd, pvj.playlist_id AS playlistId, ';
                select += 'v.updated_at AS updatedAt, v.created_at AS createdAt, sub_name AS subName';
                let from = 'playlist_video_join AS pvj';
                where = ['pvj.playlist_id = ' + args.playlist.id];
                let join = 'LEFT JOIN video AS v ON pvj.video_id = v.id';

                // find videos from target playlist
                database.find(select, from, join, where, '', 'sort', 0, function(rowsVideo) {
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
    getPlaylistConfig: function(chatbot, args) {
        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    config: {
                        hasYoutubeToken: !!chatbot.config.youtubeToken.length,
                        hasVideosFolder: fs.existsSync(chatbot.config.videosFolder),
                        hasTwitchClientIdToken: !!chatbot.config.clientIdToken.length
                    }
                },
                method: 'setPlaylistConfig',
                ref: 'playlist',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    getPlaylists: function(chatbot, args) {
        let select = 'id, name, active, p.updated_at AS updatedAt, ';
        select += 'p.created_at AS createdAt, COUNT(pvj.playlist_id) AS videoQuantity';
        let from = 'playlist AS p';
        let join = 'LEFT JOIN playlist_video_join AS pvj ON pvj.playlist_id = p.id ';
        let where = ['channel_id = ' + chatbot.channels[args.channel].id];
        let group = 'name';
        let order = group;
        database.find(select, from, join, where, group, order, 0, function(rows) {
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
    getPlaylistSearchResults: function(chatbot, args) {
        let search = args.playlistSearch.replace(/ /g, '%');
        let select = 'id, name, active, p.updated_at AS updatedAt, ';
        select += 'p.created_at AS createdAt, COUNT(pvj.playlist_id) AS videoQuantity';
        let from = 'playlist AS p';
        let join = 'LEFT JOIN playlist_video_join AS pvj ON pvj.playlist_id = p.id ';
        let where = [
            `channel_id = ${chatbot.channels[args.channel].id}`,
            `name LIKE '%${search}%'`
        ];
        let group = 'name';
        let order = group;

        database.find(select, from, join, where, group, order, 30, function(rows) {
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
            var options = {
                url: `https://api.twitch.tv/kraken/clips/${args.file}`,
                method: 'GET',
                headers: {
                    'Client-ID': chatbot.config.clientIdToken,
                    'Accept': 'application/vnd.twitchtv.v5+json'
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
                    let name = body.title;
                    let subName = `Clip - ${body.game}`;

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
            var options = {
                url: `https://api.twitch.tv/kraken/videos/${args.file}`,
                method: 'GET',
                headers: {
                    'Client-ID': chatbot.config.clientIdToken,
                    'Accept': 'application/vnd.twitchtv.v5+json'
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
                    let name = body.title;
                    let subName = body.game;

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
                platform: 'empty'
            };

            for (let i = 0; i < chatbot.activePlaylists[args.channel].videos.length; i++) {
                // set all videos after match to played = false
                if (chatbot.activePlaylists[args.channel].videos[i].skipped || match) {
                    chatbot.activePlaylists[args.channel].videos[i].played = false;
                    uuidArray.push(chatbot.activePlaylists[args.channel].videos[i].uuid);

                    if (chatbot.activePlaylists[args.channel].videos[i].skipped) {
                        continue;
                    }
                }

                if (!chatbot.activePlaylists[args.channel].videos[i].played && !match) {
                    video = chatbot.activePlaylists[args.channel].videos[i];
                    chatbot.activePlaylists[args.channel].videos[i].played = true;
                    chatbot.currentVideoStart[args.channel] = moment().unix();
                    matchUuid = chatbot.activePlaylists[args.channel].videos[i].uuid;
                    match = true;
                }
            }

            if (video.duration === 0) {
                //chatbot.currentVideoStart[args.channel] = 0;
            }

            if (typeof video.titleCmd !== 'undefined' && video.titleCmd.length) {
                chatbot.client.say('#' + args.channel, `!title ${video.titleCmd}`);
            }

            if (typeof video.gameCmd !== 'undefined' && video.gameCmd.length) {
                chatbot.client.say('#' + args.channel, `!game ${video.gameCmd}`);
            }

            const call = {
                args: {
                    channel: args.channel,
                    video: video
                },
                method: 'setVideo',
                ref: 'video',
                env: 'browser'
            };

            chatbot.socketVideo.write(JSON.stringify(call));
            playlist.getActivePlaylist(chatbot, args);

            if (matchUuid.length) {
                database.update('playlist_video_join', {played: true, start: 0, end: 0}, [`uuid = '${matchUuid}'`], function(update) {
                    if (uuidArray.length) {
                        database.update('playlist_video_join', {played: false, start: 0, end: 0}, [`uuid IN ('${uuidArray.join('\', \'')}')`]);
                    }
                });
            }
        }
    },
    getVideoIndexFromActivePlaylist: function(chatbot, channel, video) {
        for (let i = 0; i < chatbot.activePlaylists[channel].videos.length; i++) {
            if (video.uuid === chatbot.activePlaylists[channel].videos[i].uuid) {
                return i;
            }
        }

        return -1;
    },
    getVideoIndexFromVideos: function(videos, video) {
        for (let i = 0; i < videos.length; i++) {
            if (video.uuid === videos[i].uuid) {
                return i;
            }
        }

        return -1;
    },
    getVideoSearchResults: function(chatbot, args) {
        let search = args.videoSearch.replace(/ /g, '%');
        let select = 'id, name, file, duration, platform, updated_at AS updatedAt, created_at AS createdAt';
        let where = [
            `channel_id = ${chatbot.channels[args.channel].id}`,
            `name LIKE '%${search}%' OR file LIKE '%${search}%'`
        ];

        database.find(select, 'video', '', where, '', 'name', 30, function(rows) {
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
                    let multiplier = 60 * 60;
                    let name = body.items[0].snippet.title;

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
                            call.args.duration = duration;
                            chatbot.socket.write(JSON.stringify(call));
                        }
                    }
                } else {
                    console.log(body);
                }
            });
        } else if (chatbot.socket !== null) {
            chatbot.socket.write(JSON.stringify(call));
        }
    },
    mergePlaylists: function(chatbot, args) {
        let select = 'id, uuid, name, file, duration, platform, start, end, played, skipped, sort, ';
        select += 'title_cmd AS titleCmd, game_cmd AS gameCmd, pvj.playlist_id AS playlistId, ';
        select += 'v.updated_at AS updatedAt, v.created_at AS createdAt, sub_name AS subName';
        let from = 'playlist_video_join AS pvj';
        let join = 'LEFT JOIN video AS v ON pvj.video_id = v.id';
        let limit = 0; // equal to: args.merge.from === 0 && args.merge.to === 0

        if (args.merge.from > 0 && args.merge.to > 0) {
            limit = (args.merge.from - 1) + ',' + (args.merge.to - args.merge.from) + 1;
        } else if (args.merge.from === 0 && args.merge.to > 0) {
            limit = '0,' + args.merge.to;
        } else if (args.merge.from > 0 && args.merge.to === 0) {
            limit = (args.merge.from - 1) + ',50';
        }

        // find videos from target playlist
        database.find(select, from, join, ['pvj.playlist_id = ' + args.merge.targetId], '', 'sort', 0, function(rowsTarget) {
            // find videos from sorce playlist
            database.find(select, from, join, ['pvj.playlist_id = ' + args.merge.sourceId], '', 'sort', limit, function(rowsSource) {
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
                        playlistId: args.merge.targetId,
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
                        database.find(select, from, join, ['pvj.playlist_id = ' + args.merge.targetId], '', 'sort', 0, function(rowsTargetRefresh) {
                            if (args.merge.targetId === chatbot.activePlaylists[args.channel].id) {
                                chatbot.activePlaylists[args.channel].videos = rowsTargetRefresh;
                                playlist.getActivePlaylist(chatbot, args);
                            }

                            playlist.getPlaylists(chatbot, args);
                        });
                    });
                } else {
                    // prepend playlist
                    rowsTarget.forEach(function(row) {
                        values.push({
                            uuid: uuidv4(),
                            playlistId: args.merge.targetId,
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
                    database.remove('playlist_video_join', ['playlist_id = ' + args.merge.targetId], function(remove) {
                        // insert new relations
                        database.insert('playlist_video_join', values, function(insert) {
                            if (args.merge.targetId === chatbot.activePlaylists[args.channel].id) {
                                database.find(select, from, join, ['pvj.playlist_id = ' + args.merge.targetId], '', 'sort', 0, function(rowsTargetRefresh) {
                                    if (args.merge.targetId === chatbot.activePlaylists[args.channel].id) {
                                        chatbot.activePlaylists[args.channel].videos = rowsTargetRefresh;
                                        playlist.getActivePlaylist(chatbot, args);
                                    }

                                    playlist.getPlaylists(chatbot, args);
                                });
                            }
                        });
                    });
                }
            });
        });
    },
    moveVideo: function(chatbot, args) {
        let time = moment().unix();

        if (args.playlist.id === chatbot.activePlaylists[args.channel].id) {
            let videoIndex = playlist.getVideoIndexFromActivePlaylist(chatbot, args.channel, args.video);
            let sort = chatbot.activePlaylists[args.channel].videos[videoIndex].sort;
            chatbot.activePlaylists[args.channel].videos[videoIndex].sort = chatbot.activePlaylists[args.channel].videos[videoIndex + args.direction].sort;
            chatbot.activePlaylists[args.channel].videos[videoIndex + args.direction].sort = sort;

            let set = {
                updatedAt: time,
                sort: chatbot.activePlaylists[args.channel].videos[videoIndex].sort
            };
            let where = [`uuid = '${chatbot.activePlaylists[args.channel].videos[videoIndex].uuid}'`];
            database.update('playlist_video_join', set, where);

            set = {
                updatedAt: time,
                sort: chatbot.activePlaylists[args.channel].videos[videoIndex + args.direction].sort
            };
            where = [`uuid = '${chatbot.activePlaylists[args.channel].videos[videoIndex + args.direction].uuid}'`];
            database.update('playlist_video_join', set, where);

            let movedVideo = chatbot.activePlaylists[args.channel].videos.splice(videoIndex, 1)[0];
            chatbot.activePlaylists[args.channel].videos.splice(videoIndex + args.direction, 0, movedVideo);
            playlist.getActivePlaylist(chatbot, args);
        } else {
            let from = 'playlist_video_join';
            let where = ['playlist_id = ' + args.playlist.id];

            database.find('*', from, '', where, '', 'sort', 0, function(rows) {
                let videoIndex = playlist.getVideoIndexFromVideos(rows, args.video);
                let sort = rows[videoIndex].sort;
                rows[videoIndex].sort = rows[videoIndex + args.direction].sort;
                rows[videoIndex + args.direction].sort = sort;

                let set = {
                    updatedAt: time,
                    sort: rows[videoIndex].sort
                };
                where = [`uuid = '${rows[videoIndex].uuid}'`];
                database.update('playlist_video_join', set, where);

                set = {
                    updatedAt: time,
                    sort: rows[videoIndex + args.direction].sort
                };
                where = [`uuid = '${rows[videoIndex + args.direction].uuid}'`];
                database.update('playlist_video_join', set, where);

                playlist.getPlaylist(chatbot, args);
            });
        }
    },
    resetActivePlaylist: function(chatbot, args) {
        if (chatbot.socket !== null) {
            const playlistLength = chatbot.activePlaylists[args.channel].videos.length;
            chatbot.currentVideoStart[args.channel] = 0;

            for (let i = 0; i < playlistLength; i++) {
                chatbot.activePlaylists[args.channel].videos[i].played = false;
                chatbot.activePlaylists[args.channel].videos[i].skipped = false;
                chatbot.activePlaylists[args.channel].videos[i].start = 0;
                chatbot.activePlaylists[args.channel].videos[i].end = 0;
            }

            playlist.getActivePlaylist(chatbot, args);

            let set = {
                played: 0,
                skipped: 0,
                start: 0,
                end: 0,
                updatedAt: moment().unix()
            };

            database.update('playlist_video_join', set, ['playlist_id = ' + chatbot.activePlaylists[args.channel].id]);
        }
    },
    removePlaylist: function(chatbot, args) {
        if (chatbot.socket !== null) {
            database.remove('playlist', ['id = ' + args.playlist.id], function(remove) {
                playlist.getPlaylists(chatbot, args);

                if (args.playlist.active) {
                    chatbot.activePlaylists[args.channel] = chatbot.playlists[args.channel][0];
                    chatbot.activePlaylists[args.channel].videos = [];

                    database.update('playlist', {active: 1, updatedAt: moment().unix()}, ['id = ' + chatbot.playlists[args.channel][0].id], function(update) {
                        let select = 'id, uuid, name, sub_name AS subName, file, duration, platform, start, end, played, skipped, ';
                        select += 'title_cmd AS titleCmd, game_cmd AS gameCmd, v.updated_at AS updatedAt, v.created_at AS createdAt';
                        let from = 'playlist_video_join AS pvj';
                        let join = 'LEFT JOIN video AS v ON pvj.video_id = v.id';

                        // find videos from playlist
                        database.find(select, from, join, ['pvj.playlist_id = ' + chatbot.activePlaylists[args.channel].id], '', '', 0, function(rows) {
                            chatbot.activePlaylists[args.channel].videos = rows;
                            playlist.getActivePlaylist(chatbot, args);
                        });
                    });
                }
            });
        }
    },
    removeVideo: function(chatbot, args) {
        if (args.video.playlistId === chatbot.activePlaylists[args.channel].id) {
            chatbot.activePlaylists[args.channel].videos.splice(args.videoIndex, 1)[0];
            playlist.getActivePlaylist(chatbot, args);
        }

        database.remove('playlist_video_join', [`uuid = '${args.video.uuid}'`], function(remove) {
            playlist.getPlaylists(chatbot, args);

            if (args.video.playlistId !== chatbot.activePlaylists[args.channel].id) {
                args.playlist = {id: args.video.playlistId};
                playlist.getPlaylist(chatbot, args);
            }
        });
    },
    removeVideosByFlagFromActivePlaylist: function(chatbot, args) {
        let uuidArray = [];
        let videos = chatbot.activePlaylists[args.channel].videos;
        chatbot.activePlaylists[args.channel].videos = [];

        for (let i = 0; i < videos.length; i++) {
            if (!!videos[i][args.flag] === !!args.value) {
                uuidArray.push(videos[i].uuid);
            } else {
                chatbot.activePlaylists[args.channel].videos.push(videos[i]);
            }
        }

        if (uuidArray.length) {
            database.remove('playlist_video_join', [`uuid IN ('${uuidArray.join('\' ,\'')}')`], function(remove) {
                playlist.getPlaylists(chatbot, args);
            });
        }

        playlist.getActivePlaylist(chatbot, args);
    },
    switchPlaylist: function(chatbot, args) {
        let time = moment().unix();
        chatbot.activePlaylists[args.channel].id = args.playlist.id;
        chatbot.activePlaylists[args.channel].name = args.playlist.name;
        chatbot.activePlaylists[args.channel].active = args.playlist.active;
        chatbot.activePlaylists[args.channel].videos = [];
        chatbot.activePlaylists[args.channel].updatedAt = time;
        chatbot.activePlaylists[args.channel].createdAt = args.playlist.createdAt;

        let select = 'id, uuid, name, sub_name, file, duration, platform, start, end, v.updated_at, v.created_at, '; 
        select += 'pvj.played, pvj.skipped, pvj.sort, pvj.title_cmd, pvj.game_cmd, pvj.playlist_id';
        let from = 'playlist_video_join AS pvj';
        let join = 'LEFT JOIN video AS v ON pvj.video_id = v.id';

        // find videos from target playlist
        database.find(select, from, join, ['pvj.playlist_id = ' + args.playlist.id], '', 'sort', 0, function(rowsAll) {
            rowsAll.forEach(function(row) {
                chatbot.activePlaylists[args.channel].videos.push({
                    id: row.id,
                    uuid: row.uuid,
                    playlistId: row.playlist_id,
                    name: row.name,
                    subName: row.sub_name,
                    file: row.file,
                    duration: row.duration, // unix timestamp (seconds)
                    platform: row.platform,
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

            // reset playlists to active = 0
            database.update('playlist', {active: 0, updatedAt: time}, ['channel_id = ' + chatbot.channels[args.channel].id], function(updateAll) {
                // set playlist to active = 1
                database.update('playlist', {active: 1, updatedAt: time}, ['id = ' + chatbot.activePlaylists[args.channel].id], function(update) {
                    playlist.getPlaylists(chatbot, args);
                });
            });

            chatbot.activePlaylists[args.channel].videoQuantity = rowsAll.length;
            playlist.getActivePlaylist(chatbot, args);
        });
    },
    updatePlaylist: function(chatbot, args) {
        let set = {
            name: args.playlist.name,
            updatedAt: moment().unix()
        };
        let where = [
            'id = ' + args.playlist.id,
            'channel_id = ' + chatbot.channels[args.channel].id
        ];

        database.update('playlist', set, where, function(update) {
            if (args.playlist.id === chatbot.activePlaylists[args.channel].id) {
                chatbot.activePlaylists[args.channel].name = args.playlist.name;
                playlist.getActivePlaylist(chatbot, args);
            }

            playlist.getPlaylists(chatbot, args);
        });
    },
    updateVideo: function(chatbot, args) {
        if (chatbot.socket !== null) {
            delete args.video.durationHours;
            delete args.video.durationMin;
            delete args.video.durationSec;
            delete args.video.autofill;
            args.video.updatedAt = moment().unix(); // unix timestamp (seconds)

            let set = {
                name: args.video.name,
                subName: args.video.subName,
                file: args.video.file,
                duration: args.video.duration, // unix timestamp (seconds)
                platform: args.video.platform,
                updatedAt: args.video.updatedAt
            };

            database.update('video', set, ['id = ' + args.video.id], function() {
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
                    if (args.video.playlistId === chatbot.activePlaylists[args.channel].id) {
                        chatbot.activePlaylists[args.channel].videos[args.videoIndex] = args.video;
                        playlist.getActivePlaylist(chatbot, args);
                    }
                });
            });
        }
    },
    updateVideoFromActivePlaylist: function(chatbot, args) {
        args.video.updatedAt = moment().unix(); // unix timestamp (seconds)
        chatbot.activePlaylists[args.channel].videos[args.videoIndex] = args.video;

        let set = {
            name: args.video.name,
            file: args.video.file,
            duration: args.video.duration,
            platform: args.video.platform,
            updatedAt: args.video.updatedAt
        };

        database.update('video', set, ['id = ' + args.video.id], function(update) {
            set = {
                played: args.video.played,
                skipped: args.video.skipped,
                titleCmd: args.video.titleCmd,
                gameCmd: args.video.gameCmd,
                start: args.video.start,
                end: args.video.end,
                updatedAt: args.video.updatedAt
            };

            database.update('playlist_video_join', set, [`uuid = '${args.video.uuid}'`]);
        });
    }
};

module.exports = playlist;
