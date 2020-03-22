const slider = {
    methods: {
        /**
         * Init slider with slick carousel
         * This is the default configuration
         * Change or add settings with 'data-slick' in HTML
         * 
         * @returns {undefined}
         */
        initSlider: function() {
            (function($) {
                $('.slider.slick-initialized').slick('unslick');
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
    }
};

export default slider;
