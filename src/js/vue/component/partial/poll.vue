<script>
    import Datetime from 'vue-ctk-date-time-picker';
    import audio from '../../method/audio';
    import bsComponent from '../../method/bs-component';

    export default {
        components: {
            'c-datetime': Datetime
        },
        mixins: [audio, bsComponent],
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
                polls: [],
                startCountdown: 0,
                startCountdownInterval: 0,
                winner: {
                    id: 0,
                    name: '',
                    chat: 0,
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

            if (!this.isPopout) {
                this.getPolls();
            }

            jQuery('#animate-poll-winner').on('hidden.bs.modal', function() {
                $this.stopAudio('test');
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
                            poll: this.poll
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
                if (typeof socketWrite === 'function' && confirm('Are you sure to close "' + this.activePoll.name + '"?')) {
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
                    && confirm('Are you sure to remove poll "' + poll.name + '"?')) {
                    const call = {
                        method: 'removePoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            poll: {
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
                    this.activePoll = args.poll;
                    this.currentTime = moment().unix();
                    this.setCountdown();
                    this.resetPoll();
                    this.initTooltip();

                    if (this.isPopout && this.activePoll.id && typeof this.audioNodes.background === 'undefined') {
                        this.playAudio('background', this.activePoll.audio.file, this.activePoll.audio.volume / 100, true);
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
                    this.polls = args.polls;
                }
            },
            setPollWinner: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.winner = args.winner;

                    if (this.isPopout) {
                        setTimeout(function() {
                            jQuery('.poll .winner').height(jQuery(window).height());
                        }, 100);

                        if (this.winner.audio.id) {
                            this.playAudio('winner', this.winner.audio.file, this.winner.audio.volume / 100);
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
            <a href="#" onclick="javascript:return false;" @click="popoutPoll()">Poll <font-awesome-icon :icon="['fas', 'external-link-alt']" class="fa-fw" /></a>
        </div>
        <div v-if="!activePoll.id && !isPopout" class="h4 text-center">
            Poll
        </div>
        <div class="row">
            <div class="col-12">
                <div v-if="activePoll.id && startCountdown > 0" class="text-white">
                    <div class="h5">
                        {{ activePoll.name }}
                    </div>
                    <p>Multiple Choice: <span v-if="activePoll.multipleChoice">Yes</span><span v-if="!activePoll.multipleChoice">No</span></p>
                    <p>Poll starts in {{ startCountdown|formatDuration() }}</p>
                    <button v-if="!isPopout" type="button" class="btn btn-sm btn-primary" @click="startPoll()">Start Poll</button>
                </div>
                <div v-if="!activePoll.id && isPopout" class="text-center h2">
                    No Poll is currently active!
                </div>
                <div v-if="activePoll.id && startCountdown === 0" class="text-white">
                    <div v-if="!winner.id" class="overview">
                        <div class="h5">
                            {{ activePoll.name }}
                        </div>
                        <p>
                            <span v-if="activePoll.raffleId">
                                Raffle: {{ activePoll.raffleName }}<br>
                            </span>
                            Multiple Choice: <span v-if="activePoll.multipleChoice">Yes</span><span v-if="!activePoll.multipleChoice">No</span><br>
                            Attendees: {{ activePoll.attendees }} | Votes: {{ activePoll.votes }}
                        </p>
                        <div v-for="(option, index) in activePoll.options" :key="option.id" class="mb-3">
                            <div class="form-row">
                                <div class="col">
                                    !vote {{ index + 1 }} - {{ option.name }}
                                </div>
                                <div class="col text-right">
                                    {{ option.average }}% ({{ option.votes }} Votes)
                                </div>
                            </div>
                            <div class="progress mt-2">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" :style="'width:' + option.average + '%'"></div>
                            </div>
                        </div>
                        <p v-if="activePoll.end && endCountdown">
                            Poll ends in {{ endCountdown|formatDuration() }}
                        </p>
                        <p v-if="activePoll.end && !endCountdown">
                            Poll has ended
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
                        <span v-if="winner.id" class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" title="Close Animation"><button v-if="winner.id" type="button" class="btn btn-sm btn-warning" @click="closePollAnimation()"><font-awesome-icon :icon="['fas', 'award']" class="fa-fw" /></button></span>
                        <span v-if="!winner.id" class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" title="Animate Winner"><button type="button" class="btn btn-sm btn-primary" data-toggle="modal" data-target="#animate-poll-winner"><font-awesome-icon :icon="['fas', 'award']" class="fa-fw" /></button></span>
                        <span class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" title="Announce to Chat"><button type="button" class="btn btn-sm btn-primary" @click="announcePollToChat()"><font-awesome-icon :icon="['fas', 'comment-dots']" class="fa-fw" /></button></span>
                        <span class="d-inline-block mr-2" data-toggle="tooltip" data-placement="top" title="Result to Chat"><button type="button" class="btn btn-sm btn-primary" @click="pollResultToChat()"><font-awesome-icon :icon="['fas', 'chart-pie']" class="fa-fw" /></button></span>
                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Close Poll"><button type="button" class="btn btn-sm btn-danger" @click="closePoll()"><font-awesome-icon :icon="['fas', 'times']" class="fa-fw" /></button></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" :class="{'d-none': activePoll.id || isPopout}">
            <div class="col-12">
                <div class="form-group">
                    <label for="poll-name">Question:</label>
                    <input id="poll-name" v-model="poll.name" type="text" class="form-control" placeholder="" :class="{'is-invalid': poll.name === ''}">
                </div>
                <div class="form-group">
                    <label for="poll-options">Options:</label>
                    <input id="poll-options" v-model="newOption" type="text" class="form-control" placeholder="New Option" :class="{'is-invalid': !poll.options.length}" @keyup.enter="addOption()">
                    <div v-if="poll.options.length" class="list-group pt-2">
                        <button v-for="(option, index) in poll.options" :key="option.id" type="button" class="list-group-item list-group-item-action" @click="removeOption(index)">{{ option }}</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="poll-start">Start:</label>
                            <c-datetime id="poll-start" v-model="datetimePicker.start" class="pommes" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" />
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="poll-end">End:</label>
                            <c-datetime id="poll-end" v-model="datetimePicker.end" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" />
                        </div>
                    </div>
                    <div v-if="hasRaffle" class="col-12 mb-3 text-white">
                        <div v-if="activeRaffle.id">
                            Raffle: {{ activeRaffle.name }}
                        </div>
                        <div v-else>
                            Please activate a Raffle.
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="form-group custom-control custom-switch float-left mr-3">
                            <input id="poll-multiple-choice" v-model="poll.multipleChoice" type="checkbox" class="custom-control-input">
                            <label for="poll-multiple-choice" class="custom-control-label">Multiple Choice</label>
                        </div>
                        <div class="form-group custom-control custom-switch float-left mr-3">
                            <input id="poll-background-audio" v-model="hasBackgroundAudio" type="checkbox" class="custom-control-input">
                            <label for="poll-background-audio" class="custom-control-label">Background Audio</label>
                        </div>
                        <div class="form-group custom-control custom-switch float-left">
                            <input id="poll-has-raffle" v-model="hasRaffle" type="checkbox" class="custom-control-input">
                            <label for="poll-has-raffle" class="custom-control-label">Raffle</label>
                        </div>
                    </div>
                    <div v-if="hasBackgroundAudio" class="col-12">
                        <div class="form-row">
                            <div class="col-12 col-lg-6">
                                <div class="form-group">
                                    <label for="poll-audio-file" class="col-form-label">
                                        Audio File:&nbsp;
                                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Audio is only played in popout window">
                                            <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                        </span>
                                    </label>
                                    <select id="poll-audio-file" v-model.number="poll.audio.id" class="custom-select">
                                        <option value="0">None</option>
                                        <option v-for="audio in audioLoops" :key="audio.id" :value="audio.id">{{ audio.name }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-lg-6">
                                <div class="form-group">
                                    <label for="poll-audio-volume">Volume ({{ poll.audio.volume }}%)</label>
                                    <input id="poll-audio-volume" v-model.number="poll.audio.volume" type="range" class="custom-range mt-md-3" min="0" max="100" step="1" @change="setAudioVolume('background', poll.audio.volume / 100)">
                                </div>
                            </div>
                            <div class="col-12 mb-3">
                                <button type="button" class="btn btn-light mr-2" :disabled="!poll.audio.file.length" @click="playAudio('background', poll.audio.file, poll.audio.volume / 100, true)">Play Audio</button>
                                <button type="button" class="btn btn-light" @click="stopAudio('background')">Stop Audio</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 text-right">
                        <button v-if="polls.length" type="button" class="btn btn-sm btn-primary mr-2" data-toggle="modal" data-target="#all-polls">All Polls</button>
                        <button type="button" class="btn btn-sm btn-primary" :disabled="poll.name === '' || !poll.options.length || (poll.end > 0 && poll.end < poll.start)" @click="addPoll()">Activate Poll</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="all-polls" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="all-polls-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl modal-xxl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="all-polls-modal-title" class="modal-title">
                            All Polls
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div v-if="polls.length" class="col-12 pt-3">
                                <div class="table-responsive">
                                    <table id="pollsTable" class="table table-striped table-hover table-dark">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Question</th>
                                                <th scope="col">Options</th>
                                                <th scope="col">Multiple Choice</th>
                                                <th scope="col">Attendees</th>
                                                <th scope="col">Votes</th>
                                                <th scope="col">Audio</th>
                                                <th scope="col">Created at</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(pollItem, index) in polls" :key="pollItem.id" class="video">
                                                <td>{{ index + 1 }}</td>
                                                <td>{{ pollItem.name }}</td>
                                                <td>
                                                    <span v-for="option in pollItem.options" :key="option.id" class="text-nowrap">
                                                        {{ option.name }} - {{ option.average }}% ({{ option.votes }} Votes)<span v-if="option.winner">&nbsp;<font-awesome-icon :icon="['fas', 'award']"></font-awesome-icon></span><br>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span v-if="pollItem.multipleChoice">Yes</span>
                                                    <span v-if="!pollItem.multipleChoice">No</span>
                                                </td>
                                                <td>{{ pollItem.attendees }}</td>
                                                <td>{{ pollItem.votes }}</td>
                                                <td>
                                                    <span v-if="pollItem.audio.id" class="text-nowrap">Poll: {{ pollItem.audio.name }}<br></span>
                                                    <span v-for="option in pollItem.options" :key="option.id" class="text-nowrap">
                                                        <span v-if="option.winner && option.audio.id">Option: {{ option.audio.name }}</span>
                                                    </span>
                                                </td>
                                                <td>{{ pollItem.createdAt|formatDateTime($t('datetime')) }}</td>
                                                <td>
                                                    <span class="text-nowrap">
                                                        <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="tooltip" data-placement="top" title="Copy to Form" @click="copyToForm(pollItem)"><font-awesome-icon :icon="['fas', 'copy']" class="fa-fw" /></button>
                                                        <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Remove Poll" :disabled="pollItem.active" @click="removePoll(pollItem)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
                                                    </span>
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

        <div id="animate-poll-winner" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="animate-poll-winner-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="animate-poll-winner-modal-title" class="modal-title">
                            Animate Winner
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
                                        Audio File:&nbsp;
                                        <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Audio is only played in popout window">
                                            <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                        </span>
                                    </label>
                                    <select id="animate-poll-winner-file" v-model.number="winner.audio.id" class="custom-select">
                                        <option value="0">None</option>
                                        <option v-for="audio in audioJingles" :key="audio.id" :value="audio.id">{{ audio.name }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="form-group">
                                    <label for="animate-poll-winner-volume">Volume ({{ winner.audio.volume }}%)</label>
                                    <input id="animate-poll-winner-volume" v-model.number="winner.audio.volume" type="range" class="custom-range mt-md-3" min="0" max="100" step="1" @change="setAudioVolume('winner', winner.audio.volume / 100)">
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="custom-control custom-switch">
                                    <input id="animate-poll-winner-Announce" v-model.number="winner.chat" type="checkbox" value="1" class="custom-control-input">
                                    <label class="custom-control-label" for="animate-poll-winner-Announce">Announce Winner to Chat</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" :disabled="!winner.audio.file.length" @click="playAudio('winner', winner.audio.file, winner.audio.volume / 100)">Play Audio</button>
                        <button type="button" class="btn btn-light" @click="stopAudio('winner')">Stop Audio</button>
                        <button type="button" class="btn btn-primary" @click="animatePollWinner()">Ok</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
