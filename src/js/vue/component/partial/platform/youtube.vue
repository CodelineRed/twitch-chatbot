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
                return 'https://www.youtube.com/embed/' + file + '?rel=0&autoplay=1&controls=0&disablekb=1&showinfo=0&modestbranding=1';
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
