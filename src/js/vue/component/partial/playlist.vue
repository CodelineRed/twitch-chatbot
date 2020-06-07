<script>
    import bsComponent from '../../method/bs-component';
    import btnAnimation from '../../method/btn-animation';
    import dataTable from '../../method/data-table';

    export default {
        mixins: [bsComponent, btnAnimation, dataTable],
        data: function() {
            return {
                activePlaylist: {videos: []},
                config: {
                    hasYoutubeToken: false,
                    hasVideosFolder: false,
                    hasTwitchClientIdToken: false
                },
                currentVideoStart: 0, // seconds
                dataTable: null,
                updateMode: false,
                merge: {
                    target: {},
                    method: 1,
                    source: {},
                    from: 0,
                    to: 0
                },
                playlist: {
                    id: 0,
                    name: '',
                    active: false,
                    videos: []
                },
                playlists: [],
                playlistId: 0,
                playlistIndex: 0,
                playlistSearch: '',
                playlistSearchResults: [],
                playlistSearchTimeout: '',
                playlistSourceSearch: '',
                playlistTargetSearch: '',
                showLoader: {
                    playlist: false,
                    video: false
                },
                video: {
                    id: 0,
                    name: '',
                    subName: '',
                    file: '',
                    played: false,
                    skipped: false,
                    duration: 0, // seconds
                    durationHours: 0,
                    durationMin: 0,
                    durationSec: 0,
                    player: 'youtube',
                    playlistId: 0,
                    titleCmd: '',
                    gameCmd: '',
                    autofill: true
                },
                videoIndex: 0,
                videoSearch: '',
                videoSearchResults: [],
                videoSearchTimeout: ''
            };
        },
        watch: {
            'playlist.id': function() {
                this.getPlaylist();
            },
            'video.file': function() {
                if (this.video.player === 'local' && this.video.autofill === true 
                    && this.video.file === this.$options.filters.localFile(this.video.file)) {
                    this.getLocalVideoMeta();
                } else if (this.video.player === 'local'
                    && this.video.file !== this.$options.filters.localFile(this.video.file)) {
                    this.video.file = this.$options.filters.localFile(this.video.file);
                }

                if (this.video.player === 'twitch-clip' && this.video.autofill === true 
                    && this.video.file === this.$options.filters.twitchClipFile(this.video.file)) {
                    this.getTwitchClipMeta();
                } else if (this.video.player === 'twitch-clip'
                    && this.video.file !== this.$options.filters.twitchClipFile(this.video.file)) {
                    this.video.file = this.$options.filters.twitchClipFile(this.video.file);
                }

                if (this.video.player === 'twitch' && this.video.autofill === true 
                    && this.video.file === this.$options.filters.twitchVideoFile(this.video.file)) {
                    this.getTwitchVideoMeta();
                } else if (this.video.player === 'twitch'
                    && this.video.file !== this.$options.filters.twitchVideoFile(this.video.file)) {
                    this.video.file = this.$options.filters.twitchVideoFile(this.video.file);
                }

                if (this.video.player === 'youtube' && this.video.autofill === true 
                    && this.video.file === this.$options.filters.youtubeFile(this.video.file)) {
                    this.getYoutubeVideoMeta();
                } else if (this.video.player === 'youtube'
                    && this.video.file !== this.$options.filters.youtubeFile(this.video.file)) {
                    this.video.file = this.$options.filters.youtubeFile(this.video.file);
                }
            },
            'video.durationHours': function() {
                this.calculateVideoDuration(this.video.durationHours, this.video.durationMin, this.video.durationSec);
            },
            'video.durationMin': function() {
                this.calculateVideoDuration(this.video.durationHours, this.video.durationMin, this.video.durationSec);
            },
            'video.durationSec': function() {
                this.calculateVideoDuration(this.video.durationHours, this.video.durationMin, this.video.durationSec);
            },
            'video.player': function() {
                this.video.autofill = true;

                if ((this.video.player === 'local' && this.config.hasVideosFolder === false) 
                    || (/twitch/.test(this.video.player) && this.config.hasTwitchClientIdToken === false) 
                    || (this.video.player === 'youtube' && this.config.hasYoutubeToken === false)) {
                    this.video.autofill = false;
                }

                if (this.video.autofill === true) {
                    if (this.video.player === 'local') {
                        this.getLocalVideoMeta();
                    }

                    if (this.video.player === 'twitch-clip') {
                        this.getTwitchClipMeta();
                    }

                    if (this.video.player === 'twitch') {
                        this.getTwitchVideoMeta();
                    }

                    if (this.video.player === 'youtube') {
                        this.getYoutubeVideoMeta();
                    }
                }
            },
            playlistSearch: function() {
                if (this.playlistSearch.length >= 3 && !/\(|\)/g.test(this.playlistSearch)) {
                    let $this = this;
                    this.showLoader.playlist = true;
                    clearTimeout(this.playlistSearchTimeout);
                    this.playlistSearchTimeout = setTimeout(function() {
                        $this.getPlaylistSearchResults();
                        $this.showLoader.playlist = false;
                    }, 500);
                } else if (this.playlistSearch.length === 0) {
                    this.playlistSearchResults = [];
                    this.video.playlistId = this.activePlaylist.id;
                }
            },
            playlistSourceSearch: function() {
                if (this.playlistSourceSearch.length >= 3 && !/\(|\)/g.test(this.playlistSourceSearch)) {
                    this.playlistSearch = this.playlistSourceSearch;
                } else if (this.playlistSourceSearch.length < 3) {
                    this.merge.source = {};
                }
            },
            playlistTargetSearch: function() {
                if (this.playlistTargetSearch.length >= 3 && !/\(|\)/g.test(this.playlistTargetSearch)) {
                    this.playlistSearch = this.playlistTargetSearch;
                } else if (this.playlistTargetSearch.length < 3) {
                    this.merge.target = {
                        id: this.activePlaylist.id,
                        name: this.activePlaylist.name
                    };
                }
            },
            videoSearch: function() {
                if (this.videoSearch.length >= 3) {
                    let $this = this;
                    this.showLoader.video = true;
                    clearTimeout(this.videoSearchTimeout);
                    this.videoSearchTimeout = setTimeout(function() {
                        $this.getVideoSearchResults();
                        $this.showLoader.video = false;
                    }, 500);
                } else if (this.videoSearch.length === 0) {
                    this.videoSearchResults = [];
                    jQuery('#video-form').trigger('hidden.bs.modal');
                }
            }
        },
        mounted: function() {
            let $this = this;
            this.getActivePlaylist();
            this.getPlaylistConfig();
            this.getPlaylists();

            jQuery('.playlist .modal').on('shown.bs.modal', function() {
                jQuery(this).find('input[type="text"]').first().trigger('focus');

                if (jQuery(this).attr('id') === 'merge-playlist') {
                    $this.merge.target = {
                        id: $this.activePlaylist.id,
                        name: $this.activePlaylist.name
                    };
                }
            });

            jQuery('#playlist-form, #remove-playlist, #switch-playlist').on('hidden.bs.modal', function() {
                // reset
                $this.playlist = {
                    id: 0,
                    name: '',
                    active: false,
                    videos: []
                };
                $this.updateMode = false;
                $this.playlistSearch = '';
            });

            jQuery('#merge-playlists').on('hidden.bs.modal', function() {
                // reset
                $this.merge = {
                    target: {
                        id: $this.activePlaylist.id,
                        name: $this.activePlaylist.name
                    },
                    method: 1,
                    source: {},
                    from: 0,
                    to: 0
                };
                $this.playlistSearch = '';
                $this.playlistSourceSearch = '';
                $this.playlistTargetSearch = '';
            });

            jQuery('#video-form').on('hidden.bs.modal', function() {
                // reset
                $this.video = {
                    id: 0,
                    name: '',
                    subName: '',
                    file: '',
                    played: false,
                    skipped: false,
                    duration: 0, // seconds
                    durationHours: 0,
                    durationMin: 0,
                    durationSec: 0,
                    autofill: true,
                    player: 'youtube',
                    playlistId: $this.activePlaylist.id,
                    titleCmd: '',
                    gameCmd: ''
                };
                $this.updateMode = false;
                $this.videoSearch = '';
                $this.playlistSearch = '';
            });
        },
        methods: {
            addPlaylist: function() {
                if (typeof socketWrite === 'function' && jQuery('#playlist-form .is-invalid').length === 0) {
                    const call = {
                        method: 'addPlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlist: this.playlist
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                    jQuery('#playlist-form').modal('hide');
                }
            },
            addVideo: function() {
                if (typeof socketWrite === 'function' && jQuery('#video-form .is-invalid').length === 0) {
                    const call = {
                        method: 'addVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            video: this.video
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                    jQuery('#video-form').modal('hide');
                }
            },
            calculateVideoDuration: function(hours, min, sec) {
                const durationHours = hours === '' ? 0 : hours;
                const durationMin = min === '' ? 0 : min;
                const durationSec = sec === '' ? 0 : sec;

                this.video.duration =(durationHours * 60 * 60) + (durationMin * 60) + durationSec;
            },
            clearActivePlaylist: function() {
                if (typeof socketWrite === 'function' && confirm('Are you sure to clear playlist?')) {
                    const call = {
                        method: 'clearActivePlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getActivePlaylist: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getActivePlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getFilePlaceholder: function() {
                if (this.video.player === 'local') {
                    return 'Rel. File Path starting from \'videosFolder\'';
                }

                if (this.video.player === 'twitch-clip') {
                    return 'Twitch Clip Slug';
                }

                if (this.video.player === 'twitch') {
                    return 'Twitch Video ID';
                }

                if (this.video.player === 'youtube') {
                    return 'YouTube Video ID';
                }
            },
            getLocalVideoMeta: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getLocalVideoMeta',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            file: this.video.file
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getPlaylist: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getPlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlist: this.playlist
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getPlaylistConfig: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getPlaylistConfig',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getPlaylistLabel: function(playlist) {
                return playlist.name + ' (' + (playlist.active ? 'active, ' : '') + playlist.videoQuantity + ' Videos)';
            },
            getPlaylists: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getPlaylists',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getPlaylistSearchResults: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getPlaylistSearchResults',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlistSearch: this.playlistSearch
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getTwitchClipMeta: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getTwitchClipMeta',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            file: this.video.file
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getTwitchVideoMeta: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getTwitchVideoMeta',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            file: this.video.file
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getVideoCommands: function(video) {
                let result = '';

                if (video.titleCmd.length) {
                    result += '!title ' + video.titleCmd;
                }
                if (video.titleCmd.length && video.gameCmd.length) {
                    result += '<br>';
                }

                if (video.gameCmd.length) {
                    result += '!game ' + video.gameCmd;
                }

                return result;
            },
            getVideoPlayerIcon: function(player) {
                let icon = ['far', 'question-circle'];

                if (player === 'local') {
                    icon = ['fas', 'hdd'];
                } else if (/twitch/.test(player)) {
                    icon = ['fab', 'twitch'];
                } else if (player === 'youtube') {
                    icon = ['fab', 'youtube'];
                }

                return icon;
            },
            getVideoSearchResults: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getVideoSearchResults',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            videoSearch: this.videoSearch
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            getYoutubeVideoMeta: function() {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'getYoutubeVideoMeta',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            file: this.video.file
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            isDisabledAutofill: function() {
                return (!this.config.hasYoutubeToken && this.video.player === 'youtube') 
                    || (!this.config.hasVideosFolder && this.video.player === 'local') 
                    || (!this.config.hasTwitchClientIdToken && /twitch/.test(this.video.player));
            },
            isInvalidFile: function() {
                if (this.video.file === '') {
                    return true;
                } else if (this.video.player === 'local' 
                    && !/(.*)(\.mp4)$/i.test(this.video.file)) {
                    return true;
                } else if (this.video.player === 'youtube' 
                    && this.video.file.length !== 11) {
                    return true;
                }

                return false;
            },
            isInvalidHours: function() {
                const hours = this.video.durationHours;
                return (hours < 0 || hours > 23);
            },
            isInvalidMin: function() {
                const min = this.video.durationMin;
                return (min < 0 || min > 59);
            },
            isInvalidSec: function() {
                const hours = this.video.durationHours;
                const min = this.video.durationMin;
                const sec = this.video.durationSec;
                return (sec < 0 || sec > 59 || (hours + min + sec === 0));
            },
            mergePlaylists: function() {
                if (typeof socketWrite === 'function' && typeof this.merge.target.id === 'number' 
                    && typeof this.merge.source.id === 'number' && jQuery('#merge-playlists .is-invalid').length === 0) {
                    jQuery('#merge-playlists').modal('hide');

                    const call = {
                        method: 'mergePlaylists',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            merge: this.merge
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            moveVideo: function(video, direction, playlist) {
                if (typeof socketWrite === 'function') {
                    const call = {
                        method: 'moveVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            direction: direction,
                            playlist: {
                                id: playlist.id,
                                name: playlist.name
                            },
                            video: video
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            popoutPlayer: function() {
                const url = this.$router.resolve({name: 'player', params: {channel: this.$root._route.params.channel}}).href;
                const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=1280,height=800';
                window.open(url, 'Player', params);
            },
            removeVideo: function(video, index, playlist) {
                if (typeof socketWrite === 'function' && confirm('Are you sure to remove video "' + video.name + '"?')) {
                    const call = {
                        method: 'removeVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlist: {
                                id: playlist.id,
                                name: playlist.name
                            },
                            video: video,
                            videoIndex: index
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            removeVideosByFlagFromActivePlaylist: function(flag, value) {
                if (typeof socketWrite === 'function' && confirm('Are you sure to remove ' + flag + ' videos?')) {
                    const call = {
                        method: 'removeVideosByFlagFromActivePlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            flag: flag,
                            value: value
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            resetActivePlaylist: function() {
                if (typeof socketWrite === 'function' && confirm('Are you sure to reset playlist?')) {
                    const call = {
                        method: 'resetActivePlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            removePlaylist: function(playlist) {
                if (typeof playlist === 'undefined') {
                    playlist = this.playlist;
                }

                if (typeof socketWrite === 'function' && playlist.id > 0 && this.playlists.length > 1 
                    && confirm('Are you sure to remove playlist "' + playlist.name + '"?')) {
                    const call = {
                        method: 'removePlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlist: {
                                id: playlist.id,
                                name: playlist.name,
                                active: playlist.active
                            }
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                    jQuery('#remove-playlist').modal('hide');
                }
            },
            selectPlaylist: function(playlist, prozess) {
                if (prozess === 'add-video') {
                    this.video.playlistId = playlist.id;
                    this.playlistSearch = this.getPlaylistLabel(playlist);
                } else if (prozess === 'merge-target') {
                    this.merge.target = playlist;
                    this.playlistTargetSearch = this.getPlaylistLabel(playlist);
                } else if (prozess === 'merge-source') {
                    this.merge.source = playlist;
                    this.playlistSourceSearch = this.getPlaylistLabel(playlist);
                } else {
                    // prozess: update, switch and remove
                    this.playlist.id = playlist.id;
                    this.playlist.name = playlist.name;
                    this.playlist.active = playlist.active;
                    this.playlistSearch = this.getPlaylistLabel(playlist);
                }

                this.playlistSearchResults = [];
            },
            selectVideo: function(videoIndex) {
                let vsr = this.videoSearchResults[videoIndex];
                vsr.channel = this.$root._route.params.channel.toLowerCase();
                this.videoSearchResults = [];
                this.setVideoDurationToForm(vsr);
                this.video.autofill = false;
                //this.video.playlistId = this.activePlaylist.id;
                this.video.id = vsr.id;
                this.video.name = vsr.name;
                this.video.subName = vsr.subName;
                this.video.file = vsr.file;
                this.video.duration = vsr.duration;
                this.video.player = vsr.player;
                this.video.updatedAt = vsr.updatedAt;
                this.video.createdAt = vsr.createdAt;
                this.video.played = 0;
                this.video.skipped = 0;
                this.video.titleCmd = '';
                this.video.gameCmd = '';
            },
            setActivePlaylist: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.activePlaylist = args.activePlaylist;
                    this.video.playlistId = args.activePlaylist.id;
                    this.merge.target = {
                        id: args.activePlaylist.id,
                        name: args.activePlaylist.name
                    };
                    this.initDataTable();
                }
            },
            setPlaylist: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.playlist = args.playlist;
                }
            },
            setPlaylistConfig: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.config = args.config;
                }
            },
            setPlaylists: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.playlists = args.playlists;
                }
            },
            setPlaylistSearchResults: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.playlistSearchResults = args.playlists;
                }
            },
            setVideoMetaToForm: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.setVideoDurationToForm(args);
                    this.video.name = args.name;
                    this.video.subName = args.subName;
                }
            },
            setVideoDurationToForm: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    const durationObject = moment.duration(parseInt(args.duration), 's');
                    this.video.durationHours = durationObject.hours();
                    this.video.durationMin = durationObject.minutes();
                    this.video.durationSec = durationObject.seconds();
                }
            },
            setVideoSearchResults: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.videoSearchResults = args.videos;
                }
            },
            showPlaylistForm: function() {
                jQuery('#playlist-form').modal('show');
                this.updateMode = true;
            },
            showPlaylistSourceSearchResults: function() {
                return this.playlistSearchResults.length && this.playlistSourceSearch.length && !/\(|\)/g.test(this.playlistSourceSearch);
            },
            showPlaylistTargetSearchResults: function() {
                return this.playlistSearchResults.length && this.playlistTargetSearch.length && !/\(|\)/g.test(this.playlistTargetSearch);
            },
            showVideoForm: function(video, index) {
                this.video = this.activePlaylist.videos[index];
                this.videoIndex = index;
                this.updateMode = true;
                const durationObject = moment.duration(parseInt(this.video.duration), 's');
                this.video.durationHours = durationObject.hours();
                this.video.durationMin = durationObject.minutes();
                this.video.durationSec = durationObject.seconds();
                jQuery('#video-form').modal('show');
            },
            switchPlaylist: function(playlist) {
                if (typeof socketWrite === 'function') {

                    const call = {
                        method: 'switchPlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlist: typeof playlist === 'undefined' ? this.playlist : playlist
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                    if (typeof playlist === 'undefined') {
                        jQuery('#switch-playlist').modal('hide');
                    } else {
                        jQuery('#all-playlists').modal('hide');
                    }
                }
            },
            updatePlaylist: function() {
                if (typeof socketWrite === 'function' && jQuery('#playlist-form .is-invalid').length === 0) {
                    const call = {
                        method: 'updatePlaylist',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlist: this.playlist
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                }
            },
            updateVideo: function(video, videoIndex, playlist) {
                if (typeof socketWrite === 'function' 
                    && (jQuery('#video-form .is-invalid').length === 0 || typeof video !== 'undefined')) {
                    const call = {
                        method: 'updateVideo',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            playlist: {
                                id: typeof playlist === 'undefined' ? this.activePlaylist.id : playlist.id,
                                name: typeof playlist === 'undefined' ? this.activePlaylist.name : playlist.name
                            },
                            video: typeof video === 'undefined' ? this.video : video
                        },
                        env: 'node'
                    };

                    socketWrite(call);
                    if (typeof video === 'undefined') {
                        this.videoIndex = 0;
                        this.updateMode = false;
                        jQuery('#video-form').modal('hide');
                    } else {
                        this.btnAnimation(event.target, 'success');
                        this.updateDataTableRow(videoIndex, 'playlistTable');
                    }
                }
            }
        }
    };
</script>

<template>
    <div class="playlist p-2">
        <div v-if="activePlaylist.videos.length" class="h4 text-center">
            <a href="#" onclick="javascript:return false;" @click="popoutPlayer()">{{ activePlaylist.name }} <font-awesome-icon :icon="['fas', 'external-link-alt']" class="fa-fw" /></a>
        </div>
        <div v-if="!activePlaylist.videos.length" class="h4 text-center">
            {{ activePlaylist.name }}
        </div>
        <div class="table-responsive">
            <table id="playlistTable" class="table table-striped table-hover table-dark data-table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Duration</th>
                        <th scope="col">Start</th>
                        <th scope="col">End</th>
                        <th scope="col">Played</th>
                        <th scope="col">Skipped</th>
                        <th scope="col">Cmd</th>
                        <th scope="col" data-orderable="false"></th>
                    </tr>
                </thead>
                <tbody>
                    <!-- eslint-disable-next-line vue/require-v-for-key -->
                    <tr v-for="(videoItem, index) in activePlaylist.videos" class="video">
                        <td class="index">
                            <div v-if="index > 0" class="move move-up" @click="moveVideo(videoItem, -1, activePlaylist)">
                                <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: -90}" />
                            </div>
                            <div v-if="index + 1 < activePlaylist.videos.length" class="move move-down" @click="moveVideo(videoItem, 1, activePlaylist)">
                                <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: 90}" />
                            </div>
                            {{ index + 1 }}
                        </td>
                        <td>
                            <font-awesome-icon :icon="getVideoPlayerIcon(videoItem.player)" class="fa-fw mr-2"></font-awesome-icon>
                            {{ videoItem.name }}
                            <span v-if="videoItem.subName.length" class="text-muted"> - {{ videoItem.subName }}</span>
                        </td>
                        <td><span class="text-nowrap">{{ videoItem.duration|formatDuration() }}</span></td>
                        <td><span class="text-nowrap">{{ videoItem.start|formatDateTime($t('time-long-suffix')) }}</span></td>
                        <td><span class="text-nowrap">{{ videoItem.end|formatDateTime($t('time-long-suffix')) }}</span></td>
                        <td :data-order="videoItem.played ? '1' : '0'" :data-search="videoItem.played ? 'played-yes' : 'played-no'">
                            <div class="custom-control custom-switch">
                                <input :id="'video-played-' + index" v-model="activePlaylist.videos[index].played" type="checkbox" class="custom-control-input">
                                <label class="custom-control-label" :for="'video-played-' + index">&nbsp;</label>
                            </div>
                        </td>
                        <td :data-order="videoItem.skipped ? '1' : '0'" :data-search="videoItem.skipped ? 'skipped-yes' : 'skipped-no'">
                            <div class="custom-control custom-switch">
                                <input :id="'video-skipped-' + index" v-model="activePlaylist.videos[index].skipped" type="checkbox" class="custom-control-input">
                                <label class="custom-control-label" :for="'video-skipped-' + index">&nbsp;</label>
                            </div>
                        </td>
                        <td :data-order="getVideoCommands(videoItem).length ? '1' : '0'">
                            <span v-if="videoItem.titleCmd === '' && videoItem.gameCmd === ''">-</span>
                            <button v-if="videoItem.titleCmd !== '' || videoItem.gameCmd !== ''" type="button" class="btn btn-sm btn-primary" data-toggle="popover" title="Commands" :data-content="getVideoCommands(videoItem)"><font-awesome-icon :icon="['fas', 'terminal']" class="fa-fw" /></button>
                        </td>
                        <td class="text-center">
                            <span class="text-nowrap">
                                <button type="button" class="btn btn-sm btn-primary btn-animation mr-2" data-animation-success="success" data-animation-error="error" data-toggle="tooltip" data-placement="top" title="Save" @click="updateVideo(videoItem, index, activePlaylist)"><font-awesome-icon :icon="['fas', 'save']" class="fa-fw" /></button>
                                <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="tooltip" data-placement="top" title="Update" @click="showVideoForm(videoItem, index)"><font-awesome-icon :icon="['fas', 'edit']" class="fa-fw" /></button>
                                <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Remove from Playlist" @click="removeVideo(videoItem, index, activePlaylist)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="controls text-right pt-3">
            <div class="btn-group dropup">
                <button type="button" class="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <font-awesome-icon :icon="['fas', 'cogs']" class="fa-fw" />
                </button>
                <div class="dropdown-menu dropdown-menu-right">
                    <a href="#" class="dropdown-item bg-danger" onclick="javascript:return false;" @click="clearActivePlaylist()">Clear Playlist</a>
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item bg-warning" onclick="javascript:return false;" @click="removeVideosByFlagFromActivePlaylist('played', true)">Remove Played Videos</a>
                    <a href="#" class="dropdown-item bg-warning" onclick="javascript:return false;" @click="removeVideosByFlagFromActivePlaylist('skipped', true)">Remove Skipped Videos</a>
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item bg-primary" data-toggle="modal" data-target="#all-playlists">All Playlists</a>
                    <a href="#" class="dropdown-item bg-primary" onclick="javascript:return false;" @click="resetActivePlaylist()">Reset Playlist</a>
                    <a href="#" class="dropdown-item bg-primary" data-toggle="modal" data-target="#remove-playlist">Remove Playlist</a>
                    <a href="#" class="dropdown-item bg-primary" data-toggle="modal" data-target="#merge-playlists">Merge Playlists</a>
                    <a href="#" class="dropdown-item bg-primary" data-toggle="modal" data-target="#switch-playlist">Switch Playlist</a>
                    <a href="#" class="dropdown-item bg-primary" onclick="javascript:return false;" @click="showPlaylistForm()">Update Playlist</a>
                    <a href="#" class="dropdown-item bg-primary" data-toggle="modal" data-target="#playlist-form">Add Playlist</a>
                    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item bg-primary" data-toggle="modal" data-target="#video-form">Add Video</a>
                </div>
            </div>
        </div>

        <div id="all-playlists" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="all-playlists-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="all-playlists-modal-title" class="modal-title">
                            All Playlists
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div v-if="playlists.length" class="col-12 pt-3">
                                <div class="table-responsive">
                                    <table id="playlistsTable" class="table table-striped table-hover table-dark">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Videos</th>
                                                <th scope="col">Updated at</th>
                                                <th scope="col">Created at</th>
                                                <th scope="col"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- eslint-disable-next-line vue/require-v-for-key -->
                                            <tr v-for="(playlistItem, index) in playlists" class="video">
                                                <td>{{ index + 1 }}</td>
                                                <td>{{ playlistItem.name }}</td>
                                                <td>{{ playlistItem.videoQuantity }}</td>
                                                <td>{{ playlistItem.updatedAt|formatDateTime($t('datetime')) }}</td>
                                                <td>{{ playlistItem.createdAt|formatDateTime($t('datetime')) }}</td>
                                                <td>
                                                    <span class="text-nowrap">
                                                        <button type="button" class="btn btn-sm btn-primary mr-2" data-toggle="tooltip" data-placement="top" title="Switch to Playlist" @click="switchPlaylist(playlistItem)"><font-awesome-icon :icon="['fas', 'sync']" class="fa-fw" /></button>
                                                        <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Remove Playlist" :disabled="playlistItem.name.toLowerCase() === 'general'" @click="removePlaylist(playlistItem)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
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

        <div id="playlist-form" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="playlist-form-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="playlist-form-modal-title" class="modal-title">
                            <span v-if="!updateMode">Add Playlist</span>
                            <span v-if="updateMode">Update Playlist</span>
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="!updateMode" class="row">
                            <div class="col-12 col-md-10">
                                <label for="playlist-form-name" class="col-form-label">Name:</label>
                                <input id="playlist-form-name" v-model="playlist.name" type="text" class="form-control" :class="{'is-invalid': playlist.name === ''}" autocomplete="off">
                            </div>
                            <div class="col-12 col-md-2">
                                <div class="custom-control custom-switch pt-2 pt-md-5 float-left mr-3">
                                    <input id="playlist-form-active" v-model.number="playlist.active" type="checkbox" value="1" class="custom-control-input">
                                    <label class="custom-control-label" for="playlist-form-active">Active</label>
                                </div>
                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                <div class="clearfix"></div>
                            </div>
                        </div>
                        <div v-if="updateMode" class="row">
                            <div class="col-12 form-search">
                                <label for="playlist-form-search" class="col-form-label">
                                    Search Playlist:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Min. 3 chars. Space is jocker char.">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <input id="playlist-form-search" v-model="playlistSearch" type="text" class="form-control" :class="{'is-invalid': video.playlistId === 0}" autocomplete="off" placeholder="Name">
                                <div v-if="showLoader.playlist" class="fa-icon">
                                    <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw fa-spin" />
                                </div>
                                <div class="position-relative">
                                    <div v-if="playlistSearchResults.length" class="list-group">
                                        <button v-for="playlistItem in playlistSearchResults" :key="playlistItem.id" type="button" class="list-group-item list-group-item-action" @click="selectPlaylist(playlistItem, 'update')">{{ getPlaylistLabel(playlistItem) }}</button>
                                    </div>
                                </div>
                            </div>
                            <div v-if="playlist.name !== ''" class="col-12">
                                <label for="playlist-form-name" class="col-form-label">Name:</label>
                                <div class="form-row">
                                    <div class="col">
                                        <input id="playlist-form-name" v-model="playlist.name" type="text" class="form-control" :class="{'is-invalid': playlist.name === ''}" autocomplete="off" :disabled="playlist.name.toLowerCase() === 'general'">
                                    </div>
                                    <div class="col-auto">
                                        <button type="button" class="btn btn-primary" :disabled="playlist.name.toLowerCase() === 'general'" @click="updatePlaylist()"><font-awesome-icon :icon="['fas', 'save']" class="fa-fw" /></button>
                                    </div>
                                </div>
                            </div>
                            <div v-if="playlist.videos.length" class="col-12 pt-3">
                                <div class="table-responsive">
                                    <table id="playlistFormTable" class="table table-striped table-hover table-dark">
                                        <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Duration</th>
                                                <th scope="col" data-orderable="false"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- eslint-disable-next-line vue/require-v-for-key -->
                                            <tr v-for="(videoItem, index) in playlist.videos" class="video">
                                                <td class="index">
                                                    <div v-if="index > 0" class="move move-up" @click="moveVideo(videoItem, -1, playlist)">
                                                        <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: -90}" />
                                                    </div>
                                                    <div v-if="index + 1 < playlist.videos.length" class="move move-down" @click="moveVideo(videoItem, 1, playlist)">
                                                        <font-awesome-icon :icon="['fas', 'chevron-right']" class="fa-fw" :transform="{rotate: 90}" />
                                                    </div>
                                                    {{ index + 1 }}
                                                </td>
                                                <td>{{ videoItem.name }}</td>
                                                <td><span class="text-nowrap">{{ videoItem.duration|formatDuration() }}</span></td>
                                                <td class="text-center">
                                                    <span class="text-nowrap">
                                                        <button type="button" class="btn btn-sm btn-danger" data-toggle="tooltip" data-placement="top" title="Remove from Playlist" @click="removeVideo(videoItem, index, playlist)"><font-awesome-icon :icon="['fas', 'trash-alt']" class="fa-fw" /></button>
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
                        <button v-if="!updateMode" type="button" class="btn btn-primary" @click="addPlaylist()">Add</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="video-form" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="video-form-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="video-form-modal-title" class="modal-title">
                            <span v-if="!updateMode">Add Video</span>
                            <span v-if="updateMode">Update Video</span>
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div v-if="!updateMode" class="col-12 col-md-6 form-search">
                                <label for="video-form-video-search" class="col-form-label">
                                    Search Video:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Min. 3 chars. Space is jocker char.">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <input id="video-form-video-search" v-model="videoSearch" type="text" class="form-control" autocomplete="off" placeholder="Name or File">
                                <div v-if="showLoader.video" class="fa-icon">
                                    <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw fa-spin" />
                                </div>
                                <div class="position-relative">
                                    <div v-if="videoSearchResults.length" class="list-group">
                                        <!-- eslint-disable-next-line vue/require-v-for-key -->
                                        <button v-for="(videoItem, index) in videoSearchResults" type="button" class="list-group-item list-group-item-action" @click="selectVideo(index)">{{ videoItem.name + ' (' + videoItem.file + ')' }}</button>
                                    </div>
                                </div>
                            </div>
                            <div v-if="!updateMode" class="col-12 col-md-6 form-search">
                                <label for="video-form-playlist-search" class="col-form-label">
                                    Search Playlist:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Min. 3 chars. Space is jocker char.">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <input id="video-form-playlist-search" v-model="playlistSearch" type="text" class="form-control" :class="{'is-invalid': video.playlistId === 0}" autocomplete="off" :placeholder="getPlaylistLabel(activePlaylist)">
                                <div v-if="showLoader.playlist" class="fa-icon">
                                    <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw fa-spin" />
                                </div>
                                <div class="position-relative">
                                    <div v-if="playlistSearchResults.length" class="list-group">
                                        <button v-for="playlistItem in playlistSearchResults" :key="playlistItem.id" type="button" class="list-group-item list-group-item-action" @click="selectPlaylist(playlistItem, 'add-video')">{{ getPlaylistLabel(playlistItem) }}</button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="video-form-title-cmd" class="col-form-label">
                                    Title Command:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="From this video, change channel title to">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                        <div class="input-group-text">!title</div>
                                    </div>
                                    <input id="video-form-title-cmd" v-model="video.titleCmd" type="text" class="form-control" autocomplete="off" placeholder="">
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="video-form-game-cmd" class="col-form-label">
                                    Game Command:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="From this video, change channel game/cat. to">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                        <div class="input-group-text">!game</div>
                                    </div>
                                    <input id="video-form-game-cmd" v-model="video.gameCmd" type="text" class="form-control" autocomplete="off" placeholder="">
                                </div>
                            </div>
                            <div class="col-12">
                                <hr>
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="video-form-player" class="col-form-label">Player:</label>
                                <select id="video-form-player" v-model="video.player" :disabled="videoSearch.length > 0" class="custom-select">
                                    <option value="local" :disabled="!config.hasVideosFolder">Local Video</option>
                                    <option value="twitch-clip">Twitch Clip</option>
                                    <option value="twitch">Twitch Video</option>
                                    <option value="youtube">Youtube Video</option>
                                </select>
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="video-form-file" class="col-form-label">File:</label>
                                <input id="video-form-file" v-model="video.file" type="text" class="form-control" :class="{'is-invalid': isInvalidFile()}" :disabled="videoSearch.length > 0" autocomplete="off" :placeholder="getFilePlaceholder()">
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="video-form-name" class="col-form-label">Name:</label>
                                <input id="video-form-name" v-model="video.name" type="text" class="form-control" :class="{'is-invalid': video.name === ''}" :disabled="videoSearch.length > 0" autocomplete="off">
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="video-form-subname" class="col-form-label">Sub Name:</label>
                                <input id="video-form-subname" v-model="video.subName" type="text" class="form-control" :disabled="videoSearch.length > 0" autocomplete="off">
                            </div>
                            <div class="col-12 col-md-6">
                                <label for="video-form-duration-hours" class="col-form-label">Duration:</label>
                                <div class="form-row">
                                    <div class="col">
                                        <div class="input-group">
                                            <input id="video-form-duration-hours" v-model.number="video.durationHours" type="number" min="0" max="23" class="form-control" :class="{'is-invalid': isInvalidHours()}" :disabled="videoSearch.length > 0" placeholder="hours">
                                            <div class="input-group-append">
                                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                                <div class="input-group-text">h</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="input-group">
                                            <input id="video-form-duration-min" v-model.number="video.durationMin" type="number" min="0" max="59" class="form-control" :class="{'is-invalid': isInvalidMin()}" :disabled="videoSearch.length > 0" placeholder="min.">
                                            <div class="input-group-append">
                                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                                <div class="input-group-text">m</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="input-group">
                                            <input id="video-form-duration-sec" v-model.number="video.durationSec" type="number" min="0" max="59" class="form-control" :class="{'is-invalid': isInvalidSec()}" :disabled="videoSearch.length > 0" placeholder="sec.">
                                            <div class="input-group-append">
                                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                                <div class="input-group-text">s</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-6 pt-3 pt-md-5">
                                <div class="custom-control custom-switch float-left mr-3">
                                    <input id="video-form-played" v-model.number="video.played" type="checkbox" value="1" class="custom-control-input">
                                    <label class="custom-control-label" for="video-form-played">Played</label>
                                </div>
                                <div class="custom-control custom-switch float-left mr-3">
                                    <input id="video-form-skipped" v-model.number="video.skipped" type="checkbox" value="1" class="custom-control-input">
                                    <label class="custom-control-label" for="video-form-skipped">Skipped</label>
                                </div>
                                <div class="custom-control custom-switch float-left">
                                    <input id="video-form-autofill" v-model.number="video.autofill" type="checkbox" value="1" class="custom-control-input" :disabled="isDisabledAutofill()">
                                    <label class="custom-control-label" for="video-form-autofill" data-toggle="tooltip" data-placement="top" title="Autofill 'Name' and 'Duration' by given 'File'">
                                        Autofill
                                    </label>
                                </div>
                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button v-if="!updateMode" type="button" class="btn btn-primary" @click="addVideo()">Add</button>
                        <button v-if="updateMode" type="button" class="btn btn-primary" @click="updateVideo()">Update</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="remove-playlist" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="remove-playlist-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="remove-playlist-modal-title" class="modal-title">
                            Remove Playlist
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12 form-search">
                                <label for="remove-playlist-search" class="col-form-label">
                                    Search Playlist:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Min. 3 chars. Space is jocker char.">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <input id="remove-playlist-search" v-model="playlistSearch" type="text" class="form-control" :class="{'is-invalid': video.playlistId === 0}" autocomplete="off" placeholder="Name">
                                <div v-if="showLoader.playlist" class="fa-icon">
                                    <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw fa-spin" />
                                </div>
                                <div class="position-relative">
                                    <div v-if="playlistSearchResults.length" class="list-group">
                                        <button v-for="playlistItem in playlistSearchResults" :key="playlistItem.id" type="button" class="list-group-item list-group-item-action" @click="selectPlaylist(playlistItem, 'remove')">{{ getPlaylistLabel(playlistItem) }}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-danger" :disabled="playlist.name.toLowerCase() === 'general'" @click="removePlaylist()">Remove</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="merge-playlists" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="merge-playlists-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="merge-playlists-modal-title" class="modal-title">
                            Merge Playlist
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12 col-md-4 form-search">
                                <label for="merge-playlists-search-target" class="col-form-label">
                                    Search Playlist Target:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Min. 3 chars. Space is jocker char.">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <input id="merge-playlists-search-target" v-model="playlistTargetSearch" type="text" class="form-control" :class="{'is-invalid': video.playlistId === 0}" autocomplete="off" :placeholder="getPlaylistLabel(activePlaylist)">
                                <div v-if="showLoader.playlist" class="fa-icon">
                                    <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw fa-spin" />
                                </div>
                                <div class="position-relative">
                                    <div v-if="showPlaylistTargetSearchResults()" class="list-group">
                                        <button v-for="playlistItem in playlistSearchResults" :key="playlistItem.id" type="button" class="list-group-item list-group-item-action" @click="selectPlaylist(playlistItem, 'merge-target')">{{ getPlaylistLabel(playlistItem) }}</button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <label for="merge-playlists-method" class="col-form-label">Method:</label>
                                <select id="merge-playlists-method" v-model.number="merge.method" class="custom-select">
                                    <option value="1">Append</option>
                                    <option value="-1">Prepend</option>
                                </select>
                            </div>
                            <div class="col-12 col-md-4 form-search">
                                <label for="merge-playlists-search-source" class="col-form-label">
                                    Search Playlist Source:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Min. 3 chars. Space is jocker char.">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <input id="merge-playlists-search-source" v-model="playlistSourceSearch" type="text" class="form-control" :class="{'is-invalid': video.playlistId === 0}" autocomplete="off" placeholder="Name">
                                <div v-if="showLoader.playlist" class="fa-icon">
                                    <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw fa-spin" />
                                </div>
                                <div class="position-relative">
                                    <div v-if="showPlaylistSourceSearchResults()" class="list-group">
                                        <button v-for="playlistItem in playlistSearchResults" :key="playlistItem.id" type="button" class="list-group-item list-group-item-action" @click="selectPlaylist(playlistItem, 'merge-source')">{{ getPlaylistLabel(playlistItem) }}</button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-6 col-xl-4 offset-md-6 offset-xl-8">
                                <label for="merge-playlists-from" class="col-form-label">
                                    Videos from / to:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="infinity = 0. max 'to' = 50">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <div class="form-row">
                                    <div class="col">
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                                <div class="input-group-text">from</div>
                                            </div>
                                            <input id="merge-playlists-from" v-model.number="merge.from" type="number" min="0" class="form-control" :class="{'is-invalid': merge.to > 0 && merge.from > merge.to}" placeholder="from">
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                                <div class="input-group-text">to</div>
                                            </div>
                                            <input id="merge-playlists-to" v-model.number="merge.to" type="number" min="0" max="50" class="form-control" :class="{'is-invalid': merge.to > 0 && merge.to < merge.from}" placeholder="to">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="mergePlaylists()">Merge</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="switch-playlist" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="switch-playlist-modal-title" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="switch-playlist-modal-title" class="modal-title">
                            Switch Playlist
                        </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12 form-search">
                                <label for="switch-playlist-search" class="col-form-label">
                                    Search Playlist:&nbsp;
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Min. 3 chars. Space is jocker char.">
                                        <font-awesome-icon :icon="['far', 'question-circle']" class="fa-fw" />
                                    </span>
                                </label>
                                <input id="switch-playlist-search" v-model="playlistSearch" type="text" class="form-control" :class="{'is-invalid': video.playlistId === 0}" autocomplete="off" placeholder="Name">
                                <div v-if="showLoader.playlist" class="fa-icon">
                                    <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw fa-spin" />
                                </div>
                                <div class="position-relative">
                                    <div v-if="playlistSearchResults.length" class="list-group">
                                        <button v-for="playlistItem in playlistSearchResults" :key="playlistItem.id" type="button" class="list-group-item list-group-item-action" @click="selectPlaylist(playlistItem, 'switch')">{{ getPlaylistLabel(playlistItem) }}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="switchPlaylist()">Switch</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
