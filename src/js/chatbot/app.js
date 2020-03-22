/**
 * Chatbot Object
 */
const chatbot = {
    socket: null,
    config: null,
    client: null,
    counter: {},
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
    logCommand: function(args) {
        console.log(`* Executed ${args.msg} command by ${args.context['display-name']} at ${args.channel}.`);
    },
    commands: {
        counter: function(args) {
            if (/^\d\d?$/.test(args.msg)) {
                if (typeof chatbot.counter[args.channel] === 'undefined') {
                    chatbot.counter[args.channel] = 0;
                }
                
                const n = parseInt(args.msg);
                chatbot.counter[args.channel] = (n - chatbot.counter[args.channel] === 1) ? n : 0;

                if (chatbot.socket !== null) {
                    const call = {
                        channel: args.cahnnel,
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
            if (/^!d(\d+)(w(\d))?$/.test(args.msg)) {
                const matches = args.msg.match(/^!d(\d+)(w(\d))?$/);
                const sides = parseInt(matches[1].slice(0, 2));
                const dices = typeof matches[3] === 'undefined' ? 1 : parseInt(matches[3]) > 0 ? parseInt(matches[3]) : 1;
                let results = []; // eslint-disable-line array-bracket-newline
                let result = 0;
                
                for (let i = 0; i < dices; i++) {
                    let eyes = Math.floor(Math.random() * sides) + 1;
                    result += eyes;
                    results.push(eyes);
                }
                
                chatbot.client.say(args.target, `@${args.context['display-name']} rolled d${sides}` + (dices > 1 ? `w${dices}`: '') + `: ${results.join(' + ')} = ${result}.`);
                chatbot.logCommand(args);
            }
        }
    }
};

module.exports = chatbot;
