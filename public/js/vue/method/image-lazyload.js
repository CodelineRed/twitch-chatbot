define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*global LazyLoad*/
  const imageLazyLoad = {
    methods: {
      /**
       * Loads all lazyload images instantly
       * 
       * @returns {undefined}
       */
      forceImageLoad: function () {
        (function ($) {
          $('img[data-src]:not(.loaded)').each(function () {
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
      initImageLazyLoad: function () {
        let lazyLoad = new LazyLoad({//elements_selector: '.lazyload' // eslint-disable-line camelcase
        });
      }
    }
  };
  var _default = imageLazyLoad;
  _exports.default = _default;
});