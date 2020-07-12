const config       = require('./src/app/chatbot.json');
const database     = require('./src/js/chatbot/database');
const locales      = require('./src/js/chatbot/locales');

const fs           = require('fs');
const glob         = require('glob');
const mediainfo    = require('mediainfo-wrapper');
const moment       = require('moment');
const {v4: uuidv4} = require('uuid');
const yargs        = require('yargs');

let addedVideosAmount = 0;
let localRegExp = /(.*)(\.mp4)$/i;
let options = {};
let playlists = [];
let slashesRegExp = /(\/|\\)+/g;
let time = moment().unix();
let videosFolder = config.videosFolder.replace(slashesRegExp, '/');

const argv = yargs
    .option('backup', {
        alias: 'b',
        description: 'Create an additional backup (default: false)',
        type: 'boolean'
    })
    .option('channel', {
        alias: 'c',
        description: 'Channel name which owns the videos (required)',
        type: 'string'
    })
    .option('identity', {
        alias: 'i',
        description: 'Channel id / Room id (required if channel is not in databse)',
        type: 'number'
    })
    .option('log', {
        description: 'Show logs in CLI (default: true)',
        type: 'boolean'
    })
    .option('locale', {
        alias: 'l',
        description: 'Locale to use in date generation (default: en)',
        type: 'string'
    })
    .option('subname', {
        alias: 'sn',
        description: 'Add date as sub name (default: true)',
        type: 'boolean'
    })
    .help()
    .alias('help', 'h')
    .argv;

if (typeof argv.backup === 'undefined') {
    argv.backup = false;
}

if (argv.channel) {
    argv.channel = argv.channel.toLowerCase();
}

if (typeof argv.log === 'undefined') {
    argv.log = true;
}

if (argv.locale) {
    argv.locale = typeof locales[argv.locale] === 'undefined' ? 'en' : argv.locale;
} else {
    argv.locale = 'en';
}

if (typeof argv.subname === 'undefined') {
    argv.subname = true;
}

function log(message) {
    if (argv.log === true) {
        console.log(message);
    }
}

function importSummary(videos, index) {
    // if all files processed and no video was added
    if (index === videos.length && !addedVideosAmount) {
        log('* All videos already exists in database');
    } else if (index === videos.length && addedVideosAmount) {
        const vs = addedVideosAmount > 1 ? 's' : '';
        const ps = playlists.length > 1 ? 's' : '';
        const durationObject = moment.duration(moment().unix() - time, 's');
        const hours = ('0' + durationObject.hours()).substr(-2);
        const minutes = ('0' + durationObject.minutes()).substr(-2);
        const seconds = ('0' + durationObject.seconds()).substr(-2);
        const duration = hours + ':' + minutes + ':' + seconds + ' h';

        log('----- Summary -----');
        log(`* Added ${addedVideosAmount} video${vs} in ${playlists.length} playlist${ps} in ${duration}`);
    }
}

