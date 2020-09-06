define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    template: '<div class="row"><div class="col-12 pb-5"><h1 class="text-center">{{ $t(&#39;nav-token&#39;)&nbsp;}} - {{ $t(&#39;app&#39;) }}</h1><div class="row justify-content-center"><div class="col-12 col-md-6 col-xxl-4"><p v-if="status === 0" class="text-center">Please wait{{ $t(&#39;please-wait&#39;) }} <font-awesome-icon :icon="[&#39;fas&#39;, &#39;sync&#39;]" class="fa-spin"></font-awesome-icon></p><p v-else-if="status === 1" class="text-center"><!-- eslint-disable-next-line vue/no-v-html --><span v-html="$t(&#39;token-text&#39;, [$route.params.property])"></span></p><p v-else="" class="text-center">{{ $t(&#39;auth-failed&#39;) }}</p></div></div></div></div>',
    data: function () {
      return {
        status: 0
      };
    },
    mounted: function () {
      this.saveChannelToken();
    },
    methods: {
      saveChannelToken: function () {
        if (typeof socketWrite === 'function') {
          const call = {
            method: 'saveChannelToken',
            args: {
              channel: {
                token: this.$root._route.params.token,
                property: this.$root._route.params.property
              }
            },
            env: 'node'
          };
          socketWrite(call);
        }
      },
      setChannelTokenStatus: function (args) {
        this.status = args.status;
      }
    }
  };
  _exports.default = _default;
});