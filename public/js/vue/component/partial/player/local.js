define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    template: '<div class="embed-responsive embed-responsive-16by9"><video class="embed-responsive-item" autoplay=""><source :src="generateUrl(video.file)" type="video/mp4">{{ $t(&#39;no-video-support&#39;) }}</video></div>',
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
        return 'http://localhost:3060/' + file;
      },
      getParentVideo: function () {
        const $this = this;
        $this.video = $this.$parent.video;
      }
    }
  };
  _exports.default = _default;
});