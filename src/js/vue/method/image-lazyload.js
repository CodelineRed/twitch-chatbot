/*global LazyLoad*/

const imageLazyLoad = {
    methods: {
        /**
         * Loads all lazyload images instantly
         * 
         * @returns {undefined}
         */
        forceImageLoad: function() {
            (function($) {
                $('img[data-src]:not(.loaded)').each(function() {
                    $(this).attr('src', $(this).data('src'));
                    $(this).addClass('loaded');
                });
            })(jQuery);
        },
        
        /**
         * Init image lazy load
         * 
         * @returns {undefined}
         */
        initImageLazyLoad: function() {
            let lazyLoad = new LazyLoad({
                //elements_selector: '.lazyload' // eslint-disable-line camelcase
            });
        }
    }
};

export default imageLazyLoad;
