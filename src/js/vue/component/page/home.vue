<script>
    import imageLazyLoad from '../../method/image-lazyload';
    import slider from '../../method/slider';
    import Channels from '../partial/channels';
    
    export default {
        components: {
            'c-channels': Channels
        },
        mixins: [imageLazyLoad, slider],
        mounted: function() {
            jQuery('[data-toggle="tooltip"]').tooltip();

            this.initImageLazyLoad();
            this.initSlider();
        }
    };
</script>

<template>
    <div class="row mb-5">
        <div class="col-12">
            <h3 class="text-center mb-4">
                Channels
            </h3>
            <c-channels ref="channels" />
        </div>
    </div>
</template>
