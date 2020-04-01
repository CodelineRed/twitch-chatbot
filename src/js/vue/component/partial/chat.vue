<script>
    import imageLazyLoad from '../../method/image-lazyload';
    
    export default {
        mixins: [imageLazyLoad],
        data: function() {
            return {
                firstInit: true,
                isMessagesHover: false,
                isPause: window.localStorage.getItem('isChatPause') === 'true' ? true : false,
                isPopout: false,
                messages: [],
                showBadges: window.localStorage.getItem('showMessageBadges') === 'true' ? true : false,
                showScrollBottom: false,
                showTime: window.localStorage.getItem('showMessageTime') === 'true' ? true : false,
                showUserColor: window.localStorage.getItem('showMessageUserColor') === 'true' ? true : false
            };
        },
        watch: {
            isPause: function() {
                window.localStorage.setItem('isChatPause', this.isPause);
            },
            messages: function() {
                let $this = this;
                
                setTimeout(function() {
                    if ($this.firstInit) {
                        jQuery('.messages').scrollTop(jQuery('.messages')[0].scrollHeight);
                        $this.firstInit = false;
                    }
                    
                    if (!$this.isPopout && !$this.isMessagesHover) {
                        jQuery('[data-toggle="tooltip"]').tooltip('dispose');
                        jQuery('[data-toggle="tooltip"]').tooltip();
                    }
                    
                    $this.initImageLazyLoad();
                    jQuery('.messages:not(.stop)').scrollTop(jQuery('.messages')[0].scrollHeight);
                }, 100);
            },
            showBadges: function() {
                window.localStorage.setItem('showMessageBadges', this.showBadges);
            },
            showTime: function() {
                window.localStorage.setItem('showMessageTime', this.showTime);
            },
            showUserColor: function() {
                window.localStorage.setItem('showMessageUserColor', this.showUserColor);
            }
        },
        mounted: function() {
            let $this = this;
            
            if (/chat/gi.test(this.$root._route.path)) {
                this.isPopout = true;
            }
            this.getChatMessages();
            
            jQuery('.messages').scroll(function() {
                const scrollTop = jQuery('.messages').scrollTop();
                const scrollHeight = jQuery('.messages')[0].scrollHeight;
                const scrollPos = (scrollTop + (scrollHeight - scrollTop)) - scrollTop;
                
                if (scrollPos - 250 > jQuery('.messages').height()) {
                    $this.showScrollBottom = true;
                } else {
                    $this.showScrollBottom = false;
                }
            });
            
            if (this.isPopout) {
                jQuery(window).resize(function() {
                    jQuery('.chat .messages').css('height', '');
                    jQuery('.chat .messages').height((jQuery(document).height() - jQuery('.chat .controls').outerHeight()) - (parseInt(jQuery('.chat').css('padding-top')) + parseInt(jQuery('.chat').css('padding-bottom'))));
                });
                jQuery(window).resize();
            }
        },
        methods: {
            popoutChat: function() {
                const url = this.$router.resolve({name: 'chat', params: {channel: this.$root._route.params.channel}}).href;
                const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=750,height=750';
                window.open(url, 'Chat Popout', params);
            },
            scrollBottom: function() {
                jQuery('.messages').scrollTop(jQuery('.messages')[0].scrollHeight);
            },
            getChatClass: function() {
                let cssClass = [];
                
                if (this.isPopout) {
                    cssClass.push('popout');
                }
                
                cssClass.push(this.$route.params.channel.toLowerCase());
                
                return cssClass.join(' ');
            },
            setChatMessage: function(args) {
                if (!this.isPause && this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.messages.push({
                        badges: args.badges,
                        channelId: args.channelId,
                        color: args.color,
                        message: args.message,
                        messageId: args.messageId,
                        messageType: args.messageType,
                        mod: args.mod,
                        nativeBadges: args.nativeBadges,
                        purge: args.purge,
                        subscriber: args.subscriber,
                        timestamp: args.timestamp,
                        turbo: args.turbo,
                        user: args.user,
                        userId: args.userId
                    });
                    
                    // limit of messages
                    if (this.messages.length >= 100 && !this.isMessagesHover) {
                        this.messages.shift();
                    }
                }
            },
            setChatMessages: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.messages = args.messages;
                }
            },
            getChatMessages: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getChatMessages',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            getChatMessageClass: function(index, message) {
                let cssClass = [];
                
                if (index === 0) {
                    cssClass.push('first');
                }
                
                if (message.purge.hasPurge) {
                    cssClass.push('purge');
                }
                
                cssClass.push(message.messageType);
                cssClass.push('channel-' + message.channelId);
                cssClass.push('message-' + message.messageId);
                cssClass.push('user-' + message.userId);
                
                return cssClass.join(' ');
            }
        }
    };
