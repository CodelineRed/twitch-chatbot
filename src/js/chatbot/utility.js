const locales = require('./locales');
const request = require('request');
const cmp     = require('semver-compare');

const utility = {
    /**
     * Returns value of package property or null
     * 
     * @param {String} prop
     * @returns {String|Null}
     */
    getPackageProperty: function(prop) {
        let packagejson = require('../../../package.json');

        if (typeof packagejson[prop] !== 'undefined') {
            return packagejson[prop];
        }

        return null;
    },
    /**
     * Gets latest version from GitHub
     * 
     * @returns {Promise}
     */
    getGithubVersion: function() {
        let options = {
            url: 'https://raw.githubusercontent.com/InsanityMeetsHH/twitch-chatbot/master/package.json',
            method: 'GET',
            json: true
        };

        return new Promise(function(resolve, reject) {
            request(options, (err, res, body) => {
                if (err) {
                    reject(err);
                }

                if (typeof body.version !== 'undefined') {
                    resolve(body.version);
                }
            });
        });
    },
    /**
     * Displays version text to console
     * 
     * @returns {undefined}
     */
    getVersionText: function() {
        utility.getGithubVersion().then(function(version) {
            console.log(locales.t('version-text', [utility.getPackageProperty('version')]));

            if (cmp(utility.getPackageProperty('version'), version) === 0) {
                console.log(locales.t('version-text-latest'));
            } else if (cmp(utility.getPackageProperty('version'), version) === -1) {
                console.log(locales.t('version-text-behind', [version]));
            } else {
                console.log(locales.t('version-text-ahead', [version]));
            }
        });
    }
};

module.exports = utility;
