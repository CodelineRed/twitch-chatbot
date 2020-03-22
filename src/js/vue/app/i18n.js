import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { locales } from './i18n-locales';
import LangSwitch from '../component/partial/langswitch';

Vue.use(VueI18n);

const i18n = new VueI18n({
    messages: Object.assign(locales),
    locale: LangSwitch.data().currentLocale,
    fallbackLocale: LangSwitch.data().fallbackLocale,
    silentFallbackWarn: true,
    silentTranslationWarn: true
});

export default i18n;
