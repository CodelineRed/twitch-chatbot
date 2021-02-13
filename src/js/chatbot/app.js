const database   = require('./database');
const attendee   = require('./attendee');
const audio      = require('./audio');
const bot        = require('./bot');
const chat       = require('./chat');
const channel    = require('./channel');
const command    = require('./command');
const counter    = require('./counter');
const playlist   = require('./playlist');
const poll       = require('./poll');
const raffle     = require('./raffle');
const statistic  = require('./statistic');
const userChoice = require('./user-choice');
const video      = require('./video');

/**
 * Chatbot Object
 */
const chatbot = {
    bots: bot.list,
    channels: channel.lists,
    client: null, // tmi client
    config: null,
    counters: counter.lists,
    commands: command.lists,
    commandList: command.defaultList,
    currentVideoStart: video.currentStarts, // unix timestamp (seconds)
    messages: chat.lists,
    activePlaylists: playlist.activeLists,
    activePolls: poll.activeLists,
    activeRaffles: raffle.activeLists,
    playlists: playlist.lists,
    polls: poll.lists,
    raffles: raffle.lists,
    socket: null, // skateboard socket
    socketChat: null, // skateboard socket
    socketCounter: null, // skateboard socket
    socketPoll: null, // skateboard socket
    socketRaffle: null, // skateboard socket
    socketVideo: null, // skateboard socket
    addAttendee: attendee.add,
    addPlaylist: playlist.add,
    addPoll: poll.add,
    addRaffle: raffle.add,
    addUserChoice: userChoice.add,
    addVideo: video.add,
    announcePollToChat: poll.announceToChat,
    announceRaffleToChat: raffle.announceToChat,
    clearActivePlaylist: playlist.clearActive,
    closePoll: poll.close,
    closeRaffle: raffle.close,
    getActivePlaylist: playlist.getActive,
    getActivePoll: poll.getActive,
    getActiveRaffle: raffle.getActive,
    getAudios: audio.getList,
    getChannels: channel.getList,
    getChannelDisplayName: channel.getDisplayName,
    getCommands: command.getList,
    getCounter: counter.get,
    getChannelToken: channel.getToken,
    getChart: statistic.getChart,
    getLocalVideoMeta: video.getLocalVideoMeta,
    getMessages: chat.getList,
    getMisc: statistic.getMisc,
    getPlaylist: playlist.get,
    getPlaylistConfig: playlist.getConfig,
    getPlaylists: playlist.getList,
    getPlaylistSearchResults: playlist.getSearchResults,
    getPolls: poll.getList,
    getPollWinner: poll.getWinner,
    getPurges: statistic.getPurges,
    getRaffles: raffle.getList,
    getRaffleWinner: raffle.getWinner,
    getStreamDates: statistic.getStreamDates,
    getSubs: statistic.getSubs,
    getTopChatters: statistic.getTopChatters,
    getTopEmotes: statistic.getTopEmotes,
    getTopWords: statistic.getTopWords,
    getTwitchClipMeta: video.getTwitchClipMeta,
    getTwitchVideoMeta: video.getTwitchVideoMeta,
    getVideo: video.get,
    getVideoSearchResults: video.getSearchResults,
    getYoutubeVideoMeta: video.getYoutubeVideoMeta,
    mergePlaylists: playlist.merge,
    moveVideo: video.move,
    pollResultToChat: poll.resultToChat,
    raffleResultToChat: raffle.resultToChat,
    resetActivePlaylist: playlist.resetActive,
    removeCustomCommand: command.removeCustomCommand,
    removePlaylist: playlist.remove,
    removePoll: poll.remove,
    removeRaffle: raffle.remove,
    removeVideo: video.remove,
    removeVideosByFlagFromActivePlaylist: playlist.removeVideosByFlagFromActivePlaylist,
    saveChannelToken: channel.saveToken,
    startPoll: poll.start,
    startRaffle: raffle.start,
    swapPlaylist: playlist.swap,
    updateCommand: command.update,
    updateCommandLastExec: command.updateLastExec,
    updateCounter: counter.update,
    updatePlaylist: playlist.update,
    updateVideo: video.update,
    warmUpDatabase: function(channelState) {
        database.prepareBotTable(this, channelState);
        database.prepareChannelTable(this, channelState);
    }
};

module.exports = chatbot;
