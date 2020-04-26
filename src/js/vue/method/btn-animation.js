const btnAnimation = {
    methods: {
        btnAnimation: function(target, style) {
            (function($) {
                target = $(target).closest('button');

                target.addClass('btn-animation-start btn-animation-' + target.data('animation-' + style));

                setTimeout(function() {
                    target.removeClass('btn-animation-start btn-animation-' + target.data('animation-' + style));
                }, 1000);
            })(jQuery);
        }
    }
};

export default btnAnimation;
