define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const audio = {
    data: function () {
      return {
        audioNodes: {},
        audios: []
      };
    },
    computed: {
      audioLoops: function () {
        return this.audios.filter(item => {
          return item.type.toLowerCase().indexOf('loop') > -1;
        });
      },
      audioJingles: function () {
        return this.audios.filter(item => {
          return item.type.toLowerCase().indexOf('jingle') > -1;
        });
      }
    },
    methods: {
      getAudios: function (ref) {
        if (typeof socketWrite === 'function') {
          const call = {
            method: 'getAudios',
            args: {
              ref: ref
            },
            env: 'node'
          };
          socketWrite(call);
        }
      },
      getAudioFileById: function (id) {
        for (let i = 0; i < this.audios.length; i++) {
          if (id === this.audios[i].id) {
            return this.audios[i].file;
          }
        }

        return '';
      },
      playAudio: function (name, src, volume, loop) {
        this.prepareAudio(name);
        this.stopAudio(name);
        this.setAudioLoop(name, loop);
        this.setAudioSrc(name, src);
        this.setAudioVolume(name, volume);
        this.audioNodes[name].play();
      },
      prepareAudio: function (name) {
        if (typeof this.audioNodes[name] === 'undefined') {
          this.audioNodes[name] = new Audio();
        }
      },
      setAudioLoop: function (name, loop) {
        this.prepareAudio(name);
        this.audioNodes[name].loop = typeof loop === 'undefined' ? false : loop;
      },
      setAudios: function (args) {
        this.audios = args.audios;
      },
      setAudioSrc: function (name, src) {
        this.prepareAudio(name);
        this.audioNodes[name].src = '/audio/' + src;
      },
      setAudioVolume: function (name, volume) {
        this.prepareAudio(name);
        this.audioNodes[name].volume = typeof volume === 'undefined' ? 0.5 : volume;
      },
      stopAudio: function (name) {
        this.prepareAudio(name);

        if (this.audioNodes[name].currentTime) {
          this.audioNodes[name].pause();
          this.audioNodes[name].currentTime = 0;
        }
      }
    }
  };
  var _default = audio;
  _exports.default = _default;
});