const moment  = require('moment');
const request = require('request');
const sqlite3 = require('sqlite3').verbose();

const database = {
    connection: null,
    file: './data/chatbot.sqlite3',
    callback: function(callback, args) {
        if (typeof callback === 'function') {
            if (typeof args === 'undefined') {
                callback();
            } else {
                callback(args);
            }
        }
    },
    open: function() {
        database.connection = new sqlite3.Database(this.file, sqlite3.OPEN_READWRITE);
    },
    /**
     * @param {string} select
     * @param {string} from
     * @param {string} join
     * @param {array} where
     * @param {string} group
     * @param {string} order
     * @param {integer} limit
     * @param {function} callback
     * @param {mixed} callbackArgs
     * @returns {undefined}
     */
    find: function(select, from, join, where, group, order, limit, callback, callbackArgs) {
        if (database.connection !== null) {
            database.connection.serialize(() => {
                let query = `SELECT ${select} FROM ${from} `;

                if (typeof join !== 'undefined' && join.length) {
                    query += `${join} `;
                }

                if (typeof where !== 'undefined' && where.length) {
                    query += `WHERE ${where.join(' AND ')} `;
                }

                if (typeof group !== 'undefined' && group.length) {
                    query += `GROUP BY ${group} `;
                }

                if (typeof order !== 'undefined' && order.length) {
                    query += `ORDER BY ${order} `;
                }

                if (parseInt(limit) > 0 || (typeof limit === 'string' && limit.length)) {
                    query += `LIMIT ${limit} `;
                }

                database.connection.all(query, (errAll, rows) => {
                    if (errAll) {
                        console.error(errAll.message);
                    }

                    if (typeof callbackArgs === 'undefined') {
                        database.callback(callback, rows);
                    } else {
                        database.callback(callback, callbackArgs);
                    }
                });
            });
        }
    },
    prepareActivePlaylists: function(chatbot, channel) {
        if (database.connection !== null) {
            let select = 'SELECT p.id AS p_id, p.name AS p_name, p.updated_at AS p_updated_at, p.created_at AS p_created_at, ';
            select += 'v.id, v.name, v.sub_name, v.file, v.duration, v.player, v.updated_at, v.created_at, ';
            select += 'pvj.uuid, pvj.start, pvj.end, pvj.played, pvj.uuid, pvj.start, pvj.end, pvj.played, ';
            select += 'pvj.skipped, pvj.title_cmd, pvj.game_cmd, pvj.sort ';
            let from = 'FROM playlist AS p ';
            let join = 'LEFT JOIN playlist_video_join AS pvj ON pvj.playlist_id = p.id ';
            join += 'LEFT JOIN video AS v ON pvj.video_id = v.id ';
            let where = 'WHERE p.channel_id = ? AND p.active = ? ';
            let order = 'ORDER BY sort';

            let stmt = database.connection.prepare(select + from + join + where + order);
            stmt.all([chatbot.channels[channel].id, 1], (errAll, rowsActivePlaylist) => {
                if (errAll) {
                    console.error(errAll.message);
                }

                if (rowsActivePlaylist.length) {
                    chatbot.activePlaylists[channel] = {
                        id: rowsActivePlaylist[0].p_id,
                        name: rowsActivePlaylist[0].p_name,
                        updatedAt: rowsActivePlaylist[0].p_updated_at, // unix timestamp (seconds)
                        createdAt: rowsActivePlaylist[0].p_created_at, // unix timestamp (seconds)
                        active: true,
                        videoQuantity: rowsActivePlaylist.length,
                        videos: []
                    };

                    if (rowsActivePlaylist[0].name !== null) {
                        rowsActivePlaylist.forEach(function(row) {
                            chatbot.activePlaylists[channel].videos.push({
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

                    // get all playlists with video quantity
                    select = 'SELECT id, name, active, p.updated_at, p.created_at, COUNT(pvj.playlist_id) AS video_quantity ';
                    from = 'FROM playlist AS p ';
                    join = 'LEFT JOIN playlist_video_join AS pvj ON pvj.playlist_id = p.id  ';
                    where = 'WHERE channel_id = ? ';
                    let group = 'GROUP BY name ';
                    order = 'ORDER BY name;';
                    stmt = database.connection.prepare(select + from + join + where + group + order);
                    stmt.all([chatbot.channels[channel].id], (errPlaylists, rowsPlaylists) => {
                        if (errPlaylists) {
                            console.error(errPlaylists.message);
                        }

                        chatbot.playlists[channel] = [];
                        rowsPlaylists.forEach(function(row) {
                            chatbot.playlists[channel].push({
                                id: row.id,
                                name: row.name,
                                active: !!row.active,
                                videoQuantity: row.video_quantity,
                                updatedAt: row.updated_at, // unix timestamp (seconds)
                                createdAt: row.created_at // unix timestamp (seconds)
                            });
                        });
                    });
                } else {
                    let values = {
                        channelId: chatbot.channels[channel].id,
                        name: 'General',
                        active: 1,
                        updatedAt: moment().unix(),
                        createdAt: moment().unix()
                    };

                    database.insert('playlist', [values], function(insert) {
                        chatbot.activePlaylists[channel] = {
                            id: insert.lastID,
                            name: 'General',
                            active: 1,
                            updatedAt: values.updatedAt, // unix timestamp (seconds)
                            createdAt: values.createdAt, // unix timestamp (seconds)
                            videos: []
                        };

                        chatbot.playlists[channel] = [];
                        chatbot.playlists[channel].push(chatbot.activePlaylists[channel]);
                        console.log(`* Added playlist "General" for "${channel}" to database.`);
                    });
                }
            });
        }
    },
    prepareBotTable: function(chatbot, channel) {
        if (database.connection !== null) {
            database.connection.serialize(() => {
                database.connection.all('SELECT * FROM bot', (errAll, rows) => {
                    if (errAll) {
                        console.error(errAll.message);
                    }

                    rows.forEach(function(row) {
                        chatbot.bots.push(row.name);
                    });

                    let values = [];
                    let bots = [
                        'mod4youbot', 'moobot', 'nightbot', 
                        'streamelements', 'streamlabs'
                    ];

                    for (let i = 0; i < bots.length; i++) {
                        // if not found
                        if (chatbot.bots.indexOf(bots[i]) === -1) {
                            chatbot.bots.push(bots[i]);
                            values.push({
                                name: bots[i],
                                updatedAt: moment().unix(),
                                createdAt: moment().unix()
                            });
                        }
                    }

                    database.insert('bot', values, function(insert) {
                        if (values.length) {
                            let botsString = values.map(function(elem) {
                                return elem.name;
                            }).join(', ');

                            console.log(`* Added "${botsString}" bots to database.`);
                        }

                        // get channel bots
                        request('https://api.betterttv.net/2/channels/' + channel, { json: true }, (err, res, body) => {
                            if (err) {
                                return console.log(err);
                            }
                            values = [];

                            if (typeof body.bots !== 'undefined') {
                                for (let i = 0; i < body.bots.length; i++) {
                                    // if not found
                                    if (chatbot.bots.indexOf(body.bots[i]) === -1) {
                                        chatbot.bots.push(body.bots[i]);
                                        values.push({
                                            name: body.bots[i],
                                            updatedAt: moment().unix(),
                                            createdAt: moment().unix()
                                        });
                                    }
                                }
                            }

                            database.insert('bot', values, function(insertRequest) {
                                if (values.length) {
                                    let botsString = values.map(function(elem) {
                                        return elem.name;
                                    }).join(', ');

                                    console.log(`* Added "${botsString}" bots from BTTV to database.`);
                                }
                            });
                        });
                    });
                });
            });
        }
    },
    prepareChannelTable: function(chatbot, channelState) {
        if (database.connection !== null) {
            database.connection.serialize(() => {
                const channel = channelState.channel.slice(1);
                let stmt = database.connection.prepare('SELECT * FROM channel WHERE name = ?');
                stmt.all([channel], (errAll, rows) => {
                    if (errAll) {
                        console.error(errAll.message);
                    }

                    // if channel found
                    if (rows.length) {
                        chatbot.channels[channel] = {
                            id: rows[0].id,
                            roomId: rows[0].room_id,
                            updatedAt: rows[0].updated_at, // unix timestamp (seconds)
                            createdAt: rows[0].created_at // unix timestamp (seconds)
                        };
                        database.prepareCommands(chatbot, channel);
                        database.prepareCounters(chatbot, channel);
                        database.prepareActivePlaylists(chatbot, channel);
                    } else {
                        let values = {
                            name: channel,
                            roomId: channelState['room-id'],
                            updatedAt: moment().unix(),
                            createdAt: moment().unix()
                        };

                        database.insert('channel', [values], function(insert) {
                            chatbot.channels[channel] = {
                                id: insert.lastID,
                                roomId: channelState['room-id'],
                                updatedAt: values.updatedAt, // unix timestamp (seconds)
                                createdAt: values.createdAt // unix timestamp (seconds)
                            };

                            console.log(`* Added channel "${channel}" to database.`);

                            database.prepareCommands(chatbot, channel);
                            database.prepareCounters(chatbot, channel);
                            database.prepareActivePlaylists(chatbot, channel);
                        });
                    }
                });
            });
        }
    },
    prepareCommands: function(chatbot, channel) {
        if (database.connection !== null) {
            database.connection.all('SELECT * FROM command', (errAll, rowsAll) => {
                if (errAll) {
                    console.error(errAll.message);
                }

                chatbot.commands[channel] = [];
                let commands = Object.keys(chatbot.commandList);
                let values = [];

                if (rowsAll.length) {
                    let commandNames = [];
                    rowsAll.forEach(function(row) {
                        commandNames.push(row.name);
                    });

                    // find missing commands
                    commands = commands.filter(function(i) {
                        return commandNames.indexOf(i) < 0;
                    });
                }

                for (let i = 0; i < commands.length; i++) {
                    values.push({
                        name: commands[i],
                        updatedAt: moment().unix(),
                        createdAt: moment().unix()
                    });
                }

                database.insert('command', values, function(insert) {
                    if (insert.changes) {
                        console.log(`* Added ${insert.changes} commands to database.`);
                    }

                    let select = 'SELECT cmd.id, cmd.name, cmd.created_at, ccj.cooldown, ccj.active, ccj.last_exec, ccj.updated_at ';
                    let from = 'FROM channel AS c ';
                    let join = 'JOIN channel_command_join AS ccj ON c.id = ccj.channel_id ';
                    join += 'JOIN command AS cmd ON ccj.command_id = cmd.id ';
                    let where = 'WHERE c.id = ' + chatbot.channels[channel].id + ' ';
                    let order = 'ORDER BY cmd.name';

                    database.connection.all(select + from + join + where + order, (errJoinCcj, rowsAllJoins) => {
                        if (errJoinCcj) {
                            console.error(errJoinCcj.message);
                        }

                        let currentCommandIds = [];
                        rowsAllJoins.forEach(function(row) {
                            chatbot.commands[channel].push({
                                id: row.id,
                                name: row.name,
                                cooldown: row.cooldown, // cooldown in seconds
                                active: !!row.active,
                                lastExec: parseInt(row.last_exec), // unix timestamp (seconds)
                                updatedAt: parseInt(row.updated_at), // unix timestamp (seconds)
                                createdAt: parseInt(row.created_at) // unix timestamp (seconds)
                            });
                            currentCommandIds.push(row.id);
                        });

                        select = 'SELECT * FROM command AS cmd ';
                        where = '';
                        if (rowsAllJoins.length) {
                            // select lately added commands
                            where += 'WHERE id NOT IN (' + currentCommandIds.join(',') + ') ';
                        }

                        database.connection.all(select + where + order, (errCommand, rowsDifference) => {
                            values = [];
                            if (errCommand) {
                                console.error(errCommand.message);
                            }

                            rowsDifference.forEach(function(row) {
                                values.push({
                                    channelId: chatbot.channels[channel].id,
                                    commandId: row.id,
                                    cooldown: 0,
                                    active: 0,
                                    updatedAt: moment().unix(),
                                    createdAt: moment().unix()
                                });

                                chatbot.commands[channel].push({
                                    id: row.id,
                                    name: row.name,
                                    cooldown: 0,
                                    active: 0,
                                    lastExec: 0, // unix timestamp (seconds)
                                    updatedAt: row.updated_at, // unix timestamp (seconds)
                                    createdAt: row.created_at // unix timestamp (seconds)
                                });
                            });

                            database.insert('channel_command_join', values, function(insertCcj) {
                                if (insertCcj.changes) {
                                    console.log(`* Added ${insertCcj.changes} command relations for "${channel}" to database.`);
                                }
                            });
                        });
                    });
                });
            });
        }
    },
    prepareCounters: function(chatbot, channel) {
        if (database.connection !== null) {
            let stmt = database.connection.prepare('SELECT * FROM counter WHERE channel_id = ?');
            stmt.all([chatbot.channels[channel].id], (errAll, rows) => {
                if (errAll) {
                    console.error(errAll.message);
                }

                if (rows.length) {
                    chatbot.counters[channel] = {
                        id: rows[0].id,
                        name: rows[0].name,
                        streak: rows[0].streak,
                        victory: rows[0].victory,
                        updatedAt: rows[0].updated_at, // unix timestamp (seconds)
                        createdAt: rows[0].created_at // unix timestamp (seconds)
                    };
                } else {
                    let values = {
                        channelId: chatbot.channels[channel].id,
                        name: 'General',
                        updatedAt: moment().unix(),
                        createdAt: moment().unix()
                    };

                    database.insert('counter', [values], function(insert) {
                        chatbot.counters[channel] = {
                            id: insert.lastID,
                            name: 'General',
                            streak: 0,
                            victory: 10,
                            updatedAt: values.updatedAt, // unix timestamp (seconds)
                            createdAt: values.createdAt // unix timestamp (seconds)
                        };

                        console.log(`* Added counter "General" for "${channel}" to database.`);
                    });
                }
            });
        }
    },
    remove: function(table, where, callback, callbackArgs) {
        if (database.connection !== null) {
            database.connection.serialize(() => {
                database.connection.run(`DELETE FROM ${table} WHERE ${where.join(' AND ')}`, function(errDeleteRow) {
                    if (errDeleteRow) {
                        console.error('errDeleteRow');
                        console.error(errDeleteRow);
                    }

                    if (typeof callbackArgs === 'undefined') {
                        database.callback(callback, this);
                    } else {
                        database.callback(callback, callbackArgs);
                    }

                    console.log(`* Remove "${JSON.stringify(this)}"`);
                });
            });
        }
    },
    insert: function(table, values, callback, callbackArgs) {
        if (database.connection !== null) {
            database.connection.serialize(() => {
                let valueKeys = values.length ? Object.keys(values[0]) : [];
                let colArray = [];
                let valueArray = [];
                let questionmarkArray = [];

                for (let i = 0; i < values.length; i++) {
                    for (let j = 0; j < valueKeys.length; j++) {
                        // camel case to snake case
                        let valueKey = valueKeys[j].replace(/([A-Z])/g, '_$1').toLowerCase();

                        //if (setKey === 'id') {
                        //    continue;
                        //}

                        if (i === 0) {
                            colArray.push(valueKey);
                        }

                        valueArray.push(values[i][valueKeys[j]]);
                    }

                    questionmarkArray.push('(' + colArray.map(function(){
                        return '?';
                    }).join(',') + ')');
                }

                if (valueKeys.length) {
                    database.connection.run(`INSERT INTO ${table} (${colArray.join(', ')}) VALUES ${questionmarkArray.join(', ')};`, valueArray, function(errInsertRow) {
                        if (errInsertRow) {
                            console.error('errInsertRow');
                            console.error(errInsertRow);
                            console.error(`INSERT INTO ${table} (${colArray.join(', ')}) VALUES ${questionmarkArray.join(', ')};`);
                        }

                        if (typeof callbackArgs === 'undefined') {
                            database.callback(callback, this);
                        } else {
                            database.callback(callback, callbackArgs);
                        }

                        //console.log(`* Insert "${JSON.stringify(this)}"`);
                    });
                } else {
                    if (typeof callbackArgs === 'undefined') {
                        database.callback(callback, {changes: 0});
                    } else {
                        database.callback(callback, callbackArgs);
                    }
                }
            });
        }
    },
    update: function(table, set, where, callback, callbackArgs) {
        if (database.connection !== null) {
            database.connection.serialize(() => {
                let setKeys = Object.keys(set);
                let setArray = [];
                let setObject = {};

                for (let i = 0; i < setKeys.length; i++) {
                    // camel case to snake case
                    let setKey = setKeys[i].replace(/([A-Z])/g, '_$1').toLowerCase();

                    //if (setKey === 'id') {
                    //    continue;
                    //}

                    setArray.push(setKey + ' = $' + setKey);
                    setObject['$' + setKey] = set[setKeys[i]];
                }

                database.connection.run(`UPDATE ${table} SET ${setArray.join(', ')} WHERE ${where.join(' AND ')}`, setObject, function(errUpdateRow) {
                    if (errUpdateRow) {
                        console.error('errUpdateRow');
                        console.error(errUpdateRow);
                    }

                    if (typeof callbackArgs === 'undefined') {
                        database.callback(callback, this);
                    } else {
                        database.callback(callback, callbackArgs);
                    }

                    //console.log(`* Updated "${set.name}" (${channel})`);
                    //console.log(`* Updated "${JSON.stringify(this)}"`);
                });
            });
        }
    }
};

database.open();

module.exports = database;
