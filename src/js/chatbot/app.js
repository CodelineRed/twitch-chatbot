const audio     = require('./audio');
const chat      = require('./chat');
const channel   = require('./channel');
const command   = require('./command');
const counter   = require('./counter');
const database  = require('./database');
const playlist  = require('./playlist');
const poll      = require('./poll');
const raffle    = require('./raffle');
const statistic = require('./statistic');

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
    getChart: statistic.getChart,
    getLocalVideoMeta: playlist.getLocalVideoMeta,
    getMessages: chat.getMessages,
    getMisc: statistic.getMisc,
    getPlaylist: playlist.getPlaylist,
    getPlaylistConfig: playlist.getPlaylistConfig,
    getPlaylists: playlist.getPlaylists,
    getPlaylistSearchResults: playlist.getPlaylistSearchResults,
    getPolls: poll.getPolls,
    getPurges: statistic.getPurges,
    getRaffles: raffle.getRaffles,
    getPollWinner: poll.getPollWinner,
    getRaffleWinner: raffle.getRaffleWinner,
    getStreamDates: statistic.getStreamDates,
    getSubs: statistic.getSubs,
    getTopEmotes: statistic.getTopEmotes,
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
