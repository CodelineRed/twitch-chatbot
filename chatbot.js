const moment      = require('moment');
const skateboard  = require('skateboard');
const format      = require('string-format-js');
const tmi         = require('tmi.js');

const config      = require('./src/app/chatbot.json');
const chatbot     = require('./src/js/chatbot/app');

chatbot.config = config;

// define configuration options
const opts = {
    connection: {
        maxReconnectAttempts: 300,
        reconnect: true,
        reconnectInterval: 5000
    },
    identity: {
        username: config.username,
        password: config.tmiToken
    },
    channels: config.channels.slice(0) // keep capital letters
};

// create a client with options
const client = new tmi.client(opts); // eslint-disable-line new-cap

function onAnongiftpaidupgrade(channel, username, userstate) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        userstate: userstate
    };

    chatbot.getChatNotification(commandArgs);
}

//onBan
//#insanitymeetshh
//insanitymeetshamburg
//null
//{ 'room-id': '86980760',
//  'target-user-id': '82566098',
//  'tmi-sent-ts': '1585062499494' }
function onBan(channel, username, reason, userstate) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        purge: {message: 'banned', showMessage: false, hasPurge: true, reason: reason},
        user: username,
        userstate: userstate
    };

    chatbot.getChatPurge(commandArgs);
}

//onCheer
//#thiseguy
//Cheer1000 Cheer1000 Cheer1000
//{ 'badge-info': { subscriber: '4' },
//  badges: { subscriber: '3', premium: '1' },
//  bits: '3000',
//  color: null,
//  'display-name': 'KingNothing2802',
//  emotes: null,
//  flags: null,
//  id: '6b8f7de9-c48e-464b-af23-443ff20e2ad6',
//  mod: false,
//  'room-id': '66480362',
//  subscriber: true,
//  'tmi-sent-ts': '1585077948824',
//  turbo: false,
//  'user-id': '103652824',
//  'user-type': null,
//  'emotes-raw': null,
//  'badge-info-raw': 'subscriber/4',
//  'badges-raw': 'subscriber/3,premium/1',
//  username: 'kingnothing2802' }
function onCheer(channel, userstate, message) {
    userstate['message-type'] = 'cheer';
    
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['display-name'] + ' cheered with ' + userstate.bits + ' bits!',
        message: message ? message.trim() : null,
        userstate: userstate
    };

    chatbot.getChatNotification(commandArgs);
}

// called every time the bot connects to Twitch chat
function onConnected(url, port) {
    console.log(`* Connected to ${url}:${port}`);
    let ports = [3100, 3110, 3120, 3130, 3140, 3150];
    
    if (chatbot.socket === null) {
        for (let i = 0; i < ports.length; i++) {
            skateboard({port: ports[i]}, (stream) => {
                if (ports[i] === 3100) {
                    chatbot.socket = stream;
                } else if (ports[i] === 3110) {
                    chatbot.socketChat = stream;
                } else if (ports[i] === 3120) {
                    chatbot.socketVideo = stream;
                } else if (ports[i] === 3130) {
                    chatbot.socketRaffle = stream;
                } else if (ports[i] === 3140) {
                    chatbot.socketPoll = stream;
                } else if (ports[i] === 3150) {
                    chatbot.socketCounter = stream;
                }

                stream.on('data', function(data) {
                    let dataJson = JSON.parse(data);

                    if (typeof dataJson.method === 'string' && typeof chatbot[dataJson.method] === 'function' 
                            && typeof dataJson.env === 'string' && dataJson.env === 'node') {
                        if (typeof dataJson.args === 'object' && dataJson.args !== null) {
                            chatbot[dataJson.method](dataJson.args);
                        } else {
                            chatbot[dataJson.method]();
                        }
                    }
                });
            });
        }
    }
    
    chatbot.readJson('commands', chatbot.config.channels[0].toLowerCase());
    chatbot.readJson('counters', chatbot.config.channels[0].toLowerCase());
    chatbot.readJson('messages', chatbot.config.channels[0].toLowerCase());
    chatbot.readJson('playlist', chatbot.config.channels[0].toLowerCase());
    chatbot.readJson('polls', chatbot.config.channels[0].toLowerCase());
    chatbot.readJson('raffles', chatbot.config.channels[0].toLowerCase());
}

