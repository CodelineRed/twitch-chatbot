const database = require('./src/js/chatbot/database');
const locales  = require('./src/js/chatbot/locales');

const fs       = require('fs');
const glob     = require('glob');
const moment   = require('moment');
const yargs    = require('yargs');

const migrationFolder = './data/migration/';
let pastMigrations = [];
const versionExtract = /^.\/data\/migration\/(.*).js$/;
const argv = yargs
    .option('direction', {
        alias: 'd',
        default: 'up',
        description: 'Migration direction)',
        type: 'string'
    })
    .option('file', {
        alias: 'f',
        description: 'Execute one file (e.g.: -f version-1.0.0)',
        type: 'string'
    })
    .option('locale', {
        alias: 'l',
        default: 'en',
        description: 'Locale for log messages',
        type: 'string'
    })
    .option('log', {
        default: true,
        description: 'Show logs in CLI',
        type: 'boolean'
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.locale) {
    locales.changeLanguage(argv.locale);
}

function log(message) {
    if (argv.log === true) {
        console.log(message);
    }
}

// if file matches pattern
if (/^version-[0-9]+.[0-9]+.[0-9]+$/.test(argv.file)) {
    // prepend folder path and append file extension
    argv.file = migrationFolder + argv.file + '.js';
} else if (typeof argv.file === 'string' && argv.file.length) {
    // echo error message if "-f" was defined but not matches pattern
    log(locales.t('migration-file-incorrect', [argv.file]));
    // abort futher script execution
    process.exit(1);
}

function executeMigarationFilesRecursive(migrationFiles, index) {
    // if is end of array
    if (typeof migrationFiles[index] === 'undefined') {
        return;
    } else {
        let migration = require(migrationFiles[index]);

        // if migration was executed in the past
        if (pastMigrations.indexOf(migrationFiles[index]) > -1) {
            if (typeof argv.file === 'string') {
                log(locales.t('migration-file-executed', [migrationFiles[index].replace(versionExtract, '$1')]));
            }

            executeMigarationFilesRecursive(migrationFiles, ++index);
        } else {
            // if migration was not executed in the past and direction up
            if (pastMigrations.indexOf(migrationFiles[index]) === -1 && argv.direction === 'up') {
                migration[argv.direction](function() {
                    let time = moment().unix();
                    let values = {
                        name: migrationFiles[index],
                        updatedAt: time,
                        createdAt: time
                    };

                    database.insert('migration', [values], function(migrationInsert) {
                        log(locales.t('migration-executed', [migrationFiles[index].replace(versionExtract, '$1'), locales.t(argv.direction)]));
                        executeMigarationFilesRecursive(migrationFiles, ++index);
                    });
                });
            }

            // if migration was not executed in the past and direction down
            if (pastMigrations.indexOf(migrationFiles[index]) !== -1 && argv.direction === 'down') {
                migration[argv.direction](function() {
                    let where = ['name = ?'];
                    let prepare = [migrationFiles[index]];

                    database.remove('migration', where, prepare, function(migrationRemove) {
                        log(locales.t('migration-executed', [migrationFiles[index].replace(versionExtract, '$1'), locales.t(argv.direction)]));
                        executeMigarationFilesRecursive(migrationFiles, ++index);
                    });
                });
            }
        }
    }
}

// if folder exists
if (fs.existsSync(migrationFolder)) {
    database.find('*', 'migration', '', [], '', 'name', 0, [], function(migrationRows) {
        for (let i = 0; i < migrationRows.length; i++) {
            pastMigrations.push(migrationRows[i].name);
        }

        // if execute a single file
        if (typeof argv.file !== 'undefined' && fs.existsSync(argv.file)) {
            executeMigarationFilesRecursive([argv.file], 0);
        } else {
            glob(migrationFolder + 'version-*.js', {}, function(error, migrationFiles) {
                if (argv.direction === 'down') {
                    migrationFiles.reverse();
                }

                if ((argv.direction === 'up' && pastMigrations.length === migrationFiles.length) 
                    || (argv.direction === 'down' && !pastMigrations.length)) {
                    log(locales.t('migration-all-executed'));
                } else {
                    executeMigarationFilesRecursive(migrationFiles, 0);
                }
            });
        }
    });
}
