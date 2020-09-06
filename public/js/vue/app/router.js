define(["exports", "vue", "vue-router", "./i18n", "./routes"], function (_exports, _vue, _vueRouter, _i18n, _routes) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _vue = _interopRequireDefault(_vue);
  _vueRouter = _interopRequireDefault(_vueRouter);
  _i18n = _interopRequireDefault(_i18n);
  _routes = _interopRequireDefault(_routes);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  _vue.default.use(_vueRouter.default);

  _i18n.default.locale = localStorage.currentLocale ? localStorage.currentLocale : _i18n.default.currentLocale;
  const router = new _vueRouter.default({
    // base: '/',
    // mode: 'history',
    routes: _routes.default,

    /**
     * Returns translated meta string
     *
     * Examples:
     * i18n.nav-home (just message key)
     * i18n.nav-home(lorem ipsum|foobar|1234) (message key with params)
     * router.current-route (get current route)
     * router.param-id (get value of param "id")
     *
     * @param meta string
     * @param to null|object
     * @returns string
     */
    translateMeta: function (meta, to) {
      let routerRegExp = /router\.([a-z-]+)/gi;
      let routerParamRegExp = /param-([a-z]+)/i;
      let routerMatches = meta.match(routerRegExp);
      let i18nParamsRegExp = /\([0-9a-z,| äüöß]+\)/gi;
      let i18nRegExp = new RegExp('i18n\\.([a-z-]+)(' + i18nParamsRegExp.source + ')?', 'gi');
      let i18nCleanRegExp = new RegExp('i18n\\.|' + i18nParamsRegExp.source, 'gi');
      let i18nMatches = meta.match(i18nRegExp); // if routerMatches is not empty

      if (routerMatches !== null) {
        for (let i = 0; i < routerMatches.length; i++) {
          // if param exists
          if (routerParamRegExp.test(routerMatches[i])) {
            if (typeof to.params[routerMatches[i].match(routerParamRegExp)[1]] === 'string') {
              meta = meta.replace(routerMatches[i], to.params[routerMatches[i].match(routerParamRegExp)[1]]);
            }
          } // if current-route exists


          if (/router\.current-route/gi.test(meta)) {
            meta = meta.replace(/router\.current-route/gi, window.location.origin + '/#' + to.path);
          }
        }
      } // if i18nMatches is not empty


      if (i18nMatches !== null) {
        for (let i = 0; i < i18nMatches.length; i++) {
          let params = []; // eslint-disable-line array-bracket-newline
          // if params exists

          if (i18nParamsRegExp.test(i18nMatches[i])) {
            params = i18nMatches[i].match(i18nParamsRegExp)[0].replace(/\(|\)/g, '').split('|');
          }

          meta = meta.replace(i18nMatches[i], _i18n.default.t(i18nMatches[i].replace(i18nCleanRegExp, ''), params));
        }
      }

      return meta;
    }
  }); // this callback runs before every route change, including on page load.

  router.beforeEach((to, from, next) => {
    // this goes through the matched routes from last to first, finding the closest route with a title.
    // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
    const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title); // find the nearest route element with meta tags.

    const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);
    const nearestWithLink = to.matched.slice().reverse().find(r => r.meta && r.meta.linkTags);
    const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);
    const previousNearestWithLink = from.matched.slice().reverse().find(r => r.meta && r.meta.linkTags); // if a route with a title was found, set the document (page) title to that value.

    if (nearestWithTitle) {
      document.title = router.options.translateMeta(nearestWithTitle.meta.title, to);
    } // remove any stale meta tags from the document using the key attribute we set below.


    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => el.parentNode.removeChild(el)); // Skip rendering meta tags if there are none.

    if (!nearestWithMeta) {
      return next();
    } // turn the meta tag definitions into actual elements in the head.


    nearestWithMeta.meta.metaTags.map(tagDef => {
      const tag = document.createElement('meta');
      Object.keys(tagDef).forEach(key => {
        tag.setAttribute(key, router.options.translateMeta(tagDef[key], to));
      }); // we use this to track which meta tags we create, so we don't interfere with other ones.

      tag.setAttribute('data-vue-router-controlled', '');
      return tag;
    }).forEach(tag => document.head.appendChild(tag)); // skip rendering link tags if there are none.

    if (!nearestWithLink) {
      return next();
    } // turn the link tag definitions into actual elements in the head.


    nearestWithLink.meta.linkTags.map(tagDef => {
      const tag = document.createElement('link');
      Object.keys(tagDef).forEach(key => {
        tag.setAttribute(key, router.options.translateMeta(tagDef[key], to));
      }); // we use this to track which link tags we create, so we don't interfere with other ones.

      tag.setAttribute('data-vue-router-controlled', '');
      return tag;
    }).forEach(tag => document.head.appendChild(tag));
    next();
  });
  var _default = router;
  _exports.default = _default;
});