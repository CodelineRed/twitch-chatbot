/**
 * Chatbot Object
 */
const chatbot = {
    socket: null,
    config: null,
    client: null,
    count: 0,
    getChannels: function() {
        const result = {
            args: {
                channels: chatbot.config.channels.join(';').replace(/#/g, '')
            },
            method: 'setChannels',
            ref: 'channels',
            env: 'web'
        };
        
        chatbot.socket.write(JSON.stringify(result));
    },
    logCommand: function(args) {
        console.log(`* Executed ${args.msg} command by ${args.context['display-name']} at ${args.channel}.`);
    },
    commands: {
        counter: function(args) {
            if (/^\d\d?$/.test(args.msg)) {
                const n = parseInt(args.msg);
                chatbot.count = (n - chatbot.count === 1) ? n : 0;

                if (chatbot.socket !== null) {
                    const call = {
                        channel: args.cahnnel,
                        args: {
                            channel: args.channel,
                            counter: chatbot.count.toString()
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
                
                chatbot.client.say(args.target, `Rolled d${sides}` + (dices > 1 ? `w${dices}`: ``) + `: ${results.join(' + ')} = ${result}.`); // eslint-disable-line quotes
                chatbot.logCommand(args);
            }
        }
    }
};

module.exports = chatbot;
