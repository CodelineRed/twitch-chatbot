const audio    = require('./audio');
const chat     = require('./chat');
const channel  = require('./channel');
const command  = require('./command');
const counter  = require('./counter');
const database = require('./database');
const locales  = require('./locales');
const playlist = require('./playlist');
const poll     = require('./poll');

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
    activePolls: {},
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
    addPoll: poll.addPoll,
    addUserChoice: poll.addUserChoice,
    addVideo: playlist.addVideo,
    announcePollToChat: poll.announcePollToChat,
    clearActivePlaylist: playlist.clearActivePlaylist,
    closePoll: poll.closePoll,
    getChannels: channel.getChannels,
    getCommands: command.getCommands,
    getCounter: counter.getCounter,
    getActivePlaylist: playlist.getActivePlaylist,
    getActivePoll: poll.getActivePoll,
    getAudios: audio.getAudios,
    getLocalVideoMeta: playlist.getLocalVideoMeta,
    getMessages: chat.getMessages,
    getPlaylist: playlist.getPlaylist,
    getPlaylistConfig: playlist.getPlaylistConfig,
    getPlaylists: playlist.getPlaylists,
    getPlaylistSearchResults: playlist.getPlaylistSearchResults,
    getPolls: poll.getPolls,
    getPollWinner: poll.getPollWinner,
    getTwitchClipMeta: playlist.getTwitchClipMeta,
    getTwitchVideoMeta: playlist.getTwitchVideoMeta,
    getVideo: playlist.getVideo,
    getVideoSearchResults: playlist.getVideoSearchResults,
    getYoutubeVideoMeta: playlist.getYoutubeVideoMeta,
    mergePlaylists: playlist.mergePlaylists,
    moveVideo: playlist.moveVideo,
    pollResultToChat: poll.pollResultToChat,
    resetActivePlaylist: playlist.resetActivePlaylist,
    removePlaylist: playlist.removePlaylist,
    removePoll: poll.removePoll,
    removeVideo: playlist.removeVideo,
    removeVideosByFlagFromActivePlaylist: playlist.removeVideosByFlagFromActivePlaylist,
    setTranslation: function() {
        if (typeof locales[chatbot.config.locale] === 'undefined') {
            chatbot.t = locales.en;
        } else {
            chatbot.t = locales[chatbot.config.locale];
        }
    },
    startPoll: poll.startPoll,
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
