define(["exports", "../partial/chat", "../partial/commands", "../partial/counter", "../partial/playlist", "../partial/poll", "../partial/raffle"], function (_exports, _chat, _commands, _counter, _playlist, _poll, _raffle) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _chat = _interopRequireDefault(_chat);
  _commands = _interopRequireDefault(_commands);
  _counter = _interopRequireDefault(_counter);
  _playlist = _interopRequireDefault(_playlist);
  _poll = _interopRequireDefault(_poll);
  _raffle = _interopRequireDefault(_raffle);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var _default = {
    template: '<div class="row mb-5 channel"><div class="col-12 pb-3"><h3 class="text-center">{{ $route.params.channel }} - {{ $t(&#39;app&#39;) }} <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Components Order"><button type="button" class="btn btn-sm btn-primary components-order" data-toggle="modal" data-target="#components-order"><font-awesome-icon :icon="[&#39;fas&#39;, &#39;th&#39;]" class="fa-fw"></font-awesome-icon></button></span></h3></div><!-- eslint-disable-next-line vue/require-v-for-key --><div v-for="(properties, component, index) in componentsOrder" :class="getComponentClass(properties, index)"><component :is="(&#39;c-&#39; + component)" :ref="component"></component></div><div class="col-12"><div id="components-order" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="components-order-modal-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document"><div class="modal-content"><div class="modal-header"><h5 id="components-order-modal-title" class="modal-title">{{ $tc(&#39;component&#39;, 2) }} {{ $t(&#39;order&#39;) }}</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button></div><div class="modal-body"><div class="row"><div class="col-12 form-search"><div class="table-responsive"><table id="componentsOrderTable" class="table table-striped table-hover table-dark"><thead><tr><th scope="col">#</th><th scope="col">{{ $tc(&#39;component&#39;, 2) }}</th><th scope="col">{{ $t(&#39;show&#39;) }}</th><th scope="col" colspan="2">{{ $t(&#39;smartphone&#39;) }}</th><th scope="col">{{ $t(&#39;tablet&#39;) }}</th><th scope="col" colspan="3">{{ $t(&#39;computer&#39;) }}</th></tr></thead><tbody><!-- eslint-disable-next-line vue/require-v-for-key --><tr v-for="(properties, component, index) in componentsOrder"><td class="index"><div v-if="index > 0" class="move move-up" @click="moveComponent(component, -1, index)"><font-awesome-icon :icon="[&#39;fas&#39;, &#39;chevron-right&#39;]" class="fa-fw" :transform="{rotate: -90}"></font-awesome-icon></div><div v-if="index + 1 < Object.keys(componentsOrder).length" class="move move-down" @click="moveComponent(component, 1, index)"><font-awesome-icon :icon="[&#39;fas&#39;, &#39;chevron-right&#39;]" class="fa-fw" :transform="{rotate: 90}"></font-awesome-icon></div>{{ index + 1 }}</td><td>{{ component }}</td><td><div class="custom-control custom-switch"><input id="components-order-show" v-model="componentsOrder[component].show" type="checkbox" class="custom-control-input" @change="saveComponentsOrder()"><label for="components-order-show" class="custom-control-label">&nbsp;</label></div></td><td v-for="(width, breakpoint) in properties.cols" :key="breakpoint"><select v-model.number="componentsOrder[component].cols[breakpoint]" class="custom-select" @change="saveComponentsOrder()"><option value="0">{{ $t(&#39;default&#39;) }}</option><option v-for="bpWidth in 12" :key="bpWidth" :value="bpWidth" :selected="bpWidth === width">{{ breakpoint }} {{ bpWidth }}</option></select></td></tr></tbody></table></div></div></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div></div></div></div></div></div>',
    components: {
      'c-chat': _chat.default,
      'c-commands': _commands.default,
      'c-counter': _counter.default,
      'c-playlist': _playlist.default,
      'c-poll': _poll.default,
      'c-raffle': _raffle.default
    },
    data: function () {
      return {
        componentsOrder: window.localStorage.getItem('componentsOrder') ? JSON.parse(window.localStorage.getItem('componentsOrder')) : null
      };
    },
    mounted: function () {
      if (this.componentsOrder === null) {
        this.componentsOrder = {
          chat: {
            show: true,
            cols: {
              xs: 12,
              sm: 0,
              md: 0,
              lg: 0,
              xl: 0,
              xxl: 0
            }
          },
          poll: {
            show: true,
            cols: {
              xs: 12,
              sm: 0,
              md: 6,
              lg: 0,
              xl: 0,
              xxl: 0
            }
          },
          raffle: {
            show: true,
            cols: {
              xs: 12,
              sm: 0,
              md: 6,
              lg: 0,
              xl: 0,
              xxl: 0
            }
          },
          commands: {
            show: true,
            cols: {
              xs: 12,
              sm: 0,
              md: 0,
              lg: 9,
              xl: 0,
              xxl: 7
            }
          },
          counter: {
            show: true,
            cols: {
              xs: 12,
              sm: 6,
              md: 4,
              lg: 3,
              xl: 0,
              xxl: 0
            }
          },
          playlist: {
            show: true,
            cols: {
              xs: 12,
              sm: 0,
              md: 0,
              lg: 0,
              xl: 0,
              xxl: 0
            }
          }
        };
        this.saveComponentsOrder();
      }
    },
    methods: {
      getComponentClass: function (properties, index) {
        let bp = Object.keys(properties.cols);
        let cssClasses = '';

        for (let i = 0; i < bp.length; i++) {
          if (properties.cols[bp[i]]) {
            if (bp[i] === 'xs') {
              cssClasses += `col-${properties.cols[bp[i]]} `;
            } else {
              cssClasses += `col-${bp[i]}-${properties.cols[bp[i]]} `;
            }
          }
        }

        if (!properties.show) {
          cssClasses += 'd-none ';
        }

        if (Object.keys(this.componentsOrder).length - 1 !== index) {
          cssClasses += 'pb-3';
        }

        return cssClasses;
      },
      moveComponent: function (component, direction, index) {
        let componentsOrder = {};
        let componentsOrderKeys = Object.keys(this.componentsOrder);
        componentsOrderKeys[index] = componentsOrderKeys[index + direction];
        componentsOrderKeys[index + direction] = component;

        for (let i = 0; i < componentsOrderKeys.length; i++) {
          componentsOrder[componentsOrderKeys[i]] = this.componentsOrder[componentsOrderKeys[i]];
        }

        this.componentsOrder = componentsOrder;
        this.saveComponentsOrder();
      },
      saveComponentsOrder: function () {
        window.localStorage.setItem('componentsOrder', JSON.stringify(this.componentsOrder));
      }
    }
  };
  _exports.default = _default;
});