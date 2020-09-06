define(["exports", "../partial/langswitch", "../partial/navigation"], function (_exports, _langswitch, _navigation) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _langswitch = _interopRequireDefault(_langswitch);
  _navigation = _interopRequireDefault(_navigation);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var _default = {
    template: '<div><header><div class="container"><div class="form-row"><c-langswitch ref="langswitch" drop="down"></c-langswitch><c-navigation ref="navigation"></c-navigation></div></div></header><main class="pt-3"><div class="container"><router-view ref="view"></router-view></div></main><footer><div class="container"><div class="row"></div></div></footer></div>',
    components: {
      'c-navigation': _navigation.default,
      'c-langswitch': _langswitch.default
    }
  };
  _exports.default = _default;
});