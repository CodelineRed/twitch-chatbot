const linkify     = require('linkifyjs');
const linkifyHtml = require('linkifyjs/html');
const moment      = require('moment');
const fs          = require('fs-extra');

/**
 * Chatbot Object
 * TODO: 
 * - FrankerFaces
 * - BetterTTV
 * - Emote flicker
 * - User color adjustment
 */
const chatbot = {
    client: null, // tmi client
    config: null,
    counter: {},
    currentVideoStart: {}, // unix timestamp (seconds)
    commands: {},
    messages: {},
    playlist: {},
    polls: {},
    raffles: {},
    socket: null, // skateboard socket
    socketChat: null, // skateboard socket
    socketVideo: null, // skateboard socket
    socketRaffle: null, // skateboard socket
    socketPoll: null, // skateboard socket
    socketCounter: null, // skateboard socket
    addVideo: function(args) {
        if (chatbot.socket !== null) {
            chatbot.preparePlaylist(args, false);
            
            delete args.video.durationHours;
            delete args.video.durationMin;
            delete args.video.durationSec;
            
            chatbot.playlist[args.channel].push(args.video);
            chatbot.getPlaylist(args);
            chatbot.saveJson('playlist', args.channel, args.video);
        }
    },
    saveJson: function(file, channel, data) {
        const json = './data/' + file + '.json';
        let content = {};
        
        async function saveJsonAsync() {
            const exists = await fs.pathExists(json);
            
            if (exists) {
                await fs.readJson(json)
                    .then(fileContent => {
                        if (typeof fileContent[channel] === 'undefined') {
                            fileContent[channel] = [];
                            console.log(`* Initialized ${channel} for file ${json}`);
                        } else {
                            console.log(`* Found ${channel} in file ${json}`);
                        }
                        
                        content = fileContent;
                    });
            } else {
                content[channel] = [];
                
                await fs.writeJson(json, content)
                    .then(() => {
                        console.log(`* Initialized file ${json} (saveJson - ${channel})`);
                    });
            }
            
            content[channel].push(data);
            
            await fs.writeJson(json, content)
                .then(() => {
                    console.log(`* Added "${data.name}" (${channel}) to ${json}`);
                })
                .catch(writeErr => {
                    console.error(`* JSON write error! "${data.name}" (${channel}) for ${json}`);
                    console.error(writeErr);
                });
        }
        
        saveJsonAsync();
    },
    readJson: function(file, channel) {
        const json = './data/' + file + '.json';
        let content = {};
        
        async function readJsonAsync() {
            const exists = await fs.pathExists(json);
            
            if (exists) {
                await fs.readJson(json)
                    .then(fileContent => {
                        if (typeof fileContent[channel] === 'undefined') {
                            fileContent[channel] = [];
                        }
                        
                        content = fileContent;
                    });
            } else {
                content[channel] = [];
                
                await fs.writeJson(json, content)
                    .then(() => {
                        console.log(`* Initialized file ${json} (readJson - ${channel})`);
                    });
            }
            
            chatbot[file] = content;
        }

        readJsonAsync();
    },
    // chatbot.writeJson(file, channel, data, content, mode)
    writeJson: function(file, channel, data, content, mode) {
        const json = './data/' + file + '.json';
        mode = typeof mode === 'string' ? mode : 'insert';
        
        fs.writeJson(json, content)
            .then(() => {
                if (mode === 'update') {
                    console.log(`* Updated "${data.name}" (${channel}) from ${json}`);
                } else if (mode === 'remove') {
                    console.log(`* Removed "${data.name}" (${channel}) from ${json}`);
                } else {
                    console.log(`* Added "${data.name}" (${channel}) to ${json}`);
                }
                
            })
            .catch(writeErr => {
                console.error(`* JSON write error (${channel} - ${data.name} - ${json})`);
                console.error(writeErr);
            });
    },
    formatMessage: function(message, emotes) {
        let splitText = message.split('');
        
        for (let i in emotes) {
            if (Object.prototype.hasOwnProperty.call(emotes, i)) {
                let emoteCodes = emotes[i];

                for (let j in emoteCodes) {
                    if (Object.prototype.hasOwnProperty.call(emoteCodes, j)) {

                        let emoteCode = emoteCodes[j];

                        if (typeof emoteCode === 'string') {
                            emoteCode = emoteCode.split('-');
                            emoteCode = [parseInt(emoteCode[0]), parseInt(emoteCode[1])];
                            let length =  emoteCode[1] - emoteCode[0];
                            let empty = Array.apply(null, new Array(length + 1)).map(function() {
                                return '';
                            });
                            let emote = message.slice(emoteCode[0], emoteCode[1] + 1);
                            splitText = splitText.slice(0, emoteCode[0]).concat(empty).concat(splitText.slice(emoteCode[1] + 1, splitText.length));
                            splitText.splice(emoteCode[0], 1, '<img class="emote img-fluid" src="img/empty-emote.png" data-src="http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0"  data-toggle="tooltip" data-placement="top" title="' + emote + '">');
                        }
                    }
                }
            }
        }
        
        splitText = linkifyHtml(splitText.join(''), {
            defaultProtocol: 'https'
        });
        
        return splitText;
    },
    getChannels: function() {
        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channels: chatbot.config.channels.join(';').replace(/#/g, '')
                },
                method: 'setChannels',
                ref: 'channels',
                env: 'web'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    getChatNotification: function(args) {
        if (chatbot.socket !== null) {
            chatbot.prepareChatMessages(args, true);
            
            const call = {
                args: {
                    badges: {},
                    channel: args.channel,
                    channelId: typeof args.userstate['room-id'] === 'undefined' ? 0 : args.userstate['room-id'],
                    color: null,
                    message: args.notification + (args.message ? ' (' + chatbot.formatMessage(args.message, args.userstate.emotes) + ')' : ''),
                    messageId: typeof args.userstate['id'] === 'undefined' ? 0 : args.userstate['id'],
                    messageType: 'notification',
                    purge: {showMessage: false, hasPurge: false},
                    timestamp: typeof args.userstate['tmi-sent-ts'] === 'undefined' ? new Date().getTime() : args.userstate['tmi-sent-ts'],
                    userId: typeof args.userstate['user-id'] === 'undefined' ? 0 : args.userstate['user-id'],
                    user: '[' + args.userstate['message-type'].charAt(0).toUpperCase() + args.userstate['message-type'].slice(1) + ']'
                },
                method: 'setChatMessage',
                ref: 'chat',
                env: 'web'
            };

            chatbot.messages[args.channel].push(call.args);
            chatbot.socket.write(JSON.stringify(call));
            
            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }
        }
    },
    getChatMessage: function(args) {
        if (chatbot.socket !== null) {
            chatbot.prepareChatMessages(args, true);
            
            if (args.userstate.badges === null) {
                args.userstate.badges = {};
            }
            
            // further badges can be found in Chatty > Settings > Look > Badges > Enable Custom Badges > Edit Item > ID/Version
            const badges = {
                broadcaster: typeof args.userstate.badges.broadcaster === 'string' ? {style: 'fas', icon: 'video', transform: null, title: 'Broadcaster', cssClass: null} : false,
                admin: typeof args.userstate.badges.admin === 'string' ? {style: 'fab', icon: 'twitch', transform: null, title: 'Admin', cssClass: null} : false,
                staff: typeof args.userstate.badges.staff === 'string' ? {style: 'fas', icon: 'wrench', transform: null, title: 'Staff', cssClass: null} : false,
                globalMod: typeof args.userstate.badges.global_mod === 'string' ? {style: 'fas', icon: 'hammer', transform: null, title: 'Global Mod', cssClass: 'global-mod'} : false,
                vip: typeof args.userstate.badges.vip === 'string' ? {style: 'fas', icon: 'gem', transform: null, title: 'Vip', cssClass: null} : false,
                mod: args.userstate.mod === true ? {style: 'fas', icon: 'gavel', transform: null, title: 'Mod', cssClass: null} : false,
                founder: typeof args.userstate.badges.founder === 'string' ? {style: 'fas', icon: 'award', transform: null, title: 'Founder', cssClass: null} : false,
                subscriber: args.userstate.subscriber === true ? {style: 'fas', icon: 'star', transform: null, title: 'Sub (' + args.userstate['badge-info'].subscriber + ')', cssClass: null} : false,
                bot: args.userstate['display-name'].toLowerCase() === chatbot.config.username.toLowerCase() ? {style: 'fas', icon: 'robot', transform: null, title: 'Bot', cssClass: null} : false,
                hypeTrain: typeof args.userstate.badges['hype-train'] === 'string' ? {style: 'fas', icon: 'train', transform: null, title: (args.userstate.badges['hype-train'] === '2' ? 'Former ' : '') + 'Hype Train Conductor', cssClass: args.userstate.badges['hype-train'] === '2' ? 'hype-train former' : 'hype-train'} : false,
                bits: typeof args.userstate.badges.bits === 'string' ? {style: 'fab', icon: 'ethereum', transform: null, title: 'Bits (' + args.userstate.badges.bits + ')', cssClass: null} : false,
                bitsLeader: typeof args.userstate.badges['bits-leader'] === 'string' ? {style: 'fab', icon: 'ethereum', transform: null, title: 'Bits Leader', cssClass: 'bits-leader'} : false,
                subGifter: typeof args.userstate.badges['sub-gifter'] === 'string' ? {style: 'fas', icon: 'gift', transform: null, title: 'Sub Gifter (' + args.userstate.badges['sub-gifter'] + ')', cssClass: 'sub-gifter'} : false,
                subGiftLeader: typeof args.userstate.badges['sub-gift-leader'] === 'string' ? {style: 'fas', icon: 'gift', transform: null, title: 'Sub Gift Leader', cssClass: 'sub-gift-leader'} : false,
                bitsCharity: typeof args.userstate.badges['bits-charity'] === 'string' ? {style: 'fas', icon: 'snowflake', transform: null, title: 'Direct Relief 2018', cssClass: 'bits-charity'} : false,
                glhfPledge: typeof args.userstate.badges['glhf-pledge'] === 'string' ? {style: 'fas', icon: 'money-bill', transform: null, title: 'GLHF Pledge', cssClass: 'glhf-pledge'} : false,
                premium: typeof args.userstate.badges.premium === 'string' ? {style: 'fas', icon: 'crown', transform: null, title: 'Prime', cssClass: null} : false,
                turbo: args.userstate.turbo === true ? {style: 'fas', icon: 'bolt', transform: null, title: 'Turbo', cssClass: null} : false,
                twitchconEU2019: typeof args.userstate.badges.twitchconEU2019 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: {rotate: -15}, title: 'TwitchCon EU 2019', cssClass: 'tc-eu-2019'} : false,
                twitchconEU2020: typeof args.userstate.badges.twitchconAmsterdam2020 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: {rotate: -15}, title: 'TwitchCon EU 2020', cssClass: 'tc-eu-2020'} : false,
                twitchconUSA2017: typeof args.userstate.badges.twitchcon2017 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: {rotate: -15}, title: 'TwitchCon USA 2017', cssClass: 'tc-usa-2017'} : false,
                twitchconUSA2018: typeof args.userstate.badges.twitchcon2018 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: {rotate: -15}, title: 'TwitchCon USA 2018', cssClass: 'tc-usa-2018'} : false,
                twitchconUSA2019: typeof args.userstate.badges.twitchconNA2019 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: {rotate: -15}, title: 'TwitchCon USA 2019', cssClass: 'tc-usa-2019'} : false,
                twitchconUSA2020: typeof args.userstate.badges.twitchconNA2020 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: {rotate: -15}, title: 'TwitchCon USA 2019', cssClass: 'tc-usa-2019'} : false,
                partner: typeof args.userstate.badges.partner === 'string' ? {style: 'fas', icon: 'check-circle', transform: {rotate: -15}, title: 'Partner', cssClass: null} : false
            };
            
            const call = {
                args: {
                    badges: badges,
                    channel: args.channel,
                    channelId: args.userstate['room-id'],
                    color: args.userstate.color,
                    message: chatbot.formatMessage(args.message, args.userstate.emotes),
                    messageId: args.userstate['id'],
                    messageType: args.userstate['message-type'],
                    nativeBadges: args.userstate.badges,
                    purge: {showMessage: false, hasPurge: false},
                    timestamp: typeof args.userstate['tmi-sent-ts'] === 'undefined' ? new Date().getTime() : args.userstate['tmi-sent-ts'],
                    userId: args.userstate['user-id'],
                    user: args.userstate['display-name']
                },
                method: 'setChatMessage',
                ref: 'chat',
                env: 'web'
            };

            chatbot.messages[args.channel].push(call.args);
            chatbot.socket.write(JSON.stringify(call));
            
            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }
        }
    },
    getChatMessages: function(args) {
        if (chatbot.socket !== null) {
            chatbot.prepareChatMessages(args, false);
            
            const call = {
                args: {
                    channel: args.channel,
                    messages: chatbot.messages[args.channel]
                },
                method: 'setChatMessages',
                ref: 'chat',
                env: 'web'
            };
            
            chatbot.socket.write(JSON.stringify(call));
            
            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }
        }
    },
    getChatPurge: function(args) {
        if (chatbot.socket !== null) {
            chatbot.prepareChatMessages(args, false);
            let lastMatch = -1;
            
            for (let i = 0; i < chatbot.messages[args.channel].length; i++) {
                if (typeof args.userstate['target-msg-id'] === 'string') {
                    if (chatbot.messages[args.channel][i].messageId === args.userstate['target-msg-id']) {
                        chatbot.messages[args.channel][i].purge = args.purge;
                        break;
                    }
                    continue;
                }
                
                if (typeof args.userstate['target-user-id'] === 'string') {
                    if (args.userstate['target-user-id'] === chatbot.messages[args.channel][i].userId) {
                        chatbot.messages[args.channel][i].purge = args.purge;
                        lastMatch = i;
                    }
                }
            }
            
            // BUG: all messages get showMessage = true
            if (lastMatch && typeof chatbot.messages[args.channel][lastMatch] !== 'undefined') {
                chatbot.messages[args.channel][lastMatch].purge.showMessage = true;
            }
            
            const call = {
                args: {
                    channel: args.channel,
                    messages: chatbot.messages[args.channel]
                },
                method: 'setChatMessages',
                ref: 'chat',
                env: 'web'
            };
            
            chatbot.socket.write(JSON.stringify(call));
            
            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }
        }
    },
    getCommands: function(args) {
        if (chatbot.socket !== null) {
            chatbot.prepareCommands(args);
            
            const call = {
                args: {
                    channel: args.channel,
                    commands: chatbot.commands[args.channel]
                },
                method: 'setCommands',
                ref: 'commands',
                env: 'web'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    getCounter: function(args) {
        if (chatbot.socket !== null) {
            if (typeof chatbot.counter[args.channel] === 'undefined') {
                chatbot.counter[args.channel] = 0;
            }
            
            const call = {
                args: {
                    channel: args.channel,
                    counter: chatbot.counter[args.channel].toString()
                },
                method: 'setCounter',
                ref: 'counter',
                env: 'web'
            };

            chatbot.socket.write(JSON.stringify(call));
        }
    },
    getPlaylist: function(args) {
        if (chatbot.socket !== null) {
            chatbot.preparePlaylist(args, false);
            let currentTime = chatbot.currentVideoStart[args.channel];
            
            for (let i = 0; i < chatbot.playlist[args.channel].length; i++) {
                if (chatbot.playlist[args.channel][i].skipped) {
                    chatbot.playlist[args.channel][i].start = 0;
                    chatbot.playlist[args.channel][i].end = 0;
                    continue;
                }
                
                if ((!chatbot.playlist[args.channel][i].played || i + 1 === chatbot.playlist[args.channel].length) && currentTime > 0) {
                    chatbot.playlist[args.channel][i].start = currentTime;
                    chatbot.playlist[args.channel][i].end = currentTime + chatbot.playlist[args.channel][i].duration;
                    currentTime += chatbot.playlist[args.channel][i].duration;
                } else {
                    let currentVideoFile = '';
                    chatbot.playlist[args.channel][i].start = 0;
                    chatbot.playlist[args.channel][i].end = 0;
                    
                    if (currentTime === 0) {
                        continue;
                    }
                
                    for (let j = chatbot.playlist[args.channel].length - 1; j >= 0; j--) {
                        if (chatbot.playlist[args.channel][j].played 
                                || (!chatbot.playlist[args.channel][j].played && j === 0)) {
                            currentVideoFile = chatbot.playlist[args.channel][j].file;
                            break;
                        }
                    }
                    
                    // if file is currently played
                    if (currentVideoFile === chatbot.playlist[args.channel][i].file) {
                        chatbot.playlist[args.channel][i].start = currentTime;
                        chatbot.playlist[args.channel][i].end = currentTime + chatbot.playlist[args.channel][i].duration;
                        currentTime += chatbot.playlist[args.channel][i].duration;
                    }
                }
            }
            
            const call = {
                args: {
                    channel: args.channel,
                    playlist: chatbot.playlist[args.channel]
                },
                method: 'setPlaylist',
                ref: 'playlist',
                env: 'web'
            };
            
            chatbot.socket.write(JSON.stringify(call));
        }
    },
    getPlaylistClear: function(args) {
        if (chatbot.socket !== null) {
            const playlistLength = chatbot.playlist[args.channel].length;
            chatbot.preparePlaylist(args, false);
            
            chatbot.playlist[args.channel] = [];
            chatbot.getPlaylist(args);
            chatbot.writeJson('playlist', args.channel, {name: playlistLength + ' videos'}, chatbot.playlist, 'remove');
        }
    },
    getPlaylistReset: function(args) {
        if (chatbot.socket !== null) {
            const playlistLength = chatbot.playlist[args.channel].length;
            chatbot.preparePlaylist(args, false);
            chatbot.currentVideoStart[args.channel] = 0;
            
            for (let i = 0; i < playlistLength; i++) {
                chatbot.playlist[args.channel][i].played = false;
                chatbot.playlist[args.channel][i].skipped = false;
                chatbot.playlist[args.channel][i].start = 0;
                chatbot.playlist[args.channel][i].end = 0;
            }
            
            chatbot.getPlaylist(args);
            chatbot.writeJson('playlist', args.channel, {name: playlistLength + ' videos'}, chatbot.playlist, 'update');
        }
    },
    getVideo: function(args) {
        if (chatbot.socketVideo !== null) {
            chatbot.preparePlaylist(args, false);
            let match = false;
            
            let video = {
                name: '',
                file: '',
                played: false,
                duration: 0,
                platform: 'empty'
            };
            
            for (let i = 0; i < chatbot.playlist[args.channel].length; i++) {
                if (chatbot.playlist[args.channel][i].skipped || match) {
                    chatbot.playlist[args.channel][i].played = false;
                    
                    if (chatbot.playlist[args.channel][i].skipped) {
                        continue;
                    }
                }
                
                if (!chatbot.playlist[args.channel][i].played && !match) {
                    video = chatbot.playlist[args.channel][i];
                    chatbot.playlist[args.channel][i].played = true;
                    chatbot.currentVideoStart[args.channel] = moment().unix();
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
                env: 'web'
            };
            
            chatbot.socketVideo.write(JSON.stringify(call));
            chatbot.getPlaylist(args);
        }
    },
    getVideoSkipped: function(args) {
        if (chatbot.socket !== null) {
            chatbot.preparePlaylist(args, false);
            chatbot.playlist[args.channel][args.videoId].skipped = !chatbot.playlist[args.channel][args.videoId].skipped;
            chatbot.getPlaylist(args);
            chatbot.writeJson('playlist', args.channel, chatbot.playlist[args.channel][args.videoId], chatbot.playlist, 'update');
        }
    },
    getVideoPlayed: function(args) {
        if (chatbot.socket !== null) {
            chatbot.preparePlaylist(args, false);
            chatbot.playlist[args.channel][args.videoId].played = !chatbot.playlist[args.channel][args.videoId].played;
            chatbot.getPlaylist(args);
            chatbot.writeJson('playlist', args.channel, chatbot.playlist[args.channel][args.videoId], chatbot.playlist, 'update');
        }
    },
    logCommand: function(args) {
        args.message = args.message.replace(/^(![a-z0-9]+)(.*)/, '$1');
        console.log(`* Executed ${args.message} command by ${args.userstate['display-name']} at ${args.channel}.`);
    },
    moveVideo: function(args) {
        if (chatbot.socket !== null) {
            chatbot.preparePlaylist(args, false);
            let movedVideo = chatbot.playlist[args.channel].splice(args.videoId, 1)[0];
            chatbot.playlist[args.channel].splice(args.videoId + args.direction, 0, movedVideo);
            chatbot.getPlaylist(args);
            chatbot.writeJson('playlist', args.channel, movedVideo, chatbot.playlist, 'update');
        }
    },
    removeVideo: function(args) {
        if (chatbot.socket !== null) {
            chatbot.preparePlaylist(args, false);
            let removedVideo = chatbot.playlist[args.channel].splice(args.videoId, 1)[0];
            chatbot.getPlaylist(args);
            chatbot.writeJson('playlist', args.channel, removedVideo, chatbot.playlist, 'remove');
        }
    },
    removeVideosByFlag: function(args) {
        if (chatbot.socket !== null) {
            let removedVideos = 0;
            chatbot.preparePlaylist(args, false);
            
            let playlist = chatbot.playlist[args.channel];
            chatbot.playlist[args.channel] = [];
            
            for (let i = 0; i < playlist.length; i++) {
                if (playlist[i][args.flag] === args.value) {
                    removedVideos++;
                } else {
                    chatbot.playlist[args.channel].push(playlist[i]);
                }
            }
            
            chatbot.getPlaylist(args);
            chatbot.writeJson('playlist', args.channel, {name: removedVideos + ' videos'}, chatbot.playlist, 'remove');
        }
    },
    prepareChatMessages: function(args, shift) {
        if (typeof chatbot.messages[args.channel] === 'undefined') {
            chatbot.messages[args.channel] = [];
        } else if (chatbot.messages[args.channel].length >= 100 && shift) {
            chatbot.messages[args.channel].shift();
        }
    },
    prepareCommands: function(args) {
        if (typeof chatbot.commands[args.channel] === 'undefined' 
                || chatbot.commands[args.channel].length === 0) {
            chatbot.commands[args.channel] = [];
            
            const commands = Object.keys(chatbot.commandList);
            for (let i = 0; i < commands.length; i++) {
                let match = false;
                
                for (let j = 0; j < chatbot.commands[args.channel].length; j++) {
                    if (typeof chatbot.commands[args.channel][j].name !== 'undefined' 
                            && chatbot.commands[args.channel][j].name === commands[i]) {
                        match = true;
                        break;
                    }
                }
                
                // if command is function and not pushed
                if (typeof chatbot.commandList[commands[i]] === 'function' && !match) {
                    chatbot.commands[args.channel].push({
                        name: commands[i],
                        cooldown: 0,
                        active: false,
                        lastExec: 0 // unix timestamp (seconds)
                    });
                }
            }
        }
    },
    preparePlaylist: function(args, shift) {
        if (typeof chatbot.playlist[args.channel] === 'undefined') {
            chatbot.playlist[args.channel] = [];
        } else if (chatbot.playlist[args.channel].length >= 100 && shift) {
            chatbot.playlist[args.channel].shift();
        }
        
        if (typeof chatbot.currentVideoStart[args.channel] === 'undefined') {
            chatbot.currentVideoStart[args.channel] = 0;
        }
    },
    updateCommand: function(args) {
        chatbot.prepareCommands(args);
        args.command.cooldown = parseInt(args.command.cooldown);
        chatbot.commands[args.channel][args.commandId] = args.command;
        chatbot.getCommands(args);
        chatbot.writeJson('commands', args.channel, args.command, chatbot.commands, 'update');
    },
    updateCommandLastExec: function(commandName, args) {
        chatbot.prepareCommands(args);
        
        for (let i = 0; i < chatbot.commands[args.channel].length; i++) {
            if (typeof chatbot.commands[args.channel][i].name !== 'undefined' 
                    && chatbot.commands[args.channel][i].name === commandName) {
                chatbot.commands[args.channel][i].lastExec = moment().unix();
                break;
            }
        }
        
        //chatbot.getCommands(args);
    },
    commandList: {
        about: function(args) {
            if (/^!(about|chatbot|bugs?|help)/i.test(args.message)) {
                const version = require('../../../package.json')['version'];
                const bugs = require('../../../package.json')['bugs']['url'];
                
                chatbot.client.say('#' + args.channel, `Software made by InsanityMeetsHH. Version: ${version} - Bug report: ${bugs}`);
                chatbot.logCommand(args);
                chatbot.updateCommandLastExec('about', args);
            }
        },
        counter: function(args) {
            if (/^\d\d?$/.test(args.message)) {
                if (typeof chatbot.counter[args.channel] === 'undefined') {
                    chatbot.counter[args.channel] = 0;
                }
                
                const n = parseInt(args.message);
                chatbot.counter[args.channel] = (n - chatbot.counter[args.channel] === 1) ? n : 0;

                if (chatbot.socket !== null) {
                    const call = {
                        args: {
                            channel: args.channel,
                            counter: chatbot.counter[args.channel].toString()
                        },
                        method: 'setCounter',
                        ref: 'counter',
                        env: 'web'
                    };

                    chatbot.socket.write(JSON.stringify(call));
                    //chatbot.logCommand(args);
                    chatbot.updateCommandLastExec('counter', args);
                }
            }
        },
        playlistInfo: function(args) {
            if (/^!(info|(sende)?plan|programm)/i.test(args.message)) {
                chatbot.preparePlaylist(args, false);
                let currentVideo = '';
                let currentVideoDuration = 0;
                let currentVideoEnd = 0;
                let nextVideo = '';
                
                for (let i = 0; i < chatbot.playlist[args.channel].length; i++) {
                    if (chatbot.playlist[args.channel][i].skipped) {
                        continue;
                    }
                    
                    if (chatbot.playlist[args.channel][i].played) {
                        nextVideo = '';
                        currentVideo = chatbot.playlist[args.channel][i].name;
                        currentVideoDuration = chatbot.playlist[args.channel][i].duration;
                        currentVideoEnd = moment((chatbot.currentVideoStart[args.channel] + chatbot.playlist[args.channel][i].duration) * 1000).format('hh:mm:ss a');
                        
                        let nextCount = 1;
                        while (typeof chatbot.playlist[args.channel][i + nextCount] !== 'undefined') {
                            if (!chatbot.playlist[args.channel][i + nextCount].skipped 
                                    && currentVideo !== chatbot.playlist[args.channel][i + nextCount].name) {
                                nextVideo = chatbot.playlist[args.channel][i + nextCount].name;
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
                chatbot.updateCommandLastExec('playlistInfo', args);
            }
        },
        rollDice: function(args) {
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
                chatbot.logCommand(args);
                chatbot.updateCommandLastExec('rollDice', args);
            }
        }
    }
};

module.exports = chatbot;
