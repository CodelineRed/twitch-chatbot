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
        }
    }
};

export default filters;
