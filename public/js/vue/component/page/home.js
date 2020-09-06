define(["exports", "../partial/channels"], function (_exports, _channels) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _channels = _interopRequireDefault(_channels);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var _default = {
    template: '<div class="row mb-5"><div class="col-12"><h3 class="text-center mb-4">{{ $tc(&#39;channel&#39;, 2) }} - {{ $t(&#39;app&#39;) }}</h3><c-channels ref="channels"></c-channels></div></div>',
    components: {
      'c-channels': _channels.default
    }
  };
  _exports.default = _default;
});