<script>
    import Datetime from 'vue-ctk-date-time-picker';
    import audio from '../../method/audio';
    import bsComponent from '../../method/bs-component';
    import dataTable from '../../method/data-table';

    export default {
        components: {
            'c-datetime': Datetime
        },
        mixins: [audio, bsComponent, dataTable],
        data: function() {
            return {
                activeRaffle: {},
                currentTime: 0,
                datetimePicker: {
                    start: '',
                    end: ''
                },
                endCountdown: 0,
                endCountdownInterval: 0,
                hasBackgroundAudio: false,
                hasMultiplicators: false,
                isPopout: false,
                maxDate: moment().add(1, 'd').format('YYYY-MM-DDTHH:00'),
                minDate: moment().format('YYYY-MM-DDTHH:mm'),
                newOption: '',
                raffle: {
                    id: 0,
                    name: '',
                    keyword: '!raffle',
                    active: false,
                    start: moment().unix(),
                    end: 0,
                    audio: {
                        id: 0,
                        file: '',
                        volume: 50
                    },
                    multiplicators: {
                        partner: 1,
                        moderator: 1,
                        vip: 1,
                        subscriber: 1,
                        turbo: 1,
                        prime: 1,
                        follower: 1,
                        guest: 1
                    }
                },
                raffles: null,
                startCountdown: 0,
                startCountdownInterval: 0,
                winner: {
                    id: 0,
                    name: '',
                    chat: 1,
                    audio: {
                        id: 0,
                        file: '',
                        volume: 50
                    }
                }
            };
        },
        watch: {
            'datetimePicker.start': function() {
                this.raffle.start = isNaN(moment(this.datetimePicker.start).unix()) ? moment().unix() : moment(this.datetimePicker.start).unix();
                this.checkDatetimeRange();
            },
            'datetimePicker.end': function() {
                this.raffle.end = isNaN(moment(this.datetimePicker.end).unix()) ? 0 : moment(this.datetimePicker.end).unix();
                this.checkDatetimeRange();
            },
            'hasBackgroundAudio': function() {
                if (!this.hasBackgroundAudio) {
                    this.stopAudio('background');
                    this.raffle.audio = {
                        id: 0,
                        file: '',
                        volume: 50
                    };
                }
            },
            'hasMultiplicators': function() {
                if (this.hasMultiplicators) {
                    let $this = this;
                    setTimeout(function() {
                        $this.initPopover();
                    }, 100);
                } else {
                    this.raffle.multiplicators = {
                        partner: 1,
                        moderator: 1,
                        vip: 1,
                        subscriber: 1,
                        turbo: 1,
                        prime: 1,
                        follower: 1,
                        guest: 1
                    };
                }
            },
            'raffle.audio.id': function() {
                this.raffle.audio.file = this.getAudioFileById(this.raffle.audio.id);
            },
            'raffle.keyword': function() {
                if (/ /.test(this.raffle.keyword)) {
                    this.raffle.keyword = this.raffle.keyword.replace(/ /, '');
                }
            },
            'winner.audio.id': function() {
                this.winner.audio.file = this.getAudioFileById(this.winner.audio.id);
            },
            'winner.id': function() {
                let $this = this;
                setTimeout(function() {
                    $this.initTooltip();
                }, 100);
            }
        },
        mounted: function() {
            let $this = this;
            this.getActiveRaffle();
            this.getAudios('raffle');

            if (/^#\/channel\/(.*)\/raffle\/?/.test(window.location.hash)) {
                this.isPopout = true;
                jQuery('body').css('overflow', 'hidden');
            }

            jQuery('#animate-raffle-winner').on('hidden.bs.modal', function() {
                $this.stopAudio('test');
            });

            jQuery('#all-raffles').on('shown.bs.modal', function() {
                if (!$this.isPopout) {
                    $this.getRaffles();
                }
            });
        },
        methods: {
            addRaffle: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'addRaffle',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            raffle: this.raffle
                        },
                        env: 'node'
                    };
                    socketWrite(call);
                }
            },
            animateRaffleWinner: function() {
                this.getRaffleWinner(false);
                jQuery('#animate-raffle-winner').modal('hide');
            },
            announceRaffleToChat: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'announceRaffleToChat',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            checkDatetimeRange: function() {
                if (this.raffle.end > 0 && this.raffle.end < this.raffle.start) {
                    jQuery('#raffle-end-input').addClass('form-control is-invalid');
                } else {
                    jQuery('#raffle-end-input').removeClass('form-control is-invalid');
                }
            },
            closeRaffleAnimation: function() {
                this.getRaffleWinner(true);
            },
            closeRaffle: function() {
                if (typeof socketWrite === 'function' && confirm(this.$t('confirm-close-raffle', [this.activeRaffle.name]))) {
                    this.endCountdown = 0;
                    const call = {
                        method: 'closeRaffle',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            copyToForm: function(raffle) {
                let mltpctrKeys = Object.keys(raffle.multiplicators);

                if (raffle.audio.id) {
                    this.hasBackgroundAudio = true;
                }

                for (let i = 0; i < mltpctrKeys.length; i++) {
                    if (!this.hasMultiplicators && raffle.multiplicators[mltpctrKeys[i]] !== 1) {
                        this.hasMultiplicators = true;
                    }
                }

                this.raffle = {
                    id: 0,
                    name: raffle.name,
                    keyword: raffle.keyword,
                    active: false,
                    start: moment().unix(),
                    end: 0,
                    audio: {
                        id: raffle.audio.id ? raffle.audio.id : 0,
                        file: raffle.audio.file ? raffle.audio.file : '',
                        volume: raffle.audio.volume ? raffle.audio.volume : 50
                    },
                    multiplicators: raffle.multiplicators
                };
                jQuery('#all-raffles').modal('hide');
            },
            getActiveRaffle: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getActiveRaffle',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getRaffles: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getRaffles',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getRaffleWinner: function(close) {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getRaffleWinner',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            audio: close ? {id: 0, file: '', volume: 50} : this.winner.audio,
                            chat: this.winner.chat,
                            close: close
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            raffleResultToChat: function() {
                if (typeof socketWrite === 'function') {
                    this.startCountdown = 0;
                    const call = {
                        method: 'raffleResultToChat',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            popoutRaffle: function() {
                const url = this.$router.resolve({name: 'raffle', params: {channel: this.$root._route.params.channel}}).href;
                const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=750,height=500';
                window.open(url, 'Raffle', params);
            },
            removeRaffle: function(raffle) {
                if (typeof socketWrite === 'function' && raffle.id > 0  
                    && confirm('Are you sure to remove raffle "' + raffle.name + '"?')) {
                    const call = {
                        method: 'removeRaffle',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            raffle: {
                                id: raffle.id,
                                name: raffle.name,
                                active: raffle.active
                            }
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            resetRaffle: function() {
                this.raffle = {
                    id: 0,
                    name: '',
                    keyword: '!raffle',
                    active: false,
                    start: moment().unix(),
                    end: 0,
                    audio: {
                        id: 0,
                        file: '',
                        volume: 50
                    },
                    multiplicators: {
                        partner: 1,
                        moderator: 1,
                        vip: 1,
                        subscriber: 1,
                        turbo: 1,
                        prime: 1,
                        follower: 1,
                        guest: 1
                    }
                };
            },
            setActiveRaffle: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.activeRaffle = args.raffle;
                    this.currentTime = moment().unix();
                    this.setCountdown();
                    this.resetRaffle();
                    this.initTooltip();

                    if (this.isPopout && this.activeRaffle.id && typeof this.sound.background === 'undefined') {
                        this.playAudio('background', this.activeRaffle.audio.file, this.activeRaffle.audio.volume, true);
                    } else if (!this.activeRaffle.id) {
                        this.stopAudio('background');
                    }
                }
            },
            setCountdown: function() {
                let $this = this;
                clearInterval(this.startCountdownInterval);
                clearInterval(this.endCountdownInterval);
                this.startCountdown = 0;
                this.endCountdown = 0;

                // if start countdown exists and not currently running
                if (this.activeRaffle.start > 0 && this.currentTime < this.activeRaffle.start && !this.startCountdown) {
                    this.startCountdown = this.activeRaffle.start - this.currentTime;
                    this.startCountdownInterval = setInterval(function() {
                        if ($this.startCountdown) {
                            $this.startCountdown--;
                        } else {
                            clearInterval($this.startCountdownInterval);
                        }
                    }, 1000);
                }

                // if end countdown exists and not currently running
                if (this.activeRaffle.end > 0 && this.currentTime < this.activeRaffle.end && !this.endCountdown) {
                    this.endCountdown = this.activeRaffle.end - this.currentTime;
                    this.endCountdownInterval = setInterval(function() {
                        if ($this.endCountdown) {
                            $this.endCountdown--;
                        } else {
                            clearInterval($this.endCountdownInterval);
                        }
                    }, 1000);
                }
            },
            setRaffles: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    if (this.raffles === null || this.raffles.length !== args.raffles.length) {
                        this.raffles = args.raffles;
                        this.initDataTable();
                    }
                }
            },
            setRaffleWinner: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.winner = args.winner;

                    if (this.isPopout) {
                        setTimeout(function() {
                            jQuery('.raffle .winner').height(jQuery(window).height());
                        }, 100);

                        if (this.winner.audio.id) {
                            this.playAudio('winner', this.winner.audio.file, this.winner.audio.volume);
                        } else {
                            this.stopAudio('winner');
                        }
                    }
                }
            },
            startRaffle: function() {
                if (typeof socketWrite === 'function') {
                    this.startCountdown = 0;
                    const call = {
                        method: 'startRaffle',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            }
        }
    };
</script>

<template>
    <div class="raffle p-2" :class="{popout: isPopout}">
        <div v-if="activeRaffle.id && !isPopout" class="h4 text-center">
            <a href="#" onclick="javascript:return false;" @click="popoutRaffle()">{{ $t('raffle') }} <font-awesome-icon :icon="['fas', 'external-link-alt']" class="fa-fw" /></a>
        </div>
        <div v-if="!activeRaffle.id && !isPopout" class="h4 text-center">
            {{ $t('raffle') }}
        </div>
        <div class="row">
            <div class="col-12">
                <div v-if="activeRaffle.id && startCountdown > 0" class="text-white">
                    <div class="h5">
                        {{ activeRaffle.name }}
                    </div>
                    <p>{{ $t('raffle-starts-in') }} {{ startCountdown|formatDuration() }}</p>
                    <button v-if="!isPopout" type="button" class="btn btn-sm btn-primary" @click="startRaffle()">{{ $t('start-raffle') }}</button>
                </div>
                <div v-if="!activeRaffle.id && isPopout" class="text-center h2">
                    {{ $t('no-raffle-active') }}
                </div>
                <div v-if="activeRaffle.id && startCountdown === 0" class="text-white">
                    <div v-if="!winner.name" class="overview">
                        <div class="h5">
                            {{ activeRaffle.name }}
                        </div>
                        <p>
                            <span v-if="activeRaffle.keyword === null" class="text-nowrap">{{ $t('join-via-poll') }} |&nbsp;</span>
                            <span v-else>{{ $t('keyword') }}: {{ activeRaffle.keyword }} |&nbsp;</span>
                            {{ $tc('attendee', activeRaffle.attendeeCount) }}: {{ activeRaffle.attendeeCount }} |&nbsp;
                            {{ $tc('entry', activeRaffle.entries) }}: {{ activeRaffle.entries }}
                        </p>
                        <p>
                            {{ $tc('attendee', activeRaffle.attendeeCount) }}: {{ activeRaffle.attendees }}
                        </p>
                        <p v-if="activeRaffle.end && endCountdown">
                            {{ $t('raffle-ends-in') }} {{ endCountdown|formatDuration() }}
                        </p>
                        <p v-if="activeRaffle.end && !endCountdown">
                            {{ $t('raffle-has-ended') }}
                        </p>
                    </div>
                    <div v-if="winner.name" class="winner">
                        <div class="option text-primary text-center">
                            {{ winner.name }}
                        </div>

                        <div class="confetti-wrapper">
                            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                            <div v-for="index in 160" :key="index" class="confetti"></div>
                        </div>
                    </div>
                    <div v-if="!isPopout" class="text-right">
                        <span v-if="winner.id" class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('close-animation')"><button v-if="winner.id" type="button" class="btn btn-sm btn-warning" @click="closeRaffleAnimation()"><font-awesome-icon :icon="['fas', 'award']" class="fa-fw" /></button></span>
                        <span v-if="!winner.id" class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('animate-winner')"><button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#animate-raffle-winner"><font-awesome-icon :icon="['fas', 'award']" class="fa-fw" /></button></span>
                        <span class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('announce-to-chat')"><button type="button" class="btn btn-sm btn-primary" @click="announceRaffleToChat()"><font-awesome-icon :icon="['fas', 'comment-dots']" class="fa-fw" /></button></span>
                        <span class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('result-to-chat')"><button type="button" class="btn btn-sm btn-primary" @click="raffleResultToChat()"><font-awesome-icon :icon="['fas', 'chart-pie']" class="fa-fw" /></button></span>
                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('close-raffle')"><button type="button" class="btn btn-sm btn-danger" @click="closeRaffle()"><font-awesome-icon :icon="['fas', 'times']" class="fa-fw" /></button></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" :class="{'d-none': activeRaffle.id || isPopout}">
            <div class="col-12">
                <div class="form-group">
                    <label for="raffle-name">{{ $t('annoucement') }}:</label>
                    <input id="raffle-name" v-model="raffle.name" type="text" class="form-control" placeholder="" :class="{'is-invalid': raffle.name === ''}">
                </div>
                <div class="form-group">
                    <label for="raffle-keyword">{{ $t('keyword') }}:</label>
                    <input id="raffle-keyword" v-model="raffle.keyword" type="text" class="form-control" placeholder="" :class="{'is-invalid': raffle.keyword === ''}">
                </div>
                <div class="form-row">
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="raffle-start">{{ $t('start') }}:</label>
                            <c-datetime id="raffle-start" v-model="datetimePicker.start" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" :locale="$t('lang')"></c-datetime>
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="raffle-end">{{ $t('end') }}:</label>
                            <c-datetime id="raffle-end" v-model="datetimePicker.end" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" :locale="$t('lang')"></c-datetime>
                        </div>
                    </div>
                    <div v-if="hasMultiplicators" class="col-12">
                        <label for="raffle-multiplicators-partner" class="col-form-label">
                            {{ $t('multiplicators') }}&nbsp;
                            <span class="d-inline-block" data-toggle="popover" :title="$t('multiplicators-title')" :data-content="$t('multiplicators-content')">
                                <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                            </span>
                        </label>
                    </div>
                    <div v-for="(multiplicator, name) in raffle.multiplicators" :key="name" class="col-12 col-md-6 col-lg-4 col-xl-3">
                        <div v-if="hasMultiplicators" class="form-group">
                            <label :for="'raffle-multiplicators-' + name">{{ $t('multiplicator-' + name) }}:</label>
                            <input :id="'raffle-multiplicators-' + name" v-model.number="raffle.multiplicators[name]" type="number" min="-1" max="100" class="form-control">
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="form-group custom-control custom-switch float-left mr-3">
                            <input id="raffle-multiplicators" v-model="hasMultiplicators" type="checkbox" class="custom-control-input">
                            <label for="raffle-multiplicators" class="custom-control-label">{{ $t('multiplicators') }}</label>
                        </div>
                        <div class="form-group custom-control custom-switch float-left">
                            <input id="raffle-background-audio" v-model="hasBackgroundAudio" type="checkbox" class="custom-control-input">
                            <label for="raffle-background-audio" class="custom-control-label">{{ $t('background-audio') }}</label>
                        </div>
                    </div>
                    <div v-if="hasBackgroundAudio" class="col-12">
                        <div class="form-row">
                            <div class="col-12 col-lg-6">
                                <div class="form-group">
                                    <label for="raffle-audio-file" class="col-form-label">
                                        {{ $t('audio-file') }}:&nbsp;
                                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('audio-file-tooltip')">
                                            <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                        </span>
                                    </label>
                                    <select id="raffle-audio-file" v-model.number="raffle.audio.id" class="custom-select">
                                        <option value="0">{{ $t('none') }}</option>
                                        <option v-for="audio in audioLoops" :key="audio.id" :value="audio.id">{{ audio.name }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-lg-6">
                                <div class="form-group">
                                    <label for="raffle-audio-volume">{{ $t('volume') }} ({{ raffle.audio.volume }}%)</label>
                                    <input id="raffle-audio-volume" v-model.number="raffle.audio.volume" type="range" class="custom-range mt-md-3" min="0" max="100" step="1" @change="setAudioVolume('background', raffle.audio.volume / 100)">
                                </div>
                            </div>
                            <div class="col-12 mb-3">
                                <button type="button" class="btn btn-light mr-2" :disabled="!raffle.audio.file.length" @click="playAudio('background', raffle.audio.file, raffle.audio.volume, true)">{{ $t('play-audio') }}</button>
                                <button type="button" class="btn btn-light" @click="stopAudio('background')">Stop Audio</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 text-right">
                        <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="modal" data-target="#all-raffles">{{ $t('all-raffles') }}</button>
                        <button type="button" class="btn btn-sm btn-primary" :disabled="raffle.name === '' || raffle.keyword === '' || (raffle.end > 0 && raffle.end < raffle.start)" @click="addRaffle()">{{ $t('activate-raffle') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="all-raffles" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="all-raffles-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl modal-xxl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="all-raffles-modal-title" class="modal-title">
                            {{ $t('all-raffles') }}
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div v-if="raffles === null" class="col-12">
                                {{ $t('please-wait') }} <font-awesome-icon :icon="['fas', 'sync']" class="fa-spin" />.
                            </div>
                            <div v-else-if="raffles.length" class="col-12">
                                <div class="table-responsive">
                                    <table id="rafflesTable" class="table table-striped table-hover table-dark data-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">{{ $t('name') }}</th>
                                                <th scope="col">{{ $t('multiplicators') }}</th>
                                                <th scope="col">{{ $t('summary') }}</th>
                                                <th scope="col">{{ $t('created-at') }}</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(raffleItem, index) in raffles" :key="raffleItem.id" class="video">
                                                <td>{{ index + 1 }}</td>
                                                <td>
                                                    <span class="text-nowrap">{{ raffleItem.name }}</span><br>
                                                    <span v-if="raffleItem.keyword === null" class="text-nowrap">{{ $t('join-via-poll') }}</span>
                                                    <span v-else class="text-nowrap">{{ $t('keyword') }}: {{ raffleItem.keyword }}</span>
                                                </td>
                                                <td>
                                                    <span v-for="(multiplicator, name) in raffleItem.multiplicators" :key="name" class="text-nowrap">
                                                        {{ name }}: {{ multiplicator }}<br>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span v-if="raffleItem.audio.id" class="text-nowrap">{{ $t('raffle-audio') }}: {{ raffleItem.audio.name }}<br></span>
                                                    <span class="text-nowrap">{{ $tc('attendee', raffleItem.attendeeCount) }}: {{ raffleItem.attendeeCount }}<br></span>
                                                    <span class="text-nowrap">{{ $tc('entry', raffleItem.entries) }}: {{ raffleItem.entries }}<br></span>
                                                    <span class="text-nowrap">{{ $t('winner') }}: {{ raffleItem.winner }}<br></span>
                                                    <span v-if="raffleItem.winnerAudio" class="text-nowrap">{{ $t('winner-audio') }}: {{ raffleItem.winnerAudio }}</span>
                                                </td>
                                                <td>{{ raffleItem.createdAt|formatDateTime($t('datetime')) }}</td>
                                                <td>
                                                    <span class="text-nowrap">
                                                        <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="tooltip" data-placement="top" :title="$t('copy-to-form')" @click="copyToForm(raffleItem)"><font-awesome-icon :icon="['fas', 'copy']" class="fa-fw" /></button>
                                                        <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" :title="$t('remove-raffle')" :disabled="raffleItem.active" @click="removeRaffle(raffleItem)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div v-else class="col-12">
                                {{ $t('raffles-not-found') }}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ $t('close') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="animate-raffle-winner" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="animate-raffle-winner-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="animate-raffle-winner-modal-title" class="modal-title">
                            {{ $t('animate-winner') }}
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label for="animate-raffle-winner-file" class="col-form-label">
                                        {{ $t('audio-file') }}:&nbsp;
                                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('audio-file-tooltip')">
                                            <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                        </span>
                                    </label>
                                    <select id="animate-raffle-winner-file" v-model.number="winner.audio.id" class="custom-select">
                                        <option value="0">{{ $t('none') }}</option>
                                        <option v-for="audio in audioJingles" :key="audio.id" :value="audio.id">{{ audio.name }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label for="animate-raffle-winner-volume">{{ $t('volume') }} ({{ winner.audio.volume }}%)</label>
                                    <input id="animate-raffle-winner-volume" v-model.number="winner.audio.volume" type="range" class="custom-range mt-md-3" min="0" max="100" step="1" @change="setAudioVolume('winner', winner.audio.volume / 100)">
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="custom-control custom-switch">
                                    <input id="animate-raffle-winner-Announce" v-model.number="winner.chat" type="checkbox" value="1" class="custom-control-input">
                                    <label class="custom-control-label" for="animate-raffle-winner-Announce">{{ $t('announce-winner-to-chat') }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" :disabled="!winner.audio.file.length" @click="playAudio('winner', winner.audio.file, winner.audio.volume)">{{ $t('play-audio') }}</button>
                        <button type="button" class="btn btn-light" @click="stopAudio('winner')">{{ $t('stop-audio') }}</button>
                        <button type="button" class="btn btn-primary" @click="animateRaffleWinner()">{{ $t('ok') }}</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ $t('close') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
