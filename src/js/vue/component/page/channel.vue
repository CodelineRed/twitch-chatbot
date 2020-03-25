<script>
    import Chat from '../partial/chat';
    import Counter from '../partial/counter';

    export default {
        components: {
            'c-chat': Chat,
            'c-counter': Counter
        }
    };
</script>

<template>
    <div class="row mb-5">
        <div class="col-12 pb-3">
            <h3 class="text-center">
                {{ $route.params.channel }} - {{ $t('app') }}
            </h3>
        </div>
        <div class="col-12">
            <c-chat ref="chat" />
        </div>
        <div class="col-12 col-md-6 col-xl-4">
            Raffle
        </div>
        <div class="col-12 col-md-6 col-xl-4">
            Poll
        </div>
        <div class="col-12 col-md-6 col-xl-4">
            <c-counter ref="counter" />
        </div>
    </div>
</template>