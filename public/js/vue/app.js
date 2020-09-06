define(["vue", "./app/filters", "./app/fontawesome", "./app/i18n", "./app/router", "./component/layout/default", "./component/layout/empty", "./component/partial/app"], function (_vue, _filters, _fontawesome, _i18n, _router, _default, _empty, _app) {
  "use strict";

  _vue = _interopRequireDefault(_vue);
  _filters = _interopRequireDefault(_filters);
  _fontawesome = _interopRequireDefault(_fontawesome);
  _i18n = _interopRequireDefault(_i18n);
  _router = _interopRequireDefault(_router);
  _default = _interopRequireDefault(_default);
  _empty = _interopRequireDefault(_empty);
  _app = _interopRequireDefault(_app);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  _vue.default.component('l-default', _default.default);

  _vue.default.component('l-empty', _empty.default);

  _vue.default.filter('formatDateTime', _filters.default.formatDateTime);

  _vue.default.filter('formatDuration', _filters.default.formatDuration);

  _vue.default.filter('localFile', _filters.default.localFile);

  _vue.default.filter('twitchClipFile', _filters.default.twitchClipFile);

  _vue.default.filter('twitchVideoFile', _filters.default.twitchVideoFile);

  _vue.default.filter('youtubeFile', _filters.default.youtubeFile);

  _vue.default.config.productionTip = false;
  const app = new _vue.default({
    fontawesome: _fontawesome.default,
    i18n: _i18n.default,
    router: _router.default,
    render: h => h(_app.default)
  }).$mount('#app'); // make app global

  window.app = app;
});