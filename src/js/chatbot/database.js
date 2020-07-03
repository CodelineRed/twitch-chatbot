const fs      = require('fs');
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
        this.backup();
    },
    backup: function(format) {
        format = typeof format === 'undefined' ? 'YYYY-MM-DD' : format;
        let backupFile = 'chatbot.' + moment().format(format) + '.sqlite3';
        let backupFolder = './data/backup/';

        // if database exists and backup databse not exists
        if (fs.existsSync(this.file) && !fs.existsSync(backupFolder + backupFile)) {
            fs.copyFile(this.file, backupFolder + backupFile, (err) => {
                if (err) {
                    throw err;
                }

                console.log(`* Backup was created. ${backupFile}`);
            });
        }
    },
    /**
     * @param {string} select required
     * @param {string} from required
     * @param {string} join optional
     * @param {array} where optional
     * @param {string} group optional
     * @param {string} order optional
     * @param {integer} limit optional
     * @param {array} prepare optional
     * @param {function} callback optional
     * @param {mixed} callbackArgs optional
     * @returns {undefined}
     */
    find: function(select, from, join, where, group, order, limit, prepare, callback, callbackArgs) {
        if (database.connection !== null) {
            this.backup();
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

                if (typeof prepare === 'undefined') {
                    prepare = [];
                }

                let stmt = database.connection.prepare(query);
                stmt.all(prepare, (errFind, rows) => {
                    if (errFind) {
                        console.error('errFind');
                        console.error(errFind);
                        console.error(`${query};`);
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
            let select = 'SELECT p.id ';
            let from = 'FROM playlist AS p ';
            let where = 'WHERE p.channel_id = ? AND p.name = ? ';
            let prepare = [chatbot.channels[channel].id, 'General'];

            let stmt = database.connection.prepare(select + from + where);
            stmt.all(prepare, (errAll, rowsActivePlaylist) => {
                if (errAll) {
                    console.error(errAll.message);
                }

                if (rowsActivePlaylist.length === 0) {
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
            database.connection.all('SELECT name FROM bot', (errAll, rows) => {
                if (errAll) {
                    console.error(errAll.message);
                }

                rows.forEach(function(row) {
                    chatbot.bots.push(row.name);
                });

                // get channel bots from BTTV
                request('https://api.betterttv.net/2/channels/' + channel, { json: true }, (err, res, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    let values = [];

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

                            console.log(`* Added "${botsString}" bot from BTTV to database.`);
                        }
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
                            oauthToken: rows[0].oauth_token,
                            updatedAt: rows[0].updated_at, // unix timestamp (seconds)
                            createdAt: rows[0].created_at // unix timestamp (seconds)
                        };
                        database.prepareCommands(chatbot, channel);
                        database.prepareCounters(chatbot, channel);
                        database.prepareActivePlaylists(chatbot, channel);
                    } else {
                        let values = {
                            id: channelState['room-id'],
                            name: channel,
                            updatedAt: moment().unix(),
                            createdAt: moment().unix()
                        };

                        database.insert('channel', [values], function(insert) {
                            chatbot.channels[channel] = {
                                id: channelState['room-id'],
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

                    let select = 'SELECT cmd.id ';
                    let from = 'FROM channel AS c ';
                    let join = 'JOIN channel_command_join AS ccj ON c.id = ccj.channel_id ';
                    join += 'JOIN command AS cmd ON ccj.command_id = cmd.id ';
                    let where = `WHERE c.id = ${chatbot.channels[channel].id} `;
                    let order = 'ORDER BY cmd.name';

                    database.connection.all(select + from + join + where + order, (errJoinCcj, rowsAllJoins) => {
                        if (errJoinCcj) {
                            console.error(errJoinCcj.message);
                        }

                        let currentCommandIds = [];

                        rowsAllJoins.forEach(function(row) {
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
            let stmt = database.connection.prepare('SELECT id FROM counter WHERE channel_id = ?');
            stmt.all([chatbot.channels[channel].id], (errAll, rows) => {
                if (errAll) {
                    console.error(errAll.message);
                }

                if (rows.length === 0) {
                    let values = {
                        channelId: chatbot.channels[channel].id,
                        name: 'General',
                        updatedAt: moment().unix(),
                        createdAt: moment().unix()
                    };

                    database.insert('counter', [values], function(insert) {
                        console.log(`* Added counter "General" for "${channel}" to database.`);
                    });
                }
            });
        }
    },
    /**
     * @param {string} table
     * @param {array} where
     * @param {array} prepare
     * @param {function} callback
     * @param {mixed} callbackArgs
     * @returns {undefined}
     */
    remove: function(table, where, prepare, callback, callbackArgs) {
        if (database.connection !== null) {
            this.backup();
            database.connection.serialize(() => {
                database.connection.run(`DELETE FROM ${table} WHERE ${where.join(' AND ')};`, prepare, function(errRemove) {
                    if (errRemove) {
                        console.error('errRemove');
                        console.error(errRemove);
                        console.error(`DELETE FROM ${table} WHERE ${where.join(' AND ')};`);
                    }


                    if (typeof callbackArgs === 'undefined') {
                        database.callback(callback, this);
                    } else {
                        database.callback(callback, callbackArgs);
                    }

                    //if (typeof callback !== 'function') {
                    //    console.log(`* Removed ${this.changes} rows from "${table}"`);
                    //}
                    //console.log(JSON.stringify(this));
                });
            });
        }
    },
    /**
     * @param {string} table
     * @param {array} values (array of objects)
     * @param {function} callback
     * @param {mixed} callbackArgs
     * @returns {undefined}
     */
    insert: function(table, values, callback, callbackArgs) {
        if (database.connection !== null) {
            this.backup();
            database.connection.serialize(() => {
                let valueKeys = values.length ? Object.keys(values[0]) : [];
                let colArray = [];
                let prepare = [];
                let valuesArray = [];

                for (let i = 0; i < values.length; i++) {
                    for (let j = 0; j < valueKeys.length; j++) {
                        // camel case to snake case
                        let valueKey = valueKeys[j].replace(/([A-Z])/g, '_$1').toLowerCase();

                        if (i === 0) {
                            colArray.push(valueKey);
                        }

                        prepare.push(values[i][valueKeys[j]]);
                    }

                    valuesArray.push('(' + colArray.map(function(){
                        return '?';
                    }).join(',') + ')');
                }

                if (valueKeys.length) {
                    database.connection.run(`INSERT INTO ${table} (${colArray.join(', ')}) VALUES ${valuesArray.join(', ')};`, prepare, function(errInsert) {
                        if (errInsert) {
                            console.error('errInsert');
                            console.error(errInsert);
                            console.error(`INSERT INTO ${table} (${colArray.join(', ')}) VALUES ${valuesArray.join(', ')};`);
                        }

                        if (typeof callbackArgs === 'undefined') {
                            database.callback(callback, this);
                        } else {
                            database.callback(callback, callbackArgs);
                        }

                        //if (typeof callback !== 'function') {
                        //    console.log(`* Inserted ${this.changes} rows in "${table}"`);
                        //}
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
    /**
     * 
     * @param {string} table
     * @param {object} set
     * @param {array} where
     * @param {function} callback
     * @param {mixed} callbackArgs
     * @returns {undefined}
     */
    update: function(table, set, where, callback, callbackArgs) {
        if (database.connection !== null) {
            this.backup();
            database.connection.serialize(() => {
                let setKeys = Object.keys(set);
                let setArray = [];
                let prepare = {};

                for (let i = 0; i < setKeys.length; i++) {
                    // camel case to snake case
                    let setKey = setKeys[i].replace(/([A-Z])/g, '_$1').toLowerCase();

                    //if (setKey === 'id') {
                    //    continue;
                    //}

                    setArray.push(setKey + ' = $' + setKey);
                    prepare['$' + setKey] = set[setKeys[i]];
                }

                database.connection.run(`UPDATE ${table} SET ${setArray.join(', ')} WHERE ${where.join(' AND ')};`, prepare, function(errUpdate) {
                    if (errUpdate) {
                        console.error('errUpdate');
                        console.error(errUpdate);
                        console.error(`UPDATE ${table} SET ${setArray.join(', ')} WHERE ${where.join(' AND ')};`);
                    }

                    if (typeof callbackArgs === 'undefined') {
                        database.callback(callback, this);
                    } else {
                        database.callback(callback, callbackArgs);
                    }

                    //if (typeof callback !== 'function') {
                    //    console.log(`* Updated ${this.changes} rows in "${table}"`);
                    //}
                });
            });
        }
    }
};

database.open();

module.exports = database;
