const audio    = require('./audio');
const chat     = require('./chat');
const channel  = require('./channel');
const command  = require('./command');
const counter  = require('./counter');
const database = require('./database');
const locales  = require('./locales');
const playlist = require('./playlist');
const poll     = require('./poll');
const raffle   = require('./raffle');

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
    activeRaffles: {},
    playlists: {},
    polls: {},
    raffles: {},
    socket: null, // skateboard socket
    socketChat: null, // skateboard socket
    socketCounter: null, // skateboard socket
    socketPoll: null, // skateboard socket
    socketRaffle: null, // skateboard socket
    socketVideo: null, // skateboard socket
    t: {}, // translation
    addAttendee: raffle.addAttendee,
    addPlaylist: playlist.addPlaylist,
    addPoll: poll.addPoll,
    addRaffle: raffle.addRaffle,
    addUserChoice: poll.addUserChoice,
    addVideo: playlist.addVideo,
    announcePollToChat: poll.announcePollToChat,
    announceRaffleToChat: raffle.announceRaffleToChat,
    clearActivePlaylist: playlist.clearActivePlaylist,
    closePoll: poll.closePoll,
    closeRaffle: raffle.closeRaffle,
    getChannels: channel.getChannels,
    getChannelDisplayName: channel.getChannelDisplayName,
    getCommands: command.getCommands,
    getCounter: counter.getCounter,
    getActivePlaylist: playlist.getActivePlaylist,
    getActivePoll: poll.getActivePoll,
    getActiveRaffle: raffle.getActiveRaffle,
    getAudios: audio.getAudios,
    getLocalVideoMeta: playlist.getLocalVideoMeta,
    getMessages: chat.getMessages,
    getPlaylist: playlist.getPlaylist,
    getPlaylistConfig: playlist.getPlaylistConfig,
    getPlaylists: playlist.getPlaylists,
    getPlaylistSearchResults: playlist.getPlaylistSearchResults,
    getPolls: poll.getPolls,
    getRaffles: raffle.getRaffles,
    getPollWinner: poll.getPollWinner,
    getRaffleWinner: raffle.getRaffleWinner,
    getTwitchClipMeta: playlist.getTwitchClipMeta,
    getTwitchVideoMeta: playlist.getTwitchVideoMeta,
    getVideo: playlist.getVideo,
    getVideoSearchResults: playlist.getVideoSearchResults,
    getYoutubeVideoMeta: playlist.getYoutubeVideoMeta,
    mergePlaylists: playlist.mergePlaylists,
    moveVideo: playlist.moveVideo,
    pollResultToChat: poll.pollResultToChat,
    raffleResultToChat: raffle.raffleResultToChat,
    resetActivePlaylist: playlist.resetActivePlaylist,
    removePlaylist: playlist.removePlaylist,
    removePoll: poll.removePoll,
    removeRaffle: raffle.removeRaffle,
    removeVideo: playlist.removeVideo,
    removeVideosByFlagFromActivePlaylist: playlist.removeVideosByFlagFromActivePlaylist,
    saveChannelToken: channel.saveChannelToken,
    setTranslation: function() {
        if (typeof locales[chatbot.config.locale] === 'undefined') {
            chatbot.t = locales.en;
        } else {
            chatbot.t = locales[chatbot.config.locale];
        }
    },
    startPoll: poll.startPoll,
    startRaffle: raffle.startRaffle,
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
