<script>
    import Channels from '../partial/channels';

    export default {
        components: {
            'c-channels': Channels
        }
    };
</script>

<template>
    <div class="row mb-5">
        <div class="col-12">
            <h3 class="text-center mb-4">
                {{ $tc('channel', 2) }} - {{ $t('app') }}
            </h3>
            <c-channels ref="channels" />
        </div>
    </div>
</template>
