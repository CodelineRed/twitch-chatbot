const moment      = require('moment');
const skateboard  = require('skateboard');
const tmi         = require('tmi.js');
const yargs       = require('yargs');

const config      = require('./src/app/chatbot.json');
const database    = require('./src/js/chatbot/database');
const chatbot     = require('./src/js/chatbot/app');
const chat        = require('./src/js/chatbot/chat');
const command     = require('./src/js/chatbot/command');
const emote       = require('./src/js/chatbot/emote');
const locales     = require('./src/js/chatbot/locales');
const user        = require('./src/js/chatbot/user');
const utility     = require('./src/js/chatbot/utility');
const viewerCount = require('./src/js/chatbot/viewer-count');

const argv = yargs
    .option('recordchat', {
        alias: 'rc',
        default: true,
        description: 'Record chat messages in database',
        type: 'boolean'
    })
    .option('showversion', {
        alias: 'sv',
        default: true,
        description: 'Display version text in console',
        type: 'boolean'
    })
    .option('intro', {
        alias: 'i',
        default: true,
        description: 'Display intro in console',
        type: 'boolean'
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.intro) {
    chatbot.showIntro();
}

if (argv.showversion) {
    utility.getVersionText();
}

let connected = false;
let countLoadedChannels = 0;
chatbot.config = config;

// define configuration options
const options = {
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
const client = new tmi.client(options); // eslint-disable-line new-cap

function onAnonGiftPaidUpgrade(channel, username, userstate) {
    const args = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        userstate: userstate
    };

    user.add(chatbot, args, function() {
        chat.getNotification(chatbot, args);
    });
}

//onBan
//#codelinered
//insanitymeetshamburg
//null
//{ 'room-id': '86980760',
//  'target-user-id': '82566098',
//  'tmi-sent-ts': '1585062499494' }
function onBan(channel, username, reason, userstate) {
    const args = {
        channel: channel.replace(/#/g, ''),
        purge: {message: 'banned', showMessage: false, hasPurge: true, reason: reason},
        user: username,
        userstate: userstate
    };

    chat.getPurge(chatbot, args);
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

    const args = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['display-name'] + ' cheered with ' + userstate.bits + ' bits!',
        message: message ? message.trim() : null,
        userstate: userstate
    };

    user.add(chatbot, args, function() {
        chat.getNotification(chatbot, args);
    });
}

// called every time the bot connects to Twitch chat
function onConnected(url, port) {
    console.log(`* Connected to ${url}:${port}`);
    let ports = [3100, 3110, 3120, 3130, 3140, 3150];

    if (chatbot.socket === null) {
        for (let i = 0; i < ports.length; i++) {
            skateboard({port: ports[i]}, (socket) => {
                if (ports[i] === 3100) {
                    chatbot.socket = socket;
                } else if (ports[i] === 3110) {
                    chatbot.socketChat = socket;
                } else if (ports[i] === 3120) {
                    chatbot.socketVideo = socket;
                } else if (ports[i] === 3130) {
                    chatbot.socketRaffle = socket;
                } else if (ports[i] === 3140) {
                    chatbot.socketPoll = socket;
                } else if (ports[i] === 3150) {
                    chatbot.socketCounter = socket;
                }

                socket.on('data', function(data) {
                    let dataJson = JSON.parse(data);
                    //console.log(dataJson);

                    // if method is function and env is "node"
                    if (typeof dataJson.method === 'string' && typeof chatbot[dataJson.method] === 'function' 
                            && typeof dataJson.env === 'string' && dataJson.env === 'node') {
                        // if args defined
                        if (typeof dataJson.args === 'object' && dataJson.args !== null) {
                            chatbot[dataJson.method](chatbot, dataJson.args);
                        } else {
                            chatbot[dataJson.method](chatbot);
                        }
                    }
                });
            });
        }
    }
}

function onGiftPaidUpgrade(channel, username, sender, userstate) {
    const args = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        userstate: userstate
    };

    user.add(chatbot, args, function() {
        chat.getNotification(chatbot, args);
    });
}

