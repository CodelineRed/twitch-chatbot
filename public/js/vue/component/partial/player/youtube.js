define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    template: '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" :src="generateUrl(video.file)" allow="autoplay" allowfullscreen=""></iframe></div>',
    data: function () {
      return {
        video: {}
      };
    },
    mounted: function () {
      this.getParentVideo();
    },
    methods: {
      generateUrl: function (file) {
        return 'https://www.youtube.com/embed/' + file + '?rel=0&autoplay=1&controls=0&disablekb=1&showinfo=0&modestbranding=1';
      },
      getParentVideo: function () {
        const $this = this;
        $this.video = $this.$parent.video;
      }
    }
  };
  _exports.default = _default;
});