</script>

<template>
    <div class="row">
        <div class="col-12">
            <div class="chat p-2" :class="getChatClass()">
                <div class="controls pb-2">
                    <div class="custom-control custom-switch float-left mr-3">
                        <input id="message-time" v-model="showTime" type="checkbox" class="custom-control-input">
                        <label class="custom-control-label" for="message-time">Time</label>
                    </div>
                    <div class="custom-control custom-switch float-left mr-3">
                        <input id="message-badges" v-model="showBadges" type="checkbox" class="custom-control-input">
                        <label class="custom-control-label" for="message-badges">Badges</label>
                    </div>
                    <div class="custom-control custom-switch float-left mr-3">
                        <input id="message-user-color" v-model="showUserColor" type="checkbox" class="custom-control-input">
                        <label class="custom-control-label" for="message-user-color">Color</label>
                    </div>
                    <div class="custom-control custom-switch float-left mr-3">
                        <input id="message-pause" v-model="isPause" type="checkbox" class="custom-control-input">
                        <label class="custom-control-label" for="message-pause">Pause</label>
                    </div>
                    <div class="float-left">
                        <a v-if="isPopout == false" href="#" onclick="javascript:return false;" @click="popoutChat()">Popout <font-awesome-icon :icon="['fas', 'external-link-alt']" class="fa-fw" /></a>
                    </div>
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <div class="clearfix"></div>
                </div>
                <div class="messages" :class="{stop: isMessagesHover}" @mouseover="isMessagesHover = true" @mouseout="isMessagesHover = false">
                    <!-- eslint-disable-next-line vue/require-v-for-key -->
                    <div v-for="(message, index) in messages" :class="getChatMessageClass(index, message)" class="message">
                        <span v-if="showTime" class="timestamp mr-2" data-toggle="tooltip" data-placement="top" :title="message.timestamp|formatDateTime($t('datetime'))">
                            [{{ message.timestamp|formatDateTime($t("time")) }}]
                        </span>
                        <span v-if="showBadges">
                            <!-- eslint-disable-next-line vue/require-v-for-key -->
                            <span v-for="(badge, badgeName) in message.badges" class="twitch-badge" data-toggle="tooltip" data-placement="top" :title="badge.title">
                                <font-awesome-icon v-if="badge" :icon="[badge.style, badge.icon]" class="fa-fw" :class="badge.cssClass == null ? badgeName : badge.cssClass" :transform="badge.transform" />
                            </span>
                        </span>
                        <span class="user mr-1" :style="{color: showUserColor ? message.color : null}">
                            {{ message.user }}
                            <span v-if="message.messageType == 'chat'">:</span>
                        </span>
                        <!-- eslint-disable-next-line vue/no-v-html -->
                        <span class="text mr-1" :class="{action: message.messageType == 'action'}" :style="{color: message.messageType == 'action' && showUserColor ? message.color : null}" v-html="message.message"></span>
                        <span v-if="message.purge.showMessage" class="purge">
                            ({{ message.purge.message }}<span v-if="message.purge.reason">: {{ message.purge.reason }}</span>)
                        </span>
                    </div>
                </div>
                <div v-if="showScrollBottom" class="scroll-bottom" @click="scrollBottom()" @mouseover="isMessagesHover = true" @mouseout="isMessagesHover = false">
                    Resume auto scroll
                </div>
            </div>
        </div>
    </div>
</template>