function onGiftpaidupgrade(channel, username, sender, userstate) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        userstate: userstate
    };

    chatbot.getChatNotification(commandArgs);
}

function onHosted(channel, username, viewers, autohost) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: 'You are hosted by ' + username + ' with ' + viewers + ' viewers' + (autohost ? ' via autohost.' : '.'),
        message: null,
        userstate: {'message-type': 'info'}
    };

    chatbot.getChatNotification(commandArgs);
}

//onHosting
//#insanitymeetshh
//biberbros
//0
function onHosting(channel, target, viewers) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: 'Now hosting ' + target + '.',
        message: null,
        userstate: {'message-type': 'info'}
    };

    chatbot.getChatNotification(commandArgs);
}

// onMessage
//#insanitymeetshh
//{ 'badge-info': null,
//  badges: { broadcaster: '1', twitchconAmsterdam2020: '1' },
//  color: '#3FC9FF',
//  'display-name': 'InsanityMeetsHH',
//  emotes: null,
//  flags: null,
//  id: 'f1cfd158-1712-4f5f-9442-399f465c56bd',
//  mod: false,
//  'room-id': '86980760',
//  subscriber: false,
//  'tmi-sent-ts': '1582045239962',
//  turbo: false,
//  'user-id': '86980760',
//  'user-type': null,
//  'emotes-raw': null,
//  'badge-info-raw': null,
//  'badges-raw': 'broadcaster/1,twitchconAmsterdam2020/1',
//  username: 'insanitymeetshh',
//  'message-type': 'chat'
//}
function onMessage(channel, userstate, message, self) {
    const args = {
        channel: channel.replace(/#/g, ''),
        userstate: userstate,
        message: message.trim()
    };

    chatbot.getChatMessage(args);

    // ignore messages from the bot
    if (self) {
        return;
    }

    const commands = Object.keys(chatbot.commandList);
    for (let i = 0; i < commands.length; i++) {
        // if command is active for channel
        if (typeof chatbot.commandList[commands[i]] === 'function') {
            let channelCommands = typeof chatbot.commands[args.channel] === 'object' ? chatbot.commands[args.channel] : [];
            let commandActive = false;
            
            for (let j = 0; j < channelCommands.length; j++) {
                if (channelCommands[j].name === commands[i]
                        && channelCommands[j].active === true
                        && channelCommands[j].lastExec + channelCommands[j].cooldown < moment().unix()) {
                    commandActive = true;
                    args.commandId = j;
                    break;
                }
            }
            
            if (commandActive) {
                chatbot.commandList[commands[i]](args);
            }
        }
    }
}

//onMessagedeleted
//#insanitymeetshh
//insanitymeetshamburg
//moin
//{ login: 'insanitymeetshamburg',
//  'room-id': null,
//  'target-msg-id': '497fb542-7d0e-4861-9b31-f53c6fbc3b0d',
//  'tmi-sent-ts': '1585062324944',
//  'message-type': 'messagedeleted' }
function onMessagedeleted(channel, username, deletedMessage, userstate) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        deletedMessage: deletedMessage,
        purge: {message: 'deleted', showMessage: true, hasPurge: true, reason: null},
        user: username,
        userstate: userstate
    };

    chatbot.getChatPurge(commandArgs);
}

//onRaided
//#hc_dizee
//p1onetv
//8
function onRaided(channel, username, viewers){
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: 'You are raided by ' + username + ' with ' + viewers + ' viewers!',
        message: null,
        userstate: {'message-type': 'info'}
    };

    chatbot.getChatNotification(commandArgs);
}

