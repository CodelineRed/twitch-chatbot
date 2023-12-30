const migration = require('../../src/js/chatbot/migration');

const migrationFile = {
    version: '1.14.0',
    up: function(callback) {
        /* eslint-disable quotes */
        let queries = [];
        queries.push("PRAGMA foreign_keys=off;");
        queries.push("BEGIN TRANSACTION;");

        // rebuild emote table w/o unique index for code
        queries.push("CREATE TABLE temp_emote (uuid text NOT NULL, type_id text NOT NULL DEFAULT '', type text NOT NULL DEFAULT 'ttv', code text NOT NULL, updated_at integer NOT NULL, created_at integer NOT NULL, PRIMARY KEY (uuid));");
        queries.push("INSERT INTO temp_emote SELECT * FROM emote;");
        queries.push("DROP TABLE emote;");
        queries.push("ALTER TABLE temp_emote RENAME TO emote;");

        // rebuild chat_emote_join table to update foreign key
        queries.push("CREATE TABLE temp_chat_emote_join (chat_uuid text NOT NULL, emote_uuid text NOT NULL, updated_at integer NOT NULL, created_at integer NOT NULL, FOREIGN KEY (emote_uuid) REFERENCES emote (uuid) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (chat_uuid) REFERENCES chat (uuid) ON DELETE CASCADE ON UPDATE NO ACTION);");
        queries.push("INSERT INTO temp_chat_emote_join SELECT * FROM chat_emote_join;");
        queries.push("DROP TABLE chat_emote_join;");
        queries.push("ALTER TABLE temp_chat_emote_join RENAME TO chat_emote_join;");

        queries.push("COMMIT;");
        queries.push("PRAGMA foreign_keys=on;");
        /* eslint-enable quotes */
        
        migration.execute(queries, this.version, callback);
    },
    down: function(callback) {
        /* eslint-disable quotes */
        let queries = [];
        queries.push("PRAGMA foreign_keys=off;");
        queries.push("BEGIN TRANSACTION;");

        // rebuild emote table with unique index for code
        queries.push("CREATE TABLE temp_emote (uuid text NOT NULL, type_id text NOT NULL DEFAULT '', type text NOT NULL DEFAULT 'ttv', code text NOT NULL, updated_at integer NOT NULL, created_at integer NOT NULL, PRIMARY KEY (uuid));");
        queries.push("INSERT INTO temp_emote SELECT * FROM emote;");
        queries.push("DROP TABLE emote;");
        queries.push("ALTER TABLE temp_emote RENAME TO emote;");
        queries.push("CREATE UNIQUE INDEX emote_code ON emote (code);");

        // rebuild chat_emote_join table to update foreign key
        queries.push("CREATE TABLE temp_chat_emote_join (chat_uuid text NOT NULL, emote_uuid text NOT NULL, updated_at integer NOT NULL, created_at integer NOT NULL, FOREIGN KEY (emote_uuid) REFERENCES emote (uuid) ON DELETE CASCADE ON UPDATE NO ACTION, FOREIGN KEY (chat_uuid) REFERENCES chat (uuid) ON DELETE CASCADE ON UPDATE NO ACTION);");
        queries.push("INSERT INTO temp_chat_emote_join SELECT * FROM chat_emote_join;");
        queries.push("DROP TABLE chat_emote_join;");
        queries.push("ALTER TABLE temp_chat_emote_join RENAME TO chat_emote_join;");
        
        queries.push("COMMIT;");
        queries.push("PRAGMA foreign_keys=on;");
        /* eslint-enable quotes */
        migration.execute(queries, this.version, callback);
    }
};

module.exports = migrationFile;
