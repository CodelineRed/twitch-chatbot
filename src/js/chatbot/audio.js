const database = require('./database');

const audio = {
    /**
     * Sends all audios to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getAudios: function(chatbot, args) {
        let select = 'id, name, file, type, duration, updated_at AS updatedAt, created_at AS createdAt';
        database.find(select, 'audio', '', [], '', 'name', 0, [], function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        audios: rows
                    },
                    method: 'setAudios',
                    ref: args.ref,
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    }
};

module.exports = audio;
