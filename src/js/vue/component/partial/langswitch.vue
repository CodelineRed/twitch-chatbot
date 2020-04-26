<script>
    import bsComponent from '../../method/bs-component';
    import dataTable from '../../method/data-table';
    import slider from '../../method/slider';

    export default {
        mixins: [bsComponent, dataTable, slider],
        data: function() {
            return {
                currentLocale: window.localStorage.getItem('currentLocale') ? window.localStorage.getItem('currentLocale') : 'en',
                fallbackLocale: 'en',
                languages: ['en', 'de'],
                init: false
            };
        },
        watch: {
            currentLocale(newLocale) {
                localStorage.currentLocale = newLocale;
            }
        },
        mounted: function() {
            this.changeLang(this.currentLocale);
        },
        methods: {
            changeLang: function(lang) {
                let $this = this;
                $this.$i18n.locale = lang;
                $this.currentLocale = lang;
                window.localStorage.setItem('currentLocale', lang);

                // workaround: initSlider() is called, but it's not right translated
                // if you slide to the left, after language has changed
                setTimeout(function() {
                    if ($this.init) {
                        $this.initDataTable();
                        $this.initSlider();
                    }
                    $this.initTooltip();
                    $this.initPopover();
                    $this.init = true;
                }, 250);
            }
        }
    };
</script>

<template>
    <div class="btn-group dropup">
        <button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <font-awesome-icon :icon="['fas', 'globe']" class="fa-fw" />
        </button>
        <div class="dropdown-menu">
            <a v-for="locale in languages" :key="locale" class="dropdown-item" :class="{active: locale === currentLocale}" onclick="javascript:return false;" href="#" @click="changeLang(locale)">{{ $t("lang-" + locale) }}</a>
        </div>
    </div>
</template>
