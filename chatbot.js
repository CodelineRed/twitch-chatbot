const skateboard = require('skateboard');
const format     = require('string-format-js');
const tmi        = require('tmi.js');

const config     = require('./src/app/chatbot.json');
const chatbot    = require('./src/js/chatbot/app');

chatbot.config = config;

// Define configuration options
const opts = {
    identity: {
        username: config.username,
        password: config.tmiToken
    },
    channels: config.channels.slice(0) // keep capital letters
};

// Create a client with options
const client = new tmi.client(opts); // eslint-disable-line new-cap

// Context
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

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
    // Ignore messages from the bot
    if (self) {
        return;
    } 
    
    const commandArgs = {
        channel: target.replace(/#/g, ''),
        target: target,
        context: context,
        msg: msg.trim()
    };
    const commands = Object.keys(chatbot.commands);
    
    for (let i = 0; i < commands.length; i++) {
        chatbot.commands[commands[i]](commandArgs);
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    
    skateboard({port: 3100}, (stream) => {
        chatbot.socket = stream;
        
        stream.on('data', function(data) {
            let dataJson = JSON.parse(data);
            
            if (typeof dataJson.method === 'string' && typeof chatbot[dataJson.method] === 'function' 
                    && typeof dataJson.env === 'string' && dataJson.env === 'node') {
                if (typeof dataJson.arg === 'string') {
                    chatbot[dataJson.method](dataJson.arg);
                } else {
                    chatbot[dataJson.method]();
                }
            }
        });
    });
}

// Register event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// Connect to Twitch:
client.connect();

chatbot.config = config;
chatbot.client = client;
