define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const bsComponent = {
    methods: {
      initPopover: function () {
        jQuery('[data-toggle="popover"]').popover('dispose');
        jQuery('[data-toggle="popover"]').popover({
          html: true,
          placement: 'top'
        });
      },
      initTooltip: function () {
        jQuery('[data-toggle="tooltip"]').tooltip('dispose');
        jQuery('[data-toggle="tooltip"]').tooltip();
      }
    }
  };
  var _default = bsComponent;
  _exports.default = _default;
});