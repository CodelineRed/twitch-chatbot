define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const layout = 'default';
  var _default = {
    template: '<component :is="layout" ref="layout"></component>',
    computed: {
      layout() {
        return 'l-' + (this.$route.meta.layout || layout);
      }

    },
    mounted: function () {
      jQuery('html').attr('lang', this.$t('lang'));
      jQuery('html').removeClass('no-js');
      let oauthTokenRegExp = /access_token=([a-z0-9]+)/;

      if (oauthTokenRegExp.test(document.location.hash)) {
        // redirect to token page
        document.location.href = this.$router.resolve({
          name: 'token',
          params: {
            token: document.location.hash.match(oauthTokenRegExp)[1],
            property: 'oauthToken'
          }
        }).href;
      }
    }
  };
  _exports.default = _default;
});