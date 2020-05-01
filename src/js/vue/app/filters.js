const filters = {
    /**
     * @param {string|integer} timestamp in seconds
     * @param {string} format see https://momentjs.com/docs/#/parsing/
     * @returns {string}
     */
    formatDateTime: function(timestamp, format) {
        if (timestamp) {
            return moment(parseInt(timestamp) * 1000).format(format);
        } else {
            return '-';
        }
    },
    /**
     * @param {string|integer} timestamp in seconds
     * @param {string} format see https://momentjs.com/docs/#/durations/
     * @returns {string}
     */
    formatDuration: function(duration) {
        if (duration) {
            const durationObject = moment.duration(parseInt(duration) * 1000, 'ms');
            const hours = ('0' + durationObject.hours()).substr(-2);
            const minutes = ('0' + durationObject.minutes()).substr(-2);
            const seconds = ('0' + durationObject.seconds()).substr(-2);

            return hours + ':' + minutes + ':' + seconds + ' h';
        } else {
            return '-';
        }
    },
    /**
     * @param {string} file
     * @returns {string}
     */
    localFile: function(file) {
        let leadingRegExp = /^(\/|\\)+/;
        let slashesRegExp = /(\/|\\)+/g;
        return file.replace(leadingRegExp, '').replace(slashesRegExp, '/');
    },
    /**
     * @param {string} file
     * @returns {string}
     */
    twitchClipFile: function(file) {
        let twitchClipRegExp = /^[A-Z][A-Za-z0-9]+$/;
        let blacklistRegExp = /(^[a-z]|[^A-Za-z0-9])/;

        if (!twitchClipRegExp.test(file)) {
            // remove blacklist chars
            file = file.replace(blacklistRegExp, '');
        }

        return file;
    },
    /**
     * @param {string} file
     * @returns {string}
     */
    twitchVideoFile: function(file) {
        let twitchVideoRegExp = /^[0-9]+$/;
        let blacklistRegExp = /([^0-9])/;

        if (!twitchVideoRegExp.test(file)) {
            // remove blacklist chars
            file = file.replace(blacklistRegExp, '');
        }

        return file;
    },
    /**
     * @param {string} file
     * @returns {string}
     */
    youtubeFile: function(file) {
        let youtubeRegExp = /^[a-z0-9_-]$/i;
        let blacklistRegExp = /([^a-z0-9-_])/i;

        if (!youtubeRegExp.test(file)) {
            // remove blacklist chars
            file = file.replace(blacklistRegExp, '');
        }

        if (file.length > 11) {
            // shorten by -1 length
            file = file.slice(0, file.length - 1);
        }

        return file;
    }
};

export default filters;
