<script>
    import Empty from './platform/empty';
    import Local from './platform/local';
    import Youtube from './platform/youtube';

    export default {
        components: {
            'empty': Empty,
            'local': Local,
            'youtube': Youtube
        },
        data: function() {
            return {
                video: {
                    name: '',
                    file: '',
                    played: false,
                    duration: 0, // seconds
                    platform: 'empty'
                }
            };
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
    </div>
</template>
