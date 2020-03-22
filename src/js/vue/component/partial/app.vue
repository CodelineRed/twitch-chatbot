<script>
    const layout = 'default';

    export default {
        computed: {
            layout() {
                return 'l-' + (this.$route.meta.layout || layout);
            }
        },
        mounted: function() {
            jQuery('html').attr('lang', this.$t('lang'));
            jQuery('html').removeClass('no-js');
        }
    };
</script>

<template>
    <component :is="layout" ref="layout" />
</template>
