var linkify     = require('linkifyjs');
var linkifyHtml = require('linkifyjs/html');

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
    messages: {},
    socket: null, // skateboard socket
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
    getCounter: function(args) {
        if (typeof chatbot.counter[args.channel] === 'undefined') {
            chatbot.counter[args.channel] = 0;
        }
        
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
        }
    },
    getChatMessage: function(args) {
        if (chatbot.socket !== null) {
            chatbot.prepareChatMessages(args, true);
            
            if (args.userstate.badges === null) {
                args.userstate.badges = {};
            }
            
            // further badges: warcraft (horde), warcraft (alliance), brawlhalla_1, overwatch-league-insider_2019A, overwatch-league-insider_2018B
            const badges = {
                broadcaster: typeof args.userstate.badges.broadcaster === 'string' ? {style: 'fas', icon: 'video', transform: null, title: 'Broadcaster', cssClass: null} : false,
                admin: typeof args.userstate.badges.admin === 'string' ? {style: 'fab', icon: 'twitch', transform: null, title: 'Admin', cssClass: null} : false,
                staff: typeof args.userstate.badges.staff === 'string' ? {style: 'fas', icon: 'wrench', transform: null, title: 'Staff', cssClass: null} : false,
                globalMod: typeof args.userstate.badges['global-mod'] === 'string' ? {style: 'fas', icon: 'hammer', transform: null, title: 'Global Mod', cssClass: 'global-mod'} : false,
                vip: typeof args.userstate.badges.vip === 'string' ? {style: 'fas', icon: 'gem', transform: null, title: 'Vip', cssClass: null} : false,
                mod: args.userstate.mod === true ? {style: 'fas', icon: 'gavel', transform: null, title: 'Mod', cssClass: null} : false,
                founder: typeof args.userstate.badges.founder === 'string' ? {style: 'fas', icon: 'award', transform: null, title: 'Founder', cssClass: null} : false,
                subscriber: args.userstate.subscriber === true ? {style: 'fas', icon: 'star', transform: null, title: 'Sub (' + args.userstate['badge-info'].subscriber + ')', cssClass: null} : false,
                bot: args.userstate['display-name'].toLowerCase() === chatbot.config.username.toLowerCase() ? {style: 'fas', icon: 'robot', transform: null, title: 'Bot', cssClass: null} : false,
                hypeTrain: typeof args.userstate.badges['hype-train'] === 'string' ? {style: 'fas', icon: 'train', transform: null, title: (args.userstate.badges['hype-train'] === '2' ? 'Former ' : '') + 'Hype Train Conductor', cssClass: args.userstate.badges['hype-train'] === '2' ? 'hype-train former' : 'hype-train'} : false,
                bits: typeof args.userstate.badges.bits === 'string' ? {style: 'fab', icon: 'ethereum', transform: null, title: 'Bits (' + args.userstate.badges.bits + ')', cssClass: null} : false,
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
                twitchconUSA2019: typeof args.userstate.badges.twitchcon2019 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: {rotate: -15}, title: 'TwitchCon USA 2019', cssClass: 'tc-usa-2019'} : false,
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
        }
    },
    logCommand: function(args) {
        console.log(`* Executed ${args.message} command by ${args.userstate['display-name']} at ${args.channel}.`);
    },
    prepareChatMessages: function(args, shift) {
        if (typeof chatbot.messages[args.channel] === 'undefined') {
            chatbot.messages[args.channel] = [];
        } else if (chatbot.messages[args.channel].length >= 100 && shift) {
            chatbot.messages[args.channel].shift();
        }
    },
    commands: {
        active: {
            insanitymeetshh: ['counter', 'rollDice'],
            electrinchen: [],
            biberbros: [],
            gronkh: []
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
                    chatbot.logCommand(args);
                }
            }
        },
        rollDice: function(args) {
            if (/^!d(\d+)(w(\d))?$/.test(args.message)) {
                const matches = args.message.match(/^!d(\d+)(w(\d))?$/);
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
            }
        }
    }
};

module.exports = chatbot;
