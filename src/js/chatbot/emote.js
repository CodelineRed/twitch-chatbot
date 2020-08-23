const database = require('./database');
const moment   = require('moment');

const emote = {
    addEmote: function(args) {
        let time = moment().unix();
        let values = {
            chatUuid: args.uuid,
            code: args.code,
            type: args.type === null || typeof args.type === 'undefined' ? 'ttv' : args.type,
            updatedAt: time,
            createdAt: time
        };

        database.insert('emote', [values]);
    }
};

module.exports = emote;
