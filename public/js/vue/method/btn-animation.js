define(["exports"],(function(t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;const n={methods:{btnAnimation:function(t,n){var a;a=jQuery,(t=a(t).closest("button")).addClass("btn-animation-start btn-animation-"+t.data("animation-"+n)),setTimeout((function(){t.removeClass("btn-animation-start btn-animation-"+t.data("animation-"+n))}),1e3)}}};t.default=n}));