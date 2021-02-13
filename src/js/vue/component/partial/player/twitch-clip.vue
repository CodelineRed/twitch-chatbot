<script>
    export default {
        data: function() {
            return {
                video: {}
            };
        },
        mounted: function() {
            this.getParentVideo();
        },
        methods: {
            generateUrl: function(file) {
                return 'https://clips.twitch.tv/embed?clip=' + file + '&autoplay=true&parent=localhost';
            },
            getParentVideo: function() {
                const $this = this;
                $this.video = $this.$parent.video;
            }
        }
    };
</script>

<template>
    <div class="embed-responsive embed-responsive-16by9">
        <iframe class="embed-responsive-item" :src="generateUrl(video.file)" allow="autoplay" allowfullscreen></iframe>
    </div>
</template>
