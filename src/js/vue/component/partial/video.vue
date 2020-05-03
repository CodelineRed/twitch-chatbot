<script>
    import Empty from './player/empty';
    import Local from './player/local';
    import TwitchClip from './player/twitch-clip';
    import TwitchVideo from './player/twitch-video';
    import Youtube from './player/youtube';

    export default {
        components: {
            'empty': Empty,
            'local': Local,
            'twitch-clip': TwitchClip,
            'twitch-video': TwitchVideo,
            'youtube': Youtube
        },
        data: function() {
            return {
                video: {
                    name: '',
                    subName: '',
                    file: '',
                    played: false,
                    skipped: false,
                    duration: 0, // seconds
                    player: 'empty'
                }
            };
        },
        watch: {
            'video.name': function() {
                jQuery('.video .name').removeClass('animation');
                setTimeout(function() {
                    jQuery('.video .name').addClass('animation');
                }, 100);
            }
        },
        mounted: function() {
            this.getVideo();
        },
        methods: {
            setVideo: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    const $this = this;
                    $this.video = args.video;

                    if (parseInt(this.video.duration) > 0) {
                        setTimeout(function() {
                            $this.video.player = 'empty';
                            $this.getVideo();
                        }, parseInt($this.video.duration) * 1000);
                    }
                }
            },
            getVideo: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    streamWrite(call);
                }
            }
        }
    };
</script>

<template>
    <div class="video" :class="$route.params.channel.toLowerCase()">
        <div v-if="video.player !== ''">
            <component :is="video.player" ref="player" />
        </div>
        <div v-if="video.name.length" class="name overlay px-2 pb-1">
            {{ video.name }}
            <div v-if="video.subName.length" class="sub-name">
                {{ video.subName }}
            </div>
        </div>
    </div>
</template>
