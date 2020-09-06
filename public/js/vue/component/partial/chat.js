define(["exports", "../../method/bs-component", "../../method/image-lazyload"], function (_exports, _bsComponent, _imageLazyload) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _bsComponent = _interopRequireDefault(_bsComponent);
  _imageLazyload = _interopRequireDefault(_imageLazyload);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  var _default = {
    template: '<div class="row"><div class="col-12"><div class="chat p-2" :class="getChatClass()"><div class="controls pb-2"><div class="custom-control custom-switch float-left mr-3"><input id="message-time" v-model="showTimestamp" type="checkbox" class="custom-control-input"><label class="custom-control-label" for="message-time">{{ $t(&#39;timestamp&#39;) }}</label></div><div class="custom-control custom-switch float-left mr-3"><input id="message-badges" v-model="showBadges" type="checkbox" class="custom-control-input"><label class="custom-control-label" for="message-badges">{{ $tc(&#39;badge&#39;, 2) }}</label></div><div class="custom-control custom-switch float-left mr-3"><input id="message-user-color" v-model="showUserColor" type="checkbox" class="custom-control-input"><label class="custom-control-label" for="message-user-color">{{ $t(&#39;color&#39;) }}</label></div><div class="custom-control custom-switch float-left mr-3"><input id="message-pause" v-model="isPause" type="checkbox" class="custom-control-input"><label class="custom-control-label" for="message-pause">{{ $t(&#39;pause&#39;) }}</label></div><div class="float-left"><a v-if="isPopout == false" href="#" onclick="javascript:return false;" @click="popoutChat()">{{ $t(&#39;popout&#39;) }} <font-awesome-icon :icon="[&#39;fas&#39;, &#39;external-link-alt&#39;]" class="fa-fw"></font-awesome-icon></a></div><!-- eslint-disable-next-line vue/singleline-html-element-content-newline --><div class="clearfix"></div></div><div class="messages" :class="{stop: isMessagesHover}" @mouseover="isMessagesHover = true" @mouseout="isMessagesHover = false"><!-- eslint-disable-next-line vue/require-v-for-key --><div v-for="(message, index) in messages" :class="getMessageClass(index, message)" class="message"><span v-if="showTimestamp" class="timestamp mr-2" data-toggle="tooltip" data-placement="top" :title="message.createdAt|formatDateTime($t(&#39;datetime&#39;))">[{{ message.createdAt|formatDateTime($t(&#39;time&#39;)) }}]</span><span v-if="showBadges"><!-- eslint-disable-next-line vue/require-v-for-key --><span v-for="(badge, badgeName) in message.badges" class="twitch-badge" data-toggle="tooltip" data-placement="top" :title="badge.title"><font-awesome-icon :icon="[badge.style, badge.icon]" class="fa-fw" :class="badge.cssClass == null ? badgeName : badge.cssClass" :transform="badge.transform"></font-awesome-icon></span></span><span v-if="message.user.length" class="user mr-1" :style="{color: showUserColor ? message.color : null}">{{ message.user }}<span v-if="message.type == &#39;chat&#39;">:</span></span><!-- eslint-disable-next-line vue/no-v-html --><span class="text mr-1" :class="{action: message.type == &#39;action&#39;}" :style="{color: message.type == &#39;action&#39; &amp;&amp; showUserColor ? message.color : null}" v-html="message.message"></span><span v-if="message.purge.showMessage" class="purge">({{ message.purge.message }}<span v-if="message.purge.reason">: {{ message.purge.reason }}</span>)</span></div></div><div v-if="showScrollBottom" class="scroll-bottom" @click="scrollBottom()" @mouseover="isMessagesHover = true" @mouseout="isMessagesHover = false">{{ $t(&#39;resume-auto-scroll&#39;) }}</div></div></div></div>',
    mixins: [_bsComponent.default, _imageLazyload.default],
    data: function () {
      return {
        firstInit: true,
        isMessagesHover: false,
        isPause: window.localStorage.getItem('isChatPause') === 'true' ? true : false,
        isPopout: false,
        messages: [],
        showBadges: window.localStorage.getItem('showMessageBadges') === 'true' ? true : false,
        showScrollBottom: false,
        showTimestamp: window.localStorage.getItem('showMessageTimestamp') === 'true' ? true : false,
        showUserColor: window.localStorage.getItem('showMessageUserColor') === 'true' ? true : false
      };
    },
    watch: {
      isPause: function () {
        window.localStorage.setItem('isChatPause', this.isPause);
      },
      messages: function () {
        let $this = this;
        setTimeout(function () {
          if ($this.firstInit) {
            jQuery('.messages').scrollTop(typeof jQuery('.messages')[0] === 'undefined' ? 0 : jQuery('.messages')[0].scrollHeight);
            $this.firstInit = false;
          }

          if (!$this.isPopout && !$this.isMessagesHover) {
            $this.initTooltip();
          }

          $this.initImageLazyLoad();
          jQuery('.messages:not(.stop)').scrollTop(typeof jQuery('.messages')[0] === 'undefined' ? 0 : jQuery('.messages')[0].scrollHeight);
        }, 100);
      },
      showBadges: function () {
        window.localStorage.setItem('showMessageBadges', this.showBadges);
      },
      showTimestamp: function () {
        let $this = this;
        window.localStorage.setItem('showMessageTimestamp', this.showTimestamp);
        setTimeout(function () {
          $this.initTooltip();
        }, 100);
      },
      showUserColor: function () {
        window.localStorage.setItem('showMessageUserColor', this.showUserColor);
      }
    },
    mounted: function () {
      let $this = this;
      this.getMessages();

      if (/^#\/channel\/(.*)\/chat\/?/.test(window.location.hash)) {
        this.isPopout = true;
      }

      jQuery('.messages').scroll(function () {
        const scrollTop = jQuery('.messages').scrollTop();
        const scrollHeight = typeof jQuery('.messages')[0] === 'undefined' ? 0 : jQuery('.messages')[0].scrollHeight;
        const scrollPos = scrollTop + (scrollHeight - scrollTop) - scrollTop;

        if (scrollPos - 250 > jQuery('.messages').height()) {
          $this.showScrollBottom = true;
        } else {
          $this.showScrollBottom = false;
        }
      });

      if (this.isPopout) {
        jQuery(window).resize(function () {
          jQuery('.chat .messages').css('height', '');
          jQuery('.chat .messages').height(jQuery(document).height() - jQuery('.chat .controls').outerHeight() - (parseInt(jQuery('.chat').css('padding-top')) + parseInt(jQuery('.chat').css('padding-bottom'))));
        });
        jQuery(window).resize();
      }
    },
    methods: {
      getChatClass: function () {
        let cssClass = [];

        if (this.isPopout) {
          cssClass.push('popout');
        }

        cssClass.push(this.$route.params.channel.toLowerCase());
        return cssClass.join(' ');
      },
      getMessages: function () {
        if (typeof socketWrite === 'function') {
          const call = {
            method: 'getMessages',
            args: {
              channel: this.$root._route.params.channel.toLowerCase()
            },
            env: 'node'
          };
          socketWrite(call);
        }
      },
      getMessageClass: function (index, message) {
        let cssClass = [];

        if (index === 0) {
          cssClass.push('first');
        }

        if (message.purge.hasPurge) {
          cssClass.push('purge');
        }

        cssClass.push(message.type);
        cssClass.push('channel-' + message.channelId);
        cssClass.push('message-' + message.uuid);
        cssClass.push('user-' + message.userId);
        return cssClass.join(' ');
      },
      popoutChat: function () {
        const url = this.$router.resolve({
          name: 'chat',
          params: {
            channel: this.$root._route.params.channel
          }
        }).href;
        const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=750,height=750';
        window.open(url, 'Chat Popout', params);
      },
      scrollBottom: function () {
        jQuery('.messages').scrollTop(typeof jQuery('.messages')[0] === 'undefined' ? 0 : jQuery('.messages')[0].scrollHeight);
      },
      setMessage: function (args) {
        if (!this.isPause && this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
          this.messages.push(args.message); // limit of messages

          if (this.messages.length >= 100 && !this.isMessagesHover) {
            this.messages.shift();
          }
        }
      },
      setMessages: function (args) {
        if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
          this.messages = args.messages;
        }
      }
    }
  };
  _exports.default = _default;
});