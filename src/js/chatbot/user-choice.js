const database     = require('./database');
const locales      = require('./locales');
const moment       = require('moment');
const {v4: uuidv4} = require('uuid');

const userChoice = {
    /**
     * Adds user choice to poll
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    add: function(chatbot, args) {
        if (typeof chatbot.activePolls[args.channel].options[args.choice - 1] !== 'undefined') {
            let select = 'uc.uuid';
            let from = 'poll AS p';
            let join = 'JOIN user_choice AS uc ON p.id = uc.poll_id';
            let where = ['uc.poll_id = ?', 'uc.user_id = ?'];
            let prepare = [
                chatbot.activePolls[args.channel].id,
                args.userstate['user-id']
            ];

            if (chatbot.activePolls[args.channel].multipleChoice) {
                where.push('option_id = ?');
                prepare.push(chatbot.activePolls[args.channel].options[args.choice - 1].id);
            }

            if (chatbot.activePolls[args.channel].raffleId) {
                chatbot.addAttendee(chatbot, args);
            }

            database.find(select, from, join, where, '', '', 0, prepare, function(rows) {
                // If the user has not yet selected an option
                if (!rows.length) {
                    let time = moment().unix();
                    let values = {
                        uuid: uuidv4(),
                        pollId: chatbot.activePolls[args.channel].id,
                        optionId: chatbot.activePolls[args.channel].options[args.choice - 1].id,
                        userId: args.userstate['user-id'],
                        updatedAt: time,
                        createdAt: time
                    };

                    database.insert('user_choice', [values], function(insert) {
                        chatbot.getActivePoll(chatbot, args);
                    });
                }
            });
        }
    }
};

module.exports = userChoice;
