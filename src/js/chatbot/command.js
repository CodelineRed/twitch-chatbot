const database     = require('./database');
const attendee     = require('./attendee');
const bot          = require('./bot');
const chat         = require('./chat');
const counter      = require('./counter');
const locales      = require('./locales');
const playlist     = require('./playlist');
const poll         = require('./poll');
const raffle       = require('./raffle');
const userChoice   = require('./user-choice');
const video        = require('./video');
const moment       = require('moment');
const {v4: uuidv4} = require('uuid');
const yargs        = require('yargs');

const command = {
    lists: {},
    diceDuels: {},
    translation: {
        about: '!about',
        commands: '!cc',
        diceDuel: '!dd[0-99](w[0-9]) @user',
        diceDuelAccept: '!dda',
        playlistInfo: '!plan',
        rollDice: '!d[0-99](w[0-9])'
    },
    defaultCommands: [
        '!about', '!chatbot', '!cb', '!bug', '!bugs', '!help', '!commands', '!cc', 
        '!d([0-9]+)(w([0-9]))?', '!dd([0-9]+)(w([0-9]))?', '!dda', '!plan', 
        '!program', '!playlist', '!video', '!vote', '!raffle', '!bots', '!addbot', 
        '!rmbot', '!addcc', '!rmcc', '!tglcc', '!updcc'
    ],
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
            content: typeof args.content === 'undefined' ? '' : args.content,
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
                        active: typeof args.active === 'undefined' ? 1 : args.active,
                        updatedAt: time,
                        createdAt: time
                    };

                    database.insert('channel_command_join', [value], function(insertCcj) {
                        command.getList(chatbot, args);
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
    getList: function(chatbot, args) {
        let select = 'cmd.id, cmd.name, cmd.type, cmd.created_at AS createdAt, ccj.cooldown, ';
        select += 'ccj.active, ccj.last_exec AS lastExec, ccj.updated_at AS updatedAt';
        let from = 'channel AS c';
        let join = 'JOIN channel_command_join AS ccj ON c.id = ccj.channel_id ';
        join += 'JOIN command AS cmd ON ccj.command_id = cmd.id';
        let where = ['c.id = ?'];
        let order = 'cmd.name';
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, from, join, where, '', order, 0, prepare, function(rows) {
            command.lists[args.channel] = [];

            if (rows.length) {
                command.lists[args.channel] = rows;
            }

            for (let i = 0; i < command.lists[args.channel].length; i++) {
                // convert to boolean
                command.lists[args.channel][i].active = !!command.lists[args.channel][i].active;
            }

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        list: command.lists[args.channel]
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
    log: function(args) {
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
                        command.getList(chatbot, args);
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
                    command.getList(chatbot, args);
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
    update: function(chatbot, args) {
        command.lists[args.channel][args.index] = args.item;

        const set = {
            cooldown: args.item.cooldown,
            active: args.item.active,
            lastExec: args.item.lastExec,
            updatedAt: moment().unix()
        };

        const where = [
            `channel_id = '${chatbot.channels[args.channel].id}'`,
            `command_id = ${args.item.id}`
        ];

        database.update('channel_command_join', set, where);
    },
    /**
     * Updates custom command in database
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    updateCustomCommand: function(chatbot, args) {
        let select = 'cmd.id, cmd.content, ccj.active, ccj.cooldown';
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
            updatedAt: time
        };

        if (typeof args.content === 'string') {
            set['content'] = args.content;
        }

        database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
            // if custom command exists for channel
            if (rows.length) {
                where = ['id = ' + rows[0].id];

                database.update('command', set, where, function(update) {
                    set = {
                        cooldown: typeof args.cooldown === 'undefined' ? rows[0].cooldown : args.cooldown,
                        active: typeof args.active === 'undefined' ? rows[0].active : args.active,
                        updatedAt: time
                    };
                    where = ['command_id = ' + rows[0].id];

                    database.update('channel_command_join', set, where, function(updateCcj) {
                        command.getList(chatbot, args);
                        if (args.say) {
                            chatbot.client.say('#' + args.channel, locales.t('custom-command-updated', [args.name.toLowerCase(), (typeof args.content === 'string' ? args.content : rows[0].content)]));
                        }
                    });
                });
            }
        });
    },
    /**
     * Updates command last execution
     * 
     * @param {type} chatbot
     * @param {type} args
     * @returns {undefined}
     */
    updateLastExec: function(chatbot, args) {
        command.lists[args.channel][args.commandIndex].lastExec = moment().unix();

        let where = [
            `channel_id = '${chatbot.channels[args.channel].id}'`,
            `command_id = ${command.lists[args.channel][args.commandIndex].id}`
        ];

        database.update('channel_command_join', {lastExec: command.lists[args.channel][args.commandIndex].lastExec}, where, function() {
            // if custom command id exists
            if (typeof args.customCommandId !== 'undefined') {
                where = [
                    `channel_id = '${chatbot.channels[args.channel].id}'`,
                    `command_id = ${args.customCommandId}`
                ];

                database.update('channel_command_join', {lastExec: command.lists[args.channel][args.commandIndex].lastExec}, where);
            }
        });

        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    lastExec: command.lists[args.channel][args.commandIndex].lastExec,
                    index: args.commandIndex
                },
                method: 'updateCommandLastExec',
                ref: 'commands',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    /**
     * List of default commands
     */
    defaultList: {
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
                command.log(args);
                command.updateLastExec(chatbot, args);
            }
        },
        /**
         * Adds bot to database
         * 
         * @deprecated will be removed in 2.0
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        addBot: function(chatbot, args) {
            if (/^!addbot ([a-z0-9_]+)/i.test(args.message) 
                && (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string'))) {
                const matches = args.message.match(/^!addbot ([a-z0-9_]+)/i);
                args = Object.assign(args, {
                    name: matches[1],
                    say: true
                });
                bot.add(chatbot, args);
            }
        },
        /**
         * Adds custom command to database
         * 
         * @deprecated will be removed in 2.0
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        addCustomCommand: function(chatbot, args) {
            if (/^!addcc (![a-z0-9]+)@?([0-9]+)? (.*)/i.test(args.message) 
                && (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string'))) {
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
         * Sends list of bots to console or chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        bots: function(chatbot, args) {
            if (/^!bots/i.test(args.message) 
                && (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string'))) {
                let argv = yargs
                    .command('bot-command <bc> [name]', 'Process chat command', (bcyargs) =>
                        bcyargs
                            .option('tc', {type: 'boolean', default: false})
                            .option('rm', {type: 'boolean', default: false})
                            .option('name', {type: 'string', default: ''})
                    )
                    .parse('bot-command ' + args.message);

                // if name given and rm is false
                if (argv.name.length && !argv.rm) {
                    args = Object.assign(args, {
                        name: argv.name,
                        say: true
                    });
                    bot.add(chatbot, args);
                    return;
                }

                // if name given and rm is true
                if (argv.name.length && argv.rm) {
                    args = Object.assign(args, {
                        name: argv.name,
                        say: true
                    });
                    bot.remove(chatbot, args);
                    return;
                }

                // if bot list should posted to chat
                if (argv.tc) {
                    chatbot.client.say('#' + args.channel, locales.t('bot-list', [bot.list.length, bot.list.join(', ')]));
                } else {
                    console.log('* ' + locales.t('bot-list', [bot.list.length, bot.list.join(', ')]));
                }
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
                let commands = command.lists[args.channel];
                for (let i = 0; i < commands.length; i++) {
                    // if command is active and tranlation exists
                    if (commands[i].active && typeof command.translation[commands[i].name] !== 'undefined') {
                        activeCommands.push(command.translation[commands[i].name]);
                    } else if (commands[i].active && commands[i].type === 'custom') {
                        // if is custom command
                        activeCommands.push(commands[i].name);
                    }
                }

                activeCommands.sort();
                chatbot.client.say('#' + args.channel, locales.t('command-commands', [activeCommands.join(', ')]));
                command.log(args);
                command.updateLastExec(chatbot, args);
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
                counter.lists[args.channel].streak = (number - counter.lists[args.channel].streak === 1) ? number : 0;

                command.updateLastExec(chatbot, args);

                if (chatbot.socket !== null) {
                    const call = {
                        args: {
                            channel: args.channel,
                            item: counter.lists[args.channel]
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
            let defaultCommands = new RegExp(command.defaultCommands.join('|'), 'i');

            // skip raffle keyword
            if (typeof raffle.activeLists[args.channel] !== 'undefined' 
                && raffle.activeLists[args.channel].keyword === args.message) {
                return;
            }

            // if message starts with command and is not a default command
            if (/^(![a-z0-9]+)(.*)/i.test(args.message) && !defaultCommands.test(args.message)) {
                const matches = args.message.match(/^(![a-z0-9]+)(.*)/i);
                let isAdmin = false;
                let updateCommand = false;
                let argv = null;
                let atUser = '';
                let atUserRegExp = /^@([a-z0-9_]+)/i;
                let argsClone = Object.assign({}, args);
                let firstWord = '';
                let select = 'cmd.id, cmd.content, ccj.active, ccj.cooldown';
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

                // if is an admin
                if (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string')) {
                    argv = yargs
                        .command('custom-command <cc> [ct..]', 'Process custom command', (ccyargs) =>
                            ccyargs
                                .option('cd', {type: 'number', default: 0})
                                .option('off', {type: 'boolean', default: false})
                                .option('on', {type: 'boolean', default: false})
                                .option('st', {type: 'boolean', default: false})
                                .option('rm', {type: 'boolean', default: false})
                                .option('ct', {type: 'string', default: ''})
                        )
                        .parse('custom-command ' + args.message);

                    firstWord = argv.ct[0];
                    isAdmin = true;
                    updateCommand = argv.ct.join(' ').length > 0 || argv.off || argv.on || argv.cd > 0;

                    // change criteria
                    where = [
                        'cmd.name = ?',
                        'ccj.channel_id = ?'
                    ];
                    prepare = [
                        matches[1].toLowerCase(),
                        chatbot.channels[argsClone.channel].id
                    ];
                    argsClone = Object.assign(argsClone, {
                        name: argv.cc,
                        say: true
                    });

                    // if cooldown is given
                    if (argv.cd > 0) {
                        argsClone['cooldown'] = argv.cd;
                    }

                    // if content is given
                    if (argv.ct.join(' ').length > 0) {
                        argsClone['content'] = argv.ct.join(' ');
                    }

                    // if active is given
                    if (argv.off || argv.on) {
                        argsClone['active'] = argv.on;
                    }
                } else {
                    argv = yargs
                        .command('custom-command <cc> [ct]', 'Process custom command', (ccyargs) =>
                            ccyargs
                                .option('ct', {type: 'string', default: ''})
                        )
                        .parse('custom-command ' + args.message);
                    firstWord = argv.ct;
                }

                // if bot should mention a user
                if (typeof firstWord === 'string' && atUserRegExp.test(firstWord)) {
                    atUser = firstWord.replace(atUserRegExp, '@$1');
                    isAdmin = false;
                }

                database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
                    // if is admin and command not exists
                    if (isAdmin && !rows.length) {
                        command.addCustomCommand(chatbot, argsClone);
                        return false;
                    } else if (isAdmin && updateCommand) {
                        // if is admin and parameters has changed
                        command.updateCustomCommand(chatbot, argsClone);
                        return false;
                    } else if (isAdmin && argv.st && rows.length) {
                        // if is admin and status is true
                        chatbot.client.say('#' + args.channel, locales.t('command-status', [args.userstate['display-name'], rows[0].content, rows[0].cooldown, (rows[0].active ? locales.t('yes') : locales.t('no'))]));
                        return false;
                    } else if (isAdmin && argv.rm) {
                        // if is admin and remove is true
                        command.removeCustomCommand(chatbot, argsClone);
                        return false;
                    }

                    // if command exists for channel
                    if (rows.length) {
                        argsClone['customCommandId'] = rows[0].id;
                        chatbot.client.say('#' + args.channel, (atUser.length ? atUser : '@' + args.userstate['display-name']) + ': ' + rows[0].content);
                        command.updateLastExec(chatbot, argsClone);
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
            if (/^!dd([0-9]+)(w([0-9]))? (@)?([0-9a-z_]+)/i.test(args.message)) {
                const matches = args.message.match(/^!dd([0-9]+)(w([0-9]))? (@)?([0-9a-z_]+)/i);
                let ddKeys = Object.keys(command.diceDuels);
                let userExists = false;

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
                    let result1 = command.defaultList.rollDice(chatbot, args);
                    let uuid = uuidv4();

                    if (typeof result1 === 'undefined') {
                        return;
                    }

                    command.diceDuels[uuid] = {
                        dice: `!d${matches[1]}` + (typeof matches[2] === 'string' ? matches[2] : ''),
                        user1: args.userstate['display-name'],
                        result1: result1,
                        user2: matches[5].toLowerCase(),
                        result2: 0
                    };

                    chatbot.client.say('#' + args.channel, locales.t('dice-duel-request', [matches[5], args.userstate['display-name']]));

                    // remove duel after 2 mins
                    setTimeout(function() {
                        delete command.diceDuels[uuid];
                    }, 120000);

                    args.message = args.message.replace('!d', '!dd');
                    command.log(args);
                    command.updateLastExec(chatbot, args);
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
                        let loser = '';
                        let loserResult = 0;
                        let winner = '';
                        let winnerResult = 0;

                        args.message = command.diceDuels[ddKeys[i]].dice;
                        args.return = true;
                        command.diceDuels[ddKeys[i]].user2 = args.userstate['display-name'];
                        command.diceDuels[ddKeys[i]].result2 = command.defaultList.rollDice(chatbot, args);

                        if (command.diceDuels[ddKeys[i]].result1 > command.diceDuels[ddKeys[i]].result2) {
                            winner = command.diceDuels[ddKeys[i]].user1;
                            winnerResult = command.diceDuels[ddKeys[i]].result1;
                            loser = command.diceDuels[ddKeys[i]].user2;
                            loserResult = command.diceDuels[ddKeys[i]].result2;
                            chatbot.client.say('#' + args.channel, locales.t('dice-duel-result', [winner, winnerResult, loser, loserResult]));
                        } else if (command.diceDuels[ddKeys[i]].result1 < command.diceDuels[ddKeys[i]].result2) {
                            winner = command.diceDuels[ddKeys[i]].user2;
                            winnerResult = command.diceDuels[ddKeys[i]].result2;
                            loser = command.diceDuels[ddKeys[i]].user1;
                            loserResult = command.diceDuels[ddKeys[i]].result1;
                            chatbot.client.say('#' + args.channel, locales.t('dice-duel-result', [winner, winnerResult, loser, loserResult]));
                        } else {
                            let user1 = command.diceDuels[ddKeys[i]].user1;
                            let user2 = command.diceDuels[ddKeys[i]].user2;
                            let result1 = command.diceDuels[ddKeys[i]].result1;
                            chatbot.client.say('#' + args.channel, locales.t('dice-duel-result-even', [user1, user2, result1]));
                        }

                        delete command.diceDuels[ddKeys[i]];
                        command.log(args);
                        command.updateLastExec(chatbot, args);
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
            if (/^!(plan|program|playlist|video)/i.test(args.message)) {
                let currentVideo = '';
                let currentVideoDuration = 0;
                let currentVideoEnd = 0;
                let nextVideo = '';

                for (let i = 0; i < playlist.activeLists[args.channel].videos.length; i++) {
                    if (playlist.activeLists[args.channel].videos[i].skipped) {
                        continue;
                    }

                    if (playlist.activeLists[args.channel].videos[i].played) {
                        nextVideo = '';
                        currentVideo = playlist.activeLists[args.channel].videos[i].name;
                        currentVideoDuration = playlist.activeLists[args.channel].videos[i].duration;
                        currentVideoEnd = moment((video.currentStarts[args.channel] + playlist.activeLists[args.channel].videos[i].duration) * 1000).format(locales.t('time-long-suffix'));

                        let nextCount = 1;
                        while (typeof playlist.activeLists[args.channel].videos[i + nextCount] !== 'undefined') {
                            if (!playlist.activeLists[args.channel].videos[i + nextCount].skipped 
                                    && currentVideo !== playlist.activeLists[args.channel].videos[i + nextCount].name) {
                                nextVideo = playlist.activeLists[args.channel].videos[i + nextCount].name;
                                break;
                            }
                            nextCount++;
                        }
                    }
                }

                if (currentVideo.length && nextVideo.length) {
                    if (video.currentStarts[args.channel]) {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-1-1', [args.userstate['display-name'], currentVideo, currentVideoEnd, nextVideo]));
                    } else {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-1-2', [args.userstate['display-name'], currentVideo, nextVideo]));
                    }
                } else if (currentVideo.length && (video.currentStarts[args.channel] + currentVideoDuration) > moment().unix()) {
                    if (video.currentStarts[args.channel]) {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-2-1', [args.userstate['display-name'], currentVideo, currentVideoEnd]));
                    } else {
                        chatbot.client.say('#' + args.channel, locales.t('command-playlist-2-2', [args.userstate['display-name'], currentVideo]));
                    }
                } else {
                    chatbot.client.say('#' + args.channel, locales.t('command-playlist-3', [args.userstate['display-name']]));
                }

                command.log(args);
                command.updateLastExec(chatbot, args);
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
            if (typeof poll.activeLists[args.channel] !== 'undefined' && /^!vote ([0-99])$/i.test(args.message)) {
                args.choice = parseInt(args.message.toLowerCase().match(/^!vote ([0-99])$/i)[1]);

                // if poll is active
                if (moment().unix() >= poll.activeLists[args.channel].start
                    && moment().unix() <= poll.activeLists[args.channel].end 
                    || !poll.activeLists[args.channel].end) {
                    userChoice.add(chatbot, args);
                }
                command.updateLastExec(chatbot, args);
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
            if (typeof raffle.activeLists[args.channel] !== 'undefined' 
                && raffle.activeLists[args.channel].keyword === args.message) {
                // if raffle is active
                if (moment().unix() >= raffle.activeLists[args.channel].start
                    && moment().unix() <= raffle.activeLists[args.channel].end 
                    || !raffle.activeLists[args.channel].end) {
                    attendee.add(chatbot, args);
                }
                command.updateLastExec(chatbot, args);
            }
        },
        /**
         * Removes bot in database
         * 
         * @deprecated will be removed in 2.0
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        removeBot: function(chatbot, args) {
            if (/^!rmbot ([a-z0-9_]+)/i.test(args.message) 
                && (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string'))) {
                const matches = args.message.match(/^!rmbot ([a-z0-9_]+)/i);
                args = Object.assign(args, {
                    name: matches[1],
                    say: true
                });
                bot.remove(chatbot, args);
            }
        },
        /**
         * Removes custom command in database
         * 
         * @deprecated will be removed in 2.0
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        removeCustomCommand: function(chatbot, args) {
            if (/^!rmcc (![a-z0-9]+)/i.test(args.message) 
                && (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string'))) {
                console.log('* ' + locales.t('command-deprecated', ['!rmcc']));
                // const matches = args.message.match(/^!rmcc (![a-z0-9]+)/i);
                // args = Object.assign(args, {
                //     name: matches[1],
                //     say: true
                // });
                // command.removeCustomCommand(chatbot, args);
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
            if (/^!d([0-9]+)(w([0-9]))?/i.test(args.message)) {
                const matches = args.message.match(/^!d([0-9]+)(w([0-9]))?/i);
                const sides = parseInt(matches[1].slice(0, 2));
                const dices = typeof matches[3] === 'undefined' ? 1 : parseInt(matches[3]) > 0 ? parseInt(matches[3]) : 1;
                let results = [];
                let result = 0;

                if (sides === 0) {
                    return;
                }

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

                    command.log(args);
                    command.updateLastExec(chatbot, args);
                }
            }
        },
        /**
         * Toggles custom command activity in database
         * 
         * @deprecated will be removed in 2.0
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        toggleCustomCommand: function(chatbot, args) {
            if (/^!tglcc (![a-z0-9]+)/i.test(args.message) 
                && (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string'))) {
                console.log('* ' + locales.t('command-deprecated', ['!tglcc']));
                // const matches = args.message.match(/^!tglcc (![a-z0-9]+)/i);
                // args = Object.assign(args, {
                //     name: matches[1],
                //     say: true
                // });
                // command.toggleCustomCommand(chatbot, args);
            }
        },
        /**
         * Updates custom command in database
         * 
         * @deprecated will be removed in 2.0
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        updateCustomCommand: function(chatbot, args) {
            if (/^!updcc (![a-z0-9]+)@?([0-9]+)? (.*)/i.test(args.message) 
                && (args.userstate.badges !== null && (typeof args.userstate.badges.broadcaster === 'string' || typeof args.userstate.badges.moderator === 'string'))) {
                console.log('* ' + locales.t('command-deprecated', ['!updcc']));
                // const matches = args.message.match(/^!updcc (![a-z0-9]+)@?([0-9]+)? (.*)/i);
                // args = Object.assign(args, {
                //     name: matches[1],
                //     cooldown: matches[2],
                //     content: matches[3],
                //     say: true
                // });
                // command.updateCustomCommand(chatbot, args);
            }
        }
    }
};

module.exports = command;
