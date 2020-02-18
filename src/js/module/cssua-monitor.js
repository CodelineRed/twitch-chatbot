/*global cssua*/
'use strict';

/**
 * Init cssua monitor
 * 
 * @returns {undefined}
 */
function initCssuaMonitor() {
    (function($) {
        if ($('.cssua-monitor').text() === '') {
            $.each(cssua.ua, function(key, value) {
                $('.cssua-monitor').append(key + ': ' + value + '<br>');
            });
            $('.cssua-monitor').append('html tag classes: ' + $('html').attr('class') + '<br>');
        }
    })(jQuery);
}