//onResub
//#jimpanse
//CanisCoraxGaming
//0
//Einmal ein Affe. Immer ein Affe. Ich war, bin und bleibe treu. 16 Monate Teil der Affenbande.
//{ 'badge-info': { subscriber: '16' },
//  badges: { subscriber: '12', premium: '1' },
//  color: '#8A2BE2',
//  'display-name': 'CanisCoraxGaming',
//  emotes: null,
//  flags: null,
//  id: '39bdc470-bf5f-4840-b06c-316cb3be7893',
//  login: 'caniscoraxgaming',
//  mod: false,
//  'msg-id': 'resub',
//  'msg-param-cumulative-months': '16',
//  'msg-param-months': false,
//  'msg-param-should-share-streak': false,
//  'msg-param-sub-plan-name': 'JimPanseTier1',
//  'msg-param-sub-plan': 'Prime',
//  'room-id': '36196174',
//  subscriber: true,
//  'system-msg':
//   'CanisCoraxGaming subscribed with Twitch Prime. They\'ve subscribed for 16 months!',
//  'tmi-sent-ts': '1585063049498',
//  'user-id': '278368354',
//  'user-type': null,
//  'emotes-raw': null,
//  'badge-info-raw': 'subscriber/16',
//  'badges-raw': 'subscriber/12,premium/1',
//  'message-type': 'resub' }
//{ prime: true, plan: 'Prime', planName: 'JimPanseTier1' }
//{ prime: false, plan: '1000', planName: 'Stufe-1-Sub von Basti (dakieksde)' }
function onResub(channel, username, months, message, userstate, methods) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: message ? message.trim() : null,
        userstate: userstate
    };

    chatbot.getChatNotification(commandArgs);
}

//onRoomstate
//{ 'emote-only': false,
//  'followers-only': '-1',
//  r9k: false,
//  rituals: true,
//  'room-id': '86980760',
//  slow: false,
//  'subs-only': false,
//  channel: '#insanitymeetshh' }
function onRoomstate(channel, state) {
    //console.log(channel);
    //console.log(state);
}

//onSubgift
//#dakieksde
//Razzec_
//0
//GRONKH
//{ prime: false,
//  plan: '1000',
//  planName: 'Stufe-1-Sub von Basti (dakieksde)' }
//{ 'badge-info': { subscriber: '32' },
//  badges: { moderator: '1', subscriber: '24', 'sub-gifter': '50' },
//  color: '#DA57BD',
//  'display-name': 'Razzec_',
//  emotes: null,
//  flags: null,
//  id: '66b6219f-da71-4aa3-a00f-b73002845143',
//  login: 'razzec_',
//  mod: true,
//  'msg-id': 'subgift',
//  'msg-param-months': '4',
//  'msg-param-origin-id':
//   'da 39 a3 ee 5e 6b 4b 0d 32 55 bf ef 95 60 18 90 af d8 07 09',
//  'msg-param-recipient-display-name': 'GRONKH',
//  'msg-param-recipient-id': '12875057',
//  'msg-param-recipient-user-name': 'gronkh',
//  'msg-param-sender-count': '74',
//  'msg-param-sub-plan-name': 'Stufe-1-Sub von Basti (dakieksde)',
//  'msg-param-sub-plan': '1000',
//  'room-id': '26395227',
//  subscriber: true,
//  'system-msg':
//   'Razzec_ gifted a Tier 1 sub to GRONKH! They have given 74 Gift Subs in the channel!',
//  'tmi-sent-ts': '1585063633592',
//  'user-id': '54597123',
//  'user-type': 'mod',
//  'emotes-raw': null,
//  'badge-info-raw': 'subscriber/32',
//  'badges-raw': 'moderator/1,subscriber/24,sub-gifter/50',
//  'message-type': 'subgift' }
function onSubgift(channel, username, streakMonths, recipient, methods, userstate) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        userstate: userstate
    };

    chatbot.getChatNotification(commandArgs);
}

//onSubmysterygift
//#drdisrespect
//danokyles
//5
//{ prime: false, plan: '1000', planName: null }
//{ 'badge-info': { subscriber: '1' },
//  badges: { subscriber: '0', 'sub-gifter': '5' },
//  color: '#1C19B3',
//  'display-name': 'danokyles',
//  emotes: null,
//  flags: null,
//  id: '282ea016-0ba2-439f-8ab0-67603e67a462',
//  login: 'danokyles',
//  mod: false,
//  'msg-id': 'submysterygift',
//  'msg-param-mass-gift-count': '5',
//  'msg-param-origin-id':
//   'e6 35 f7 fa 21 5f 26 18 5e 28 d1 9e e9 00 38 65 f4 48 0a d9',
//  'msg-param-sender-count': '10',
//  'msg-param-sub-plan': '1000',
//  'room-id': '17337557',
//  subscriber: true,
//  'system-msg':
//   'danokyles is gifting 5 Tier 1 Subs to DrDisrespect\'s community! They\'ve gifted a total of 10 in the channel!',
//  'tmi-sent-ts': '1585077297768',
//  'user-id': '200016142',
//  'user-type': null,
//  'emotes-raw': null,
//  'badge-info-raw': 'subscriber/1',
//  'badges-raw': 'subscriber/0,sub-gifter/5',
//  'message-type': 'submysterygift' }
function onSubmysterygift(channel, username, numbOfSubs, methods, userstate) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        user: username,
        userstate: userstate
    };
    
    chatbot.getChatNotification(commandArgs);
}

