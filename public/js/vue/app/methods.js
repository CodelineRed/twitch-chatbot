define(["exports", "../method/image-lazyload"], function (_exports, _imageLazyload) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _imageLazyload = _interopRequireDefault(_imageLazyload);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  const methods = {
    methods: {
      forceImageLoad: _imageLazyload.default.methods.forceImageLoad,
      initImageLazyLoad: _imageLazyload.default.methods.initImageLazyLoad
    }
  };
  var _default = methods;
  _exports.default = _default;
});