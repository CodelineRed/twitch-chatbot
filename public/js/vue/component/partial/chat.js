define(["exports","../../method/bs-component","../../method/image-lazyload"],(function(s,e,t){"use strict";function o(s){return s&&s.__esModule?s:{default:s}}Object.defineProperty(s,"__esModule",{value:!0}),s.default=void 0,e=o(e),t=o(t);var a={template:'<div class="row"> <div class="col-12"> <div class="chat p-2" :class="getChatClass()"> <div class="controls pb-2"> <div class="custom-control custom-switch float-left mr-3"> <input id="message-time" v-model="showTimestamp" type="checkbox" class="custom-control-input"> <label class="custom-control-label" for="message-time">{{ $t(\'timestamp\') }}</label> </div> <div class="custom-control custom-switch float-left mr-3"> <input id="message-badges" v-model="showBadges" type="checkbox" class="custom-control-input"> <label class="custom-control-label" for="message-badges">{{ $tc(\'badge\', 2) }}</label> </div> <div class="custom-control custom-switch float-left mr-3"> <input id="message-user-color" v-model="showUserColor" type="checkbox" class="custom-control-input"> <label class="custom-control-label" for="message-user-color">{{ $t(\'color\') }}</label> </div> <div class="custom-control custom-switch float-left mr-3"> <input id="message-pause" v-model="isPause" type="checkbox" class="custom-control-input"> <label class="custom-control-label" for="message-pause">{{ $t(\'pause\') }}</label> </div> <div class="float-left"> <a v-if="isPopout == false" href="#" onclick="javascript:return false;" @click="popoutChat()">{{ $t(\'popout\') }} <font-awesome-icon :icon="[\'fas\', \'external-link-alt\']" class="fa-fw" /></a> </div> \x3c!-- eslint-disable-next-line vue/singleline-html-element-content-newline --\x3e <div class="clearfix"></div> </div> <div class="messages" :class="{stop: isMessagesHover}" @mouseover="isMessagesHover = true" @mouseout="isMessagesHover = false"> \x3c!-- eslint-disable-next-line vue/require-v-for-key --\x3e <div v-for="(message, index) in messages" :class="getMessageClass(index, message)" class="message"> <span v-if="showTimestamp" class="timestamp mr-2" data-toggle="tooltip" data-placement="top" :title="message.createdAt|formatDateTime($t(\'datetime\'))"> [{{ message.createdAt|formatDateTime($t(\'time\')) }}] </span> <span v-if="showBadges"> \x3c!-- eslint-disable-next-line vue/require-v-for-key --\x3e <span v-for="(badge, badgeName) in message.badges" class="twitch-badge" data-toggle="tooltip" data-placement="top" :title="badge.title"> <font-awesome-icon :icon="[badge.style, badge.icon]" class="fa-fw" :class="badge.cssClass == null ? badgeName : badge.cssClass" :transform="badge.transform" /> </span> </span> <span v-if="message.user.length" class="user mr-1" :style="{color: showUserColor ? message.color : null}"> {{ message.user }} <span v-if="message.type == \'chat\'">:</span> </span> \x3c!-- eslint-disable-next-line vue/no-v-html --\x3e <span class="text mr-1" :class="{action: message.type == \'action\'}" :style="{color: message.type == \'action\' && showUserColor ? message.color : null}" v-html="message.message"></span> <span v-if="message.purge.showMessage" class="purge"> ({{ message.purge.message }}<span v-if="message.purge.reason">: {{ message.purge.reason }}</span>) </span> </div> </div> <div v-if="showScrollBottom" class="scroll-bottom" @click="scrollBottom()" @mouseover="isMessagesHover = true" @mouseout="isMessagesHover = false"> {{ $t(\'resume-auto-scroll\') }} </div> </div> </div> </div>',mixins:[e.default,t.default],data:function(){return{firstInit:!0,isMessagesHover:!1,isPause:"true"===window.localStorage.getItem("isChatPause"),isPopout:!1,messages:[],showBadges:"true"===window.localStorage.getItem("showMessageBadges"),showScrollBottom:!1,showTimestamp:"true"===window.localStorage.getItem("showMessageTimestamp"),showUserColor:"true"===window.localStorage.getItem("showMessageUserColor")}},watch:{isPause:function(){window.localStorage.setItem("isChatPause",this.isPause)},messages:function(){let s=this;setTimeout((function(){s.firstInit&&(jQuery(".messages").scrollTop(void 0===jQuery(".messages")[0]?0:jQuery(".messages")[0].scrollHeight),s.firstInit=!1),s.isPopout||s.isMessagesHover||s.initTooltip(),s.initImageLazyLoad(),jQuery(".messages:not(.stop)").scrollTop(void 0===jQuery(".messages")[0]?0:jQuery(".messages")[0].scrollHeight)}),100)},showBadges:function(){window.localStorage.setItem("showMessageBadges",this.showBadges)},showTimestamp:function(){let s=this;window.localStorage.setItem("showMessageTimestamp",this.showTimestamp),setTimeout((function(){s.initTooltip()}),100)},showUserColor:function(){window.localStorage.setItem("showMessageUserColor",this.showUserColor)}},mounted:function(){let s=this;this.getMessages(),/^#\/channel\/(.*)\/chat\/?/.test(window.location.hash)&&(this.isPopout=!0),jQuery(".messages").scroll((function(){const e=jQuery(".messages").scrollTop();e+((void 0===jQuery(".messages")[0]?0:jQuery(".messages")[0].scrollHeight)-e)-e-250>jQuery(".messages").height()?s.showScrollBottom=!0:s.showScrollBottom=!1})),this.isPopout&&(jQuery(window).resize((function(){jQuery(".chat .messages").css("height",""),jQuery(".chat .messages").height(jQuery(document).height()-jQuery(".chat .controls").outerHeight()-(parseInt(jQuery(".chat").css("padding-top"))+parseInt(jQuery(".chat").css("padding-bottom"))))})),jQuery(window).resize())},methods:{getChatClass:function(){let s=[];return this.isPopout&&s.push("popout"),s.push(this.$route.params.channel.toLowerCase()),s.join(" ")},getMessages:function(){if("function"==typeof socketWrite){const s={method:"getMessages",args:{channel:this.$root._route.params.channel.toLowerCase()},env:"node"};socketWrite(s)}},getMessageClass:function(s,e){let t=[];return 0===s&&t.push("first"),void 0!==e.purge&&e.purge.hasPurge&&t.push("purge"),t.push(e.type),t.push("channel-"+e.channelId),t.push("message-"+e.uuid),t.push("user-"+e.userId),t.join(" ")},popoutChat:function(){const s=this.$router.resolve({name:"chat",params:{channel:this.$root._route.params.channel}}).href;window.open(s,"Chat Popout","scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=750,height=750")},scrollBottom:function(){jQuery(".messages").scrollTop(void 0===jQuery(".messages")[0]?0:jQuery(".messages")[0].scrollHeight)},setMessage:function(s){this.isPause||this.$root._route.params.channel.toLowerCase()!==s.channel.toLowerCase()||(this.messages.push(s.item),this.messages.length>=100&&!this.isMessagesHover&&this.messages.shift())},setMessages:function(s){this.$root._route.params.channel.toLowerCase()===s.channel.toLowerCase()&&(this.messages=s.list)}}};s.default=a}));