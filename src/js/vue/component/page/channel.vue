<script>
    import Counter from '../partial/counter';

    export default {
        components: {
            'c-counter': Counter
        }
    };
</script>

<template>
    <div class="row mb-5">
        <div class="col-12 pb-3">
            <h3 class="text-center">
                Channel - {{ $route.params.channel }}
            </h3>
        </div>
        <div class="col-12 col-md-6 col-xl-4">
            Chat
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