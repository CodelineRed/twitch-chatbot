const database = require('./database');
const moment   = require('moment');
const {v4: uuidv4, validate: uuidValid} = require('uuid');

const emote = {
    newEmotes: [],
    addEmote: function(args) {
        let time = moment().unix();
        let from = 'emote';
        let where = ['code = ?'];
        let prepare = [args.code];

        database.find('*', from, '', where, '', '', 1, prepare, function(rows) {
            // if emote found
            if (rows.length && typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                let values = {
                    emoteUuid: rows[0].uuid,
                    chatUuid: args.uuid,
                    updatedAt: time,
                    createdAt: time
                };

                database.insert('chat_emote_join', [values]);
            } else if (!rows.length && emote.newEmotes.indexOf(args.code) === -1 && typeof args.typeId === 'string') {
                emote.newEmotes.push(args.code);
                let values = {
                    uuid: uuidv4(),
                    typeId: args.typeId,
                    type: typeof args.type === 'undefined' || args.type === null ? 'ttv' : args.type,
                    code: args.code,
                    updatedAt: time,
                    createdAt: time
                };

                database.insert('emote', [values], function() {
                    if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                        let valuesJoin = {
                            emoteUuid: values.uuid,
                            chatUuid: args.uuid,
                            updatedAt: time,
                            createdAt: time
                        };

                        database.insert('chat_emote_join', [valuesJoin]);
                    }
                });
            }
        });
    }
};

module.exports = emote;
