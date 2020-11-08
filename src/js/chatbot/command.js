const database     = require('./database');
const locales      = require('./locales');
const poll         = require('./poll');
const raffle       = require('./raffle');
const moment       = require('moment');
const {v4: uuidv4} = require('uuid');

const command = {
    diceDuels: {},
    translation: {
        about: '!about',
        commands: '!cc',
        diceDuel: '!dd[0-99](w[0-9]) @user',
        diceDuelAccept: '!dda',
        playlistInfo: '!plan',
        rollDice: '!d[0-99](w[0-9])'
    },
    /**
     * Adds custom command to database
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    addCustomCommand: function(chatbot, args) {
        let select = 'cmd.id';
        let from = 'command AS cmd';
        let join = 'JOIN channel_command_join AS ccj ON cmd.id = ccj.command_id ';
        let where = [
            'ccj.channel_id = ?',
            'cmd.name = ?'
        ];
        let prepare = [
            chatbot.channels[args.channel].id,
            args.name.toLowerCase()
        ];
        let time = moment().unix();
        let value = {
            name: args.name.toLowerCase(),
            content: args.content,
            type: 'custom',
            updatedAt: time,
            createdAt: time
        };

        database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
            // if custom command not exists for channel
            if (!rows.length) {
                database.insert('command', [value], function(insert) {
                    value = {
                        channelId: chatbot.channels[args.channel].id,
                        commandId: insert.lastID,
                        cooldown: typeof args.cooldown === 'undefined' ? 30 : args.cooldown,
                        active: 1,
                        updatedAt: time,
                        createdAt: time
                    };

                    database.insert('channel_command_join', [value], function(insertCcj) {
                        command.getCommands(chatbot, args);
                        if (args.say) {
                            chatbot.client.say('#' + args.channel, locales.t('custom-command-added', [args.name.toLowerCase(), args.content]));
                        }
                    });
                });
            }
        });
    },
    /**
     * Sends all commands to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getCommands: function(chatbot, args) {
        let select = 'cmd.id, cmd.name, cmd.type, cmd.created_at AS createdAt, ccj.cooldown, ';
        select += 'ccj.active, ccj.last_exec AS lastExec, ccj.updated_at AS updatedAt';
        let from = 'channel AS c';
        let join = 'JOIN channel_command_join AS ccj ON c.id = ccj.channel_id ';
        join += 'JOIN command AS cmd ON ccj.command_id = cmd.id';
        let where = ['c.id = ?'];
        let order = 'cmd.name';
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, from, join, where, '', order, 0, prepare, function(rows) {
            chatbot.commands[args.channel] = [];

            if (rows.length) {
                chatbot.commands[args.channel] = rows;
            }

            for (let i = 0; i < chatbot.commands[args.channel].length; i++) {
                // convert to boolean
                chatbot.commands[args.channel][i].active = !!chatbot.commands[args.channel][i].active;
            }

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        commands: chatbot.commands[args.channel]
                    },
                    method: 'setCommands',
                    ref: 'commands',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Logs commands execution to CLI
     * 
     * @param {type} args
     * @returns {undefined}
     */
    logCommand: function(args) {
        // extract command from message
        args.message = args.message.replace(/^(![a-z0-9]+)(.*)/, '$1');
        console.log(locales.t('command-executed', [args.message, args.userstate['display-name'], args.channel]));
    },
    /**
     * Removes custom command in database
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    removeCustomCommand: function(chatbot, args) {
        let select = 'cmd.id, ccj.active';
        let from = 'command AS cmd';
        let join = 'JOIN channel_command_join AS ccj ON cmd.id = ccj.command_id ';
        let where = [
            'ccj.channel_id = ?',
            'cmd.name = ?'
        ];
        let prepare = [
            chatbot.channels[args.channel].id,
            args.name.toLowerCase()
        ];

        database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
            // if custom command exists for channel
            if (rows.length) {
                where = ['command_id = ' + rows[0].id];

                database.remove('channel_command_join', where, [], function(removeCcj) {
                    where = ['id = ' + rows[0].id];

                    database.remove('command', where, [], function(remove) {
                        command.getCommands(chatbot, args);
                        if (args.say) {
                            chatbot.client.say('#' + args.channel, locales.t('custom-command-removed', [args.name.toLowerCase()]));
                        }
                    });
                });
            }
        });
    },
    /**
     * Toggles custom command in database
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    toggleCustomCommand: function(chatbot, args) {
        let select = 'cmd.id, ccj.active';
        let from = 'command AS cmd';
        let join = 'JOIN channel_command_join AS ccj ON cmd.id = ccj.command_id ';
        let where = [
            'ccj.channel_id = ?',
            'cmd.name = ?'
        ];
        let prepare = [
            chatbot.channels[args.channel].id,
            args.name.toLowerCase()
        ];
        let time = moment().unix();

        database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
            // if custom command exists for channel
            if (rows.length) {
                let set = {
                    active: !rows[0].active,
                    updatedAt: time
                };
                where = ['command_id = ' + rows[0].id];

                database.update('channel_command_join', set, where, function(updateCcj) {
                    command.getCommands(chatbot, args);
                    if (args.say) {
                        let suffix = set.active ? '1' : '0';
                        chatbot.client.say('#' + args.channel, locales.t('custom-command-toggled-' + suffix, [args.name.toLowerCase()]));
                    }
                });
            }
        });
    },
    /**
     * Updates command
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    updateCommand: function(chatbot, args) {
        chatbot.commands[args.channel][args.commandIndex] = args.command;

        const set = {
            cooldown: args.command.cooldown,
            active: args.command.active,
            lastExec: args.command.lastExec,
            updatedAt: moment().unix()
        };

        const where = [
            `channel_id = '${chatbot.channels[args.channel].id}'`,
            `command_id = ${args.command.id}`
        ];

        database.update('channel_command_join', set, where);
    },
    /**
     * Updates command last execution
     * 
     * @param {type} chatbot
     * @param {type} args
     * @returns {undefined}
     */
    updateCommandLastExec: function(chatbot, args) {
        chatbot.commands[args.channel][args.commandIndex].lastExec = moment().unix();

        let where = [
            `channel_id = '${chatbot.channels[args.channel].id}'`,
            `command_id = ${chatbot.commands[args.channel][args.commandIndex].id}`
        ];

        database.update('channel_command_join', {lastExec: chatbot.commands[args.channel][args.commandIndex].lastExec}, where, function() {
            // if custom command id exists
            if (typeof args.customCommandId !== 'undefined') {
                where = [
                    `channel_id = '${chatbot.channels[args.channel].id}'`,
                    `command_id = ${args.customCommandId}`
                ];

                database.update('channel_command_join', {lastExec: chatbot.commands[args.channel][args.commandIndex].lastExec}, where);
            }
        });

        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    lastExec: chatbot.commands[args.channel][args.commandIndex].lastExec,
                    commandIndex: args.commandIndex
                },
                method: 'updateCommandLastExec',
                ref: 'commands',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * Updates custom command in database
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    updateCustomCommand: function(chatbot, args) {
        let select = 'cmd.id';
        let from = 'command AS cmd';
        let join = 'JOIN channel_command_join AS ccj ON cmd.id = ccj.command_id ';
        let where = [
            'ccj.channel_id = ?',
            'cmd.name = ?'
        ];
        let prepare = [
            chatbot.channels[args.channel].id,
            args.name.toLowerCase()
        ];
        let time = moment().unix();
        let set = {
            content: args.content,
            updatedAt: time
        };

        database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
            // if custom command exists for channel
            if (rows.length) {
                where = ['id = ' + rows[0].id];

                database.update('command', set, where, function(update) {
                    set = {
                        cooldown: typeof args.cooldown === 'undefined' ? 30 : args.cooldown,
                        updatedAt: time
                    };
                    where = ['command_id = ' + rows[0].id];

                    database.update('channel_command_join', set, where, function(updateCcj) {
                        command.getCommands(chatbot, args);
                        if (args.say) {
                            chatbot.client.say('#' + args.channel, locales.t('custom-command-updated', [args.name.toLowerCase(), args.content]));
                        }
                    });
                });
            }
        });
    },
    /**
     * List of default commands
     */
    commandList: {
        /**
         * Sends information about chatbot to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        about: function(chatbot, args) {
            if (/^!(about|chatbot|cb|bugs?|help)/i.test(args.message)) {
                const version = require('../../../package.json')['version'];
                const date = require('../../../package.json')['commitDate'];
                const formatDate = moment(date).format(locales.t('date'));
                const bugs = require('../../../package.json')['bugs']['url'];

                chatbot.client.say('#' + args.channel, locales.t('command-about', [version, formatDate, bugs]));
                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        },
        /**
         * Adds custom command to database
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        addCustomCommand: function(chatbot, args) {
            if (/^!addcc (![a-z0-9]+)@?([0-9]+)? (.*)/i.test(args.message) 
                && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string')) {
                const matches = args.message.match(/^!addcc (![a-z0-9]+)@?([0-9]+)? (.*)/i);
                args = Object.assign(args, {
                    name: matches[1],
                    cooldown: matches[2],
                    content: matches[3],
                    say: true
                });
                command.addCustomCommand(chatbot, args);
            }
        },
        /**
         * Sends list of commands to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        commands: function(chatbot, args) {
            if (/^!(commands|cc)/i.test(args.message)) {
                let activeCommands = [];
                let commands = chatbot.commands[args.channel];
                for (let i = 0; i < commands.length; i++) {
                    // if command is active and tranlation exists
                    if (commands[i].active && typeof command.translation[commands[i].name] !== 'undefined') {
                        activeCommands.push(command.translation[commands[i].name]);
                    }
                }

                chatbot.client.say('#' + args.channel, locales.t('command-commands', [activeCommands.join(', ')]));
                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        },
        /**
         * Checks if chat is counting in a streak and sends change to frontend
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        counter: function(chatbot, args) {
            if (/^\d\d?$/.test(args.message)) {
                const number = parseInt(args.message);
                chatbot.counters[args.channel].streak = (number - chatbot.counters[args.channel].streak === 1) ? number : 0;

                //command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);

                if (chatbot.socket !== null) {
                    const call = {
                        args: {
                            channel: args.channel,
                            counter: chatbot.counters[args.channel]
                        },
                        method: 'setCounter',
                        ref: 'counter',
                        env: 'browser'
                    };

                    chatbot.socket.write(JSON.stringify(call));

                    if (chatbot.socketCounter !== null) {
                        chatbot.socketCounter.write(JSON.stringify(call));
                    }
                }
            }
        },
        /**
         * Sends custom command information to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        customCommand: function(chatbot, args) {
            if (/^(![a-z0-9]+)(.*)/i.test(args.message)) {
                const matches = args.message.match(/^(![a-z0-9]+)(.*)/i);
                let argsClone = Object.assign({}, args);
                let select = 'cmd.id, cmd.content';
                let from = 'command AS cmd';
                let join = 'JOIN channel_command_join AS ccj ON cmd.id = ccj.command_id ';
                let where = [
                    'cmd.name = ?',
                    'ccj.active = 1',
                    'ccj.channel_id = ?',
                    'ccj.last_exec + ccj.cooldown < ?'
                ];
                let prepare = [
                    matches[1].toLowerCase(),
                    chatbot.channels[argsClone.channel].id,
                    moment().unix()
                ];

                database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
                    // if command exists for channel
                    if (rows.length) {
                        argsClone['customCommandId'] = rows[0].id;
                        chatbot.client.say('#' + args.channel, rows[0].content);
                        command.updateCommandLastExec(chatbot, argsClone);
                    }
                });
            }
        },
        /**
         * Sends dice duel information to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        diceDuel: function(chatbot, args) {
            if (/^!dd([1-9]+)(w([1-9]))? (@)?([0-9a-z_]+)/i.test(args.message)) {
                const matches = args.message.match(/^!dd([1-9]+)(w([1-9]))? (@)?([0-9a-z_]+)/i);
                let ddKeys = Object.keys(command.diceDuels);
                let userExists = false;
                let index = 0;

                for (let i = 0; i < ddKeys.length; i++) {
                    if (command.diceDuels[ddKeys[i]].user1 === args.userstate['display-name']) {
                        userExists = true;
                        break;
                    }
                }

                // if user has no active duel
                if (!userExists) {
                    args.message = args.message.replace('!dd', '!d');
                    args.return = true;
                    let uuid = uuidv4();

                    command.diceDuels[uuid] = {
                        dice: `!d${matches[1]}` + (typeof matches[2] === 'string' ? matches[2] : ''),
                        user1: args.userstate['display-name'],
                        result1: command.commandList.rollDice(chatbot, args),
                        user2: matches[5].toLowerCase(),
                        result2: 0
                    };

                    chatbot.client.say('#' + args.channel, locales.t('dice-duel-request', [matches[5], args.userstate['display-name']]));

                    // remove duel after 2 mins
                    setTimeout(function() {
                        delete command.diceDuels[uuid];
                    }, 120000);

                    args.message = args.message.replace('!d', '!dd');
                    command.logCommand(args);
                    command.updateCommandLastExec(chatbot, args);
                }
            }
        },
        /**
         * Accepts dice duel
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        diceDuelAccept: function(chatbot, args) {
            if (/^!dda/i.test(args.message)) {
                let ddKeys = Object.keys(command.diceDuels);
                for (let i = 0; i < ddKeys.length; i++) {
                    if (command.diceDuels[ddKeys[i]].user2 === args.userstate['username']) {
                        let even = true;
                        let loser = '';
                        let loserResult = 0;
                        let winner = '';
                        let winnerResult = 0;

                        args.message = command.diceDuels[ddKeys[i]].dice;
                        args.return = true;
                        command.diceDuels[ddKeys[i]].user2 = args.userstate['display-name'];

                        while (even) {
                            command.diceDuels[ddKeys[i]].result2 = command.commandList.rollDice(chatbot, args);

                            if (command.diceDuels[ddKeys[i]].result1 > command.diceDuels[ddKeys[i]].result2) {
                                winner = command.diceDuels[ddKeys[i]].user1;
                                winnerResult = command.diceDuels[ddKeys[i]].result1;
                                loser = command.diceDuels[ddKeys[i]].user2;
                                loserResult = command.diceDuels[ddKeys[i]].result2;
                                even = false;
                            } else if (command.diceDuels[ddKeys[i]].result1 < command.diceDuels[ddKeys[i]].result2) {
                                winner = command.diceDuels[ddKeys[i]].user2;
                                winnerResult = command.diceDuels[ddKeys[i]].result2;
                                loser = command.diceDuels[ddKeys[i]].user1;
                                loserResult = command.diceDuels[ddKeys[i]].result1;
                                even = false;
                            }
                        }

                        chatbot.client.say('#' + args.channel, locales.t('dice-duel-result', [winner, winnerResult, loser, loserResult]));
                        delete command.diceDuels[ddKeys[i]];
                        command.logCommand(args);
                        command.updateCommandLastExec(chatbot, args);
                        break;
                    }
                }
            }
        },
        /**
         * Sends playlist information to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        playlistInfo: function(chatbot, args) {
            if (/^!(info|(sende)?plan|programm|playlist|video)/i.test(args.message)) {
                let currentVideo = '';
                let currentVideoDuration = 0;
                let currentVideoEnd = 0;
                let nextVideo = '';

                for (let i = 0; i < chatbot.activePlaylists[args.channel].videos.length; i++) {
                    if (chatbot.activePlaylists[args.channel].videos[i].skipped) {
                        continue;
                    }

                    if (chatbot.activePlaylists[args.channel].videos[i].played) {
                        nextVideo = '';
                        currentVideo = chatbot.activePlaylists[args.channel].videos[i].name;
                        currentVideoDuration = chatbot.activePlaylists[args.channel].videos[i].duration;
                        currentVideoEnd = moment((chatbot.currentVideoStart[args.channel] + chatbot.activePlaylists[args.channel].videos[i].duration) * 1000).format(locales.t('time-long-suffix'));

                        let nextCount = 1;
                        while (typeof chatbot.activePlaylists[args.channel].videos[i + nextCount] !== 'undefined') {
                            if (!chatbot.activePlaylists[args.channel].videos[i + nextCount].skipped 
                                    && currentVideo !== chatbot.activePlaylists[args.channel].videos[i + nextCount].name) {
                                nextVideo = chatbot.activePlaylists[args.channel].videos[i + nextCount].name;
                                break;
                            }
                            nextCount++;
                        }
                    }
                }

                if (currentVideo.length && nextVideo.length) {
                    if (chatbot.currentVideoStart[args.channel]) {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-1-1', [args.userstate['display-name'], currentVideo, currentVideoEnd, nextVideo]));
                    } else {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-1-2', [args.userstate['display-name'], currentVideo, nextVideo]));
                    }
                } else if (currentVideo.length && (chatbot.currentVideoStart[args.channel] + currentVideoDuration) > moment().unix()) {
                    if (chatbot.currentVideoStart[args.channel]) {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-2-1', [args.userstate['display-name'], currentVideo, currentVideoEnd]));
                    } else {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-2-2', [args.userstate['display-name'], currentVideo]));
                    }
                } else {
                    chatbot.client.say('#' + args.channel, locales.t('command-playlist-3', [args.userstate['display-name']]));
                }

                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        },
        /**
         * Executes addUserChoice if possible
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        poll: function(chatbot, args) {
            if (typeof chatbot.activePolls[args.channel] !== 'undefined' && /^!vote ([0-99])$/i.test(args.message)) {
                args.choice = parseInt(args.message.toLowerCase().match(/^!vote ([0-99])$/i)[1]);

                // if poll is active
                if (moment().unix() >= chatbot.activePolls[args.channel].start
                    && moment().unix() <= chatbot.activePolls[args.channel].end 
                    || !chatbot.activePolls[args.channel].end) {
                    poll.addUserChoice(chatbot, args);
                }
                command.updateCommandLastExec(chatbot, args);
            }
        },
        /**
         * Executes addAttendee if possible
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        raffle: function(chatbot, args) {
            if (typeof chatbot.activeRaffles[args.channel] !== 'undefined' 
                && chatbot.activeRaffles[args.channel].keyword === args.message) {
                // if raffle is active
                if (moment().unix() >= chatbot.activeRaffles[args.channel].start
                    && moment().unix() <= chatbot.activeRaffles[args.channel].end 
                    || !chatbot.activeRaffles[args.channel].end) {
                    raffle.addAttendee(chatbot, args);
                }
                command.updateCommandLastExec(chatbot, args);
            }
        },
        /**
         * Removes custom command in database
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        removeCustomCommand: function(chatbot, args) {
            if (/^!rmcc (![a-z0-9]+)/i.test(args.message) 
                && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string')) {
                const matches = args.message.match(/^!rmcc (![a-z0-9]+)/i);
                args = Object.assign(args, {
                    name: matches[1],
                    say: true
                });
                command.removeCustomCommand(chatbot, args);
            }
        },
        /**
         * Sends result of rolled dice to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        rollDice: function(chatbot, args) {
            if (/^!d([1-9]+)(w([1-9]))?/i.test(args.message)) {
                const matches = args.message.match(/^!d([1-9]+)(w([1-9]))?/i);
                const sides = parseInt(matches[1].slice(0, 2));
                const dices = typeof matches[3] === 'undefined' ? 1 : parseInt(matches[3]) > 0 ? parseInt(matches[3]) : 1;
                let results = [];
                let result = 0;

                for (let i = 0; i < dices; i++) {
                    let eyes = Math.floor(Math.random() * sides) + 1;
                    result += eyes;
                    results.push(eyes);
                }

                if (typeof args.return === 'boolean' && args.return) {
                    return result;
                } else {
                    if (dices > 1) {
                        chatbot.client.say('#' + args.channel, locales.t('command-roll-dice-1', [args.userstate['display-name'], locales.t('rolled'), sides, dices, results.join(' + '), result]));
                    } else {
                        chatbot.client.say('#' + args.channel, locales.t('command-roll-dice-2', [args.userstate['display-name'], locales.t('rolled'), sides, results.join(' + '), result]));
                    }

                    command.logCommand(args);
                    command.updateCommandLastExec(chatbot, args);
                }
            }
        },
        /**
         * Toggles custom command activity in database
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        toggleCustomCommand: function(chatbot, args) {
            if (/^!tglcc (![a-z0-9]+)/i.test(args.message) 
                && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string')) {
                const matches = args.message.match(/^!tglcc (![a-z0-9]+)/i);
                args = Object.assign(args, {
                    name: matches[1],
                    say: true
                });
                command.toggleCustomCommand(chatbot, args);
            }
        },
        /**
         * Updates custom command in database
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        updateCustomCommand: function(chatbot, args) {
            if (/^!updcc (![a-z0-9]+)@?([0-9]+)? (.*)/i.test(args.message) 
                && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string')) {
                const matches = args.message.match(/^!updcc (![a-z0-9]+)@?([0-9]+)? (.*)/i);
                args = Object.assign(args, {
                    name: matches[1],
                    cooldown: matches[2],
                    content: matches[3],
                    say: true
                });
                command.updateCustomCommand(chatbot, args);
            }
        }
    }
};

module.exports = command;
