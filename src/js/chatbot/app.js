const chat     = require('./chat');
const channel  = require('./channel');
const command  = require('./command');
const counter  = require('./counter');
const database = require('./database');
const locales  = require('./locales');
const playlist = require('./playlist');

/**
 * Chatbot Object
 */
const chatbot = {
    bots: [],
    channels: {},
    client: null, // tmi client
    config: null,
    counters: {},
    commands: {},
    commandList: command.commandList,
    currentVideoStart: {}, // unix timestamp (seconds)
    messages: {},
    activePlaylists: {},
    playlists: {},
    polls: {},
    raffles: {},
    socket: null, // skateboard socket
    socketChat: null, // skateboard socket
    socketVideo: null, // skateboard socket
    socketRaffle: null, // skateboard socket
    socketPoll: null, // skateboard socket
    socketCounter: null, // skateboard socket
    t: {}, // translation
    addPlaylist: playlist.addPlaylist,
    addVideo: playlist.addVideo,
    clearActivePlaylist: playlist.clearActivePlaylist,
    getChannels: channel.getChannels,
    getCommands: command.getCommands,
    getCounter: counter.getCounter,
    getActivePlaylist: playlist.getActivePlaylist,
    getLocalVideoMeta: playlist.getLocalVideoMeta,
    getMessages: chat.getMessages,
    getPlaylist: playlist.getPlaylist,
    getPlaylistConfig: playlist.getPlaylistConfig,
    getPlaylists: playlist.getPlaylists,
    getPlaylistSearchResults: playlist.getPlaylistSearchResults,
    getTwitchClipMeta: playlist.getTwitchClipMeta,
    getTwitchVideoMeta: playlist.getTwitchVideoMeta,
    getVideo: playlist.getVideo,
    getVideoSearchResults: playlist.getVideoSearchResults,
    getYoutubeVideoMeta: playlist.getYoutubeVideoMeta,
    mergePlaylists: playlist.mergePlaylists,
    moveVideo: playlist.moveVideo,
    resetActivePlaylist: playlist.resetActivePlaylist,
    removePlaylist: playlist.removePlaylist,
    removeVideo: playlist.removeVideo,
    removeVideosByFlagFromActivePlaylist: playlist.removeVideosByFlagFromActivePlaylist,
    setTranslation: function() {
        if (typeof locales[chatbot.config.locale] === 'undefined') {
            chatbot.t = locales.en;
        } else {
            chatbot.t = locales[chatbot.config.locale];
        }
    },
    switchPlaylist: playlist.switchPlaylist,
    updateCommand: command.updateCommand,
    updateCommandLastExec: command.updateCommandLastExec,
    updateCounter: counter.updateCounter,
    updatePlaylist: playlist.updatePlaylist,
    updateVideo: playlist.updateVideo,
    warmUpDatabase: function(channelState) {
        database.prepareBotTable(this, channelState.channel.slice(1));
        database.prepareChannelTable(this, channelState);
    }
};

module.exports = chatbot;
