<script>
    import slider from '../../method/slider';
    
    export default {
        mixins: [slider],
        data: function() {
            return {
                currentLocale: 'en',
                fallbackLocale: 'en',
                languages: ['en', 'de']
            };
        },
        watch: {
            currentLocale(newLocale) {
                localStorage.currentLocale = newLocale;
            }
        },
        mounted: function() {
            if (localStorage.currentLocale) {
                this.currentLocale = localStorage.currentLocale;
            }

            this.changeLang(this.currentLocale);
        },
        methods: {
            changeLang: function(lang) {
                let $this = this;
                $this.$i18n.locale = lang;
                localStorage.currentLocale = lang;

                // workaround: initSlider() is called, but it's not right translated
                // if you slide to the left, after language has changed
                setTimeout(function() {
                    $this.initSlider();
                }, 100);
            }
        }
    };
</script>

<template>
    <div class="btn-group dropup">
        <button type="button" class="btn btn-sm btn-info dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <font-awesome-icon :icon="['fas', 'globe']" />
        </button>
        <div class="dropdown-menu">
            <a v-for="lang in languages" :key="lang" class="dropdown-item" onclick="javascript:return false;" href="#" @click="changeLang(lang)">{{ $t("lang-" + lang) }}</a>
        </div>
    </div>
</template>
