const database = require('./database');

const migration = {
    /**
     * Starts loop through queries
     * 
     * @param {array} queries (array of query strings)
     * @param {string} version
     * @param {function|undefined} callback
     * @returns {undefined}
     */
    execute: function(queries, version, callback) {
        migration.executeRow(queries, version, 0, callback);
    },
    /**
     * Executes one sql row and calls them self recursive
     * 
     * @param {type} queries (array of query strings)
     * @param {type} version
     * @param {type} index
     * @param {type} callback
     * @returns {undefined}
     */
    executeRow: function(queries, version, index, callback) {
        if (typeof queries[index] === 'undefined') {
            if (typeof callback === 'function') {
                callback();
            }
            return;
        } else {
            database.connection.run(queries[index], function(error, rows) {
                if (error) {
                    console.log(`Version: ${version}`);
                    console.log(error);
                } else {
                    migration.executeRow(queries, version, ++index, callback);
                }
            });
        }
    }
};

module.exports = migration;
