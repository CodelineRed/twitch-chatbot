const database = require('./database');
const moment   = require('moment');

const counter = {
    getCounter: function(chatbot, args) {
        let select = 'id, channel_id AS channelId, name, streak, victory, ';
        select += 'updated_at AS updatedAt, created_at AS createdAt';
        let where = ['channel_id = ?'];
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, 'counter', '', where, '', '', 1, prepare, function(rows) {
            chatbot.counters[args.channel] = rows[0];

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

                if (chatbot.socketCounter !== null) {
                    chatbot.socketCounter.write(JSON.stringify(call));
                }
            }
        });
        
    },
    updateCounter: function(chatbot, args) {
        args.counter.streak = 0;
        args.counter.updatedAt = moment().unix();
        chatbot.counters[args.channel] = args.counter;
        database.update('counter', args.counter, ['channel_id = ' + chatbot.channels[args.channel].id]);
    }
};

module.exports = counter;
