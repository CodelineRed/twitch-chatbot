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
                return 'http://localhost:3060/' + file;
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
        <video class="embed-responsive-item" autoplay>
            <source :src="generateUrl(video.file)" type="video/mp4">
            No video support
        </video> 
    </div>
</template>
