<script>
    import Datetime from 'vue-ctk-date-time-picker';
    import bsComponent from '../../method/bs-component';
    import imageLazyLoad from '../../method/image-lazyload';

    export default {
        components: {
            'c-datetime': Datetime
        },
        mixins: [bsComponent, imageLazyLoad],
        data: function() {
            return {
                completed: 12,
                datetimePicker: {
                    start: moment().format('YYYY-MM-DDT00:00'),
                    end: moment().format('YYYY-MM-DDT23:59:59')
                },
                hasChart: false,
                misc: {},
                purges: {},
                streamDate: -1,
                streamDates: [],
                subs: {},
                topChatters: [],
                topCommands: [],
                topEmotesAll: [],
                topEmotesBttv: [],
                topEmotesFfz: [],
                topEmotesTwitch: [],
                topHashtags: [],
                topListLimit: 15
            };
        },
        watch: {
            'misc.minViewer': function() {
                if (typeof this.misc.minViewer !== 'number') {
                    this.hasChart = false;
                }
            },
            'streamDate': function() {
                if (this.streamDate >= 0) {
                    this.datetimePicker = {
                        start: moment(this.streamDates[this.streamDate].start * 1000).format('YYYY-MM-DDTHH:mm'),
                        end: moment(this.streamDates[this.streamDate].end * 1000).format('YYYY-MM-DDTHH:mm')
                    };
                } else {
                    this.datetimePicker = {
                        start: moment().format('YYYY-MM-DDT00:00'),
                        end: moment().format('YYYY-MM-DDT23:59:59')
                    };
                }
            }
        },
        mounted: function() {
            this.getAllStats();
        },
        methods: {
            getAllStats: function() {
                let $this = this;
                this.completed = 0;
                this.getTopChatters(this.topListLimit);
                this.getTopEmotes('\'ttv\',\'bttv\',\'ffz\'', 'All', this.topListLimit);
                this.getTopEmotes('\'ttv\'', 'Twitch', this.topListLimit);
                this.getTopEmotes('\'bttv\'', 'Bttv', this.topListLimit);
                this.getTopEmotes('\'ffz\'', 'Ffz', this.topListLimit);
                this.getTopWords('#', 'Hashtags', this.topListLimit);
                this.getTopWords('!', 'Commands', this.topListLimit);
                this.getChart();
                this.getMisc();
                this.getPurges();
                this.getStreamDates();
                this.getSubs();

                setTimeout(function() {
                    //$this.initImageLazyLoad();
                    $this.initTooltip();
                }, 1250);
            },
            getChart: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getChart',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            start: this.datetimePicker.start + moment().format('Z'),
                            end: this.datetimePicker.end + moment().format('Z')
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getMisc: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getMisc',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            start: this.datetimePicker.start + moment().format('Z'),
                            end: this.datetimePicker.end + moment().format('Z')
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getPurges: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getPurges',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            start: this.datetimePicker.start + moment().format('Z'),
                            end: this.datetimePicker.end + moment().format('Z')
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getStreamDates: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getStreamDates',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getSubs: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getSubs',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            start: this.datetimePicker.start + moment().format('Z'),
                            end: this.datetimePicker.end + moment().format('Z')
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getTopChatters: function(limit) {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getTopChatters',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            limit: limit,
                            start: this.datetimePicker.start + moment().format('Z'),
                            end: this.datetimePicker.end + moment().format('Z')
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getTopEmotes: function(select, type, limit) {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getTopEmotes',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            select: select,
                            limit: limit,
                            type: type,
                            start: this.datetimePicker.start + moment().format('Z'),
                            end: this.datetimePicker.end + moment().format('Z')
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getTopWords: function(prefix, type, limit) {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getTopWords',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            limit: limit,
                            prefix: prefix,
                            type: type,
                            start: this.datetimePicker.start + moment().format('Z'),
                            end: this.datetimePicker.end + moment().format('Z')
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            setChart: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    if (args.data.length) {
                        this.hasChart = true;
                        let config = {
                            type: 'line',
                            data: {
                                labels: args.labels,
                                datasets: [{
                                    backgroundColor: args.backgroundColor,
                                    borderColor: '#2e97bf',
                                    data: args.data,
                                    fill: false,
                                    fontColor: '#fff',
                                    label: this.$t('viewer-count')
                                }]
                            },
                            options: {
                                responsive: true,
                                legend: {
                                    labels: {
                                        fontColor: '#fff'
                                    }
                                },
                                scales: {
                                    yAxes: [{
                                        gridLines: {
                                            color: '#212121'
                                        },
                                        ticks: {
                                            fontColor: '#fff',
                                            min: 0
                                        }
                                    }],
                                    xAxes: [{
                                        gridLines: {
                                            color: '#212121'
                                        },
                                        ticks: {
                                            fontColor: '#fff'
                                        }
                                    }]
                                }
                            }
                        };

                        setTimeout(function() {
                            if (typeof window.viewerCountChart !== 'undefined') {
                                window.viewerCountChart.destroy();
                            }

                            if (jQuery('#canvas').is(':visible')) {
                                let ctx = document.getElementById('canvas').getContext('2d');
                                window.viewerCountChart = new Chart(ctx, config);
                            }
                        }, 200);
                    }
                }
            },
            setMisc: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    this.misc = args.misc;
                }
            },
            setPurges: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    this.purges = args.purges;
                }
            },
            setStreamDates: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    this.streamDates = args.streamDates;
                }
            },
            setSubs: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    this.subs = args.subs;
                }
            },
            setTopChatters: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    this.topChatters = args.list;
                }
            },
            setTopEmotes: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    this['topEmotes' + args.type] = args.list;
                }
            },
            setTopWords: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.completed++;
                    this['top' + args.type] = args.list;
                }
            }
        }
    };
