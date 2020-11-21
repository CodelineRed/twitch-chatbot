define(["exports","../partial/chat","../partial/commands","../partial/counter","../partial/playlist","../partial/poll","../partial/raffle"],(function(t,e,o,s,n,l,a){"use strict";function c(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,e=c(e),o=c(o),s=c(s),n=c(n),l=c(l),a=c(a);var d={template:'<div class="row mb-5 channel"><div class="col-12 pb-3"><h3 class="text-center">{{ $route.params.channel }} - {{ $t(\'app\') }}&nbsp;<span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t(\'components-order\')"><button type="button" class="btn btn-sm btn-primary btn-fs1rem" data-toggle="modal" data-target="#components-order"><font-awesome-icon :icon="[\'fas\', \'th\']" class="fa-fw" /></button></span>&nbsp;<router-link class="btn btn-sm btn-primary btn-fs1rem" data-toggle="tooltip" data-placement="top" :title="$t(\'statistic\')" :to="{name: \'statistic\', params: {channel: $route.params.channel}}"><font-awesome-icon :icon="[\'fas\', \'chart-pie\']" class="fa-fw" /></router-link></h3></div>\x3c!-- eslint-disable-next-line vue/require-v-for-key --\x3e<div v-for="(properties, component, index) in componentsOrder" :class="getComponentClass(properties, index)"><component :is="(\'c-\' + component)" :ref="component" /></div><div class="col-12"><div id="components-order" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="components-order-modal-title" aria-hidden="true"><div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document"><div class="modal-content"><div class="modal-header"><h5 id="components-order-modal-title" class="modal-title">{{ $t(\'components-order\') }}</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div class="row"><div class="col-12 form-search"><div class="table-responsive"><table id="componentsOrderTable" class="table table-striped table-hover table-dark"><thead><tr><th scope="col">#</th><th scope="col">{{ $tc(\'component\', 2) }}</th><th scope="col">{{ $t(\'show\') }}</th><th scope="col" colspan="2">{{ $t(\'smartphone\') }}</th><th scope="col">{{ $t(\'tablet\') }}</th><th scope="col" colspan="3">{{ $t(\'computer\') }}</th></tr></thead><tbody>\x3c!-- eslint-disable-next-line vue/require-v-for-key --\x3e<tr v-for="(properties, component, index) in componentsOrder"><td class="index"><div v-if="index > 0" class="move move-up" @click="moveComponent(component, -1, index)"><font-awesome-icon :icon="[\'fas\', \'chevron-right\']" class="fa-fw" :transform="{rotate: -90}" /></div><div v-if="index + 1 < Object.keys(componentsOrder).length" class="move move-down" @click="moveComponent(component, 1, index)"><font-awesome-icon :icon="[\'fas\', \'chevron-right\']" class="fa-fw" :transform="{rotate: 90}" /></div>{{ index + 1 }}</td><td>{{ component }}</td><td><div class="custom-control custom-switch"><input id="components-order-show" v-model="componentsOrder[component].show" type="checkbox" class="custom-control-input" @change="saveComponentsOrder()"><label for="components-order-show" class="custom-control-label">&nbsp;</label></div></td><td v-for="(width, breakpoint) in properties.cols" :key="breakpoint"><select v-model.number="componentsOrder[component].cols[breakpoint]" class="custom-select" @change="saveComponentsOrder()"><option value="0">{{ $t(\'default\') }}</option><option v-for="bpWidth in 12" :key="bpWidth" :value="bpWidth" :selected="bpWidth === width">{{ breakpoint }} {{ bpWidth }}</option></select></td></tr></tbody></table></div></div></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button></div></div></div></div></div></div>',components:{"c-chat":e.default,"c-commands":o.default,"c-counter":s.default,"c-playlist":n.default,"c-poll":l.default,"c-raffle":a.default},data:function(){return{componentsOrder:window.localStorage.getItem("componentsOrder")?JSON.parse(window.localStorage.getItem("componentsOrder")):null}},mounted:function(){null===this.componentsOrder&&(this.componentsOrder={chat:{show:!0,cols:{xs:12,sm:0,md:0,lg:0,xl:0,xxl:0}},poll:{show:!0,cols:{xs:12,sm:0,md:6,lg:0,xl:0,xxl:0}},raffle:{show:!0,cols:{xs:12,sm:0,md:6,lg:0,xl:0,xxl:0}},commands:{show:!0,cols:{xs:12,sm:0,md:0,lg:9,xl:0,xxl:7}},counter:{show:!0,cols:{xs:12,sm:6,md:4,lg:3,xl:0,xxl:0}},playlist:{show:!0,cols:{xs:12,sm:0,md:0,lg:0,xl:0,xxl:0}}},this.saveComponentsOrder())},methods:{getComponentClass:function(t,e){let o=Object.keys(t.cols),s="";for(let e=0;e<o.length;e++)t.cols[o[e]]&&("xs"===o[e]?s+=`col-${t.cols[o[e]]} `:s+=`col-${o[e]}-${t.cols[o[e]]} `);return t.show||(s+="d-none "),Object.keys(this.componentsOrder).length-1!==e&&(s+="pb-3"),s},moveComponent:function(t,e,o){let s={},n=Object.keys(this.componentsOrder);n[o]=n[o+e],n[o+e]=t;for(let t=0;t<n.length;t++)s[n[t]]=this.componentsOrder[n[t]];this.componentsOrder=s,this.saveComponentsOrder()},saveComponentsOrder:function(){window.localStorage.setItem("componentsOrder",JSON.stringify(this.componentsOrder))}}};t.default=d}));