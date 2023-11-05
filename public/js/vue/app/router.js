define(["exports","vue","vue-router","./i18n","./routes"],(function(e,t,a,r,o){"use strict";function l(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0,t=l(t),a=l(a),r=l(r),o=l(o),t.default.use(a.default),r.default.locale=localStorage.currentLocale?localStorage.currentLocale:r.default.currentLocale;const n=new a.default({routes:o.default,translateMeta:function(e,t){let a=/param-([a-z]+)/i,o=e.match(/router\.([a-z-]+)/gi),l=/\([0-9a-z,| äüöß]+\)/gi,n=new RegExp("i18n\\.([a-z-]+)("+l.source+")?","gi"),c=new RegExp("i18n\\.|"+l.source,"gi"),u=e.match(n);if(null!==o)for(let r=0;r<o.length;r++)a.test(o[r])&&"string"==typeof t.params[o[r].match(a)[1]]&&(e=e.replace(o[r],t.params[o[r].match(a)[1]])),/router\.current-route/gi.test(e)&&(e=e.replace(/router\.current-route/gi,window.location.origin+"/#"+t.path));if(null!==u)for(let t=0;t<u.length;t++){let a=[];l.test(u[t])&&(a=u[t].match(l)[0].replace(/\(|\)/g,"").split("|")),e=e.replace(u[t],r.default.t(u[t].replace(c,""),a))}return e}});n.beforeEach(((e,t,a)=>{jQuery(".tooltip.show, .popover.show").remove();const r=e.matched.slice().reverse().find((e=>e.meta&&e.meta.title)),o=e.matched.slice().reverse().find((e=>e.meta&&e.meta.metaTags)),l=e.matched.slice().reverse().find((e=>e.meta&&e.meta.linkTags));t.matched.slice().reverse().find((e=>e.meta&&e.meta.metaTags)),t.matched.slice().reverse().find((e=>e.meta&&e.meta.linkTags));return r&&(document.title=n.options.translateMeta(r.meta.title,e)),Array.from(document.querySelectorAll("[data-vue-router-controlled]")).map((e=>e.parentNode.removeChild(e))),o?(o.meta.metaTags.map((t=>{const a=document.createElement("meta");return Object.keys(t).forEach((r=>{a.setAttribute(r,n.options.translateMeta(t[r],e))})),a.setAttribute("data-vue-router-controlled",""),a})).forEach((e=>document.head.appendChild(e))),l?(l.meta.linkTags.map((t=>{const a=document.createElement("link");return Object.keys(t).forEach((r=>{a.setAttribute(r,n.options.translateMeta(t[r],e))})),a.setAttribute("data-vue-router-controlled",""),a})).forEach((e=>document.head.appendChild(e))),void a()):a()):a()}));e.default=n}));