</script>

<template>
    <div class="row statistic">
        <div class="col-12 mb-3">
            <h3 class="text-center">
                {{ $route.params.channel }} - {{ $t('statistic') }}&nbsp;
                <router-link class="btn btn-sm btn-primary btn-fs1rem" data-toggle="tooltip" data-placement="top" :title="$tc('channel', 1)" :to="{name: 'channel', params: {channel: $route.params.channel}}"><font-awesome-icon :icon="['fas', 'video']" class="fa-fw" /></router-link>
            </h3>
        </div>
        <div class="col-12 mb-3">
            <div class="tile-background p-2">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8 col-xl-6 col-xxl-5">
                        <div class="form-row">
                            <div class="col">
                                <c-datetime id="start" v-model="datetimePicker.start" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm:ss" label="" :no-label="true" :no-header="true" :locale="$t('lang')"></c-datetime>
                            </div>
                            <div class="col-auto">
                                -
                            </div>
                            <div class="col">
                                <c-datetime id="end" v-model="datetimePicker.end" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm:ss" label="" :no-label="true" :no-header="true" :locale="$t('lang')"></c-datetime>
                            </div>
                            <div class="col-auto">
                                <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('update')"><button type="button" class="btn btn-primary" :disabled="completed < 9" @click="getAllStats()"><font-awesome-icon :icon="['fas', 'sync']" class="fa-fw" :class="{'fa-spin': completed < 9}" /></button></span>
                            </div>
                            <div v-if="streamDates.length" class="col-12 pt-2">
                                <select id="stream-dates" v-model.number="streamDate" class="custom-select">
                                    <option value="-1">{{ $t('past-streams') }}</option>
                                    <option v-for="(streamDateItem, index) in streamDates" :key="streamDateItem.id" :value="index">
                                        {{ streamDateItem.start|formatDateTime($t('streamdate')) }} - {{ streamDateItem.end|formatDateTime($t('streamdate')) }} / {{ streamDateItem.title }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="hasChart" class="col-12 mb-3">
            <div class="tile-background p-2">
                <div class="row text-white">
                    <div class="col">
                        {{ $t('min') }}: <span v-if="misc.minViewer">{{ misc.minViewer }}</span><span v-else>0</span>
                    </div>
                    <div class="col text-center">
                        {{ $t('avg') }}: <span v-if="misc.avgViewer">{{ misc.avgViewer }}</span><span v-else>0</span>
                    </div>
                    <div class="col text-right">
                        {{ $t('max') }}: <span v-if="misc.maxViewer">{{ misc.maxViewer }}</span><span v-else>0</span>
                    </div>
                </div>
                <canvas id="canvas"></canvas>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $tc('sub', 2) }}
                </div>
                <div class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <tbody>
                            <tr>
                                <td>{{ $t('new') }}</td>
                                <td>
                                    <span v-if="subs.new">{{ subs.new }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('new-paid') }}</td>
                                <td>
                                    <span v-if="subs.newPaid">{{ subs.newPaid }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('new-prime') }}</td>
                                <td>
                                    <span v-if="subs.newPrime">{{ subs.newPrime }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('gifted') }}</td>
                                <td>
                                    <span v-if="subs.gifted">{{ subs.gifted }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('gifted-random') }}</td>
                                <td>
                                    <span v-if="subs.giftedRandom">{{ subs.giftedRandom }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('resubs') }}</td>
                                <td>
                                    <span v-if="subs.resubs">{{ subs.resubs }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('resubs-paid') }}</td>
                                <td>
                                    <span v-if="subs.resubsPaid">{{ subs.resubsPaid }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('resubs-prime') }}</td>
                                <td>
                                    <span v-if="subs.resubsPrime">{{ subs.resubsPrime }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('sub-bombs') }}</td>
                                <td>
                                    <span v-if="subs.bombs">{{ subs.bombs }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('total') }}</td>
                                <td>
                                    <span v-if="subs.new + subs.gifted + subs.giftedRandom + subs.resubs">{{ subs.new + subs.gifted + subs.giftedRandom + subs.resubs }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr class="d-none">
                                <td>{{ $t('anon-gift-paid-upgrade') }}</td>
                                <td>
                                    <span v-if="subs.anonUpgrade">{{ subs.anonUpgrade }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('purges') }}
                </div>
                <div class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <tbody>
                            <tr>
                                <td>{{ $t('deleted-messages') }}</td>
                                <td>
                                    <span v-if="purges.deletedMessages">{{ purges.deletedMessages }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('timeouted-messages') }}</td>
                                <td>
                                    <span v-if="purges.timeoutedMessages">{{ purges.timeoutedMessages }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('timeouted-users') }}</td>
                                <td>
                                    <span v-if="purges.timeoutedUsers">{{ purges.timeoutedUsers }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('banned-users') }}</td>
                                <td>
                                    <span v-if="purges.bannnedUsers">{{ purges.bannnedUsers }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('total') }}</td>
                                <td>
                                    <span v-if="purges.deletedMessages + purges.timeoutedMessages + purges.bannnedUsers">{{ purges.deletedMessages + purges.timeoutedMessages + purges.bannnedUsers }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('miscellanea') }}
                </div>
                <div class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <tbody>
                            <tr>
                                <td>{{ $t('new-users') }}</td>
                                <td>
                                    <span v-if="misc.newUsers">{{ misc.newUsers }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('all-users') }}</td>
                                <td>
                                    <span v-if="misc.allUsers">{{ misc.allUsers }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('chat-messages') }}</td>
                                <td>
                                    <span v-if="misc.messages">{{ misc.messages }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('used-emotes') }}</td>
                                <td>
                                    <span v-if="misc.usedEmotes">{{ misc.usedEmotes }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $tc('cheer', 2) }}</td>
                                <td>
                                    <span v-if="misc.cheers">{{ misc.cheers }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $tc('bit', 2) }}</td>
                                <td>
                                    <span v-if="misc.bits">{{ misc.bits }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('min-viewer') }}</td>
                                <td>
                                    <span v-if="misc.minViewer">{{ misc.minViewer }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('average-viewer') }}</td>
                                <td>
                                    <span v-if="misc.avgViewer">{{ misc.avgViewer }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                            <tr>
                                <td>{{ $t('max-viewer') }}</td>
                                <td>
                                    <span v-if="misc.maxViewer">{{ misc.maxViewer }}</span>
                                    <span v-else>0</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3 top-emotes">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('top-emotes-all', [topListLimit]) }}
                </div>
                <div v-if="topEmotesAll.length" class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">{{ $t('code') }}</th>
                                <th scope="col">{{ $t('amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="emote in topEmotesAll" :key="emote.uuid">
                                <!-- eslint-disable-next-line vue/no-v-html -->
                                <td><span v-html="emote.image"></span></td>
                                <td>{{ emote.code }}</td>
                                <td>{{ emote.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center">
                    {{ $t('no-top-emotes') }}
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3 top-emotes">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('top-emotes-twitch', [topListLimit]) }}
                </div>
                <div v-if="topEmotesTwitch.length" class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">{{ $t('code') }}</th>
                                <th scope="col">{{ $t('amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="emote in topEmotesTwitch" :key="emote.uuid">
                                <!-- eslint-disable-next-line vue/no-v-html -->
                                <td><span v-html="emote.image"></span></td>
                                <td>{{ emote.code }}</td>
                                <td>{{ emote.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center">
                    {{ $t('no-top-emotes') }}
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3 top-emotes">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('top-emotes-bttv', [topListLimit]) }}
                </div>
                <div v-if="topEmotesBttv.length" class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">{{ $t('code') }}</th>
                                <th scope="col">{{ $t('amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="emote in topEmotesBttv" :key="emote.uuid">
                                <!-- eslint-disable-next-line vue/no-v-html -->
                                <td><span v-html="emote.image"></span></td>
                                <td>{{ emote.code }}</td>
                                <td>{{ emote.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center">
                    {{ $t('no-top-emotes') }}
                </div>
            </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3 mb-3 top-emotes">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('top-emotes-ffz', [topListLimit]) }}
                </div>
                <div v-if="topEmotesFfz.length" class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">{{ $t('code') }}</th>
                                <th scope="col">{{ $t('amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="emote in topEmotesFfz" :key="emote.uuid">
                                <!-- eslint-disable-next-line vue/no-v-html -->
                                <td><span v-html="emote.image"></span></td>
                                <td>{{ emote.code }}</td>
                                <td>{{ emote.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center">
                    {{ $t('no-top-emotes') }}
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3 top-chatter">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('top-chatters', [topListLimit]) }}
                </div>
                <div v-if="topChatters.length" class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th scope="col">{{ $t('name') }}</th>
                                <th scope="col">{{ $t('amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="chatter in topChatters" :key="chatter.name">
                                <td>{{ chatter.name }}</td>
                                <td>{{ chatter.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center">
                    {{ $t('no-top-chatters') }}
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3 top-hashtags">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('top-hashtags', [topListLimit]) }}
                </div>
                <div v-if="topHashtags.length" class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th scope="col">{{ $tc('hashtag', 1) }}</th>
                                <th scope="col">{{ $t('amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="hashtag in topHashtags" :key="hashtag.name">
                                <td>{{ hashtag.word }}</td>
                                <td>{{ hashtag.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center">
                    {{ $t('no-top-hashtags') }}
                </div>
            </div>
        </div>
        <div class="col-12 col-md-4 mb-3 top-commands">
            <div class="tile-background p-2">
                <div class="h5 text-center pt-1">
                    {{ $t('top-commands', [topListLimit]) }}
                </div>
                <div v-if="topCommands.length" class="table-responsive mb-3">
                    <table class="table table-striped table-hover table-dark mb-0">
                        <thead>
                            <tr>
                                <th scope="col">{{ $tc('command', 1) }}</th>
                                <th scope="col">{{ $t('amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="command in topCommands" :key="command.name">
                                <td>{{ command.word }}</td>
                                <td>{{ command.amount }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center">
                    {{ $t('no-top-commands') }}
                </div>
            </div>
        </div>
    </div>
</template>
