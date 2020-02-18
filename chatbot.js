const tmi        = require('tmi.js');
const skateboard = require('skateboard');
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
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    // Remove whitespace from chat message
    const cmdName = msg.trim();

    // If the command is known, let's execute it
    if (cmdName === '!d20') {
        const num = rollDice(cmdName);
        client.say(target, `You rolled a ${num}.`);
        console.log(`* Executed ${cmdName} command`);
    } else {
        console.log(`* Unknown command ${cmdName}`);
    }
    
    if (/^\d\d?$/.test(cmdName)) {
        const n = parseInt(cmdName);
        count = (n - count === 1) ? n : 0;
        socket.write(count.toString()); 
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
    
    skateboard({port: 3000}, (stream) => {
        socket = stream;
    });
}
