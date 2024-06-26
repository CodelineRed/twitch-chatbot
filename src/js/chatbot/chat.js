const config       = require('../../app/chatbot.json');
const database     = require('./database');
const bot          = require('./bot');
const emote        = require('./emote');
const linkify      = require('linkifyjs');
const linkifyHtml  = require('linkify-html');
const moment       = require('moment');
const {v4: uuidv4, validate: uuidValid} = require('uuid');

const chat = {
    lists: {},
    /**
     * Formats badges to fontawesome icon
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {object}
     */
    formatBadges: function(chatbot, args) {
        if (args.badges === null) {
            args.badges = {};
        }

        if (args.badgeInfo === null) {
            args.badgeInfo = {};
        }

        // further badges can be found in Chatty > Settings > Look > Badges > Enable Custom Badges > Edit Item > ID/Version
        const badges = {
            broadcaster: typeof args.badges.broadcaster === 'string' ? {style: 'fas', icon: 'video', transform: null, title: 'Broadcaster', cssClass: null} : undefined,
            admin: typeof args.badges.admin === 'string' ? {style: 'fab', icon: 'twitch', transform: null, title: 'Admin', cssClass: null} : undefined,
            staff: typeof args.badges.staff === 'string' ? {style: 'fas', icon: 'wrench', transform: null, title: 'Staff', cssClass: null} : undefined,
            globalMod: typeof args.badges.global_mod === 'string' ? {style: 'fas', icon: 'hammer', transform: null, title: 'Global Mod', cssClass: 'global-mod'} : undefined,
            vip: typeof args.badges.vip === 'string' ? {style: 'fas', icon: 'gem', transform: null, title: 'Vip', cssClass: null} : undefined,
            mod: typeof args.badges.moderator === 'string' ? {style: 'fas', icon: 'gavel', transform: null, title: 'Mod', cssClass: null} : undefined,
            founder: typeof args.badges.founder === 'string' ? {style: 'fas', icon: 'award', transform: null, title: 'Founder' + (typeof args.badgeInfo.founder === 'undefined' ? '' : ' (' + args.badgeInfo.founder + ')'), cssClass: null} : undefined,
            subscriber: typeof args.badges.subscriber === 'string' ? {style: 'fas', icon: 'star', transform: null, title: 'Sub' + (typeof args.badgeInfo.subscriber === 'undefined' ? '' : ' (' + args.badgeInfo.subscriber + ')'), cssClass: null} : undefined,
            hypeTrain: typeof args.badges['hype-train'] === 'string' ? {style: 'fas', icon: 'train', transform: null, title: (args.badges['hype-train'] === '2' ? 'Former ' : '') + 'Hype Train Conductor', cssClass: args.badges['hype-train'] === '2' ? 'hype-train former' : 'hype-train'} : undefined,
            bits: typeof args.badges.bits === 'string' ? {style: 'fab', icon: 'ethereum', transform: null, title: 'Bits (' + args.badges.bits + ')', cssClass: null} : undefined,
            bitsLeader: typeof args.badges['bits-leader'] === 'string' ? {style: 'fab', icon: 'ethereum', transform: null, title: 'Bits Leader', cssClass: 'bits-leader'} : undefined,
            subGifter: typeof args.badges['sub-gifter'] === 'string' ? {style: 'fas', icon: 'gift', transform: null, title: 'Sub Gifter (' + args.badges['sub-gifter'] + ')', cssClass: 'sub-gifter'} : undefined,
            subGiftLeader: typeof args.badges['sub-gift-leader'] === 'string' ? {style: 'fas', icon: 'gift', transform: null, title: 'Sub Gift Leader', cssClass: 'sub-gift-leader'} : undefined,
            bitsCharity: typeof args.badges['bits-charity'] === 'string' ? {style: 'fas', icon: 'snowflake', transform: null, title: 'Direct Relief 2018', cssClass: 'bits-charity'} : undefined,
            glhfPledge: typeof args.badges['glhf-pledge'] === 'string' ? {style: 'fas', icon: 'money-bill', transform: null, title: 'GLHF Pledge', cssClass: 'glhf-pledge'} : undefined,
            premium: typeof args.badges.premium === 'string' ? {style: 'fas', icon: 'crown', transform: null, title: 'Prime', cssClass: null} : undefined,
            turbo: typeof args.badges.turbo === 'string' ? {style: 'fas', icon: 'bolt', transform: null, title: 'Turbo', cssClass: null} : undefined,
            twitchconEU2019: typeof args.badges.twitchconEU2019 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: null, title: 'TwitchCon EU 2019', cssClass: 'tc-eu-2019'} : undefined,
            twitchconEU2020: typeof args.badges.twitchconAmsterdam2020 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: null, title: 'TwitchCon EU 2020', cssClass: 'tc-eu-2020'} : undefined,
            twitchconUSA2017: typeof args.badges.twitchcon2017 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: null, title: 'TwitchCon USA 2017', cssClass: 'tc-usa-2017'} : undefined,
            twitchconUSA2018: typeof args.badges.twitchcon2018 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: null, title: 'TwitchCon USA 2018', cssClass: 'tc-usa-2018'} : undefined,
            twitchconUSA2019: typeof args.badges.twitchconNA2019 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: null, title: 'TwitchCon USA 2019', cssClass: 'tc-usa-2019'} : undefined,
            twitchconUSA2020: typeof args.badges.twitchconNA2020 === 'string' ? {style: 'fas', icon: 'ticket-alt', transform: null, title: 'TwitchCon USA 2019', cssClass: 'tc-usa-2019'} : undefined,
            twitchconTGC2020: typeof args.badges.glitchcon2020 === 'string' ? {style: 'fas', icon: 'dragon', transform: null, title: 'GlitchCon 2020', cssClass: 'tgc-2020'} : undefined,
            partner: typeof args.badges.partner === 'string' ? {style: 'fas', icon: 'check-circle', transform: null, title: 'Partner', cssClass: null} : undefined,
            bot: bot.list.indexOf(args.user.toLowerCase()) > -1 ? {style: 'fas', icon: 'robot', transform: null, title: 'Bot', cssClass: null} : undefined
        };

        return badges;
    },
    /**
     * Returns formated message
     * 
     * @param {object} args
     * @returns {string}
     */
    format: function(args) {
        let message = args.message;
        let rawMessage = args.message;
        message = emote.encodeTwitch(message, args);
        message = emote.encode7tv(message, rawMessage, args);
        message = emote.encodeBttv(message, rawMessage, args);
        message = emote.encodeFfz(message, rawMessage, args);
        message = linkifyHtml(message, {
            defaultProtocol: 'https'
        });

        return message;
    },
    /**
     * Sends formated message to frontend
     * 
     * @param {string} chatbot
     * @param {string} args
     * @returns {undefined}
     */
    get: function(chatbot, args) {
        chat.prepareLists(chatbot, args, true);

        let formatBadges = {
            user: args.userstate['display-name'],
            badges: args.userstate.badges,
            badgeInfo: args.userstate['badge-info']
        };

        let format = {
            uuid: typeof args.userstate.id === 'undefined' ? uuidv4() : args.userstate.id,
            channel: args.channel,
            emotes: args.userstate.emotes,
            lazy: true,
            message: args.message
        };

        let values = {
            uuid: format.uuid,
            badges: chat.formatBadges(chatbot, formatBadges),
            badgeInfo: formatBadges.badgeInfo === null || typeof formatBadges.badgeInfo === 'undefined' ? '' : formatBadges.badgeInfo,
            roomId: typeof args.userstate['room-id'] === 'undefined' ? '' : args.userstate['room-id'],
            color: args.userstate.color === null || typeof args.userstate.color === 'undefined' ? '' : args.userstate.color,
            emotes: args.userstate.emotes === null || typeof args.userstate.emotes === 'undefined' ? '' : args.userstate.emotes,
            flags: args.userstate.flags === null || typeof args.userstate.flags === 'undefined' ? '' : args.userstate.flags,
            message: chat.format(format),
            type: args.userstate['message-type'],
            purge: {showMessage: false, hasPurge: false},
            user: args.userstate['display-name'],
            userId: typeof args.userstate['user-id'] === 'undefined' ? '0' : args.userstate['user-id'],
            createdAt: typeof args.userstate['tmi-sent-ts'] === 'undefined' ? moment().unix() : (parseInt(args.userstate['tmi-sent-ts']) / 1000).toFixed(0) // unix timestamp (seconds)
        };

        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    item: Object.assign({}, values)
                },
                method: 'setMessage',
                ref: 'chat',
                env: 'browser'
            };
            chatbot.socket.write(JSON.stringify(call));

            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }
        }

        chat.lists[args.channel].push(values);
        if (typeof chatbot.channels[args.channel] !== 'undefined') {
            values.badges = args.userstate.badges === null ? '' : JSON.stringify(args.userstate.badges);
            values.badgeInfo = Object.keys(values.badgeInfo).length ? JSON.stringify(values.badgeInfo) : '';
            values.channelId = chatbot.channels[args.channel].id;
            values.emotes = Object.keys(values.emotes).length ? JSON.stringify(values.emotes) : '';
            values.flags = typeof values.flags === 'string' ? values.flags : JSON.stringify(values.flags);
            values.message = args.message;
            values.notification = '';
            values.purge = JSON.stringify(values.purge);
            values.updatedAt = values.createdAt;
            delete values.roomId;
            delete values.color;
            delete values.user;
            delete values.badges;
            delete values.badgeInfo;

            database.insert('chat', [values]);
        }
    },
    /**
     * Sends latest 100 messages to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getList: function(chatbot, args) {
        chat.prepareLists(chatbot, args, false);

        let subSelect = 'SELECT ch.uuid, ch.channel_id, ch.emotes, ch.flags, ';
        subSelect += 'ch.message, ch.notification, ch.type, ch.purge, ';
        subSelect += 'ch.user_id, ch.updated_at, ch.created_at, ';
        subSelect += 'u.name AS user_name, u.color, cuj.badges, cuj.badge_info ';
        let subFrom = 'FROM channel AS c ';
        let subJoin = 'JOIN chat AS ch ON c.id = ch.channel_id ';
        subJoin += 'JOIN user AS u ON ch.user_id = u.id ';
        subJoin += 'JOIN channel_user_join AS cuj ON ch.user_id = cuj.user_id AND ch.channel_id = cuj.channel_id ';
        let subWhere = 'WHERE c.name = ? ';
        let subOrder = 'ORDER BY ch.created_at DESC ';
        let subLimit = 'LIMIT 100';
        let select = '*';
        let from = '(' + subSelect + subFrom + subJoin + subWhere + subOrder + subLimit + ')';
        let order = 'created_at ASC';

        // get the latest 100 messages
        database.find(select, from, '', [], '', order, 0, [args.channel], function(rows) {
            chat.lists[args.channel] = [];

            rows.forEach(function(row) {
                let formatBadges = {
                    user: row.user_name,
                    badges: row.badges.length ? JSON.parse(row.badges) : {},
                    badgeInfo: row.badge_info.length ? JSON.parse(row.badge_info) : {}
                };

                let format = {
                    channel: args.channel,
                    emotes: row.emotes.length ? JSON.parse(row.emotes) : {},
                    lazy: true,
                    message: row.message
                };

                let message = chat.format(format);

                if (row.notification.length) {
                    message = row.notification + (row.message ? ' (' + chat.format(format) + ')' : '');
                    row.user_name = ''; // eslint-disable-line camelcase
                }

                chat.lists[args.channel].push({
                    uuid: row.uuid,
                    channelId: row.channel_id,
                    badges: row.type === 'notification' ? '' : chat.formatBadges(chatbot, formatBadges),
                    badgeInfo: row.type === 'notification' ? '' : formatBadges.badge_info,
                    color: row.color,
                    emotes: format.emotes,
                    flags: row.flags,
                    message: message,
                    type: row.type,
                    purge: row.purge.length ? JSON.parse(row.purge) : {},
                    user: row.user_name,
                    userId: row.user_id,
                    createdAt: row.created_at // unix timestamp (seconds)
                });
            });

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        list: chat.lists[args.channel]
                    },
                    method: 'setMessages',
                    ref: 'chat',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));

                if (chatbot.socketChat !== null) {
                    chatbot.socketChat.write(JSON.stringify(call));
                }
            }
        });
    },
    /**
     * Sends chat notification to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getNotification: function(chatbot, args) {
        chat.prepareLists(chatbot, args, true);

        let format = {
            channel: args.channel,
            emotes: {},
            lazy: true,
            message: args.message
        };

        let values = {
            uuid: typeof args.userstate.id === 'undefined' ? uuidv4() : args.userstate.id,
            badges: '',
            badgeInfo: '',
            roomId: args.userstate['room-id'] === 'undefined' ? 0 : args.userstate['user-id'],
            color: '',
            emotes: '',
            flags: '',
            message: args.notification + (args.message ? ' (' + chat.format(format) + ')' : ''),
            type: 'notification',
            purge: {showMessage: false, hasPurge: false},
            user: '[' + args.userstate['message-type'].charAt(0).toUpperCase() + args.userstate['message-type'].slice(1) + ']',
            userId: typeof args.userstate['user-id'] === 'undefined' ? 0 : args.userstate['user-id'],
            createdAt: typeof args.userstate['tmi-sent-ts'] === 'undefined' ? moment().unix() : (parseInt(args.userstate['tmi-sent-ts']) / 1000).toFixed(0) // unix timestamp (seconds)
        };

        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    item: Object.assign({}, values)
                },
                method: 'setMessage',
                ref: 'chat',
                env: 'browser'
            };

            chatbot.socket.write(JSON.stringify(call));

            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }
        }

        chat.lists[args.channel].push(values);
        if (typeof chatbot.channels[args.channel] !== 'undefined') {
            values.channelId = chatbot.channels[args.channel].id;
            values.message = typeof args.message === 'string' ? args.message : '';
            values.notification = values.user + ' ' + args.notification;
            values.purge = JSON.stringify(values.purge);
            values.updatedAt = values.createdAt;
            delete values.roomId;
            delete values.color;
            delete values.user;
            delete values.badges;
            delete values.badgeInfo;

            database.insert('chat', [values]);
        }
    },
    /**
     * Saves message purge
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getPurge: function(chatbot, args) {
        chat.prepareLists(chatbot, args, false);

        // if message deleted
        if (typeof args.userstate['target-msg-id'] === 'string') {
            let set = {
                updatedAt: moment().unix(),
                purge: JSON.stringify(args.purge)
            };
            let where = [`uuid = '${args.userstate['target-msg-id']}'`];

            database.update('chat', set, where, function(update) {
                chat.getList(chatbot, args);
            });
        }

        // if message timeout / ban
        if (typeof args.userstate['target-user-id'] === 'string') {
            let from = 'chat';
            let set = {
                updatedAt: moment().unix(),
                purge: JSON.stringify(args.purge)
            };
            let where = [
                `channel_id = '${args.userstate['room-id']}'`,
                `user_id = '${args.userstate['target-user-id']}'`,
                'purge LIKE \'%"showMessage":false%\''
            ];

            database.update(from, set, where, function(update) {
                where = ['user_id = ?'];
                let order = 'created_at DESC';
                let prepare = [args.userstate['target-user-id']];

                database.find('*', from, '', where, '', order, 1, prepare, function(rows) {
                    if (rows.length) {
                        where = [`uuid = '${rows[0].uuid}'`];
                        set.purge = JSON.parse(set.purge);
                        set.purge.showMessage = true;
                        set.purge = JSON.stringify(set.purge);

                        // add showMessage = true to latest message
                        database.update(from, set, where, function(updateSingle) {
                            chat.getList(chatbot, args);
                        });
                    } else {
                        chat.getList(chatbot, args);
                    }
                });
            });
        }
    },
    /**
     * Prepares messages array
     * 
     * @param {object} chatbot
     * @param {object} args
     * @param {boolean} shift
     * @returns {undefined}
     */
    prepareLists: function(chatbot, args, shift) {
        if (typeof chat.lists[args.channel] === 'undefined') {
            chat.lists[args.channel] = [];
        } else if (chat.lists[args.channel].length >= 100 && shift) {
            chat.lists[args.channel].shift();
        }
    }
};

module.exports = chat;
