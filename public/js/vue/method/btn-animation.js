define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const btnAnimation = {
    methods: {
      btnAnimation: function (target, style) {
        (function ($) {
          target = $(target).closest('button');
          target.addClass('btn-animation-start btn-animation-' + target.data('animation-' + style));
          setTimeout(function () {
            target.removeClass('btn-animation-start btn-animation-' + target.data('animation-' + style));
          }, 1000);
        })(jQuery);
      }
    }
  };
  var _default = btnAnimation;
  _exports.default = _default;
});