<script>
    import LangSwitch from './langswitch';
    
    export default {
        components: {
            'c-langswitch': LangSwitch
        }
    };
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="d-inline-block pr-2">
                    <c-langswitch ref="langswitch" />
                </div>
                <router-link class="btn btn-sm btn-primary" :to="{name: 'index'}"><font-awesome-icon :icon="['fas', 'home']" class="fa-fw" /></router-link>
            </div>
        </div>
    </div>
</template>
