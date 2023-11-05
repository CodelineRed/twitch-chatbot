const database = require('./database');
const moment   = require('moment');

const counter = {
    lists: {},
    /**
     * Sends coutner dataset to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    get: function(chatbot, args) {
        let select = 'id, channel_id AS channelId, name, streak, victory, ';
        select += 'updated_at AS updatedAt, created_at AS createdAt';
        let where = ['channel_id = ?'];
        let prepare = [chatbot.channels[args.channel].id];

        database.find(select, 'counter', '', where, '', '', 1, prepare, function(rows) {
            counter.lists[args.channel] = rows[0];

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        item: counter.lists[args.channel]
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
    /**
     * Updates counter victory
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    update: function(chatbot, args) {
        args.item.streak = 0;
        args.item.updatedAt = moment().unix();
        counter.lists[args.channel] = args.item;
        database.update('counter', args.item, [`channel_id = '${chatbot.channels[args.channel].id}'`]);
    }
};

module.exports = counter;
