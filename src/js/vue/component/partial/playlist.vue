<script>
    import dataTable from '../../method/data-table';
    
    export default {
        mixins: [dataTable],
        data: function() {
            return {
                currentVideoStart: 0, // seconds
                dataTable: null,
                playlist: [],
                newVideo: {
                    name: '',
                    file: '',
                    played: false,
                    skipped: false,
                    duration: 0, // seconds
                    durationHours: 0,
                    durationMin: 0,
                    durationSec: 0,
                    platform: 'youtube',
                    titleCmd: '',
                    gameCmd: ''
                }
            };
        },
        watch: {
            'newVideo.durationHours': function() {
                this.calculateNewVideoDuration(this.newVideo.durationHours, this.newVideo.durationMin, this.newVideo.durationSec);
            },
            'newVideo.durationMin': function() {
                this.calculateNewVideoDuration(this.newVideo.durationHours, this.newVideo.durationMin, this.newVideo.durationSec);
            },
            'newVideo.durationSec': function() {
                this.calculateNewVideoDuration(this.newVideo.durationHours, this.newVideo.durationMin, this.newVideo.durationSec);
            }
        },
        mounted: function() {
            this.getPlaylist();
        },
        methods: {
            addVideo: function() {
                if (typeof streamWrite === 'function' && jQuery('#add-video .is-invalid').length === 0) {
                    jQuery('#add-video').modal('hide');
                    
                    const call = {
                        method: 'addVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            video: this.newVideo
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                    
                    // reset
                    this.newVideo = {
                        name: '',
                        file: '',
                        played: false,
                        skipped: false,
                        duration: 0, // seconds
                        durationHours: 0,
                        durationMin: 0,
                        durationSec: 0,
                        platform: 'youtube',
                        titleCmd: '',
                        gameCmd: ''
                    };
                }
            },
            calculateNewVideoDuration: function(hours, min, sec) {
                const durationHours = hours === '' ? 0 : hours;
                const durationMin = min === '' ? 0 : min;
                const durationSec = sec === '' ? 0 : sec;
                
                this.newVideo.duration =(parseInt(durationHours) * 60 * 60) + (parseInt(durationMin) * 60) + parseInt(durationSec);
            },
            getPlaylist: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getPlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            getPlaylistClear: function() {
                if (typeof streamWrite === 'function' && confirm('Are you sure to clear playlist?')) {
                    const call = {
                        method: 'getPlaylistClear',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            getPlaylistReset: function() {
                if (typeof streamWrite === 'function' && confirm('Are you sure to reset playlist?')) {
                    const call = {
                        method: 'getPlaylistReset',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            isInvalidHours: function(){
                const hours = parseInt(this.newVideo.durationHours);
                return hours < 0 || hours > 99;
            },
            isInvalidMin: function(){
                const min = parseInt(this.newVideo.durationMin);
                return min < 0 || min > 59;
            },
            isInvalidSec: function(){
                const hours = parseInt(this.newVideo.durationHours);
                const min = parseInt(this.newVideo.durationMin);
                const sec = parseInt(this.newVideo.durationSec);
                return sec < 0 || sec > 59 || (hours + min + sec === 0);
            },
            moveVideo: function(videoId, direction) {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'moveVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            videoId: videoId,
                            direction: direction
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            popoutVideo: function() {
                const url = this.$router.resolve({name: 'video', params: {channel: this.$root._route.params.channel}}).href;
                const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=1280,height=800';
                window.open(url, 'Video', params);
            },
            removeVideo: function(videoId) {
                if (typeof streamWrite === 'function' && confirm('Are you sure to remove video "' + this.playlist[videoId].name + '"?')) {
                    const call = {
                        method: 'removeVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            videoId: videoId
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            removeVideosByFlag: function(flag, value) {
                if (typeof streamWrite === 'function' && confirm('Are you sure to remove ' + flag + ' videos?')) {
                    const call = {
                        method: 'removeVideosByFlag',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            flag: flag,
                            value: value
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            setPlaylist: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.playlist = args.playlist;
                    this.initDataTable();
                }
            },
            toggleVideoPlayed: function(videoId) {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'toggleVideoPlayed',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            videoId: videoId
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            toggleVideoSkipped: function(videoId) {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'toggleVideoSkipped',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            videoId: videoId
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
    <div class="playlist p-2">
        <div v-if="playlist.length > 0" class="h4 text-center">
            <a href="#" onclick="javascript:return false;" @click="popoutVideo()">Playlist start <font-awesome-icon :icon="['fas', 'external-link-alt']" class="fa-fw" /></a>
        </div>
        <div v-if="playlist.length > 0" class="table-responsive">
            <table id="playlistTable" class="table table-striped table-hover table-dark data-table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Title</th>
                        <th scope="col">Duration</th>
                        <th scope="col">Start</th>
                        <th scope="col">End</th>
                        <th scope="col">Played</th>
                        <th scope="col">Skipped</th>
                        <th scope="col" data-orderable="false"></th>
                    </tr>
                </thead>
                <tbody>
                    <!-- eslint-disable-next-line vue/require-v-for-key -->
                    <tr v-for="(video, index) in playlist" class="video">
                        <td class="index">
                            <div v-if="index > 0" class="move move-up" @click="moveVideo(index, -1)">
                                <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: -90}" />
                            </div>
                            <div v-if="index + 1 < playlist.length" class="move move-down" @click="moveVideo(index, 1)">
                                <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: 90}" />
                            </div>
                            {{ index + 1 }}
                        </td>
                        <td>{{ video.name }}</td>
                        <td><span style="white-space: nowrap">{{ (video.duration * 1000)|formatDuration() }}</span></td>
                        <td><span style="white-space: nowrap">{{ (video.start * 1000)|formatDateTime($t('time-long-suffix')) }}</span></td>
                        <td><span style="white-space: nowrap">{{ (video.end * 1000)|formatDateTime($t('time-long-suffix')) }}</span></td>
                        <td :data-order="video.played ? '1' : '0'" :data-search="video.played ? 'played-yes' : 'played-no'">
                            <span v-if="video.played">Yes</span>
                            <span v-if="!video.played">No</span>
                        </td>
                        <td :data-order="video.skipped ? '1' : '0'" :data-search="video.skipped ? 'skipped-yes' : 'skipped-no'">
                            <span v-if="video.skipped">Yes</span>
                            <span v-if="!video.skipped">No</span>
                        </td>
                        <td class="text-center">
                            <span style="white-space: nowrap">
                                <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="tooltip" data-placement="top" title="Toggle Played" @click="toggleVideoPlayed(index)"><font-awesome-icon :icon="['fas', 'play']" class="fa-fw" /></button>
                                <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="tooltip" data-placement="top" title="Toggle Skipped" @click="toggleVideoSkipped(index)"><font-awesome-icon :icon="['fas', 'step-forward']" class="fa-fw" /></button>
                                <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Remove" @click="removeVideo(index)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="controls text-right" :class="{'pt-3': playlist.length > 0}">
            <button v-if="playlist.length > 0" type="button" class="d-none d-lg-inline-block btn btn-sm btn-danger mr-2" @click="getPlaylistClear()">Clear Playlist</button>
            <button v-if="playlist.length > 0" type="button" class="d-none d-lg-inline-block btn btn-sm btn-warning mr-2" @click="removeVideosByFlag('played', true)">Remove Played Videos</button>
            <button v-if="playlist.length > 0" type="button" class="d-none d-lg-inline-block btn btn-sm btn-warning mr-2" @click="removeVideosByFlag('skipped', true)">Remove Skipped Videos</button>
            <button v-if="playlist.length > 0" type="button" class="d-none d-lg-inline-block btn btn-sm btn-primary mr-2" @click="getPlaylistReset()">Reset Playlist</button>
            <button v-if="playlist.length > 0" type="button" class="d-none d-lg-inline-block btn btn-sm btn-primary" data-toggle="modal" data-target="#add-video">Add Video</button>

            <div v-if="playlist.length > 0" class="d-lg-none btn-group dropup">
                <button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <font-awesome-icon :icon="['fas', 'cogs']" class="fa-fw" />
                </button>
                <div class="dropdown-menu dropdown-menu-right">
                    <a href="#" class="dropdown-item bg-danger" onclick="javascript:return false;" @click="getPlaylistClear()">Clear Playlist</a>
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item bg-warning" onclick="javascript:return false;" @click="removeVideosByFlag('played', true)">Remove Played Videos</a>
                    <a href="#" class="dropdown-item bg-warning" onclick="javascript:return false;" @click="removeVideosByFlag('skipped', true)">Remove Skipped Videos</a>
                    <a href="#" class="dropdown-item" onclick="javascript:return false;" @click="getPlaylistReset()">Reset Playlist</a>
                    <a href="#" class="dropdown-item" data-toggle="modal" data-target="#add-video">Add Video</a>
                </div>
            </div>
            
            <div v-if="playlist.length == 0" class="card">
                <div class="card-body">
                    <h5 class="card-title text-center mb-0">
                        + Add Video
                    </h5>
                    <a href="#" data-toggle="modal" data-target="#add-video" class="stretched-link"></a>
                </div>
            </div>
        </div>
        
        <div id="add-video" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="add-video-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="add-video-modal-title" class="modal-title">
                            Add Video
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-12 col-md-6">
                                    <label for="add-video-title" class="col-form-label">Title:</label>
                                    <input id="add-video-title" v-model="newVideo.name" type="text" class="form-control" :class="{'is-invalid': newVideo.name === ''}" autocomplete="off">
                                </div>
                                <div class="col-12 col-md-6">
                                    <label for="add-video-file" class="col-form-label">File:</label>
                                    <input id="add-video-file" v-model="newVideo.file" type="text" class="form-control" :class="{'is-invalid': newVideo.file === ''}" autocomplete="off" placeholder="YouTube video id or file name">
                                </div>
                                <div class="col-12 col-md-6">
                                    <label for="add-video-duration-hours" class="col-form-label">Duration:</label>
                                    <div class="form-row">
                                        <div class="col">
                                            <input id="add-video-duration-hours" v-model="newVideo.durationHours" type="number" min="0" max="99" class="form-control" :class="{'is-invalid': isInvalidHours()}" placeholder="hours">
                                        </div>
                                        <div class="col">
                                            <input id="add-video-duration-min" v-model="newVideo.durationMin" type="number" min="0" max="59" class="form-control" :class="{'is-invalid': isInvalidMin()}" placeholder="min.">
                                        </div>
                                        <div class="col">
                                            <input id="add-video-duration-sec" v-model="newVideo.durationSec" type="number" min="0" max="59" class="form-control" :class="{'is-invalid': isInvalidSec()}" placeholder="sec.">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6">
                                    <label for="add-video-platform" class="col-form-label">Platform:</label>
                                    <select id="add-video-platform" v-model="newVideo.platform" class="custom-select">
                                        <option value="local">Local</option>
                                        <option value="youtube">Youtube</option>
                                    </select>
                                </div>
                                <div class="col-12 col-md-6">
                                    <label for="add-video-title-cmd" class="col-form-label">Change channel title to:</label>
                                    <input id="add-video-title-cmd" v-model="newVideo.titleCmd" type="text" class="form-control" autocomplete="off" placeholder="">
                                </div>
                                <div class="col-12 col-md-6">
                                    <label for="add-video-game-cmd" class="col-form-label">Change channel game/cat. to:</label>
                                    <input id="add-video-game-cmd" v-model="newVideo.gameCmd" type="text" class="form-control" autocomplete="off" placeholder="">
                                </div>
                                <div class="col-12">
                                    <div class="custom-control custom-switch pt-0 pt-md-4 float-left mr-3">
                                        <input id="add-video-played" v-model="newVideo.played" type="checkbox" value="1" class="custom-control-input">
                                        <label class="custom-control-label" for="add-video-played">Played</label>
                                    </div>
                                    <div class="custom-control custom-switch pt-0 pt-md-4 float-left">
                                        <input id="add-video-skipped" v-model="newVideo.skipped" type="checkbox" value="1" class="custom-control-input">
                                        <label class="custom-control-label" for="add-video-skipped">Skipped</label>
                                    </div>
                                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                    <div class="clearfix"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary submit-form" @click="addVideo()">Add</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
