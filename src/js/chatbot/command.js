const database = require('./database');
const locales  = require('./locales');
const poll     = require('./poll');
const raffle   = require('./raffle');
const moment   = require('moment');

const command = {
    /**
     * Sends all commands to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getCommands: function(chatbot, args) {
        let select = 'cmd.id, cmd.name, cmd.created_at AS createdAt, ccj.cooldown, ';
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

        database.update('channel_command_join', {lastExec: chatbot.commands[args.channel][args.commandIndex].lastExec}, where);

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
         * Sends list of commands to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        commands: function(chatbot, args) {
            if (/^!(commands|cc)/i.test(args.message)) {
                chatbot.client.say('#' + args.channel, locales.t('command-commands'));
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
                args.choice = parseInt(args.message.toLowerCase().match(/^!vote ([0-99])$/)[1]);

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
         * Sends result of rolled dice to chat
         * 
         * @param {object} chatbot
         * @param {object} args
         * @returns {undefined}
         */
        rollDice: function(chatbot, args) {
            if (/^!d([1-9]+)(w([1-9]))?/.test(args.message)) {
                const matches = args.message.match(/^!d([1-9]+)(w([1-9]))?/);
                const sides = parseInt(matches[1].slice(0, 2));
                const dices = typeof matches[3] === 'undefined' ? 1 : parseInt(matches[3]) > 0 ? parseInt(matches[3]) : 1;
                let results = [];
                let result = 0;

                for (let i = 0; i < dices; i++) {
                    let eyes = Math.floor(Math.random() * sides) + 1;
                    result += eyes;
                    results.push(eyes);
                }

                if (dices > 1) {
                    chatbot.client.say('#' + args.channel, locales.t('command-roll-dice-1', [args.userstate['display-name'], locales.t('rolled'), sides, dices, results.join(' + '), result]));
                } else {
                    chatbot.client.say('#' + args.channel, locales.t('command-roll-dice-2', [args.userstate['display-name'], locales.t('rolled'), sides, results.join(' + '), result]));
                }

                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        }
    }
};

module.exports = command;
