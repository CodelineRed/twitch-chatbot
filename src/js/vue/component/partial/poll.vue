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
                activePoll: {},
                activeRaffle: {},
                currentTime: 0,
                datetimePicker: {
                    start: '',
                    end: ''
                },
                endCountdown: 0,
                endCountdownInterval: 0,
                hasBackgroundAudio: false,
                hasRaffle: false,
                isPopout: false,
                maxDate: moment().add(1, 'd').format('YYYY-MM-DDTHH:00'),
                minDate: moment().format('YYYY-MM-DDTHH:mm'),
                newOption: '',
                poll: {
                    id: 0,
                    raffleId: null,
                    name: '',
                    active: false,
                    multipleChoice: false,
                    start: moment().unix(),
                    end: 0,
                    audio: {
                        id: 0,
                        file: '',
                        volume: 50
                    },
                    options: []
                },
                polls: null,
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
            'activeRaffle.id': function() {
                if (this.hasRaffle && typeof this.activeRaffle.id !== 'undefined') {
                    this.poll.raffleId = this.activeRaffle.id;
                } else {
                    this.poll.raffleId = null;
                }
            },
            'datetimePicker.start': function() {
                this.poll.start = isNaN(moment(this.datetimePicker.start).unix()) ? moment().unix() : moment(this.datetimePicker.start).unix();
                this.checkDatetimeRange();
            },
            'datetimePicker.end': function() {
                this.poll.end = isNaN(moment(this.datetimePicker.end).unix()) ? 0 : moment(this.datetimePicker.end).unix();
                this.checkDatetimeRange();
            },
            'hasBackgroundAudio': function() {
                if (!this.hasBackgroundAudio) {
                    this.stopAudio('background');
                    this.poll.audio = {
                        id: 0,
                        file: '',
                        volume: 50
                    };
                }
            },
            'hasRaffle': function() {
                if (this.hasRaffle && typeof this.activeRaffle.id !== 'undefined') {
                    this.poll.raffleId = this.activeRaffle.id;
                } else {
                    this.poll.raffleId = null;
                }
            },
            'poll.audio.id': function() {
                this.poll.audio.file = this.getAudioFileById(this.poll.audio.id);
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
            this.getActivePoll();
            this.getAudios('poll');

            if (/^#\/channel\/(.*)\/poll\/?/.test(window.location.hash)) {
                this.isPopout = true;
                jQuery('body').css('overflow', 'hidden');
            }

            jQuery('#animate-poll-winner').on('hidden.bs.modal', function() {
                $this.stopAudio('test');
            });

            jQuery('#all-polls').on('shown.bs.modal', function() {
                if (!$this.isPopout) {
                    $this.getPolls();
                }
            });
        },
        methods: {
            addOption: function() {
                if (this.newOption) {
                    this.poll.options.push(this.newOption);
                    this.newOption = '';
                }
            },
            addPoll: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'addPoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            item: this.poll
                        },
                        env: 'node'
                    };
                    socketWrite(call);
                }
            },
            animatePollWinner: function() {
                this.getPollWinner(false);
                jQuery('#animate-poll-winner').modal('hide');
            },
            announcePollToChat: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'announcePollToChat',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            checkDatetimeRange: function() {
                if (this.poll.end > 0 && this.poll.end < this.poll.start) {
                    jQuery('#poll-end-input').addClass('form-control is-invalid');
                } else {
                    jQuery('#poll-end-input').removeClass('form-control is-invalid');
                }
            },
            closePollAnimation: function() {
                this.getPollWinner(true);
            },
            closePoll: function() {
                if (typeof socketWrite === 'function' && confirm(this.$t('confirm-close-poll', [this.activePoll.name]))) {
                    this.endCountdown = 0;
                    const call = {
                        method: 'closePoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            copyToForm: function(poll) {
                let options = [];

                for (var i = 0; i < poll.options.length; i++) {
                    options.push(poll.options[i].name);
                }

                if (poll.audio.id) {
                    this.hasBackgroundAudio = true;
                }

                this.poll = {
                    id: 0,
                    raffleId: null,
                    name: poll.name,
                    active: false,
                    multipleChoice: poll.multipleChoice,
                    start: moment().unix(),
                    end: 0,
                    options: options,
                    audio: {
                        id: poll.audio.id ? poll.audio.id : 0,
                        file: poll.audio.file ? poll.audio.file : '',
                        volume: poll.audio.volume ? poll.audio.volume : 50
                    }
                };
                jQuery('#all-polls').modal('hide');
            },
            getActivePoll: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getActivePoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getPolls: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getPolls',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getPollWinner: function(close) {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getPollWinner',
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
            pollResultToChat: function() {
                if (typeof socketWrite === 'function') {
                    this.startCountdown = 0;
                    const call = {
                        method: 'pollResultToChat',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            popoutPoll: function() {
                const url = this.$router.resolve({name: 'poll', params: {channel: this.$root._route.params.channel}}).href;
                const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=500,height=750';
                window.open(url, 'Poll', params);
            },
            removeOption(index) {
                this.poll.options.splice(index, 1);
            },
            removePoll: function(poll) {
                if (typeof socketWrite === 'function' && poll.id > 0  
                    && confirm(this.$t('confirm-remove-poll', [poll.name]))) {
                    const call = {
                        method: 'removePoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            item: {
                                id: poll.id,
                                name: poll.name,
                                active: poll.active
                            }
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            resetPoll: function() {
                this.poll = {
                    id: 0,
                    raffleId: null,
                    name: '',
                    active: false,
                    multipleChoice: false,
                    start: moment().unix(),
                    end: 0,
                    options: [],
                    audio: {
                        id: 0,
                        file: '',
                        volume: 50
                    }
                };
            },
            setActivePoll: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.activePoll = args.item;
                    this.currentTime = moment().unix();
                    this.setCountdown();
                    this.resetPoll();
                    this.initTooltip();

                    if (this.isPopout && this.activePoll.id && typeof this.sound.background === 'undefined') {
                        this.playAudio('background', this.activePoll.audio.file, this.activePoll.audio.volume, true);
                    } else if (!this.activePoll.id) {
                        this.stopAudio('background');
                    }
                }
            },
            setActiveRaffle: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.activeRaffle = args.raffle;
                }
            },
            setCountdown: function() {
                let $this = this;
                clearInterval(this.startCountdownInterval);
                clearInterval(this.endCountdownInterval);
                this.startCountdown = 0;
                this.endCountdown = 0;

                // if start countdown exists and not currently running
                if (this.activePoll.start > 0 && this.currentTime < this.activePoll.start && !this.startCountdown) {
                    this.startCountdown = this.activePoll.start - this.currentTime;
                    this.startCountdownInterval = setInterval(function() {
                        if ($this.startCountdown) {
                            $this.startCountdown--;
                        } else {
                            clearInterval($this.startCountdownInterval);
                        }
                    }, 1000);
                }

                // if end countdown exists and not currently running
                if (this.activePoll.end > 0 && this.currentTime < this.activePoll.end && !this.endCountdown) {
                    this.endCountdown = this.activePoll.end - this.currentTime;
                    this.endCountdownInterval = setInterval(function() {
                        if ($this.endCountdown) {
                            $this.endCountdown--;
                        } else {
                            clearInterval($this.endCountdownInterval);
                        }
                    }, 1000);
                }
            },
            setPolls: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    if (this.polls === null || this.polls.length !== args.list.length) {
                        this.polls = args.list;
                        this.initDataTable();
                    }
                }
            },
            setPollWinner: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.winner = args.item;

                    if (this.isPopout) {
                        setTimeout(function() {
                            jQuery('.poll .winner').height(jQuery(window).height());
                        }, 100);

                        if (this.winner.audio.id) {
                            this.playAudio('winner', this.winner.audio.file, this.winner.audio.volume);
                        } else {
                            this.stopAudio('winner');
                        }
                    }
                }
            },
            startPoll: function() {
                if (typeof socketWrite === 'function') {
                    this.startCountdown = 0;
                    const call = {
                        method: 'startPoll',
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
    <div class="poll p-2" :class="{popout: isPopout}">
        <div v-if="activePoll.id && !isPopout" class="h4 text-center">
            <a href="#" onclick="javascript:return false;" @click="popoutPoll()">{{ $t('poll') }} <font-awesome-icon :icon="['fas', 'external-link-alt']" class="fa-fw" /></a>
        </div>
        <div v-if="!activePoll.id && !isPopout" class="h4 text-center">
            {{ $t('poll') }}
        </div>
        <div class="row">
            <div class="col-12">
                <div v-if="activePoll.id && startCountdown > 0" class="text-white">
                    <div class="h5">
                        {{ activePoll.name }}
                    </div>
                    <p>{{ $t('multiple-choice') }}: <span v-if="activePoll.multipleChoice">{{ $t('yes') }}</span><span v-else>{{ $t('no') }}</span></p>
                    <p>{{ $t('poll-starts-in') }} {{ startCountdown|formatDuration() }}</p>
                    <button v-if="!isPopout" type="button" class="btn btn-sm btn-primary" @click="startPoll()">{{ $t('start-poll') }}</button>
                </div>
                <div v-if="!activePoll.id && isPopout" class="text-center h2">
                    {{ $t('no-poll-active') }}
                </div>
                <div v-if="activePoll.id && startCountdown === 0" class="text-white">
                    <div v-if="!winner.id" class="overview">
                        <div class="h5">
                            {{ activePoll.name }}
                        </div>
                        <p>
                            <span v-if="activePoll.raffleId">
                                {{ $t('raffle') }}: {{ activePoll.raffleName }}<br>
                            </span>
                            {{ $t('multiple-choice') }}: <span v-if="activePoll.multipleChoice">{{ $t('yes') }}</span><span v-else>{{ $t('no') }}</span><br>
                            {{ $tc('attendee', activePoll.attendees) }}: {{ activePoll.attendees }} | {{ $tc('vote', activePoll.votes) }}: {{ activePoll.votes }}
                        </p>
                        <div v-for="(option, index) in activePoll.options" :key="option.id" class="mb-3">
                            <div class="form-row">
                                <div class="col">
                                    !vote {{ index + 1 }} - {{ option.name }}
                                </div>
                                <div class="col text-right">
                                    {{ option.average }}% ({{ option.votes }} {{ $tc('vote', option.votes) }})
                                </div>
                            </div>
                            <div class="progress mt-2">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" :style="'width:' + option.average + '%'"></div>
                            </div>
                        </div>
                        <p v-if="activePoll.end && endCountdown">
                            {{ $t('poll-ends-in') }} {{ endCountdown|formatDuration() }}
                        </p>
                        <p v-if="activePoll.end && !endCountdown">
                            {{ $t('poll-has-ended') }}
                        </p>
                    </div>
                    <div v-if="winner.id" class="winner">
                        <div class="option text-primary text-center">
                            {{ winner.name }}
                        </div>

                        <div class="confetti-wrapper">
                            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                            <div v-for="index in 160" :key="index" class="confetti"></div>
                        </div>
                    </div>
                    <div v-if="!isPopout" class="text-right">
                        <span v-if="winner.id" class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('close-animation')"><button v-if="winner.id" type="button" class="btn btn-sm btn-warning" @click="closePollAnimation()"><font-awesome-icon :icon="['fas', 'award']" class="fa-fw" /></button></span>
                        <span v-if="!winner.id" class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('animate-winner')"><button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#animate-poll-winner"><font-awesome-icon :icon="['fas', 'award']" class="fa-fw" /></button></span>
                        <span class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('announce-to-chat')"><button type="button" class="btn btn-sm btn-primary" @click="announcePollToChat()"><font-awesome-icon :icon="['fas', 'comment-dots']" class="fa-fw" /></button></span>
                        <span class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" :title="$t('result-to-chat')"><button type="button" class="btn btn-sm btn-primary" @click="pollResultToChat()"><font-awesome-icon :icon="['fas', 'chart-pie']" class="fa-fw" /></button></span>
                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('close-poll')"><button type="button" class="btn btn-sm btn-danger" @click="closePoll()"><font-awesome-icon :icon="['fas', 'times']" class="fa-fw" /></button></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" :class="{'d-none': activePoll.id || isPopout}">
            <div class="col-12">
                <div class="form-group">
                    <label for="poll-name">{{ $tc('question', 1) }}:</label>
                    <input id="poll-name" v-model="poll.name" type="text" class="form-control" placeholder="" :class="{'is-invalid': poll.name === ''}">
                </div>
                <div class="form-group">
                    <label for="poll-options">{{ $tc('option', 2) }}:</label>
                    <input id="poll-options" v-model="newOption" type="text" class="form-control" :placeholder="$t('new-option')" :class="{'is-invalid': !poll.options.length}" @keyup.enter="addOption()">
                    <div v-if="poll.options.length" class="list-group pt-2">
                        <button v-for="(option, index) in poll.options" :key="option.id" type="button" class="list-group-item list-group-item-action" @click="removeOption(index)">{{ option }}</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="poll-start">{{ $t('start') }}:</label>
                            <c-datetime id="poll-start" v-model="datetimePicker.start" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" :locale="$t('lang')"></c-datetime>
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="poll-end">{{ $t('end') }}:</label>
                            <c-datetime id="poll-end" v-model="datetimePicker.end" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" :locale="$t('lang')"></c-datetime>
                        </div>
                    </div>
                    <div v-if="hasRaffle" class="col-12 mb-3 text-white">
                        <div v-if="activeRaffle.id">
                            {{ $t('raffle') }}: {{ activeRaffle.name }}
                        </div>
                        <div v-else>
                            {{ $t('please-activate-raffle') }}
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="form-group custom-control custom-switch float-left mr-3">
                            <input id="poll-multiple-choice" v-model="poll.multipleChoice" type="checkbox" class="custom-control-input">
                            <label for="poll-multiple-choice" class="custom-control-label">{{ $t('multiple-choice') }}</label>
                        </div>
                        <div class="form-group custom-control custom-switch float-left mr-3">
                            <input id="poll-background-audio" v-model="hasBackgroundAudio" type="checkbox" class="custom-control-input">
                            <label for="poll-background-audio" class="custom-control-label">{{ $t('background-audio') }}</label>
                        </div>
                        <div class="form-group custom-control custom-switch float-left">
                            <input id="poll-has-raffle" v-model="hasRaffle" type="checkbox" class="custom-control-input">
                            <label for="poll-has-raffle" class="custom-control-label">{{ $t('raffle') }}</label>
                        </div>
                    </div>
                    <div v-if="hasBackgroundAudio" class="col-12">
                        <div class="form-row">
                            <div class="col-12 col-lg-6">
                                <div class="form-group">
                                    <label for="poll-audio-file" class="col-form-label">
                                        {{ $t('audio-file') }}:&nbsp;
                                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('audio-file-tooltip')">
                                            <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                        </span>
                                    </label>
                                    <select id="poll-audio-file" v-model.number="poll.audio.id" class="custom-select">
                                        <option value="0">{{ $t('none') }}</option>
                                        <option v-for="audio in audioLoops" :key="audio.id" :value="audio.id">{{ audio.name }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-lg-6">
                                <div class="form-group">
                                    <label for="poll-audio-volume">{{ $t('volume') }} ({{ poll.audio.volume }}%)</label>
                                    <input id="poll-audio-volume" v-model.number="poll.audio.volume" type="range" class="custom-range mt-md-3" min="0" max="100" step="1" @change="setAudioVolume('background', poll.audio.volume / 100)">
                                </div>
                            </div>
                            <div class="col-12 mb-3">
                                <button type="button" class="btn btn-light mr-2" :disabled="!poll.audio.file.length" @click="playAudio('background', poll.audio.file, poll.audio.volume, true)">{{ $t('play-audio') }}</button>
                                <button type="button" class="btn btn-light" @click="stopAudio('background')">{{ $t('stop-audio') }}</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 text-right">
                        <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="modal" data-target="#all-polls">{{ $t('all-polls') }}</button>
                        <button type="button" class="btn btn-sm btn-primary" :disabled="poll.name === '' || !poll.options.length || (poll.end > 0 && poll.end < poll.start)" @click="addPoll()">{{ $t('activate-poll') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="all-polls" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="all-polls-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl modal-xxl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="all-polls-modal-title" class="modal-title">
                            {{ $t('all-polls') }}
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div v-if="polls === null" class="col-12">
                                {{ $t('please-wait') }} <font-awesome-icon :icon="['fas', 'sync']" class="fa-spin" />.
                            </div>
                            <div v-else-if="polls.length" class="col-12">
                                <div class="table-responsive">
                                    <table id="pollsTable" class="table table-striped table-hover table-dark data-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">{{ $t('question') }}</th>
                                                <th scope="col">{{ $tc('option', 2) }}</th>
                                                <th scope="col">{{ $t('multiple-choice') }}</th>
                                                <th scope="col">{{ $tc('attendee', 2) }}</th>
                                                <th scope="col">{{ $tc('vote', 2) }}</th>
                                                <th scope="col">{{ $t('audio') }}</th>
                                                <th scope="col">{{ $t('created-at') }}</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(pollItem, index) in polls" :key="pollItem.id" class="video">
                                                <td>{{ index + 1 }}</td>
                                                <td>{{ pollItem.name }}</td>
                                                <td>
                                                    <span v-for="option in pollItem.options" :key="option.id" class="text-nowrap">
                                                        {{ option.name }} - {{ option.average }}% ({{ option.votes }} {{ $tc('vote', option.votes) }})<span v-if="option.winner">&nbsp;<font-awesome-icon :icon="['fas', 'award']"></font-awesome-icon></span><br>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span v-if="pollItem.multipleChoice">{{ $t('yes') }}</span>
                                                    <span v-else>{{ $t('no') }}</span>
                                                </td>
                                                <td>{{ pollItem.attendees }}</td>
                                                <td>{{ pollItem.votes }}</td>
                                                <td>
                                                    <span v-if="pollItem.audio.id" class="text-nowrap">{{ $t('poll') }}: {{ pollItem.audio.name }}<br></span>
                                                    <span v-for="option in pollItem.options" :key="option.id" class="text-nowrap">
                                                        <span v-if="option.winner && option.audio.id">{{ $tc('option', 1) }}: {{ option.audio.name }}</span>
                                                    </span>
                                                </td>
                                                <td>{{ pollItem.createdAt|formatDateTime($t('datetime')) }}</td>
                                                <td>
                                                    <span class="text-nowrap">
                                                        <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="tooltip" data-placement="top" :title="$t('copy-to-form')" @click="copyToForm(pollItem)"><font-awesome-icon :icon="['fas', 'copy']" class="fa-fw" /></button>
                                                        <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" :title="$t('remove-poll')" :disabled="pollItem.active" @click="removePoll(pollItem)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div v-else class="col-12">
                                {{ $t('polls-not-found') }}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ $t('close') }}</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="animate-poll-winner" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="animate-poll-winner-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="animate-poll-winner-modal-title" class="modal-title">
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
                                    <label for="animate-poll-winner-file" class="col-form-label">
                                        {{ $t('audio-file') }}:&nbsp;
                                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" :title="$t('audio-file-tooltip')">
                                            <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                        </span>
                                    </label>
                                    <select id="animate-poll-winner-file" v-model.number="winner.audio.id" class="custom-select">
                                        <option value="0">{{ $t('none') }}</option>
                                        <option v-for="audio in audioJingles" :key="audio.id" :value="audio.id">{{ audio.name }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label for="animate-poll-winner-volume">{{ $t('volume') }} ({{ winner.audio.volume }}%)</label>
                                    <input id="animate-poll-winner-volume" v-model.number="winner.audio.volume" type="range" class="custom-range mt-md-3" min="0" max="100" step="1" @change="setAudioVolume('winner', winner.audio.volume / 100)">
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="custom-control custom-switch">
                                    <input id="animate-poll-winner-Announce" v-model.number="winner.chat" type="checkbox" value="1" class="custom-control-input">
                                    <label class="custom-control-label" for="animate-poll-winner-Announce">{{ $t('announce-winner-to-chat') }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" :disabled="!winner.audio.file.length" @click="playAudio('winner', winner.audio.file, winner.audio.volume)">{{ $t('play-audio') }}</button>
                        <button type="button" class="btn btn-light" @click="stopAudio('winner')">{{ $t('stop-audio') }}</button>
                        <button type="button" class="btn btn-primary" @click="animatePollWinner()">{{ $t('ok') }}</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">{{ $t('close') }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
