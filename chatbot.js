const skateboard = require('skateboard');
const format     = require('string-format-js');
const tmi        = require('tmi.js');
require('dotenv').config();

let count = 0;
let socket = null;

// Define configuration options
const opts = {
    identity: {
        username: process.env.TWITCH_NICK,
        password: process.env.TWITCH_TOKEN
    },
    channels: [
        process.env.TWITCH_CHANNEL
    ]
};

// Create a client with options
const client = new tmi.client(opts);

// Register event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

process.on('unhandledRejection', (reason, p) => {
    console.log(`Unhandled Rejection at: Promise`, p, `reason:`, reason);
});

// Connect to Twitch:
client.connect();

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
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const cmdName = msg.trim();

    // If the command is known, let's execute it
    if (cmdName === '!d20') {
        const num = rollDice(cmdName);
        client.say(target, `You rolled a ${num}.`);
        console.log(`* Executed ${cmdName} command by ${context['display-name']}.`);
    }
    
    if (/^\d\d?$/.test(cmdName)) {
        const n = parseInt(cmdName);
        count = (n - count === 1) ? n : 0;
        
        if (socket !== null) {
            socket.write(count.toString());
        }
    }
}

// Function called when the "dice" command is issued
function rollDice () {
    const sides = 20;
    return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
//    client.say(process.env.TWITCH_CHANNEL, `/me has joined channel! HeyGuys`);
    
    skateboard({port: 3000}, (stream) => {
        socket = stream;
    });
}
