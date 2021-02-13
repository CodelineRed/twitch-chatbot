const database = require('./database');

const audio = {
    /**
     * Sends list of audios to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getList: function(chatbot, args) {
        let select = 'id, name, file, type, duration, updated_at AS updatedAt, created_at AS createdAt';
        database.find(select, 'audio', '', [], '', 'name', 0, [], function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        list: rows
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