function addVideoRecursive(videos, channel, index) {
    let videosAmount = videos.length;

    // if is first function call
    if (!index) {
        log(`* Found ${videosAmount} videos overall`);
    }

    let relFilePath = videos[index].replace(videosFolder, '');
    let join = 'JOIN playlist_video_join AS pvj ON pvj.video_id = v.id';
    let where = ['file = ?', 'channel_id = ?'];
    let prepare = [relFilePath, channel.id];

    database.find('name', 'video AS v', join, where, '', '', 1, prepare, function(videoRows) {
        // if video not exits
        if (!videoRows.length) {
            mediainfo(videos[index]).then(function(data) {
                // if data genaral is defined
                if (data.length && typeof data[0].general !== 'undefined') {
                    // milliseconds to seconds
                    let duration = ((data[0].general.duration[0] / 1000) -.5).toFixed(0);
                    let format = locales[argv.locale]['date'];
                    let playlist = relFilePath.indexOf('/') ? relFilePath.split('/')[0] : 'General';
                    let name = relFilePath
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
                    let subName = '';

                    // if sub name flag is true
                    if (argv.subname) {
                        let isoDate = data[0].general.file_last_modification_date[0].replace(/^(UTC )([0-9-]+) ([0-9:.]+)$/, '$2T$3Z');
                        subName = moment(isoDate).format(format);
                    }

                    // if duration lower equal than 23:59:59 hours
                    if (duration <= 86399) {
                        let values = {
                            channelId: channel.id,
                            name: name,
                            subName: subName,
                            file: relFilePath,
                            duration: duration, // unix timestamp (seconds)
                            player: 'local',
                            updatedAt: time, // unix timestamp (seconds)
                            createdAt: time // unix timestamp (seconds)
                        };

                        database.insert('video', [values], function(insert) {
                            // if video was added
                            if (insert.lastID) {
                                addedVideosAmount++;
                                log(`* Added video "${name}" to playlist "${playlist}" (#${addedVideosAmount})`);
                            }

                            let select = 'p.id, COUNT(pvj.playlist_id) AS videoQuantity';
                            let from = 'playlist AS p';
                            join = 'LEFT JOIN playlist_video_join AS pvj ON p.id = pvj.playlist_id ';
                            where = ['name = ?'];
                            prepare = [playlist];

                            database.find(select, from, join, where, '', '', 1, prepare, function(playlistRows) {
                                values = {
                                    uuid: uuidv4(),
                                    playlistId: null,
                                    videoId: insert.lastID,
                                    sort: 0,
                                    updatedAt: time, // unix timestamp (seconds)
                                    createdAt: time // unix timestamp (seconds)
                                };

                                // if playlist NOT exists
                                if (playlistRows[0].id === null) {
                                    let playlistValues = {
                                        channelId: channel.id,
                                        name: playlist,
                                        active: 0,
                                        updatedAt: time, // unix timestamp (seconds)
                                        createdAt: time // unix timestamp (seconds)
                                    };
                                    database.insert('playlist', [playlistValues], function(playlistInsert) {
                                        if (playlists.indexOf(playlist) === -1) {
                                            playlists.push(playlist);
                                            log(`* Added playlist "${playlist}"`);
                                        }

                                        values.playlistId = playlistInsert.lastID;
                                        database.insert('playlist_video_join', [values], function(pvjInsert) {
                                            index++;
                                            if (typeof videos[index] !== 'undefined') {
                                                addVideoRecursive(videos, channel, index);
                                            }
                                            importSummary(videos, index);
                                        });
                                    });
                                } else {
                                    if (playlists.indexOf(playlist) === -1) {
                                        playlists.push(playlist);
                                        log(`* Found playlist "${playlist}"`);
                                    }

                                    values.playlistId = playlistRows[0].id;
                                    values.sort = 1 * playlistRows[0].videoQuantity;
                                    database.insert('playlist_video_join', [values], function(pvjInsert) {
                                        index++;
                                        if (typeof videos[index] !== 'undefined') {
                                            addVideoRecursive(videos, channel, index);
                                        }
                                        importSummary(videos, index);
                                    });
                                }
                            });
                        });
                    }
                }
            }).catch(function(e) {
                console.error(e);
            });
        } else {
            index++;
            if (typeof videos[index] !== 'undefined') {
                addVideoRecursive(videos, channel, index);
            }
        }
        importSummary(videos, index);
    });
}

if (fs.existsSync(videosFolder) && typeof argv.channel === 'string' && argv.channel.length) {
    if (argv.backup === true) {
        database.backup('YYYY-MM-DD_HH-mm-ss');
    }

    glob(videosFolder + '*/*.mp4', options, function(error, videos) {
        if (error) {
            console.log(error);
        } else {
            let select = 'id, name, updated_at AS updatedAt, created_at AS createdAt';
            database.find(select, 'channel', '', ['name = ?'], '', '', 1, [argv.channel], function(rows) {
                if (rows.length) {
                    log(`* Found channel ${argv.channel}`);
                    addVideoRecursive(videos, rows[0], 0);
                } else if (typeof argv.identity === 'number' && argv.identity > 0) {
                    let values = {
                        id: argv.identity,
                        name: argv.channel,
                        updatedAt: time,
                        createdAt: time
                    };

                    database.insert('channel', [values], function(insert) {
                        values.id = insert.lastID;
                        addVideoRecursive(videos, values, 0);
                    });
                } else {
                    log('* Option --identity is missing or empty');
                }
            });
        }
    });
} else if (!fs.existsSync(videosFolder)) {
    log(`* Folder not found (${config.videosFolder})`);
} else if  (typeof argv.channel === 'undefined' || !argv.channel.length) {
    log('* Option --channel is missing or empty');
}

