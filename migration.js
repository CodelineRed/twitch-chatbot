const database     = require('./src/js/chatbot/database');

const fs           = require('fs');
const glob         = require('glob');
const moment       = require('moment');
const yargs        = require('yargs');

const migrationFolder = './data/migration/';
let pastMigrations = [];
const versionExtract = /^.\/data\/migration\/(.*).js$/;
const argv = yargs
    .option('direction', {
        alias: 'd',
        description: 'Migration direction (default: up)',
        type: 'string'
    })
    .option('file', {
        alias: 'f',
        description: 'Execute one specific migration file (e.g.: -f version-1.0.0',
        type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;

if (typeof argv.direction === 'undefined') {
    argv.direction = 'up';
}

// if file matches pattern
if (/^version-[0-9]+.[0-9]+.[0-9]+$/.test(argv.file)) {
    // prepend folder path and append file extension
    argv.file = migrationFolder + argv.file + '.js';
} else if (typeof argv.file === 'string' && argv.file.length) {
    // echo error message if "-f" was defined but not matches pattern
    console.log(`* File "${argv.file}" is incorrect`);
    // abort futher script execution
    process.exit(1);
}

function executeMigarationFilesRecursive(migrationFiles, index) {
    // if is end of array
    if (typeof migrationFiles[index] === 'undefined') {
        return;
    } else {
        let migration = require(migrationFiles[index]);

        // if migration was not executed in the past
        if (pastMigrations.indexOf(migrationFiles[index]) === -1 && argv.direction === 'up') {
            migration.up(function() {
                let time = moment().unix();
                let values = {
                    name: migrationFiles[index],
                    updatedAt: time,
                    createdAt: time
                };

                database.insert('migration', [values], function(migrationInsert) {
                    console.log(`* Executed ${migrationFiles[index].replace(versionExtract, '$1')} up`);
                    executeMigarationFilesRecursive(migrationFiles, ++index);
                });
            });
        }

        // if migration was executed in the past
        if (pastMigrations.indexOf(migrationFiles[index]) !== -1 && argv.direction === 'down') {
            migration.down(function() {
                let where = ['name = ?'];
                let prepare = [migrationFiles[index]];

                database.remove('migration', where, prepare, function(migrationRemove) {
                    console.log(`* Executed ${migrationFiles[index].replace(versionExtract, '$1')} down`);
                    executeMigarationFilesRecursive(migrationFiles, ++index);
                });
            });
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
                executeMigarationFilesRecursive(migrationFiles, 0);
            });
        }
    });
}
