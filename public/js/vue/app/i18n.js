define(["exports", "vue", "vue-i18n", "./i18n-locales", "../component/partial/langswitch"], function (_exports, _vue, _vueI18n, _i18nLocales, _langswitch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _vue = _interopRequireDefault(_vue);
  _vueI18n = _interopRequireDefault(_vueI18n);
  _langswitch = _interopRequireDefault(_langswitch);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  _vue.default.use(_vueI18n.default);

  const i18n = new _vueI18n.default({
    messages: Object.assign(_i18nLocales.locales),
    locale: _langswitch.default.data().currentLocale,
    fallbackLocale: _langswitch.default.data().fallbackLocale,
    silentFallbackWarn: true,
    silentTranslationWarn: true
  });
  var _default = i18n;
  _exports.default = _default;
});