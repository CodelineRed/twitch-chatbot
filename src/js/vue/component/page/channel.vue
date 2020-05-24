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
                componentsOrder: window.localStorage.getItem('componentsOrder') ? JSON.parse(window.localStorage.getItem('componentsOrder')) : null
            };
        },
        mounted: function() {
            if (this.componentsOrder === null) {
                this.componentsOrder = {
                    chat: {xs: 12, sm: 0, md: 0, lg: 0, xl: 0, xxl: 0},
                    poll: {xs: 12, sm: 0,  md: 6, lg: 0, xl: 0, xxl: 0},
                    raffle: {xs: 12, sm: 0, md: 6, lg: 0, xl: 0, xxl: 0},
                    commands: {xs: 12, sm: 0, md: 0, lg: 9, xl: 0, xxl: 7},
                    counter: {xs: 12, sm: 6, md: 4, lg: 3, xl: 0, xxl: 0},
                    playlist: {xs: 12, sm: 0,  md: 0, lg: 0, xl: 0, xxl: 0}
                };
                window.localStorage.setItem('componentsOrder', JSON.stringify(this.componentsOrder));
            }
        },
        methods: {
            getComponentClass: function(breakpoints, index) {
                let bp = Object.keys(breakpoints);
                let cssClasses = '';

                for (let i = 0; i < bp.length; i++) {
                    if (breakpoints[bp[i]]) {
                        if (bp[i] === 'xs') {
                            cssClasses += `col-${breakpoints[bp[i]]} `;
                        } else {
                            cssClasses += `col-${bp[i]}-${breakpoints[bp[i]]} `;
                        }
                    }
                }

                if (bp.length -1 !== index) {
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
                window.localStorage.setItem('componentsOrder', JSON.stringify(this.componentsOrder));
            },
            updateComponent: function(component, breakpoint, event) {
                this.componentsOrder[component][breakpoint] = parseInt(event.target.value);
                window.localStorage.setItem('componentsOrder', JSON.stringify(this.componentsOrder));
            }
        }
    };
</script>

<template>
    <div class="row mb-5 channel">
        <div class="col-12 pb-3">
            <h3 class="text-center">
                {{ $route.params.channel }} - {{ $t('app') }} <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Components Order"><button type="button" class="btn btn-sm btn-primary components-order" data-toggle="modal" data-target="#components-order"><font-awesome-icon :icon="['fas', 'th']" class="fa-fw" /></button></span>
            </h3>
        </div>
        <!-- eslint-disable-next-line vue/require-v-for-key -->
        <div v-for="(breakpoints, component, index) in componentsOrder" :class="getComponentClass(breakpoints, index)">
            <component :is="('c-' + component)" :ref="component" />
        </div>
        <div class="col-12">
            <div id="components-order" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="components-order-modal-title" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 id="components-order-modal-title" class="modal-title">
                                Components Order
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
                                                    <th scope="col">Component</th>
                                                    <th scope="col" colspan="2">Smartphone</th>
                                                    <th scope="col">Tablet</th>
                                                    <th scope="col" colspan="3">Computer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- eslint-disable-next-line vue/require-v-for-key -->
                                                <tr v-for="(breakpoints, component, index) in componentsOrder">
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
                                                    <td v-for="(width, breakpoint) in breakpoints" :key="breakpoint">
                                                        <select class="custom-select" @change="updateComponent(component, breakpoint, $event)">
                                                            <option value="0">None</option>
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
        </div>
    </div>
</template>