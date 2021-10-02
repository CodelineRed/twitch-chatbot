const database = require('./database');
const locales  = require('./locales');
const moment   = require('moment');

const bot = {
    list: [],
    /**
     * Adds bot to database
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    add: function(chatbot, args) {
        let select = 'id';
        let from = 'bot';
        let where = ['name = ?'];
        let prepare = [args.name.toLowerCase()];
        let time = moment().unix();
        let value = {
            name: args.name.toLowerCase(),
            updatedAt: time,
            createdAt: time
        };

        database.find(select, from, '', where, '', '', 0, prepare, function(rows) {
            // if bot not exists
            if (!rows.length) {
                database.insert('bot', [value], function(insert) {
                    bot.list.push(value.name);
                    if (args.say) {
                        chatbot.client.say('#' + args.channel, locales.t('bot-added', [value.name]));
                    }
                });
            } else if (args.say) {
                chatbot.client.say('#' + args.channel, locales.t('bot-exists', [value.name]));
            }
        });
    },
    /**
     * Removes bot from database
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    remove: function(chatbot, args) {
        let select = 'id';
        let from = 'bot';
        let where = ['name = ?'];
        let prepare = [args.name.toLowerCase()];

        database.find(select, from, '', where, '', '', 0, prepare, function(rows) {
            // if bot exists
            if (rows.length) {
                database.remove('bot', where, prepare, function(removeBot) {
                    let index = bot.list.indexOf(args.name.toLowerCase());
                    database.prepareBotTable(chatbot, {'room-id': 0});

                    // remove bot from list
                    if (index > -1) {
                        bot.list.splice(index, 1);
                    }

                    if (args.say) {
                        chatbot.client.say('#' + args.channel, locales.t('bot-removed', [args.name.toLowerCase()]));
                    }
                });
            } else if (args.say) {
                chatbot.client.say('#' + args.channel, locales.t('bot-not-exists', [args.name.toLowerCase()]));
            }
        });
    }
};

module.exports = bot;
