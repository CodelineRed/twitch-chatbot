const migration = require('../../src/js/chatbot/migration');

const migrationFile = {
    version: '1.0.0',
    up: function(callback) {
        /* eslint-disable quotes */
        let queries = [];
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (1, 'Ambi EP', 'ambi-ep.mp3', 'jingle', 4, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (2, 'Big Clap', 'big-clap.mp3', 'jingle', 10, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (3, 'Brassy', 'brassy.mp3', 'jingle', 3, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (4, 'C-Space', 'c-space.mp3', 'jingle', 6, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (5, 'Cheering and Clapping', 'cheering-and-clapping.mp3', 'jingle', 11, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (6, 'Ensemble', 'ensemble.mp3', 'jingle', 10, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (7, 'Fan Fare 1', 'fan-fare-1.mp3', 'jingle', 11, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (8, 'Fan Fare 2', 'fan-fare-2.mp3', 'jingle', 9, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (9, 'Fan Fare 3', 'fan-fare-3.mp3', 'jingle', 1, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (10, 'Winner Deep Voice', 'winner-deep-voice.mp3', 'jingle', 2, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (11, 'Winner Female Voice', 'winner-female-voice.mp3', 'jingle', 1, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (12, 'Winner Robot Voice', 'winner-robot-voice.mp3', 'jingle', 1, strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO audio (id, name, file, type, duration, updated_at, created_at) VALUES (13, 'Airy', 'airy.mp3', 'loop', 10, strftime('%s', 'now'), strftime('%s', 'now'));");
        
        queries.push("INSERT INTO bot (id, name, updated_at, created_at) VALUES (1, 'mod4youbot', strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO bot (id, name, updated_at, created_at) VALUES (2, 'moobot', strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO bot (id, name, updated_at, created_at) VALUES (3, 'nightbot', strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO bot (id, name, updated_at, created_at) VALUES (4, 'streamelements', strftime('%s', 'now'), strftime('%s', 'now'));");
        queries.push("INSERT INTO bot (id, name, updated_at, created_at) VALUES (5, 'streamlabs', strftime('%s', 'now'), strftime('%s', 'now'));");
        /* eslint-enable quotes */
        
        migration.execute(queries, this.version, callback);
    },
    down: function(callback) {
        /* eslint-disable quotes */
        let queries = [];
        queries.push("DELETE FROM audio WHERE id IN (1,2,3,4,5,6,7,8,9,10,11,12,13);");
        queries.push("DELETE FROM bot WHERE id IN (1,2,3,4,5);");
        /* eslint-enable quotes */
        migration.execute(queries, this.version, callback);
    }
};

module.exports = migrationFile;
