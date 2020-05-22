<script>
    import Datetime from 'vue-ctk-date-time-picker';

    export default {
        components: {
            'c-datetime': Datetime
        },
        data: function() {
            return {
                activePoll: {},
                currentTime: 0,
                datetimePicker: {
                    start: '',
                    end: ''
                },
                endCountdown: 0,
                endCountdownInterval: 0,
                isPopout: false,
                maxDate: moment().add(1, 'd').format('YYYY-MM-DDTHH:00'),
                minDate: moment().format('YYYY-MM-DDTHH:00'),
                newOption: '',
                poll: {
                    id: 0,
                    name: '',
                    active: false,
                    multipleChoice: false,
                    start: moment().unix(),
                    end: 0,
                    options: []
                },
                polls: [],
                startCountdown: 0,
                startCountdownInterval: 0
            };
        },
        watch: {
            'datetimePicker.start': function() {
                this.poll.start = isNaN(moment(this.datetimePicker.start).unix()) ? moment().unix() : moment(this.datetimePicker.start).unix();
                this.checkDatetimeRange();
            },
            'datetimePicker.end': function() {
                this.poll.end = isNaN(moment(this.datetimePicker.end).unix()) ? 0 : moment(this.datetimePicker.end).unix();
                this.checkDatetimeRange();
            }
        },
        mounted: function() {
            this.getActivePoll();

            if (/^#\/channel\/(.*)\/poll\/?/.test(window.location.hash)) {
                this.isPopout = true;
            }

            if (!this.isPopout) {
                this.getPolls();
            }
        },
        methods: {
            addOption: function() {
                if (this.newOption) {
                    this.poll.options.push(this.newOption);
                    this.newOption = '';
                }
            },
            addPoll: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'addPoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            poll: this.poll
                        },
                        env: 'node'
                    };
                    streamWrite(call);
                }
            },
            announcePollToChat: function() {
                if (typeof streamWrite === 'function') {
                    this.startCountdown = 0;
                    const call = {
                        method: 'announcePollToChat',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    streamWrite(call);
                }
            },
            checkDatetimeRange: function() {
                if (this.poll.end > 0 && this.poll.end < this.poll.start) {
                    jQuery('#poll-end-input').addClass('form-control is-invalid');
                } else {
                    jQuery('#poll-end-input').removeClass('form-control is-invalid');
                }
            },
            closePoll: function() {
                if (typeof streamWrite === 'function') {
                    this.endCountdown = 0;
                    const call = {
                        method: 'closePoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    streamWrite(call);
                }
            },
            getActivePoll: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getActivePoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    streamWrite(call);
                }
            },
            getPolls: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getPolls',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    streamWrite(call);
                }
            },
            pollResultToChat: function() {
                if (typeof streamWrite === 'function') {
                    this.startCountdown = 0;
                    const call = {
                        method: 'pollResultToChat',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    streamWrite(call);
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
                if (typeof streamWrite === 'function' && poll.id > 0  
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

                    streamWrite(call);
                }
            },
            resetPoll: function() {
                this.poll = {
                    id: 0,
                    name: '',
                    active: false,
                    multipleChoice: false,
                    start: moment().unix(),
                    end: 0,
                    options: []
                };
            },
            setActivePoll: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.activePoll = args.poll;
                    this.currentTime = moment().unix();
                    this.setCountdown();
                    this.resetPoll();
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
            startPoll: function() {
                if (typeof streamWrite === 'function') {
                    this.startCountdown = 0;
                    const call = {
                        method: 'startPoll',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
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
                    <div class="h5">
                        {{ activePoll.name }}
                    </div>
                    <p>
                        Multiple Choice: <span v-if="activePoll.multipleChoice">Yes</span><span v-if="!activePoll.multipleChoice">No</span><br>
                        Attendees: {{ activePoll.attendees }}<br>
                        Votes: {{ activePoll.votes }}
                    </p>
                    <div v-for="(option, index) in activePoll.options" :key="option.id" class="mb-3">
                        <div class="form-row">
                            <div class="col">
                                !poll {{ index + 1 }} - {{ option.name }}
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
                    <div v-if="!isPopout" class="text-right">
                        <button type="button" class="btn btn-sm btn-primary mr-2" @click="announcePollToChat()">Anounce to Chat</button>
                        <button type="button" class="btn btn-sm btn-primary mr-2" @click="pollResultToChat()">Result to Chat</button>
                        <button type="button" class="btn btn-sm btn-primary" @click="closePoll()">Close Poll</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row" :class="{'d-none': activePoll.id || isPopout}">
            <div class="col-12">
                <div class="form-group">
                    <label for="poll-name" class="text-white">Title:</label>
                    <input id="poll-name" v-model="poll.name" type="text" class="form-control" placeholder="" :class="{'is-invalid': poll.name === ''}">
                </div>
                <div class="form-group">
                    <label for="poll-options" class="text-white">Options:</label>
                    <input id="poll-options" v-model="newOption" type="text" class="form-control" placeholder="New Option" :class="{'is-invalid': !poll.options.length}" @keyup.enter="addOption()">
                    <div v-if="poll.options.length" class="list-group pt-2">
                        <button v-for="(option, index) in poll.options" :key="option" type="button" class="list-group-item list-group-item-action" @click="removeOption(index)">{{ option }}</button>
                    </div>
                </div>
                <div class="form-row">
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="poll-start" class="text-white">Start:</label>
                            <c-datetime id="poll-start" v-model="datetimePicker.start" class="pommes" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" />
                        </div>
                    </div>
                    <div class="col-12 col-lg-6">
                        <div class="form-group">
                            <label for="poll-end" class="text-white">End:</label>
                            <c-datetime id="poll-end" v-model="datetimePicker.end" color="#2e97bf" :dark="true" format="YYYY-MM-DDTHH:mm" label="" :no-label="true" :no-header="true" :min-date="minDate" :max-date="maxDate" />
                        </div>
                    </div>
                </div>
                <div class="custom-control custom-switch">
                    <input id="poll-multiple-choice" v-model="poll.multipleChoice" type="checkbox" class="custom-control-input">
                    <label for="poll-multiple-choice" class="custom-control-label text-white">Multiple Choice</label>
                </div>
                <div class="text-right">
                    <button v-if="polls.length" type="button" class="btn btn-sm btn-primary mr-2" data-toggle="modal" data-target="#all-polls">All Polls</button>
                    <button type="button" class="btn btn-sm btn-primary" :disabled="poll.name === '' || !poll.options.length || (poll.end > 0 && poll.end < poll.start)" @click="addPoll()">Activate Poll</button>
                </div>
            </div>
        </div>

        <div id="all-polls" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="all-polls-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
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
                                                <th scope="col">Name</th>
                                                <th scope="col">Options</th>
                                                <th scope="col">Multiple Choice</th>
                                                <th scope="col">Attendees</th>
                                                <th scope="col">Votes</th>
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
                                                        {{ option.name }} - {{ option.average }}% ({{ option.votes }} Votes)<br>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span v-if="pollItem.multipleChoice">Yes</span>
                                                    <span v-if="!pollItem.multipleChoice">No</span>
                                                </td>
                                                <td>{{ pollItem.attendees }}</td>
                                                <td>{{ pollItem.votes }}</td>
                                                <td>{{ pollItem.createdAt|formatDateTime($t('datetime')) }}</td>
                                                <td>
                                                    <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Remove Poll" :disabled="pollItem.active" @click="removePoll(pollItem)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
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
</template>
