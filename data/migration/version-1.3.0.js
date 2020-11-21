const migration = require('../../src/js/chatbot/migration');

const migrationFile = {
    version: '1.3.0',
    up: function(callback) {
        /* eslint-disable quotes */
        let queries = [];
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (14, 'Voice of Doubt', 'voice-of-doubt.mp3', 'loop', 36, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (15, 'Peace', 'peace.mp3', 'loop', 21, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (16, 'Freedom', 'freedom.mp3', 'loop', 19, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (17, 'Valley', 'valley.mp3', 'loop', 16, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (18, 'Hope', 'hope.mp3', 'loop', 10, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (19, 'Memory Palace', 'memory-palace.mp3', 'loop', 42, strftime('%s', 'now'), strftime('%s', 'now'));");
        /* eslint-enable quotes */
        
        migration.execute(queries, this.version, callback);
    },
    down: function(callback) {
        /* eslint-disable quotes */
        let queries = [];
        queries.push("DELETE FROM audio WHERE id IN (14,15,16,17,18,19);");
        /* eslint-enable quotes */
        migration.execute(queries, this.version, callback);
    }
};

module.exports = migrationFile;
