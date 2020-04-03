const btnAnimation = {
    methods: {
        btnAnimation: function(target) {
            (function($) {
                target = $(target).closest('button');
                
                target.addClass('btn-animation-start btn-animation-' + target.data('animation-color'));

                setTimeout(function() {
                    target.removeClass('btn-animation-start btn-animation-' + target.data('animation-color'));
                }, 1000);
            })(jQuery);
        }
    }
};

export default btnAnimation;
