/*global LazyLoad*/
'use strict';

/**
 * Init image lazy load
 * 
 * @returns {undefined}
 */
function initImageLazyLoad() {
    (function($) {
        var lazyLoad = new LazyLoad({
            //elements_selector: '.lazyload' // eslint-disable-line camelcase
        });
    })(jQuery);
}

/**
 * Loads all lazyload images instantly
 * 
 * @returns {undefined}
 */
function forceImageLoad() {
    (function($) {
        $('img[data-src]:not(.loaded)').each(function() {
            $(this).attr('src', $(this).data('src'));
            $(this).addClass('loaded');
        });
    })(jQuery);
}
