<script>
    import Chat from '../partial/chat';
    import Commands from '../partial/commands';
    import Counter from '../partial/counter';
    import Playlist from '../partial/playlist';
    import Poll from '../partial/poll';
    import Raffle from '../partial/raffle';

    export default {
        components: {
            'c-chat': Chat,
            'c-commands': Commands,
            'c-counter': Counter,
            'c-playlist': Playlist,
            'c-poll': Poll,
            'c-raffle': Raffle
        },
        data: function() {
            return {
                componentsOrder: window.localStorage.getItem('componentsOrder') ? JSON.parse(window.localStorage.getItem('componentsOrder')) : null,
                oauthToken: ''
            };
        },
        mounted: function() {
            if (this.componentsOrder === null) {
                this.componentsOrder = {
                    chat: {
                        show: true,
                        cols: {xs: 12, sm: 0, md: 0, lg: 0, xl: 0, xxl: 0}
                    },
                    poll: {
                        show: true,
                        cols: {xs: 12, sm: 0,  md: 6, lg: 0, xl: 0, xxl: 0}
                    },
                    raffle: {
                        show: true,
                        cols: {xs: 12, sm: 0, md: 6, lg: 0, xl: 0, xxl: 0}
                    },
                    commands: {
                        show: true,
                        cols: {xs: 12, sm: 0, md: 0, lg: 9, xl: 0, xxl: 7}
                    },
                    counter: {
                        show: true,
                        cols: {xs: 12, sm: 6, md: 4, lg: 3, xl: 0, xxl: 0}
                    },
                    playlist: {
                        show: true,
                        cols: {xs: 12, sm: 0,  md: 0, lg: 0, xl: 0, xxl: 0}
                    }
                };
                this.saveComponentsOrder();
            }
            this.getChannelToken('oauthToken');
        },
        methods: {
            getChannelToken: function(name) {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getChannelToken',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            name: name
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getComponentClass: function(properties, index) {
                let bp = Object.keys(properties.cols);
                let cssClasses = '';

                for (let i = 0; i < bp.length; i++) {
                    if (properties.cols[bp[i]]) {
                        if (bp[i] === 'xs') {
                            cssClasses += `col-${properties.cols[bp[i]]} `;
                        } else {
                            cssClasses += `col-${bp[i]}-${properties.cols[bp[i]]} `;
                        }
                    }
                }

                if (!properties.show) {
                    cssClasses += 'd-none ';
                }

                if (Object.keys(this.componentsOrder).length - 1 !== index) {
                    cssClasses += 'pb-3';
                }

                return cssClasses;
            },
            moveComponent: function(component, direction, index) {
                let componentsOrder = {};
                let componentsOrderKeys = Object.keys(this.componentsOrder);
                componentsOrderKeys[index] = componentsOrderKeys[index + direction];
                componentsOrderKeys[index + direction] = component;

                for (let i = 0; i < componentsOrderKeys.length; i++) {
                    componentsOrder[componentsOrderKeys[i]] = this.componentsOrder[componentsOrderKeys[i]];
                }

                this.componentsOrder = componentsOrder;
                this.saveComponentsOrder();
            },
            saveComponentsOrder: function() {
                window.localStorage.setItem('componentsOrder', JSON.stringify(this.componentsOrder));
            },
            setChannelToken: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this[args.name] = args.token;
                }
            }
        }
    };
</script>

<template>
    <div class="row mb-5 channel">
        <div class="col-12 pb-3">
            <h3 class="text-center">
                {{ $route.params.channel }} - {{ $t('app') }}&nbsp;
                <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('components-order')"><button type="button" class="btn btn-sm btn-primary btn-fs1rem" data-toggle="modal" data-target="#components-order"><font-awesome-icon :icon="['fas', 'th']" class="fa-fw" /></button></span>&nbsp;
                <span v-if="oauthToken.length"><span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('oauth-token')"><button type="button" class="btn btn-sm btn-primary btn-fs1rem" data-toggle="modal" data-target="#oauth-token"><font-awesome-icon :icon="['fas', 'key']" class="fa-fw" /></button></span>&nbsp;</span>
                <router-link class="btn btn-sm btn-primary btn-fs1rem" data-toggle="tooltip" data-placement="top" :title="$t('statistic')" :to="{name: 'statistic', params: {channel: $route.params.channel}}"><font-awesome-icon :icon="['fas', 'chart-pie']" class="fa-fw" /></router-link>
            </h3>
        </div>
        <!-- eslint-disable-next-line vue/require-v-for-key -->
        <div v-for="(properties, component, index) in componentsOrder" :class="getComponentClass(properties, index)">
            <component :is="('c-' + component)" :ref="component" />
        </div>
        <div class="col-12">
            <div id="components-order" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="components-order-modal-title" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 id="components-order-modal-title" class="modal-title">
                                {{ $t('components-order') }}
                            </h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-12 form-search">
                                    <div class="table-responsive">
                                        <table id="componentsOrderTable" class="table table-striped table-hover table-dark">
                                            <thead>
                                                <tr>
                                                    <th scope="col">#</th>
                                                    <th scope="col">{{ $tc('component', 2) }}</th>
                                                    <th scope="col">{{ $t('show') }}</th>
                                                    <th scope="col" colspan="2">{{ $t('smartphone') }}</th>
                                                    <th scope="col">{{ $t('tablet') }}</th>
                                                    <th scope="col" colspan="3">{{ $t('computer') }}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- eslint-disable-next-line vue/require-v-for-key -->
                                                <tr v-for="(properties, component, index) in componentsOrder">
                                                    <td class="index">
                                                        <div v-if="index > 0" class="move move-up" @click="moveComponent(component, -1, index)">
                                                            <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: -90}" />
                                                        </div>
                                                        <div v-if="index + 1 < Object.keys(componentsOrder).length" class="move move-down" @click="moveComponent(component, 1, index)">
                                                            <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: 90}" />
                                                        </div>
                                                        {{ index + 1 }}
                                                    </td>
                                                    <td>{{ component }}</td>
                                                    <td>
                                                        <div class="custom-control custom-switch">
                                                            <input id="components-order-show" v-model="componentsOrder[component].show" type="checkbox" class="custom-control-input" @change="saveComponentsOrder()">
                                                            <label for="components-order-show" class="custom-control-label">&nbsp;</label>
                                                        </div>
                                                    </td>
                                                    <td v-for="(width, breakpoint) in properties.cols" :key="breakpoint">
                                                        <select v-model.number="componentsOrder[component].cols[breakpoint]" class="custom-select" @change="saveComponentsOrder()">
                                                            <option value="0">{{ $t('default') }}</option>
                                                            <option v-for="bpWidth in 12" :key="bpWidth" :value="bpWidth" :selected="bpWidth === width">{{ breakpoint }} {{ bpWidth }}</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="oauth-token" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="oauth-token-modal-title" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 id="oauth-token-modal-title" class="modal-title">
                                {{ $t('oauth-token') }}
                            </h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body text-center">
                            {{ oauthToken }}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ $t('close') }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>