<script>
    export default {

    };
</script>

<template>
    <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-xl-6 pb-5">
            <h1 class="text-center">
                {{ $t('nav-error') }} - {{ $t('app') }}
            </h1>
            <p>{{ $t('page-not-found') }} <font-awesome-icon :icon="['far', 'sad-cry']" /></p>
        </div>
    </div>
</template>
