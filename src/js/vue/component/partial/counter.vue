<script>
    export default {
        data: function() {
            return {
                counter: {},
                isPopout: false,
                updateTimeout: null
            };
        },
        watch: {
            'counter.victory': function() {
                const $this = this;
                
                clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(function() {
                    $this.updateCounter();
                }, 2000);
            }
        },
        mounted: function() {
            this.getCounter();
            jQuery('#setupButton').click();
            
            if (/^#\/channel\/(.*)\/counter\/?/.test(window.location.hash)) {
                this.isPopout = true;
            }
        },
        methods: {
            getCounter: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getCounter',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            popoutCounter: function() {
                const url = this.$router.resolve({name: 'counter', params: {channel: this.$root._route.params.channel}}).href;
                const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=500,height=560';
                window.open(url, 'Counter', params);
            },
            setCounter: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.counter = args.counter;
                }
            },
            updateCounter: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'updateCounter',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            counter: this.counter
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            }
        }
    };
</script>

<template>
    <div class="row">
        <div class="col-12">
            <div class="counter" :class="{'p-2': isPopout === false, popout: isPopout, victory: counter.streak >= parseInt(counter.victory)}">
                <div v-if="isPopout === false" class="h4 text-center">
                    <a href="#" onclick="javascript:return false;" @click="popoutCounter()">{{ $t('counter') }} <font-awesome-icon :icon="['fas', 'external-link-alt']" class="fa-fw" /></a>
                </div>
                
                <div :class="{'embed-responsive': isPopout, 'embed-responsive-1by1': isPopout}">
                    <div :class="{'embed-responsive-item': isPopout}">
                        <div id="counter" class="h3 text-center mb-0 text">
                            {{ counter.streak }}
                        </div>
                    </div>
                </div>
                
                <div v-if="isPopout === false" class="input-group input-group-sm pt-3">
                    <div class="input-group-prepend">
                        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                        <div class="input-group-text"><font-awesome-icon :icon="['fas', 'trophy']" class="fa-fw" /></div>
                    </div>
                    <input v-model="counter.victory" type="number" min="1" max="99" class="form-control">
                </div>
                 
                <canvas v-if="isPopout" id="confetti"></canvas>
                <button id="setupButton" class="d-none">Setup Confetti</button>
                <button id="startButton" class="d-none">Start Confetti</button>
                <button id="stopButton" class="d-none">Stop Confetti</button>
            </div>
        </div>
    </div>
</template>
