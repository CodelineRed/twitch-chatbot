/*global moment*/

const filters = {
    /**
     * @param {string|integer} timestamp in milliseconds
     * @param {string} format see https://momentjs.com/docs/#/parsing/
     * @returns {string}
     */
    formatDateTime: function(timestamp, format) {
        if (timestamp) {
            return moment(parseInt(timestamp)).format(format);
        } else {
            return '-';
        }
    },
    /**
     * @param {string|integer} timestamp in milliseconds
     * @param {string} format see https://momentjs.com/docs/#/durations/
     * @returns {string}
     */
    formatDuration: function(duration) {
        if (duration) {
            const durationObject = moment.duration(parseInt(duration), 'ms');
            const hours = ('0' + durationObject.hours()).substr(-2);
            const minutes = ('0' + durationObject.minutes()).substr(-2);
            const seconds = ('0' + durationObject.seconds()).substr(-2);
            
            return hours + ':' + minutes + ':' + seconds + ' h';
        } else {
            return '-';
        }
    }
};

export default filters;
