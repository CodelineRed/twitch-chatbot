const database     = require('./database');
const locales      = require('./locales');
const video        = require('./video');
const fs           = require('fs');
const moment       = require('moment');
const {v4: uuidv4} = require('uuid');

const playlist = {
    activeLists: {},
    lists: {},
    /**
     * Adds active playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    add: function(chatbot, args) {
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
                        playlist.getActive(chatbot, args);
                        playlist.getList(chatbot, args);
                    });
                } else {
                    playlist.getList(chatbot, args);
                }
                console.log(locales.t('playlist-added', [args.playlist.name]));
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
    clearActive: function(chatbot, args) {
        if (chatbot.socket !== null) {
            let from = 'playlist_video_join';
            let where = ['playlist_id = ?'];
            let prepare = [playlist.activeLists[args.channel].id];

            database.remove(from, where, prepare, function(remove) {
                playlist.getActive(chatbot, args);
                console.log(locales.t('playlist-cleared', [playlist.activeLists[args.channel].name]));
            });
        }
    },
    /**
     * Sends playlist to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    get: function(chatbot, args) {
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
                                item: selectedPlaylist
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
     * Sends active playlist to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getActive: function(chatbot, args) {
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
                playlist.activeLists[args.channel] = {
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
                    playlist.activeLists[args.channel].videoQuantity = rows.length;

                    rows.forEach(function(row) {
                        playlist.activeLists[args.channel].videos.push({
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
                    let currentTime = video.currentStarts[args.channel];

                    // sets start and end timestamp
                    for (let i = 0; i < playlist.activeLists[args.channel].videos.length; i++) {
                        // if video is skipped
                        if (playlist.activeLists[args.channel].videos[i].skipped) {
                            playlist.activeLists[args.channel].videos[i].start = 0;
                            playlist.activeLists[args.channel].videos[i].end = 0;
                            continue;
                        }

                        // if video not played or is last video in list and currentTime is set
                        if ((!playlist.activeLists[args.channel].videos[i].played 
                            || (i + 1) === playlist.activeLists[args.channel].videos.length) && currentTime > 0) {
                            playlist.activeLists[args.channel].videos[i].start = currentTime;
                            playlist.activeLists[args.channel].videos[i].end = currentTime + playlist.activeLists[args.channel].videos[i].duration;
                            currentTime += playlist.activeLists[args.channel].videos[i].duration;
                        } else {
                            // if video played
                            let currentVideoFile = '';
                            playlist.activeLists[args.channel].videos[i].start = 0;
                            playlist.activeLists[args.channel].videos[i].end = 0;

                            if (currentTime === 0) {
                                continue;
                            }

                            // find currentVideoFile
                            for (let j = playlist.activeLists[args.channel].videos.length - 1; j >= 0; j--) {
                                if (playlist.activeLists[args.channel].videos[j].played 
                                        || (!playlist.activeLists[args.channel].videos[j].played && j === 0)) {
                                    currentVideoFile = playlist.activeLists[args.channel].videos[j].file;
                                    break;
                                }
                            }

                            // if file is currently played
                            if (currentVideoFile === playlist.activeLists[args.channel].videos[i].file 
                                && typeof currentTime !== 'undefined') {
                                playlist.activeLists[args.channel].videos[i].start = currentTime;
                                playlist.activeLists[args.channel].videos[i].end = currentTime + playlist.activeLists[args.channel].videos[i].duration;
                                currentTime += playlist.activeLists[args.channel].videos[i].duration;
                            }
                        }
                    }

                    const call = {
                        args: {
                            channel: args.channel,
                            item: playlist.activeLists[args.channel]
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
     * Sends information about tokens and video folder to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getConfig: function(chatbot, args) {
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
    getList: function(chatbot, args) {
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
                playlist.lists[args.channel] = rows;
                const call = {
                    args: {
                        channel: args.channel,
                        list: playlist.lists[args.channel]
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
    getSearchResults: function(chatbot, args) {
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
                        list: rows
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
     * Merges 2 playlists
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    merge: function(chatbot, args) {
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
                        if (args.merge.target.id === playlist.activeLists[args.channel].id) {
                            playlist.getActive(chatbot, args);
                        }

                        playlist.getList(chatbot, args);
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
                            if (args.merge.target.id === playlist.activeLists[args.channel].id) {
                                playlist.getActive(chatbot, args);
                            }

                            playlist.getList(chatbot, args);
                            console.log(locales.t('playlist-merged', [rowsSource.length, args.merge.source.name, args.merge.target.name]));
                        });
                    });
                }
            });
        });
    },
    /**
     * Removes playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    remove: function(chatbot, args) {
        if (chatbot.socket !== null && args.playlist.name.toLowerCase() !== 'general') {
            database.remove('playlist', ['id = ?'], [args.playlist.id], function(remove) {
                playlist.getList(chatbot, args);

                if (args.playlist.active) {
                    let playlistId = playlist.lists[args.channel][0].id;

                    if (playlist.lists[args.channel][0].id === args.playlist.id) {
                        playlistId = playlist.lists[args.channel][1].id;
                    }

                    let from = 'playlist';
                    let set = {
                        active: 1,
                        updatedAt: moment().unix()
                    };
                    let where = [`id = ${playlistId}`];

                    database.update(from, set, where, function(update) {
                        playlist.getActive(chatbot, args);
                        console.log(locales.t('playlist-removed', [args.playlist.name]));
                    });
                } else {
                    console.log(locales.t('playlist-removed', [args.playlist.name]));
                }
            });
        }
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
        let videos = playlist.activeLists[args.channel].videos;

        for (let i = 0; i < videos.length; i++) {
            // convert to boolean and compare
            if (!!videos[i][args.flag] === !!args.value) {
                uuidArray.push(videos[i].uuid);
            }
        }

        if (uuidArray.length) {
            database.remove('playlist_video_join', [`uuid IN ('${uuidArray.join('\', \'')}')`], [], function(remove) {
                playlist.getActive(chatbot, args);
                playlist.getList(chatbot, args);
                console.log(locales.t('videos-removed', [remove.changes, locales.t('video', {count: remove.changes}), playlist.activeLists[args.channel].name]));
            });
        } else {
            playlist.getActive(chatbot, args);
        }
    },
    /**
     * Resets all videos in active playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    resetActive: function(chatbot, args) {
        if (chatbot.socket !== null) {
            video.currentStarts[args.channel] = 0;
            let set = {
                played: 0,
                skipped: 0,
                start: 0,
                end: 0,
                updatedAt: moment().unix()
            };
            let where = [`playlist_id = ${playlist.activeLists[args.channel].id}`];

            database.update('playlist_video_join', set, where, function(update) {
                playlist.getActive(chatbot, args);
                console.log(locales.t('playlist-resetted', [playlist.activeLists[args.channel].name]));
            });
        }
    },
    /**
     * Swaps the active playlist
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    swap: function(chatbot, args) {
        let time = moment().unix();

        // reset playlists to active = 0
        database.update('playlist', {active: 0, updatedAt: time}, [`channel_id = '${chatbot.channels[args.channel].id}'`], function(updateAll) {
            // set playlist to active = 1
            database.update('playlist', {active: 1, updatedAt: time}, [`id = ${args.playlist.id}`], function(update) {
                playlist.getActive(chatbot, args);
                playlist.getList(chatbot, args);
                console.log(locales.t('playlist-swaped', [args.playlist.name]));
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
    update: function(chatbot, args) {
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
                if (args.playlist.id === playlist.activeLists[args.channel].id) {
                    playlist.getActive(chatbot, args);
                }

                playlist.getList(chatbot, args);
                console.log(locales.t('playlist-updated', [args.playlist.name]));
            });
        }
    }
};

module.exports = playlist;
