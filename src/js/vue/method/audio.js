const audio = {
    data: function() {
        return {
            sound: {},
            audios: []
        };
    },
    computed: {
        audioLoops: function() {
            return this.audios.filter(item => {
                return item.type.toLowerCase().indexOf('loop') > -1;
            });
        },
        audioJingles: function() {
            return this.audios.filter(item => {
                return item.type.toLowerCase().indexOf('jingle') > -1;
            });
        }
    },
    methods: {
        getAudios: function(ref) {
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
        getAudioFileById: function(id) {
            for (let i = 0; i < this.audios.length; i++) {
                if (id === this.audios[i].id) {
                    return this.audios[i].file;
                }
            }
            return '';
        },
        playAudio: function(name, src, volume, loop) {
            this.prepareAudio(name);
            this.stopAudio(name);
            this.setAudioLoop(name, loop);
            this.setAudioSrc(name, src);
            this.setAudioVolume(name, volume);
            this.sound[name].play();
        },
        prepareAudio: function(name) {
            if (typeof this.sound[name] === 'undefined') {
                this.sound[name] = new Audio();
            }
        },
        setAudioLoop: function(name, loop) {
            this.prepareAudio(name);
            this.sound[name].loop = typeof loop === 'boolean' ? loop : false;
        },
        setAudios: function(args) {
            this.audios = args.list;
        },
        setAudioSrc: function(name, src) {
            this.prepareAudio(name);
            this.sound[name].src = '/audio/' + src;
        },
        setAudioVolume: function(name, volume) {
            volume = typeof volume === 'number' ? (volume > 0 ? volume / 100 : volume) : 0.5;
            this.prepareAudio(name);
            this.sound[name].volume = volume;
        },
        stopAudio: function(name) {
            this.prepareAudio(name);
            if (this.sound[name].currentTime) {
                this.sound[name].pause();
                this.sound[name].currentTime = 0;
            }
        }
    }
};

export default audio;
