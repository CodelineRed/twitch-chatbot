<script>
    import Chat from '../partial/chat';
    import Counter from '../partial/counter';
    import Playlist from '../partial/playlist';

    export default {
        components: {
            'c-chat': Chat,
            'c-counter': Counter,
            'c-playlist': Playlist
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
        <div class="col-12 pb-3">
            <c-chat ref="chat" />
        </div>
        <div class="col-12 pb-3">
            <c-playlist ref="playlist" />
        </div>
        <div class="col-12 col-lg-6 pb-3">
            Raffle
        </div>
        <div class="col-12 col-lg-6 pb-3">
            Poll
        </div>
        <div class="col-12 col-lg-6 pb-3">
            <c-counter ref="counter" />
        </div>
    </div>
</template>