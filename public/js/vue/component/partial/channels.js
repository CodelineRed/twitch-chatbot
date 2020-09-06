define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    template: '<div class="row"><div class="col-12"><div class="row channels"><div v-for="channel in channels" :key="channel" class="col-12 col-sm-6 col-md-4 col-xl-3 pb-3"><div class="card"><div class="card-body"><h5 class="card-title text-center mb-0">{{ channel }}</h5><router-link class="stretched-link" :to="{ name: &#39;channel&#39;, params: { channel: channel } }"></router-link></div></div></div></div></div></div>',
    data: function () {
      return {
        channels: []
      };
    },
    mounted: function () {
      this.getChannels();
    },
    methods: {
      setChannels: function (args) {
        this.channels = args.channels.split(';');
      },
      getChannels: function () {
        if (typeof socketWrite === 'function') {
          const call = {
            method: 'getChannels',
            env: 'node'
          };
          socketWrite(call);
        }
      }
    }
  };
  _exports.default = _default;
});