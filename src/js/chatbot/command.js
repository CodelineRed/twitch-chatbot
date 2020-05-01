const database = require('./database');
const moment   = require('moment');

const command = {
    getCommands: function(chatbot, args) {
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
    },
    logCommand: function(args) {
        args.message = args.message.replace(/^(![a-z0-9]+)(.*)/, '$1');
        console.log(`* Executed ${args.message} command by ${args.userstate['display-name']} at ${args.channel}.`);
    },
    updateCommand: function(chatbot, args) {
        if (chatbot.socket !== null) {
            chatbot.commands[args.channel][args.commandIndex] = args.command;

            const set = {
                cooldown: args.command.cooldown,
                active: args.command.active,
                lastExec: args.command.lastExec,
                updatedAt: moment().unix()
            };

            const where = [
                'channel_id = ' + chatbot.channels[args.channel].id,
                'command_id = ' + args.command.id
            ];

            database.update('channel_command_join', set, where);
        }
    },
    updateCommandLastExec: function(chatbot, args) {
        if (chatbot.socket !== null) {
            chatbot.commands[args.channel][args.commandIndex].lastExec = moment().unix();

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

            let where = [
                'channel_id = ' + chatbot.channels[args.channel].id,
                'command_id = ' + chatbot.commands[args.channel][args.commandIndex].id
            ];

            database.update('channel_command_join', {lastExec: call.args.lastExec}, where);
        }
    },
    commandList: {
        about: function(chatbot, args) {
            if (/^!(about|chatbot|cb|bugs?|help)/i.test(args.message)) {
                const version = require('../../../package.json')['version'];
                const bugs = require('../../../package.json')['bugs']['url'];

                chatbot.client.say('#' + args.channel, `Software made by InsanityMeetsHH. Version: ${version} - Bug report: ${bugs}`);
                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        },
        commands: function(chatbot, args) {
            if (/^!(commands|cc)/i.test(args.message)) {
                chatbot.client.say('#' + args.channel, 'The bot commands for this channel: !about, !cc, !plan and !d[0-99](w[0-9])');
                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        },
        counter: function(chatbot, args) {
            if (/^\d\d?$/.test(args.message)) {
                const number = parseInt(args.message);
                chatbot.counters[args.channel].streak = (number - chatbot.counters[args.channel].streak === 1) ? number : 0;

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
                    //command.logCommand(args);
                    command.updateCommandLastExec(chatbot, args);

                    if (chatbot.socketCounter !== null) {
                        chatbot.socketCounter.write(JSON.stringify(call));
                    }
                }
            }
        },
        playlistInfo: function(chatbot, args) {
            if (/^!(info|(sende)?plan|programm)/i.test(args.message)) {
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
                        currentVideoEnd = moment((chatbot.currentVideoStart[args.channel] + chatbot.activePlaylists[args.channel].videos[i].duration) * 1000).format('hh:mm:ss a');

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
                    chatbot.client.say('#' + args.channel, `@${args.userstate['display-name']} - Now "${currentVideo}"` + (chatbot.currentVideoStart[args.channel] ? ` until ${currentVideoEnd}` : '') + `. Next "${nextVideo}".`);
                } else if (currentVideo.length && (chatbot.currentVideoStart[args.channel] + currentVideoDuration) > moment().unix()) {
                    chatbot.client.say('#' + args.channel, `@${args.userstate['display-name']} - Now "${currentVideo}"` + (chatbot.currentVideoStart[args.channel] ? ` until ${currentVideoEnd}.` : '.'));
                } else {
                    chatbot.client.say('#' + args.channel, `@${args.userstate['display-name']} - No further videos in playlist.`);
                }

                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        },
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

                chatbot.client.say('#' + args.channel, `@${args.userstate['display-name']} rolled d${sides}` + (dices > 1 ? `w${dices}`: '') + `: ${results.join(' + ')} = ${result}.`);
                command.logCommand(args);
                command.updateCommandLastExec(chatbot, args);
            }
        }
    }
};

module.exports = command;