/*!
 * vue-i18n v8.28.2 
 * (c) 2022 kazuya kawaguchi
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.VueI18n=e()}(this,(function(){"use strict";var t=["compactDisplay","currency","currencyDisplay","currencySign","localeMatcher","notation","numberingSystem","signDisplay","style","unit","unitDisplay","useGrouping","minimumIntegerDigits","minimumFractionDigits","maximumFractionDigits","minimumSignificantDigits","maximumSignificantDigits"],e=["dateStyle","timeStyle","calendar","localeMatcher","hour12","hourCycle","timeZone","formatMatcher","weekday","era","year","month","day","hour","minute","second","timeZoneName"];function n(t,e){"undefined"!=typeof console&&(console.warn("[vue-i18n] "+t),e&&console.warn(e.stack))}function a(t,e){"undefined"!=typeof console&&(console.error("[vue-i18n] "+t),e&&console.error(e.stack))}var r=Array.isArray;function i(t){return null!==t&&"object"==typeof t}function o(t){return"string"==typeof t}var s=Object.prototype.toString;function l(t){return"[object Object]"===s.call(t)}function c(t){return null==t}function u(t){return"function"==typeof t}function h(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=null,a=null;return 1===t.length?i(t[0])||r(t[0])?a=t[0]:"string"==typeof t[0]&&(n=t[0]):2===t.length&&("string"==typeof t[0]&&(n=t[0]),(i(t[1])||r(t[1]))&&(a=t[1])),{locale:n,params:a}}function f(t){return JSON.parse(JSON.stringify(t))}function p(t,e){return!!~t.indexOf(e)}var m=Object.prototype.hasOwnProperty;function _(t,e){return m.call(t,e)}function g(t){for(var e=arguments,n=Object(t),a=1;a<arguments.length;a++){var r=e[a];if(null!=r){var o=void 0;for(o in r)_(r,o)&&(i(r[o])?n[o]=g(n[o],r[o]):n[o]=r[o])}}return n}function v(t,e){if(t===e)return!0;var n=i(t),a=i(e);if(!n||!a)return!n&&!a&&String(t)===String(e);try{var o=r(t),s=r(e);if(o&&s)return t.length===e.length&&t.every((function(t,n){return v(t,e[n])}));if(o||s)return!1;var l=Object.keys(t),c=Object.keys(e);return l.length===c.length&&l.every((function(n){return v(t[n],e[n])}))}catch(t){return!1}}function d(t){return null!=t&&Object.keys(t).forEach((function(e){"string"==typeof t[e]&&(t[e]=t[e].replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;"))})),t}var b={name:"i18n",functional:!0,props:{tag:{type:[String,Boolean,Object],default:"span"},path:{type:String,required:!0},locale:{type:String},places:{type:[Array,Object]}},render:function(t,e){var a=e.data,r=e.parent,i=e.props,o=e.slots,s=r.$i18n;if(s){var l=i.path,c=i.locale,u=i.places,h=o(),f=s.i(l,c,function(t){var e;for(e in t)if("default"!==e)return!1;return Boolean(e)}(h)||u?function(t,e){var a=e?function(t){return n("`places` prop is deprecated in next major version. Please switch to Vue slots."),Array.isArray(t)?t.reduce(k,{}):Object.assign({},t)}(e):{};if(!t)return a;t=t.filter((function(t){return t.tag||""!==t.text.trim()}));var r=t.every(F);r&&n("`place` attribute is deprecated in next major version. Please switch to Vue slots.");return t.reduce(r?y:k,a)}(h.default,u):h),p=i.tag&&!0!==i.tag||!1===i.tag?i.tag:"span";return p?t(p,a,f):f}n("Cannot find VueI18n instance!")}};function y(t,e){return e.data&&e.data.attrs&&e.data.attrs.place&&(t[e.data.attrs.place]=e),t}function k(t,e,n){return t[n]=e,t}function F(t){return Boolean(t.data&&t.data.attrs&&t.data.attrs.place)}var w,T={name:"i18n-n",functional:!0,props:{tag:{type:[String,Boolean,Object],default:"span"},value:{type:Number,required:!0},format:{type:[String,Object]},locale:{type:String}},render:function(e,a){var r=a.props,s=a.parent,l=a.data,c=s.$i18n;if(!c)return n("Cannot find VueI18n instance!"),null;var u=null,h=null;o(r.format)?u=r.format:i(r.format)&&(r.format.key&&(u=r.format.key),h=Object.keys(r.format).reduce((function(e,n){var a;return p(t,n)?Object.assign({},e,((a={})[n]=r.format[n],a)):e}),null));var f=r.locale||c.locale,m=c._ntp(r.value,f,u,h),_=m.map((function(t,e){var n,a=l.scopedSlots&&l.scopedSlots[t.type];return a?a(((n={})[t.type]=t.value,n.index=e,n.parts=m,n)):t.value})),g=r.tag&&!0!==r.tag||!1===r.tag?r.tag:"span";return g?e(g,{attrs:l.attrs,class:l.class,staticClass:l.staticClass},_):_}};function $(t,e,n){I(t,n)&&W(t,e,n)}function C(t,e,n,a){if(I(t,n)){var r=n.context.$i18n;(function(t,e){var n=e.context;return t._locale===n.$i18n.locale})(t,n)&&v(e.value,e.oldValue)&&v(t._localeMessage,r.getLocaleMessage(r.locale))||W(t,e,n)}}function M(t,e,a,r){if(a.context){var i=a.context.$i18n||{};e.modifiers.preserve||i.preserveDirectiveContent||(t.textContent=""),t._vt=void 0,delete t._vt,t._locale=void 0,delete t._locale,t._localeMessage=void 0,delete t._localeMessage}else n("Vue instance does not exists in VNode context")}function I(t,e){var a=e.context;return a?!!a.$i18n||(n("VueI18n instance does not exists in Vue instance"),!1):(n("Vue instance does not exists in VNode context"),!1)}function W(t,e,a){var r,i,s=function(t){var e,n,a,r;o(t)?e=t:l(t)&&(e=t.path,n=t.locale,a=t.args,r=t.choice);return{path:e,locale:n,args:a,choice:r}}(e.value),c=s.path,u=s.locale,h=s.args,f=s.choice;if(c||u||h)if(c){var p=a.context;t._vt=t.textContent=null!=f?(r=p.$i18n).tc.apply(r,[c,f].concat(D(u,h))):(i=p.$i18n).t.apply(i,[c].concat(D(u,h))),t._locale=p.$i18n.locale,t._localeMessage=p.$i18n.getLocaleMessage(p.$i18n.locale)}else n("`path` is required in v-t directive");else n("value type not supported")}function D(t,e){var n=[];return t&&n.push(t),e&&(Array.isArray(e)||l(e))&&n.push(e),n}function S(t,e){(void 0===e&&(e={bridge:!1}),S.installed&&t===w)?n("already installed."):(S.installed=!0,((w=t).version&&Number(w.version.split(".")[0])||-1)<2?n("vue-i18n ("+S.version+") need to use Vue 2.0 or later (Vue: "+w.version+")."):(!function(t){t.prototype.hasOwnProperty("$i18n")||Object.defineProperty(t.prototype,"$i18n",{get:function(){return this._i18n}}),t.prototype.$t=function(t){for(var e=[],n=arguments.length-1;n-- >0;)e[n]=arguments[n+1];var a=this.$i18n;return a._t.apply(a,[t,a.locale,a._getMessages(),this].concat(e))},t.prototype.$tc=function(t,e){for(var n=[],a=arguments.length-2;a-- >0;)n[a]=arguments[a+2];var r=this.$i18n;return r._tc.apply(r,[t,r.locale,r._getMessages(),this,e].concat(n))},t.prototype.$te=function(t,e){var n=this.$i18n;return n._te(t,n.locale,n._getMessages(),e)},t.prototype.$d=function(t){for(var e,n=[],a=arguments.length-1;a-- >0;)n[a]=arguments[a+1];return(e=this.$i18n).d.apply(e,[t].concat(n))},t.prototype.$n=function(t){for(var e,n=[],a=arguments.length-1;a-- >0;)n[a]=arguments[a+1];return(e=this.$i18n).n.apply(e,[t].concat(n))}}(w),w.mixin(function(t){function e(){this!==this.$root&&this.$options.__INTLIFY_META__&&this.$el&&this.$el.setAttribute("data-intlify",this.$options.__INTLIFY_META__)}return void 0===t&&(t=!1),t?{mounted:e}:{beforeCreate:function(){var t=this.$options;if(t.i18n=t.i18n||(t.__i18nBridge||t.__i18n?{}:null),t.i18n)if(t.i18n instanceof q){if(t.__i18nBridge||t.__i18n)try{var e=t.i18n&&t.i18n.messages?t.i18n.messages:{};(t.__i18nBridge||t.__i18n).forEach((function(t){e=g(e,JSON.parse(t))})),Object.keys(e).forEach((function(n){t.i18n.mergeLocaleMessage(n,e[n])}))}catch(t){a("Cannot parse locale messages via custom blocks.",t)}this._i18n=t.i18n,this._i18nWatcher=this._i18n.watchI18nData()}else if(l(t.i18n)){var r=this.$root&&this.$root.$i18n&&this.$root.$i18n instanceof q?this.$root.$i18n:null;if(r&&(t.i18n.root=this.$root,t.i18n.formatter=r.formatter,t.i18n.fallbackLocale=r.fallbackLocale,t.i18n.formatFallbackMessages=r.formatFallbackMessages,t.i18n.silentTranslationWarn=r.silentTranslationWarn,t.i18n.silentFallbackWarn=r.silentFallbackWarn,t.i18n.pluralizationRules=r.pluralizationRules,t.i18n.preserveDirectiveContent=r.preserveDirectiveContent),t.__i18nBridge||t.__i18n)try{var i=t.i18n&&t.i18n.messages?t.i18n.messages:{};(t.__i18nBridge||t.__i18n).forEach((function(t){i=g(i,JSON.parse(t))})),t.i18n.messages=i}catch(t){n("Cannot parse locale messages via custom blocks.",t)}var o=t.i18n.sharedMessages;o&&l(o)&&(t.i18n.messages=g(t.i18n.messages,o)),this._i18n=new q(t.i18n),this._i18nWatcher=this._i18n.watchI18nData(),(void 0===t.i18n.sync||t.i18n.sync)&&(this._localeWatcher=this.$i18n.watchLocale()),r&&r.onComponentInstanceCreated(this._i18n)}else n("Cannot be interpreted 'i18n' option.");else this.$root&&this.$root.$i18n&&this.$root.$i18n instanceof q?this._i18n=this.$root.$i18n:t.parent&&t.parent.$i18n&&t.parent.$i18n instanceof q&&(this._i18n=t.parent.$i18n)},beforeMount:function(){var t=this.$options;t.i18n=t.i18n||(t.__i18nBridge||t.__i18n?{}:null),t.i18n?t.i18n instanceof q||l(t.i18n)?(this._i18n.subscribeDataChanging(this),this._subscribing=!0):n("Cannot be interpreted 'i18n' option."):(this.$root&&this.$root.$i18n&&this.$root.$i18n instanceof q||t.parent&&t.parent.$i18n&&t.parent.$i18n instanceof q)&&(this._i18n.subscribeDataChanging(this),this._subscribing=!0)},mounted:e,beforeDestroy:function(){if(this._i18n){var t=this;this.$nextTick((function(){t._subscribing&&(t._i18n.unsubscribeDataChanging(t),delete t._subscribing),t._i18nWatcher&&(t._i18nWatcher(),t._i18n.destroyVM(),delete t._i18nWatcher),t._localeWatcher&&(t._localeWatcher(),delete t._localeWatcher)}))}}}}(e.bridge)),w.directive("t",{bind:$,update:C,unbind:M}),w.component(b.name,b),w.component(T.name,T),w.config.optionMergeStrategies.i18n=function(t,e){return void 0===e?t:e}))}var L=function(){this._caches=Object.create(null)};L.prototype.interpolate=function(t,e){if(!e)return[t];var a=this._caches[t];return a||(a=function(t){var e=[],n=0,a="";for(;n<t.length;){var r=t[n++];if("{"===r){a&&e.push({type:"text",value:a}),a="";var i="";for(r=t[n++];void 0!==r&&"}"!==r;)i+=r,r=t[n++];var o="}"===r,s=O.test(i)?"list":o&&x.test(i)?"named":"unknown";e.push({value:i,type:s})}else"%"===r?"{"!==t[n]&&(a+=r):a+=r}return a&&e.push({type:"text",value:a}),e}(t),this._caches[t]=a),function(t,e){var a=[],r=0,o=Array.isArray(e)?"list":i(e)?"named":"unknown";if("unknown"===o)return a;for(;r<t.length;){var s=t[r];switch(s.type){case"text":a.push(s.value);break;case"list":a.push(e[parseInt(s.value,10)]);break;case"named":"named"===o?a.push(e[s.value]):n("Type of token '"+s.type+"' and format of value '"+o+"' don't match!");break;case"unknown":n("Detect 'unknown' type of token!")}r++}return a}(a,e)};var O=/^(?:\d)+/,x=/^(?:\w)+/;var N=[];N[0]={ws:[0],ident:[3,0],"[":[4],eof:[7]},N[1]={ws:[1],".":[2],"[":[4],eof:[7]},N[2]={ws:[2],ident:[3,0],0:[3,0],number:[3,0]},N[3]={ident:[3,0],0:[3,0],number:[3,0],ws:[1,1],".":[2,1],"[":[4,1],eof:[7,1]},N[4]={"'":[5,0],'"':[6,0],"[":[4,2],"]":[1,3],eof:8,else:[4,0]},N[5]={"'":[4,0],eof:8,else:[5,0]},N[6]={'"':[4,0],eof:8,else:[6,0]};var j=/^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;function E(t){if(null==t)return"eof";switch(t.charCodeAt(0)){case 91:case 93:case 46:case 34:case 39:return t;case 95:case 36:case 45:return"ident";case 9:case 10:case 13:case 160:case 65279:case 8232:case 8233:return"ws"}return"ident"}function V(t){var e,n,a,r=t.trim();return("0"!==t.charAt(0)||!isNaN(t))&&(a=r,j.test(a)?(n=(e=r).charCodeAt(0))!==e.charCodeAt(e.length-1)||34!==n&&39!==n?e:e.slice(1,-1):"*"+r)}var R=function(){this._cache=Object.create(null)};R.prototype.parsePath=function(t){var e=this._cache[t];return e||(e=function(t){var e,n,a,r,i,o,s,l=[],c=-1,u=0,h=0,f=[];function p(){var e=t[c+1];if(5===u&&"'"===e||6===u&&'"'===e)return c++,a="\\"+e,f[0](),!0}for(f[1]=function(){void 0!==n&&(l.push(n),n=void 0)},f[0]=function(){void 0===n?n=a:n+=a},f[2]=function(){f[0](),h++},f[3]=function(){if(h>0)h--,u=4,f[0]();else{if(h=0,void 0===n)return!1;if(!1===(n=V(n)))return!1;f[1]()}};null!==u;)if(c++,"\\"!==(e=t[c])||!p()){if(r=E(e),8===(i=(s=N[u])[r]||s.else||8))return;if(u=i[0],(o=f[i[1]])&&(a=void 0===(a=i[2])?e:a,!1===o()))return;if(7===u)return l}}(t),e&&(this._cache[t]=e)),e||[]},R.prototype.getPathValue=function(t,e){if(!i(t))return null;var n=this.parsePath(e);if(0===n.length)return null;for(var a=n.length,r=t,o=0;o<a;){var s=r[n[o]];if(null==s)return null;r=s,o++}return r};var P,H=/<\/?[\w\s="/.':;#-\/]+>/,A=/(?:@(?:\.[a-zA-Z]+)?:(?:[\w\-_|./]+|\([\w\-_:|./]+\)))/g,B=/^@(?:\.([a-zA-Z]+))?:/,z=/[()]/g,U={upper:function(t){return t.toLocaleUpperCase()},lower:function(t){return t.toLocaleLowerCase()},capitalize:function(t){return""+t.charAt(0).toLocaleUpperCase()+t.substr(1)}},G=new L,q=function(t){var e=this;void 0===t&&(t={}),!w&&"undefined"!=typeof window&&window.Vue&&S(window.Vue);var n=t.locale||"en-US",a=!1!==t.fallbackLocale&&(t.fallbackLocale||"en-US"),r=t.messages||{},i=t.dateTimeFormats||t.datetimeFormats||{},o=t.numberFormats||{};this._vm=null,this._formatter=t.formatter||G,this._modifiers=t.modifiers||{},this._missing=t.missing||null,this._root=t.root||null,this._sync=void 0===t.sync||!!t.sync,this._fallbackRoot=void 0===t.fallbackRoot||!!t.fallbackRoot,this._fallbackRootWithEmptyString=void 0===t.fallbackRootWithEmptyString||!!t.fallbackRootWithEmptyString,this._formatFallbackMessages=void 0!==t.formatFallbackMessages&&!!t.formatFallbackMessages,this._silentTranslationWarn=void 0!==t.silentTranslationWarn&&t.silentTranslationWarn,this._silentFallbackWarn=void 0!==t.silentFallbackWarn&&!!t.silentFallbackWarn,this._dateTimeFormatters={},this._numberFormatters={},this._path=new R,this._dataListeners=new Set,this._componentInstanceCreatedListener=t.componentInstanceCreatedListener||null,this._preserveDirectiveContent=void 0!==t.preserveDirectiveContent&&!!t.preserveDirectiveContent,this.pluralizationRules=t.pluralizationRules||{},this._warnHtmlInMessage=t.warnHtmlInMessage||"off",this._postTranslation=t.postTranslation||null,this._escapeParameterHtml=t.escapeParameterHtml||!1,"__VUE_I18N_BRIDGE__"in t&&(this.__VUE_I18N_BRIDGE__=t.__VUE_I18N_BRIDGE__),this.getChoiceIndex=function(t,n){var a=Object.getPrototypeOf(e);if(a&&a.getChoiceIndex)return a.getChoiceIndex.call(e,t,n);var r,i;return e.locale in e.pluralizationRules?e.pluralizationRules[e.locale].apply(e,[t,n]):(r=t,i=n,r=Math.abs(r),2===i?r?r>1?1:0:1:r?Math.min(r,2):0)},this._exist=function(t,n){return!(!t||!n)&&(!c(e._path.getPathValue(t,n))||!!t[n])},"warn"!==this._warnHtmlInMessage&&"error"!==this._warnHtmlInMessage||Object.keys(r).forEach((function(t){e._checkLocaleMessage(t,e._warnHtmlInMessage,r[t])})),this._initVM({locale:n,fallbackLocale:a,messages:r,dateTimeFormats:i,numberFormats:o})},J={vm:{configurable:!0},messages:{configurable:!0},dateTimeFormats:{configurable:!0},numberFormats:{configurable:!0},availableLocales:{configurable:!0},locale:{configurable:!0},fallbackLocale:{configurable:!0},formatFallbackMessages:{configurable:!0},missing:{configurable:!0},formatter:{configurable:!0},silentTranslationWarn:{configurable:!0},silentFallbackWarn:{configurable:!0},preserveDirectiveContent:{configurable:!0},warnHtmlInMessage:{configurable:!0},postTranslation:{configurable:!0},sync:{configurable:!0}};return q.prototype._checkLocaleMessage=function(t,e,i){var s=function(t,e,i,c){if(l(i))Object.keys(i).forEach((function(n){var a=i[n];l(a)?(c.push(n),c.push("."),s(t,e,a,c),c.pop(),c.pop()):(c.push(n),s(t,e,a,c),c.pop())}));else if(r(i))i.forEach((function(n,a){l(n)?(c.push("["+a+"]"),c.push("."),s(t,e,n,c),c.pop(),c.pop()):(c.push("["+a+"]"),s(t,e,n,c),c.pop())}));else if(o(i)){if(H.test(i)){var u="Detected HTML in message '"+i+"' of keypath '"+c.join("")+"' at '"+e+"'. Consider component interpolation with '<i18n>' to avoid XSS. See https://bit.ly/2ZqJzkp";"warn"===t?n(u):"error"===t&&a(u)}}};s(e,t,i,[])},q.prototype._initVM=function(t){var e=w.config.silent;w.config.silent=!0,this._vm=new w({data:t,__VUE18N__INSTANCE__:!0}),w.config.silent=e},q.prototype.destroyVM=function(){this._vm.$destroy()},q.prototype.subscribeDataChanging=function(t){this._dataListeners.add(t)},q.prototype.unsubscribeDataChanging=function(t){!function(t,e){if(t.delete(e));}(this._dataListeners,t)},q.prototype.watchI18nData=function(){var t=this;return this._vm.$watch("$data",(function(){for(var e,n,a=(e=t._dataListeners,n=[],e.forEach((function(t){return n.push(t)})),n),r=a.length;r--;)w.nextTick((function(){a[r]&&a[r].$forceUpdate()}))}),{deep:!0})},q.prototype.watchLocale=function(t){if(t){if(!this.__VUE_I18N_BRIDGE__)return null;var e=this,n=this._vm;return this.vm.$watch("locale",(function(a){n.$set(n,"locale",a),e.__VUE_I18N_BRIDGE__&&t&&(t.locale.value=a),n.$forceUpdate()}),{immediate:!0})}if(!this._sync||!this._root)return null;var a=this._vm;return this._root.$i18n.vm.$watch("locale",(function(t){a.$set(a,"locale",t),a.$forceUpdate()}),{immediate:!0})},q.prototype.onComponentInstanceCreated=function(t){this._componentInstanceCreatedListener&&this._componentInstanceCreatedListener(t,this)},J.vm.get=function(){return this._vm},J.messages.get=function(){return f(this._getMessages())},J.dateTimeFormats.get=function(){return f(this._getDateTimeFormats())},J.numberFormats.get=function(){return f(this._getNumberFormats())},J.availableLocales.get=function(){return Object.keys(this.messages).sort()},J.locale.get=function(){return this._vm.locale},J.locale.set=function(t){this._vm.$set(this._vm,"locale",t)},J.fallbackLocale.get=function(){return this._vm.fallbackLocale},J.fallbackLocale.set=function(t){this._localeChainCache={},this._vm.$set(this._vm,"fallbackLocale",t)},J.formatFallbackMessages.get=function(){return this._formatFallbackMessages},J.formatFallbackMessages.set=function(t){this._formatFallbackMessages=t},J.missing.get=function(){return this._missing},J.missing.set=function(t){this._missing=t},J.formatter.get=function(){return this._formatter},J.formatter.set=function(t){this._formatter=t},J.silentTranslationWarn.get=function(){return this._silentTranslationWarn},J.silentTranslationWarn.set=function(t){this._silentTranslationWarn=t},J.silentFallbackWarn.get=function(){return this._silentFallbackWarn},J.silentFallbackWarn.set=function(t){this._silentFallbackWarn=t},J.preserveDirectiveContent.get=function(){return this._preserveDirectiveContent},J.preserveDirectiveContent.set=function(t){this._preserveDirectiveContent=t},J.warnHtmlInMessage.get=function(){return this._warnHtmlInMessage},J.warnHtmlInMessage.set=function(t){var e=this,n=this._warnHtmlInMessage;if(this._warnHtmlInMessage=t,n!==t&&("warn"===t||"error"===t)){var a=this._getMessages();Object.keys(a).forEach((function(t){e._checkLocaleMessage(t,e._warnHtmlInMessage,a[t])}))}},J.postTranslation.get=function(){return this._postTranslation},J.postTranslation.set=function(t){this._postTranslation=t},J.sync.get=function(){return this._sync},J.sync.set=function(t){this._sync=t},q.prototype._getMessages=function(){return this._vm.messages},q.prototype._getDateTimeFormats=function(){return this._vm.dateTimeFormats},q.prototype._getNumberFormats=function(){return this._vm.numberFormats},q.prototype._warnDefault=function(t,e,a,r,i,s){if(!c(a))return a;if(this._missing){var l=this._missing.apply(null,[t,e,r,i]);if(o(l))return l}else this._isSilentTranslationWarn(e)||n("Cannot translate the value of keypath '"+e+"'. Use the value of keypath as default.");if(this._formatFallbackMessages){var u=h.apply(void 0,i);return this._render(e,s,u.params,e)}return e},q.prototype._isFallbackRoot=function(t){return(this._fallbackRootWithEmptyString?!t:c(t))&&!c(this._root)&&this._fallbackRoot},q.prototype._isSilentFallbackWarn=function(t){return this._silentFallbackWarn instanceof RegExp?this._silentFallbackWarn.test(t):this._silentFallbackWarn},q.prototype._isSilentFallback=function(t,e){return this._isSilentFallbackWarn(e)&&(this._isFallbackRoot()||t!==this.fallbackLocale)},q.prototype._isSilentTranslationWarn=function(t){return this._silentTranslationWarn instanceof RegExp?this._silentTranslationWarn.test(t):this._silentTranslationWarn},q.prototype._interpolate=function(t,e,a,i,s,h,f){if(!e)return null;var p,m=this._path.getPathValue(e,a);if(r(m)||l(m))return m;if(c(m)){if(!l(e))return null;if(!o(p=e[a])&&!u(p))return this._isSilentTranslationWarn(a)||this._isSilentFallback(t,a)||n("Value of key '"+a+"' is not a string or function !"),null}else{if(!o(m)&&!u(m))return this._isSilentTranslationWarn(a)||this._isSilentFallback(t,a)||n("Value of key '"+a+"' is not a string or function!"),null;p=m}return o(p)&&(p.indexOf("@:")>=0||p.indexOf("@.")>=0)&&(p=this._link(t,e,p,i,"raw",h,f)),this._render(p,s,h,a)},q.prototype._link=function(t,e,a,i,o,s,l){var c=a,u=c.match(A);for(var h in u)if(u.hasOwnProperty(h)){var f=u[h],m=f.match(B),_=m[0],g=m[1],v=f.replace(_,"").replace(z,"");if(p(l,v))return n('Circular reference found. "'+f+'" is already visited in the chain of '+l.reverse().join(" <- ")),c;l.push(v);var d=this._interpolate(t,e,v,i,"raw"===o?"string":o,"raw"===o?void 0:s,l);if(this._isFallbackRoot(d)){if(this._isSilentTranslationWarn(v)||n("Fall back to translate the link placeholder '"+v+"' with root locale."),!this._root)throw Error("unexpected error");var b=this._root.$i18n;d=b._translate(b._getMessages(),b.locale,b.fallbackLocale,v,i,o,s)}d=this._warnDefault(t,v,d,i,r(s)?s:[s],o),this._modifiers.hasOwnProperty(g)?d=this._modifiers[g](d):U.hasOwnProperty(g)&&(d=U[g](d)),l.pop(),c=d?c.replace(f,d):c}return c},q.prototype._createMessageContext=function(t,e,n,a){var o=this,s=r(t)?t:[],l=i(t)?t:{},c=this._getMessages(),u=this.locale;return{list:function(t){return s[t]},named:function(t){return l[t]},values:t,formatter:e,path:n,messages:c,locale:u,linked:function(t){return o._interpolate(u,c[u]||{},t,null,a,void 0,[t])}}},q.prototype._render=function(t,e,n,a){if(u(t))return t(this._createMessageContext(n,this._formatter||G,a,e));var r=this._formatter.interpolate(t,n,a);return r||(r=G.interpolate(t,n,a)),"string"!==e||o(r)?r:r.join("")},q.prototype._appendItemToChain=function(t,e,n){var a=!1;return p(t,e)||(a=!0,e&&(a="!"!==e[e.length-1],e=e.replace(/!/g,""),t.push(e),n&&n[e]&&(a=n[e]))),a},q.prototype._appendLocaleToChain=function(t,e,n){var a,r=e.split("-");do{var i=r.join("-");a=this._appendItemToChain(t,i,n),r.splice(-1,1)}while(r.length&&!0===a);return a},q.prototype._appendBlockToChain=function(t,e,n){for(var a=!0,r=0;r<e.length&&"boolean"==typeof a;r++){var i=e[r];o(i)&&(a=this._appendLocaleToChain(t,i,n))}return a},q.prototype._getLocaleChain=function(t,e){if(""===t)return[];this._localeChainCache||(this._localeChainCache={});var n=this._localeChainCache[t];if(!n){e||(e=this.fallbackLocale),n=[];for(var a,s=[t];r(s);)s=this._appendBlockToChain(n,s,e);(s=o(a=r(e)?e:i(e)?e.default?e.default:null:e)?[a]:a)&&this._appendBlockToChain(n,s,null),this._localeChainCache[t]=n}return n},q.prototype._translate=function(t,e,a,r,i,o,s){for(var l,u=this._getLocaleChain(e,a),h=0;h<u.length;h++){var f=u[h];if(!c(l=this._interpolate(f,t[f],r,i,o,s,[r])))return f===e||this._isSilentTranslationWarn(r)||this._isSilentFallbackWarn(r)||n("Fall back to translate the keypath '"+r+"' with '"+f+"' locale."),l}return null},q.prototype._t=function(t,e,a,r){for(var i,o=[],s=arguments.length-4;s-- >0;)o[s]=arguments[s+4];if(!t)return"";var l=h.apply(void 0,o);this._escapeParameterHtml&&(l.params=d(l.params));var c=l.locale||e,u=this._translate(a,c,this.fallbackLocale,t,r,"string",l.params);if(this._isFallbackRoot(u)){if(this._isSilentTranslationWarn(t)||this._isSilentFallbackWarn(t)||n("Fall back to translate the keypath '"+t+"' with root locale."),!this._root)throw Error("unexpected error");return(i=this._root).$t.apply(i,[t].concat(o))}return u=this._warnDefault(c,t,u,r,o,"string"),this._postTranslation&&null!=u&&(u=this._postTranslation(u,t)),u},q.prototype.t=function(t){for(var e,n=[],a=arguments.length-1;a-- >0;)n[a]=arguments[a+1];return(e=this)._t.apply(e,[t,this.locale,this._getMessages(),null].concat(n))},q.prototype._i=function(t,e,a,r,i){var o=this._translate(a,e,this.fallbackLocale,t,r,"raw",i);if(this._isFallbackRoot(o)){if(this._isSilentTranslationWarn(t)||n("Fall back to interpolate the keypath '"+t+"' with root locale."),!this._root)throw Error("unexpected error");return this._root.$i18n.i(t,e,i)}return this._warnDefault(e,t,o,r,[i],"raw")},q.prototype.i=function(t,e,n){return t?(o(e)||(e=this.locale),this._i(t,e,this._getMessages(),null,n)):""},q.prototype._tc=function(t,e,n,a,r){for(var i,o=[],s=arguments.length-5;s-- >0;)o[s]=arguments[s+5];if(!t)return"";void 0===r&&(r=1);var l={count:r,n:r},c=h.apply(void 0,o);return c.params=Object.assign(l,c.params),o=null===c.locale?[c.params]:[c.locale,c.params],this.fetchChoice((i=this)._t.apply(i,[t,e,n,a].concat(o)),r)},q.prototype.fetchChoice=function(t,e){if(!t||!o(t))return null;var n=t.split("|");return n[e=this.getChoiceIndex(e,n.length)]?n[e].trim():t},q.prototype.tc=function(t,e){for(var n,a=[],r=arguments.length-2;r-- >0;)a[r]=arguments[r+2];return(n=this)._tc.apply(n,[t,this.locale,this._getMessages(),null,e].concat(a))},q.prototype._te=function(t,e,n){for(var a=[],r=arguments.length-3;r-- >0;)a[r]=arguments[r+3];var i=h.apply(void 0,a).locale||e;return this._exist(n[i],t)},q.prototype.te=function(t,e){return this._te(t,this.locale,this._getMessages(),e)},q.prototype.getLocaleMessage=function(t){return f(this._vm.messages[t]||{})},q.prototype.setLocaleMessage=function(t,e){"warn"!==this._warnHtmlInMessage&&"error"!==this._warnHtmlInMessage||this._checkLocaleMessage(t,this._warnHtmlInMessage,e),this._vm.$set(this._vm.messages,t,e)},q.prototype.mergeLocaleMessage=function(t,e){"warn"!==this._warnHtmlInMessage&&"error"!==this._warnHtmlInMessage||this._checkLocaleMessage(t,this._warnHtmlInMessage,e),this._vm.$set(this._vm.messages,t,g(void 0!==this._vm.messages[t]&&Object.keys(this._vm.messages[t]).length?Object.assign({},this._vm.messages[t]):{},e))},q.prototype.getDateTimeFormat=function(t){return f(this._vm.dateTimeFormats[t]||{})},q.prototype.setDateTimeFormat=function(t,e){this._vm.$set(this._vm.dateTimeFormats,t,e),this._clearDateTimeFormat(t,e)},q.prototype.mergeDateTimeFormat=function(t,e){this._vm.$set(this._vm.dateTimeFormats,t,g(this._vm.dateTimeFormats[t]||{},e)),this._clearDateTimeFormat(t,e)},q.prototype._clearDateTimeFormat=function(t,e){for(var n in e){var a=t+"__"+n;this._dateTimeFormatters.hasOwnProperty(a)&&delete this._dateTimeFormatters[a]}},q.prototype._localizeDateTime=function(t,e,a,r,i,o){for(var s=e,l=r[s],u=this._getLocaleChain(e,a),h=0;h<u.length;h++){var f=s,p=u[h];if(s=p,!c(l=r[p])&&!c(l[i]))break;p===e||this._isSilentTranslationWarn(i)||this._isSilentFallbackWarn(i)||n("Fall back to '"+p+"' datetime formats from '"+f+"' datetime formats.")}if(c(l)||c(l[i]))return null;var m,_=l[i];if(o)m=new Intl.DateTimeFormat(s,Object.assign({},_,o));else{var g=s+"__"+i;(m=this._dateTimeFormatters[g])||(m=this._dateTimeFormatters[g]=new Intl.DateTimeFormat(s,_))}return m.format(t)},q.prototype._d=function(t,e,a,r){if(!q.availabilities.dateTimeFormat)return n("Cannot format a Date value due to not supported Intl.DateTimeFormat."),"";if(!a)return(r?new Intl.DateTimeFormat(e,r):new Intl.DateTimeFormat(e)).format(t);var i=this._localizeDateTime(t,e,this.fallbackLocale,this._getDateTimeFormats(),a,r);if(this._isFallbackRoot(i)){if(this._isSilentTranslationWarn(a)||this._isSilentFallbackWarn(a)||n("Fall back to datetime localization of root: key '"+a+"'."),!this._root)throw Error("unexpected error");return this._root.$i18n.d(t,a,e)}return i||""},q.prototype.d=function(t){for(var n=[],a=arguments.length-1;a-- >0;)n[a]=arguments[a+1];var r=this.locale,s=null,l=null;return 1===n.length?(o(n[0])?s=n[0]:i(n[0])&&(n[0].locale&&(r=n[0].locale),n[0].key&&(s=n[0].key)),l=Object.keys(n[0]).reduce((function(t,a){var r;return p(e,a)?Object.assign({},t,((r={})[a]=n[0][a],r)):t}),null)):2===n.length&&(o(n[0])&&(s=n[0]),o(n[1])&&(r=n[1])),this._d(t,r,s,l)},q.prototype.getNumberFormat=function(t){return f(this._vm.numberFormats[t]||{})},q.prototype.setNumberFormat=function(t,e){this._vm.$set(this._vm.numberFormats,t,e),this._clearNumberFormat(t,e)},q.prototype.mergeNumberFormat=function(t,e){this._vm.$set(this._vm.numberFormats,t,g(this._vm.numberFormats[t]||{},e)),this._clearNumberFormat(t,e)},q.prototype._clearNumberFormat=function(t,e){for(var n in e){var a=t+"__"+n;this._numberFormatters.hasOwnProperty(a)&&delete this._numberFormatters[a]}},q.prototype._getNumberFormatter=function(t,e,a,r,i,o){for(var s=e,l=r[s],u=this._getLocaleChain(e,a),h=0;h<u.length;h++){var f=s,p=u[h];if(s=p,!c(l=r[p])&&!c(l[i]))break;p===e||this._isSilentTranslationWarn(i)||this._isSilentFallbackWarn(i)||n("Fall back to '"+p+"' number formats from '"+f+"' number formats.")}if(c(l)||c(l[i]))return null;var m,_=l[i];if(o)m=new Intl.NumberFormat(s,Object.assign({},_,o));else{var g=s+"__"+i;(m=this._numberFormatters[g])||(m=this._numberFormatters[g]=new Intl.NumberFormat(s,_))}return m},q.prototype._n=function(t,e,a,r){if(!q.availabilities.numberFormat)return n("Cannot format a Number value due to not supported Intl.NumberFormat."),"";if(!a)return(r?new Intl.NumberFormat(e,r):new Intl.NumberFormat(e)).format(t);var i=this._getNumberFormatter(t,e,this.fallbackLocale,this._getNumberFormats(),a,r),o=i&&i.format(t);if(this._isFallbackRoot(o)){if(this._isSilentTranslationWarn(a)||this._isSilentFallbackWarn(a)||n("Fall back to number localization of root: key '"+a+"'."),!this._root)throw Error("unexpected error");return this._root.$i18n.n(t,Object.assign({},{key:a,locale:e},r))}return o||""},q.prototype.n=function(e){for(var n=[],a=arguments.length-1;a-- >0;)n[a]=arguments[a+1];var r=this.locale,s=null,l=null;return 1===n.length?o(n[0])?s=n[0]:i(n[0])&&(n[0].locale&&(r=n[0].locale),n[0].key&&(s=n[0].key),l=Object.keys(n[0]).reduce((function(e,a){var r;return p(t,a)?Object.assign({},e,((r={})[a]=n[0][a],r)):e}),null)):2===n.length&&(o(n[0])&&(s=n[0]),o(n[1])&&(r=n[1])),this._n(e,r,s,l)},q.prototype._ntp=function(t,e,a,r){if(!q.availabilities.numberFormat)return n("Cannot format to parts a Number value due to not supported Intl.NumberFormat."),[];if(!a)return(r?new Intl.NumberFormat(e,r):new Intl.NumberFormat(e)).formatToParts(t);var i=this._getNumberFormatter(t,e,this.fallbackLocale,this._getNumberFormats(),a,r),o=i&&i.formatToParts(t);if(this._isFallbackRoot(o)){if(this._isSilentTranslationWarn(a)||n("Fall back to format number to parts of root: key '"+a+"' ."),!this._root)throw Error("unexpected error");return this._root.$i18n._ntp(t,e,a,r)}return o||[]},Object.defineProperties(q.prototype,J),Object.defineProperty(q,"availabilities",{get:function(){if(!P){var t="undefined"!=typeof Intl;P={dateTimeFormat:t&&void 0!==Intl.DateTimeFormat,numberFormat:t&&void 0!==Intl.NumberFormat}}return P}}),q.install=S,q.version="8.28.2",q}));