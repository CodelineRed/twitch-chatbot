const chalk      = require('chalk');

const database   = require('./database');
const attendee   = require('./attendee');
const audio      = require('./audio');
const bot        = require('./bot');
const chat       = require('./chat');
const channel    = require('./channel');
const command           = require('./command');
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
    getOauthToken: function() {
        let channels = Object.keys(this.channels);
        let oauthToken = '';
        for (let i = 0; i < channels.length; i++) {
            if (typeof chatbot.channels[channels[i]].oauthToken === 'string' 
                && chatbot.channels[channels[i]].oauthToken.length && !oauthToken.length) {
                oauthToken = chatbot.channels[channels[i]].oauthToken;
            }
        }
        return oauthToken;
    },
    showIntro: function() {
        // https://patorjk.com/software/taag/#p=display&f=Slant&t=Twitch%20Chatbot%0A----%20by%20----%0A%20CodelineRed
        console.log(chalk.hex('#bf94ff')('       ______         _ __       __       ________          __  __          __ '));
        console.log(chalk.hex('#bf94ff')('      /_  __/      __(_) /______/ /_     / ____/ /_  ____ _/ /_/ /_  ____  / /_'));
        console.log(chalk.hex('#bf94ff')('       / / | | /| / / / __/ ___/ __ \\   / /   / __ \\/ __ `/ __/ __ \\/ __ \\/ __/'));
        console.log(chalk.hex('#bf94ff')('      / /  | |/ |/ / / /_/ /__/ / / /  / /___/ / / / /_/ / /_/ /_/ / /_/ / /_  '));
        console.log(chalk.hex('#bf94ff')('     /_/   |__/|__/_/\\__/\\___/_/ /_/   \\____/_/ /_/\\__,_/\\__/_.___/\\____/\\__/  '));
        console.log(chalk.white('                                   __                                                 '));
        console.log(chalk.white('                                  / /_  __  __                                 '));
        console.log(chalk.white('      ________________________   / __ \\/ / / /  ________________________       '));
        console.log(chalk.white('     /_____/_____/_____/_____/  / /_/ / /_/ /  /_____/_____/_____/_____/       '));
        console.log(chalk.white('                               /_.___/\\__, /                                   '));
        console.log(chalk.white('                                     \\____/                                    '));
        console.log(chalk.hex('#ff2525')('            ______          __     ___            ____           __            '));
        console.log(chalk.hex('#ff2525')('           / ____/___  ____/ /__  / (_)___  ___  / __ \\___  ____/ /            '));
        console.log(chalk.hex('#ff2525')('          / /   / __ \\/ __  / _ \\/ / / __ \\/ _ \\/ /_/ / _ \\/ __  /             '));
        console.log(chalk.hex('#ff2525')('         / /___/ /_/ / /_/ /  __/ / / / / /  __/ _, _/  __/ /_/ /              '));
        console.log(chalk.hex('#ff2525')('         \\____/\\____/\\__,_/\\___/_/_/_/ /_/\\___/_/ |_|\\___/\\__,_/               '));
        console.log(chalk.hex('#ff2525')('                                                                               '));
    },
    warmUpDatabase: function(channelState) {
        database.prepareBotTable(this, channelState);
        database.prepareChannelTable(this, channelState);
    }
};

module.exports = chatbot;
