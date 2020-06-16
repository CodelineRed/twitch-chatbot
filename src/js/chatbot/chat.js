const database     = require('./database');
const linkify      = require('linkifyjs');
const linkifyHtml  = require('linkifyjs/html');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4} = require('uuid');

database.open();

const chat = {
    bttvEmotes: {},
    ffzEmotes: {},
    encodeBttvEmotes: function(message, channel) {
        let emoteCodes = Object.keys(chat.bttvEmotes[channel]);
        for (let i = 0; i < emoteCodes.length; i++) {
            let regex = new RegExp(emoteCodes[i], 'g');
            message = message.replace(regex, chat.generateEmoteImage(chat.bttvEmotes[channel][emoteCodes[i]], emoteCodes[i]));
        }
        return message;
    },
    encodeFfzEmotes: function(message, channel) {
        let emoteCodes = Object.keys(chat.ffzEmotes[channel]);
        for (let i = 0; i < emoteCodes.length; i++) {
            let regex = new RegExp(emoteCodes[i], 'g');
            message = message.replace(regex, chat.generateEmoteImage(chat.ffzEmotes[channel][emoteCodes[i]], emoteCodes[i]));
        }
        return message;
    },
    encodeTwitchEmotes: function(message, emotes) {
        let splitText = message.split('');

        for (let i in emotes) {
            if (Object.prototype.hasOwnProperty.call(emotes, i)) {
                let emoteCodes = emotes[i];

                for (let j in emoteCodes) {
                    if (Object.prototype.hasOwnProperty.call(emoteCodes, j)) {
                        let emoteCode = emoteCodes[j];

                        if (typeof emoteCode === 'string') {
                            emoteCode = emoteCode.split('-');
                            emoteCode = [parseInt(emoteCode[0]), parseInt(emoteCode[1])];
                            let length =  emoteCode[1] - emoteCode[0];
                            let empty = Array.apply(null, new Array(length + 1)).map(function() {
                                return '';
                            });
                            let emote = message.slice(emoteCode[0], emoteCode[1] + 1);
                            splitText = splitText.slice(0, emoteCode[0]).concat(empty).concat(splitText.slice(emoteCode[1] + 1, splitText.length));
                            splitText.splice(emoteCode[0], 1, chat.generateEmoteImage('http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/1.0', emote));
                        }
                    }
                }
            }
        }
        return splitText.join('');
    },
    formatBadges: function(chatbot, args) {
        if (args.badges === null) {
            args.badges = {};
        }

        // further badges can be found in Chatty > Settings > Look > Badges > Enable Custom Badges > Edit Item > ID/Version
        const badges = {
            broadcaster: typeof args.badges.broadcaster === 'string' ? {style: 'fas', icon: 'video', transform: null, title: 'Broadcaster', cssClass: null} : undefined,
            admin: typeof args.badges.admin === 'string' ? {style: 'fab', icon: 'twitch', transform: null, title: 'Admin', cssClass: null} : undefined,
            staff: typeof args.badges.staff === 'string' ? {style: 'fas', icon: 'wrench', transform: null, title: 'Staff', cssClass: null} : undefined,
            globalMod: typeof args.badges.global_mod === 'string' ? {style: 'fas', icon: 'hammer', transform: null, title: 'Global Mod', cssClass: 'global-mod'} : undefined,
            vip: typeof args.badges.vip === 'string' ? {style: 'fas', icon: 'gem', transform: null, title: 'Vip', cssClass: null} : undefined,
            mod: typeof args.badges.moderator === 'string' ? {style: 'fas', icon: 'gavel', transform: null, title: 'Mod', cssClass: null} : undefined,
            founder: typeof args.badges.founder === 'string' ? {style: 'fas', icon: 'award', transform: null, title: 'Founder', cssClass: null} : undefined,
            subscriber: typeof args.badges.subscriber === 'string' ? {style: 'fas', icon: 'star', transform: null, title: 'Sub (' + args.badgeInfo.subscriber + ')', cssClass: null} : undefined,
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
            partner: typeof args.badges.partner === 'string' ? {style: 'fas', icon: 'check-circle', transform: null, title: 'Partner', cssClass: null} : undefined,
            bot: chatbot.bots.indexOf(args.user.toLowerCase()) > -1 ? {style: 'fas', icon: 'robot', transform: null, title: 'Bot', cssClass: null} : undefined
        };

        return badges;
    },
    formatMessage: function(args) {
        let message = args.message;
        message = chat.encodeTwitchEmotes(message, args.emotes);
        message = chat.encodeBttvEmotes(message, args.channel);
        message = chat.encodeFfzEmotes(message, args.channel);
        message = linkifyHtml(message, {
            defaultProtocol: 'https'
        });

        return message;
    },
    generateEmoteImage: function(url, emote) {
        return '<img class="emote img-fluid" src="img/empty-emote.png" data-src="' + url + '"  data-toggle="tooltip" data-placement="top" title="' + emote + '">';
    },
    getMessage: function(chatbot, args) {
        if (chatbot.socket !== null) {
            chat.prepareMessages(chatbot, args, true);

            let formatBadges = {
                user: args.userstate['display-name'],
                badges: args.userstate.badges,
                badgeInfo: args.userstate['badge-info']
            };

            let formatMessage = {
                channel: args.channel,
                emotes: args.userstate.emotes,
                message: args.message
            };

            const call = {
                args: {
                    channel: args.channel,
                    message: {
                        uuid: typeof args.userstate.id === 'undefined' ? uuidv4() : args.userstate.id,
                        badges: chat.formatBadges(chatbot, formatBadges),
                        badgeInfo: formatBadges.badgeInfo === null || typeof formatBadges.badgeInfo === 'undefined' ? '' : formatBadges.badgeInfo,
                        roomId: typeof args.userstate['room-id'] === 'undefined' ? '' : args.userstate['room-id'],
                        color: args.userstate.color === null || typeof args.userstate.color === 'undefined' ? '' : args.userstate.color,
                        emotes: args.userstate.emotes === null || typeof args.userstate.emotes === 'undefined' ? '' : args.userstate.emotes,
                        flags: args.userstate.flags === null || typeof args.userstate.flags === 'undefined' ? '' : args.userstate.flags,
                        message: chat.formatMessage(formatMessage),
                        type: args.userstate['message-type'],
                        purge: {showMessage: false, hasPurge: false},
                        user: args.userstate['display-name'],
                        userId: typeof args.userstate['user-id'] === 'undefined' ? '0' : args.userstate['user-id'],
                        createdAt: typeof args.userstate['tmi-sent-ts'] === 'undefined' ? moment().unix() : (parseInt(args.userstate['tmi-sent-ts']) / 1000).toFixed(0) // unix timestamp (seconds)
                    }
                },
                method: 'setMessage',
                ref: 'chat',
                env: 'browser'
            };

            chatbot.messages[args.channel].push(call.args.message);
            chatbot.socket.write(JSON.stringify(call));

            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }

            if (typeof chatbot.channels[args.channel] !== 'undefined') {
                let values = Object.assign({}, call.args.message);
                delete values.roomId;
                values.badges = args.userstate.badges === null ? '' : JSON.stringify(args.userstate.badges);
                values.badgeInfo = Object.keys(values.badgeInfo).length ? JSON.stringify(values.badgeInfo) : '';
                values.channelId = chatbot.channels[args.channel].id;
                values.emotes = Object.keys(values.emotes).length ? JSON.stringify(values.emotes) : '';
                values.flags = typeof values.flags === 'string' ? values.flags : JSON.stringify(values.flags);
                values.message = args.message;
                values.notification = '';
                values.purge = JSON.stringify(values.purge);
                values.updatedAt = values.createdAt;

                database.insert('chat', [values]);
            }
        }
    },
    getMessages: function(chatbot, args) {
        chat.prepareMessages(chatbot, args, false);

        let subSelect = 'SELECT ch.uuid, ch.channel_id, c.room_id, ch.badges, ch.badge_info, ';
        subSelect += 'ch.color, ch.emotes, ch.flags, ch.message, ch.notification, ch.type, ';
        subSelect += 'ch.purge, ch.user_id, ch.user, ch.updated_at, ch.created_at ';
        let subFrom = 'FROM channel AS c ';
        let subJoin = 'JOIN chat AS ch ON ch.channel_id = c.id ';
        let subWhere = 'WHERE c.name = ? ';
        let subOrder = 'ORDER BY ch.created_at DESC ';
        let subLimit = 'LIMIT 100';
        let select = '*';
        let from = '(' + subSelect + subFrom + subJoin + subWhere + subOrder + subLimit + ')';
        let order = 'created_at ASC';

        // get the latest 100 messages
        database.find(select, from, '', [], '', order, 0, [args.channel], function(rows) {
            chatbot.messages[args.channel] = [];

            rows.forEach(function(row) {
                let formatBadges = {
                    user: row.user,
                    badges: row.badges.length ? JSON.parse(row.badges) : {},
                    badgeInfo: row.badge_info.length ? JSON.parse(row.badge_info) : {}
                };

                let formatMessage = {
                    channel: args.channel,
                    emotes: row.emotes.length ? JSON.parse(row.emotes) : {},
                    message: row.message
                };

                let message = chat.formatMessage(formatMessage);

                if (row.notification.length) {
                    message = row.notification + (row.message ? ' (' + chat.formatMessage(formatMessage) + ')' : '');
                }

                chatbot.messages[args.channel].push({
                    uuid: row.uuid,
                    channelId: row.channel_id,
                    badges: chat.formatBadges(chatbot, formatBadges),
                    badgeInfo: formatBadges.badge_info,
                    roomId: row.room_id,
                    color: row.color,
                    emotes: formatMessage.emotes,
                    flags: row.flags,
                    message: message,
                    type: row.type,
                    purge: row.purge.length ? JSON.parse(row.purge) : {},
                    user: row.user,
                    userId: row.user_id,
                    createdAt: row.created_at // unix timestamp (seconds)
                });
            });

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        messages: chatbot.messages[args.channel]
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
    getNotification: function(chatbot, args) {
        if (chatbot.socket !== null) {
            chat.prepareMessages(chatbot, args, true);

            let formatMessage = {
                channel: args.channel,
                emotes: {},
                message: args.message
            };

            const call = {
                args: {
                    channel: args.channel,
                    message: {
                        uuid: typeof args.userstate.id === 'undefined' ? uuidv4() : args.userstate.id,
                        badges: '',
                        badgeInfo: '',
                        roomId: args.userstate['room-id'] === 'undefined' ? 0 : args.userstate['user-id'],
                        color: '',
                        emotes: '',
                        flags: '',
                        message: args.notification + (args.message ? ' (' + chat.formatMessage(formatMessage) + ')' : ''),
                        type: 'notification',
                        purge: {showMessage: false, hasPurge: false},
                        user: '[' + args.userstate['message-type'].charAt(0).toUpperCase() + args.userstate['message-type'].slice(1) + ']',
                        userId: typeof args.userstate['user-id'] === 'undefined' ? 0 : args.userstate['user-id'],
                        createdAt: typeof args.userstate['tmi-sent-ts'] === 'undefined' ? moment().unix() : (parseInt(args.userstate['tmi-sent-ts']) / 1000).toFixed(0) // unix timestamp (seconds)
                    }
                },
                method: 'setMessage',
                ref: 'chat',
                env: 'browser'
            };

            chatbot.messages[args.channel].push(call.args.message);
            chatbot.socket.write(JSON.stringify(call));

            if (chatbot.socketChat !== null) {
                chatbot.socketChat.write(JSON.stringify(call));
            }

            if (typeof chatbot.channels[args.channel] !== 'undefined') {
                let values = Object.assign({}, call.args.message);
                delete values.roomId;
                values.channelId = chatbot.channels[args.channel].id;
                values.message = typeof args.message === 'string' ? args.message : '';
                values.notification = args.notification;
                values.purge = JSON.stringify(values.purge);
                values.updatedAt = values.createdAt;

                database.insert('chat', [values]);
            }
        }
    },
    getPurge: function(chatbot, args) {
        if (chatbot.socket !== null) {
            chat.prepareMessages(chatbot, args, false);

            // if message deleted
            if (typeof args.userstate['target-msg-id'] === 'string') {
                let set = {
                    updatedAt: moment().unix(),
                    purge: JSON.stringify(args.purge)
                };
                let where = [`uuid = '${args.userstate['target-msg-id']}'`];

                database.update('chat', set, where, function(update) {
                    chat.getMessages(chatbot, args);
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
                                chat.getMessages(chatbot, args);
                            });
                        } else {
                            chat.getMessages(chatbot, args);
                        }
                    });
                });
            }
        }
    },
    prepareBttvEmotes: function(channel) {
        if (typeof chat.bttvEmotes[channel] === 'undefined') {
            chat.bttvEmotes[channel] = {};

            // get global emotes
            request('https://api.betterttv.net/2/emotes', { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                for (let i = 0; i < body.emotes.length; i++) {
                    chat.bttvEmotes[channel][body.emotes[i].code] = 'https://cdn.betterttv.net/emote/' + body.emotes[i].id + '/1x';
                }
            });

            // get channel emotes
            request('https://api.betterttv.net/2/channels/' + channel, { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.emotes !== 'undefined') {
                    for (let i = 0; i < body.emotes.length; i++) {
                        chat.bttvEmotes[channel][body.emotes[i].code] = 'https://cdn.betterttv.net/emote/' + body.emotes[i].id + '/1x';
                    }
                }
            });
        }
    },
    prepareFfzEmotes: function(channel) {
        if (typeof chat.ffzEmotes[channel] === 'undefined') {
            chat.ffzEmotes[channel] = {};

            // get global emotes
            request('https://api.frankerfacez.com/v1/set/global', { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                let set = body.default_sets[0];
                for (let i = 0; i < body.sets[set].emoticons.length; i++) {
                    chat.ffzEmotes[channel][body.sets[set].emoticons[i].name] = body.sets[set].emoticons[i].urls['1'];
                }
            });

            // get channel emotes
            request('https://api.frankerfacez.com/v1/room/' + channel, { json: true }, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.sets !== 'undefined') {
                    let set = body.room.set;
                    for (let i = 0; i < body.sets[set].emoticons.length; i++) {
                        chat.ffzEmotes[channel][body.sets[set].emoticons[i].name] = body.sets[set].emoticons[i].urls['1'];
                    }
                }
            });
        }
    },
    prepareMessages: function(chatbot, args, shift) {
        if (typeof chatbot.messages[args.channel] === 'undefined') {
            chatbot.messages[args.channel] = [];
        } else if (chatbot.messages[args.channel].length >= 100 && shift) {
            chatbot.messages[args.channel].shift();
        }
    }
};

module.exports = chat;
