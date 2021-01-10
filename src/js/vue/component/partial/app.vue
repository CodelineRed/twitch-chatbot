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

            let tokenRegExp = /access_token=([a-z0-9]+)/;
            if (tokenRegExp.test(document.location.hash)) {
                // redirect to token page
                document.location.href = this.$router.resolve({
                    name: 'token',
                    params: {
                        token: document.location.hash.match(tokenRegExp)[1],
                        name: 'oauthToken'
                    }
                }).href;
            }
        }
    };
</script>

<template>
    <component :is="layout" ref="layout" />
</template>