//onSubscription
//#hc_dizee
//OBIxVx
//{ prime: true,
//  plan: 'Prime',
//  planName: 'Willkommen bei der Offiziersmesse der Bay Pirates' }
//null
//{ 'badge-info': { subscriber: '0' },
//  badges: { subscriber: '0', premium: '1' },
//  color: '#00FF03',
//  'display-name': 'OBIxVx',
//  emotes: null,
//  flags: null,
//  id: 'a6deece2-66f6-47a3-80af-e4bdd10ed1a3',
//  login: 'obixvx',
//  mod: false,
//  'msg-id': 'sub',
//  'msg-param-cumulative-months': true,
//  'msg-param-months': false,
//  'msg-param-should-share-streak': false,
//  'msg-param-sub-plan-name': 'Willkommen bei der Offiziersmesse der Bay Pirates',
//  'msg-param-sub-plan': 'Prime',
//  'room-id': '29157943',
//  subscriber: true,
//  'system-msg': 'OBIxVx subscribed with Twitch Prime.',
//  'tmi-sent-ts': '1585065528138',
//  'user-id': '64865244',
//  'user-type': null,
//  'emotes-raw': null,
//  'badge-info-raw': 'subscriber/0',
//  'badges-raw': 'subscriber/0,premium/1',
//  'message-type': 'sub' }
function onSubscription(channel, username, method, message, userstate) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: message ? message.trim() : null,
        userstate: userstate
    };

    chatbot.getChatNotification(commandArgs);
}

//onTimeout
//#insanitymeetshh
//insanitymeetshamburg
//null
//300
//{ 'ban-duration': '300',
//  'room-id': '86980760',
//  'target-user-id': '82566098',
//  'tmi-sent-ts': '1585062484900' }
function onTimeout(channel, username, reason, duration, userstate) {
    let unit = 's';
    
    if (duration >= 60 && duration < 60 * 60) {
        // minutes
        duration = (duration / 60 * 60).toFixed(1);
        unit = 'm';
    } else if (duration >= 60 * 60 && duration < 60 * 60 * 24) {
        // hours
        duration = (duration / 60 * 60 * 24).toFixed(1);
        unit = 'h';
    } else if (duration >= 60 * 60 * 24 && duration < 60 * 60 * 24 * 365) {
        // days
        duration = (duration / 60 * 60 * 24).toFixed(1);
        unit = 'd';
    } else if (duration >= 60 * 60 * 24 * 365) {
        // years
        duration = (duration / 60 * 60 * 24 * 365).toFixed(1);
        unit = 'a';
    }
    
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        purge: {message: duration + unit, showMessage: false, hasPurge: true, reason: reason},
        user: username,
        userstate: userstate
    };

    chatbot.getChatPurge(commandArgs);
}

//onUnhost
//#insanitymeetshh
//0
function onUnhost(channel, viewers) {
    const commandArgs = {
        channel: channel.replace(/#/g, ''),
        notification: 'Exited host mode.',
        message: null,
        userstate: {'message-type': 'info'}
    };

    chatbot.getChatNotification(commandArgs);
}

// register event handlers (defined below)
client.on('anongiftpaidupgrade', onAnongiftpaidupgrade);
client.on('ban', onBan);
client.on('cheer', onCheer);
client.on('connected', onConnected);
client.on('giftpaidupgrade', onGiftpaidupgrade);
client.on('hosted', onHosted);
client.on('hosting', onHosting);
client.on('message', onMessage);
client.on('messagedeleted', onMessagedeleted);
client.on('raided', onRaided);
client.on('resub', onResub);
client.on('roomstate', onRoomstate);
client.on('subgift', onSubgift);
client.on('submysterygift', onSubmysterygift);
client.on('subscription', onSubscription);
client.on('timeout', onTimeout);
client.on('unhost', onUnhost);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// connect to Twitch:
client.connect();

chatbot.config = config;
chatbot.client = client;
