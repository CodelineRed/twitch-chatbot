define(["exports", "../../method/bs-component", "../../method/data-table"], function (_exports, _bsComponent, _dataTable) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _bsComponent = _interopRequireDefault(_bsComponent);
  _dataTable = _interopRequireDefault(_dataTable);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var _default = {
    template: '<div class="col-auto"><div class="btn-group" :class="getButtonClass()"><button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><font-awesome-icon :icon="[&#39;fas&#39;, &#39;globe&#39;]" class="fa-fw"></font-awesome-icon></button><div class="dropdown-menu"><a v-for="locale in languages" :key="locale" class="dropdown-item" :class="{active: locale === currentLocale}" onclick="javascript:return false;" href="#" @click="changeLang(locale)">{{ $t(&#39;lang-&#39; + locale)&nbsp;}}</a></div></div></div>',
    mixins: [_bsComponent.default, _dataTable.default],
    props: {
      drop: {
        type: String,
        default: 'up'
      }
    },
    data: function () {
      return {
        currentLocale: window.localStorage.getItem('currentLocale') ? window.localStorage.getItem('currentLocale') : 'en',
        fallbackLocale: 'en',
        languages: ['en', 'de'],
        init: false
      };
    },
    watch: {
      currentLocale(newLocale) {
        window.localStorage.currentLocale = newLocale;
      }

    },
    mounted: function () {
      this.changeLang(this.currentLocale);
    },
    methods: {
      changeLang: function (lang) {
        let $this = this;
        $this.$i18n.locale = lang;
        $this.currentLocale = lang;
        window.localStorage.setItem('currentLocale', lang);
        setTimeout(function () {
          if ($this.init) {
            $this.initDataTable();
          }

          $this.initTooltip();
          $this.initPopover();
          $this.init = true;
        }, 250);
      },
      getButtonClass: function () {
        return 'drop' + this.drop;
      }
    }
  };
  _exports.default = _default;
});