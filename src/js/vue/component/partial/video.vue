<script>
    import Empty from './platform/empty';
    import Local from './platform/local';
    import TwitchClip from './platform/twitch-clip';
    import TwitchVideo from './platform/twitch-video';
    import Youtube from './platform/youtube';

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
                    platform: 'empty'
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
                            $this.video.platform = 'empty';
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
        <div v-if="video.platform !== ''">
            <component :is="video.platform" ref="platform" />
        </div>
        <div v-if="video.name.length" class="name overlay px-2 py-1">
            {{ video.name }}
            <div v-if="video.subName.length" class="sub-name">
                {{ video.subName }}
            </div>
        </div>
    </div>
</template>
