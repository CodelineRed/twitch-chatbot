<script>
    export default {
        data: function() {
            return {
                status: 0
            };
        },
        mounted: function() {
            this.saveChannelToken();
        },
        methods: {
            saveChannelToken: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'saveChannelToken',
                        args: {
                            token: this.$root._route.params.token,
                            name: this.$root._route.params.name
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            setChannelTokenStatus: function(args) {
                this.status = args.status;
            }
        }
    };
</script>

<template>
    <div class="row">
        <div class="col-12 pb-5">
            <h1 class="text-center">
                {{ $t('nav-token') }} - {{ $t('app') }}
            </h1>
            <div class="row justify-content-center">
                <div class="col-12 col-md-6 col-xxl-4">
                    <p v-if="status === 0" class="text-center">
                        Please wait{{ $t('please-wait') }} <font-awesome-icon :icon="['fas', 'sync']" class="fa-spin" />
                    </p>
                    <p v-else-if="status === 1" class="text-center">
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <span v-html="$t('token-text', [$route.params.name, $route.params.token])"></span>
                    </p>
                    <p v-else class="text-center">
                        {{ $t('auth-failed') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