function onHosted(channel, username, viewers, autohost) {
    let cname = channel.replace(/#/g, '');
    database.find('id', 'channel', '', ['name = ?'], '', '', 1, [cname], function(rows) {
        if (rows.length) {
            const args = {
                channel: cname,
                notification: 'You are hosted by ' + username + ' with ' + viewers + ' viewers' + (autohost ? ' via autohost.' : '.'),
                message: null,
                userstate: {
                    'room-id': rows[0].id,
                    'user-id': rows[0].id,
                    'display-name': chatbot.getChannelDisplayName(chatbot, cname),
                    'badges': null,
                    'badge-info': null,
                    'message-type': 'info'
                }
            };

            user.add(chatbot, args, function() {
                chat.getNotification(chatbot, args);
            });
        }
    });
}

//onHosting
//#codelinered
//biberbros
//0
function onHosting(channel, target, viewers) {
    let cname = channel.replace(/#/g, '');
    database.find('id', 'channel', '', ['name = ?'], '', '', 1, [cname], function(rows) {
        if (rows.length) {
            const args = {
                channel: cname,
                notification: `Now hosting ${target}.`,
                message: null,
                userstate: {
                    'room-id': rows[0].id,
                    'user-id': rows[0].id,
                    'display-name': chatbot.getChannelDisplayName(chatbot, cname),
                    'badges': null,
                    'badge-info': null,
                    'message-type': 'info'
                }
            };

            user.add(chatbot, args, function() {
                chat.getNotification(chatbot, args);
            });
        }
    });
}

// onMessage
//#codelinered
//{ 'badge-info': null,
//  badges: { broadcaster: '1', twitchconAmsterdam2020: '1' },
//  color: '#3FC9FF',
//  'display-name': 'CodelineRed',
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
//  username: 'codelinered',
//  'message-type': 'chat'
//}
function onMessage(channel, userstate, message, self) {
    const args = {
        channel: channel.replace(/#/g, ''),
        userstate: userstate,
        message: message.trim()
    };

    // if chat recording is disabled
    if (!argv.recordchat) {
        return;
    }

    user.add(chatbot, args, function() {
        chat.get(chatbot, args);

        // ignore messages from the bot
        if (self) {
            return;
        }

        const commands = Object.keys(command.defaultList);
        for (let i = 0; i < commands.length; i++) {
            // if command is active for channel
            if (typeof command.defaultList[commands[i]] === 'function') {
                let channelCommands = typeof command.lists[args.channel] === 'object' ? command.lists[args.channel] : [];
                let commandActive = false;

                for (let j = 0; j < channelCommands.length; j++) {
                    if (channelCommands[j].name === commands[i]
                            && channelCommands[j].active === true
                            && channelCommands[j].lastExec + channelCommands[j].cooldown < moment().unix()) {
                        commandActive = true;
                        args.commandIndex = j;
                        break;
                    }
                }

                if (commandActive) {
                    command.defaultList[commands[i]](chatbot, args);
                }
            }
        }
    });
}

//onMessagedeleted
//#codelinered
//insanitymeetshamburg
//moin
//{ login: 'insanitymeetshamburg',
//  'room-id': null,
//  'target-msg-id': '497fb542-7d0e-4861-9b31-f53c6fbc3b0d',
//  'tmi-sent-ts': '1585062324944',
//  'message-type': 'messagedeleted' }
function onMessageDeleted(channel, username, deletedMessage, userstate) {
    const args = {
        channel: channel.replace(/#/g, ''),
        deletedMessage: deletedMessage,
        purge: {message: 'deleted', showMessage: true, hasPurge: true, reason: null},
        user: username,
        userstate: userstate
    };

    chat.getPurge(chatbot, args);
}

//onRaided
//#hc_dizee
//p1onetv
//8
function onRaided(channel, username, viewers){
    let cname = channel.replace(/#/g, '');
    database.find('id', 'channel', '', ['name = ?'], '', '', 1, [cname], function(rows) {
        if (rows.length) {
            const args = {
                channel: cname,
                notification: `You are raided by ${username} with ${viewers} viewers!`,
                message: null,
                userstate: {
                    'room-id': rows[0].id,
                    'user-id': rows[0].id,
                    'display-name': chatbot.getChannelDisplayName(chatbot, cname),
                    'badges': null,
                    'badge-info': null,
                    'message-type': 'info'
                }
            };

            user.add(chatbot, args, function() {
                chat.getNotification(chatbot, args);
            });
        }
    });
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
function onReSub(channel, username, months, message, userstate, methods) {
    const args = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: message ? message.trim() : null,
        userstate: userstate
    };

    user.add(chatbot, args, function() {
        chat.getNotification(chatbot, args);
    });
}

//onRoomstate
//{ 'emote-only': false,
//  'followers-only': '-1',
//  r9k: false,
//  rituals: true,
//  'room-id': '86980760',
//  slow: false,
//  'subs-only': false,
//  channel: '#codelinered' }
function onRoomState(channel, state) {
    emote.prepareBttv(state);
    emote.prepareFfz(state);
    chatbot.warmUpDatabase(state);

    countLoadedChannels++;
    if (!connected && countLoadedChannels === config.channels.length) {
        connected = true;
        console.log(locales.t('channels-loaded'));

        // wait for chatbot.warmUpDatabase(state)
        setTimeout(function() {
            viewerCount.add(chatbot);
        }, 2000); // 2 seconds

        setInterval(function() {
            viewerCount.add(chatbot);
        }, 60000 * 5); // 5 mins
    }
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
function onSubGift(channel, username, streakMonths, recipient, methods, userstate) {
    const args = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        userstate: userstate
    };

    user.add(chatbot, args, function() {
        chat.getNotification(chatbot, args);
    });
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
function onSubMysteryGift(channel, username, numbOfSubs, methods, userstate) {
    const args = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: null,
        user: username,
        userstate: userstate
    };

    user.add(chatbot, args, function() {
        chat.getNotification(chatbot, args);
    });
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
    const args = {
        channel: channel.replace(/#/g, ''),
        notification: userstate['system-msg'],
        message: message ? message.trim() : null,
        userstate: userstate
    };

    user.add(chatbot, args, function() {
        chat.getNotification(chatbot, args);
    });
}

//onTimeout
//#codelinered
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
        duration = (duration / 60).toFixed(0);
        unit = 'm';
    } else if (duration >= 60 * 60 && duration < 60 * 60 * 24) {
        // hours
        duration = (duration / 60 * 60).toFixed(0);
        unit = 'h';
    } else if (duration >= 60 * 60 * 24 && duration < 60 * 60 * 24 * 365) {
        // days
        duration = (duration / 60 * 60 * 24).toFixed(0);
        unit = 'd';
    } else if (duration >= 60 * 60 * 24 * 365) {
        // years
        duration = (duration / 60 * 60 * 24 * 365).toFixed(0);
        unit = 'a';
    }

    const args = {
        channel: channel.replace(/#/g, ''),
        purge: {message: duration + unit, showMessage: false, hasPurge: true, reason: reason},
        user: username,
        userstate: userstate
    };

    chat.getPurge(chatbot, args);
}

//onUnhost
//#codelinered
//0
function onUnhost(channel, viewers) {
    let cname = channel.replace(/#/g, '');
    database.find('id', 'channel', '', ['name = ?'], '', '', 1, [cname], function(rows) {
        if (rows.length) {
            const args = {
                channel: cname,
                notification: 'Exiting host mode.',
                message: null,
                userstate: {
                    'room-id': rows[0].id,
                    'user-id': rows[0].id,
                    'display-name': chatbot.getChannelDisplayName(chatbot, cname),
                    'badges': null,
                    'badge-info': null,
                    'message-type': 'info'
                }
            };

            user.add(chatbot, args, function() {
                chat.getNotification(chatbot, args);
            });
        }
    });
}

// register event handlers (defined below)
client.on('anongiftpaidupgrade', onAnonGiftPaidUpgrade);
client.on('ban', onBan);
client.on('cheer', onCheer);
client.on('connected', onConnected);
client.on('giftpaidupgrade', onGiftPaidUpgrade);
client.on('hosted', onHosted);
client.on('hosting', onHosting);
client.on('message', onMessage);
client.on('messagedeleted', onMessageDeleted);
client.on('raided', onRaided);
client.on('resub', onReSub);
client.on('roomstate', onRoomState);
client.on('subgift', onSubGift);
client.on('submysterygift', onSubMysteryGift);
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
