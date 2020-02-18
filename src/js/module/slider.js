'use strict';

/**
 * Init slider with slick carousel
 * This is the default configuration
 * Change or add settings with 'data-slick' in HTML
 * 
 * @returns {undefined}
 */
function initSlider() {
    (function($) {
        $('.slider:not(.slick-initialized)').slick({
            arrows: true,
            autoplay: true,
            dots: true,
            fade: false,
            infinite: true,
            lazyLoad: 'ondemand', // ondemand progressive anticipated
            mobileFirst: true,
            pauseOnHover: true,
            pauseOnFocus: true,
            pauseOnDotsHover: true,
            slidesToShow: 1,
            slidesToScroll: 1
        });
    })(jQuery);
}
