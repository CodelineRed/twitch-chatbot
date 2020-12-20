const config      = require('../../app/chatbot.json');
const database    = require('./database');
const emote       = require('./emote');
const linkify     = require('linkifyjs');
const linkifyHtml = require('linkifyjs/html');
const moment      = require('moment');
const request     = require('request');
const {v4: uuidv4, validate: uuidValid} = require('uuid');

const chat = {
    bttvEmotes: {},
    ffzEmotes: {},
    /**
     * Returns message with BTTV emote images
     * 
     * @param {string} message
     * @param {object} args
     * @returns {string}
     */
    encodeBttvEmotes: function(message, args) {
        let emoteCodes = Object.keys(chat.bttvEmotes[args.channel]);
        for (let i = 0; i < emoteCodes.length; i++) {
            let regexEmote = emoteCodes[i].replace(/(\(|\))/g, '\\$1');
            let regex = new RegExp('^' + regexEmote + '| ' + regexEmote + '|' + regexEmote + '$', 'g');

            if (regex.test(message)) {
                if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                    for (let j = 0; j < (message.match(regex) || []).length; j++) {
                        let emoteArgs = {
                            uuid: args.uuid,
                            code: emoteCodes[i],
                            type: 'bttv'
                        };

                        emote.addEmote(emoteArgs);
                    }
                }

                message = message.replace(regex, chat.generateEmoteImage(chat.bttvEmotes[args.channel][emoteCodes[i]], emoteCodes[i], args.lazy));
            }
        }
        return message;
    },
    /**
     * Returns message with FFZ emote images
     * 
     * @param {string} message
     * @param {object} args
     * @returns {string}
     */
    encodeFfzEmotes: function(message, args) {
        let emoteCodes = Object.keys(chat.ffzEmotes[args.channel]);
        for (let i = 0; i < emoteCodes.length; i++) {
            let regexEmote = emoteCodes[i].replace(/(\(|\))/g, '\\$1');
            let regex = new RegExp('^' + regexEmote + '| ' + regexEmote + '|' + regexEmote + '$', 'g');

            if (regex.test(message)) {
                if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                    for (let j = 0; j < (message.match(regex) || []).length; j++) {
                        let emoteArgs = {
                            uuid: args.uuid,
                            code: emoteCodes[i],
                            type: 'ffz'
                        };

                        emote.addEmote(emoteArgs);
                    }
                }

                message = message.replace(regex, chat.generateEmoteImage(chat.ffzEmotes[args.channel][emoteCodes[i]], emoteCodes[i], args.lazy));
            }
        }
        return message;
    },
    /**
     * Returns message with Twitch emote images
     * 
     * @param {string} message
     * @param {object} args
     * @returns {string}
     */
    encodeTwitchEmotes: function(message, args) {
        let splitText = message.split('');

        for (let i in args.emotes ){
            if (Object.prototype.hasOwnProperty.call(args.emotes, i)) {
                let emoteCodes = args.emotes[i];

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
                            let ttvEmote = message.slice(emoteCode[0], emoteCode[1] + 1);
                            splitText = splitText.slice(0, emoteCode[0]).concat(empty).concat(splitText.slice(emoteCode[1] + 1, splitText.length));
                            splitText.splice(emoteCode[0], 1, chat.generateEmoteImage('http://static-cdn.jtvnw.net/emoticons/v1/' + i + '/1.0', ttvEmote, args.lazy));

                            if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                                let emoteArgs = {
                                    uuid: args.uuid,
                                    code: ttvEmote,
                                    typeId: i,
                                    type: 'ttv'
                                };

                                emote.addEmote(emoteArgs);
                            }
                        }
                    }
                }
            }
        }
        return splitText.join('');
    },
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
            bot: chatbot.bots.indexOf(args.user.toLowerCase()) > -1 ? {style: 'fas', icon: 'robot', transform: null, title: 'Bot', cssClass: null} : undefined
        };

        return badges;
    },
    /**
     * Returns formated message
     * 
     * @param {object} args
     * @returns {string}
     */
    formatMessage: function(args) {
        let message = args.message;
        message = chat.encodeTwitchEmotes(message, args);
        message = chat.encodeBttvEmotes(message, args);
        message = chat.encodeFfzEmotes(message, args);
        message = linkifyHtml(message, {
            defaultProtocol: 'https'
        });

        return message;
    },
    /**
     * Returns HTML emote image tag
     * 
     * @param {string} url
     * @param {string} title
     * @param {boolean} lazy optional (default: true)
     * @returns {string}
     */
    generateEmoteImage: function(url, title, lazy) {
        let lazyClass = typeof lazy === 'boolean' && lazy ? ' lazy' : '';
        let image = '';
        
        if (typeof config.performance === 'number' && config.performance === 0) {
            if (/betterttv/.test(url)) {
                image += ' ';
                url = 'img/bttv-placeholder-emote.png';
            } else if (/frankerfacez/.test(url)) {
                image += ' ';
                url = 'img/ffz-placeholder-emote.png';
            } else if (/\.gif$/.test(url)) {
                url = 'img/placeholder-emote.png';
            }
        }

        image += '<img class="emote' + lazyClass + '" src="' + url + '"  data-toggle="tooltip" data-placement="top" title="' + title + '">';
        return image;
    },
    /**
     * Sends formated message to frontend
     * 
     * @param {string} chatbot
     * @param {string} args
     * @returns {undefined}
     */
    getMessage: function(chatbot, args) {
        chat.prepareMessages(chatbot, args, true);

        let formatBadges = {
            user: args.userstate['display-name'],
            badges: args.userstate.badges,
            badgeInfo: args.userstate['badge-info']
        };

        let formatMessage = {
            uuid: typeof args.userstate.id === 'undefined' ? uuidv4() : args.userstate.id,
            channel: args.channel,
            emotes: args.userstate.emotes,
            lazy: true,
            message: args.message
        };

        let values = {
            uuid: formatMessage.uuid,
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
        };

        if (chatbot.socket !== null) {
            const call = {
                args: {
                    channel: args.channel,
                    message: Object.assign({}, values)
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

        chatbot.messages[args.channel].push(values);
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
    getMessages: function(chatbot, args) {
        chat.prepareMessages(chatbot, args, false);

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
            chatbot.messages[args.channel] = [];

            rows.forEach(function(row) {
                let formatBadges = {
                    user: row.user_name,
                    badges: row.badges.length ? JSON.parse(row.badges) : {},
                    badgeInfo: row.badge_info.length ? JSON.parse(row.badge_info) : {}
                };

                let formatMessage = {
                    channel: args.channel,
                    emotes: row.emotes.length ? JSON.parse(row.emotes) : {},
                    lazy: true,
                    message: row.message
                };

                let message = chat.formatMessage(formatMessage);

                if (row.notification.length) {
                    message = row.notification + (row.message ? ' (' + chat.formatMessage(formatMessage) + ')' : '');
                    row.user_name = ''; // eslint-disable-line camelcase
                }

                chatbot.messages[args.channel].push({
                    uuid: row.uuid,
                    channelId: row.channel_id,
                    badges: row.type === 'notification' ? '' : chat.formatBadges(chatbot, formatBadges),
                    badgeInfo: row.type === 'notification' ? '' : formatBadges.badge_info,
                    color: row.color,
                    emotes: formatMessage.emotes,
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
    /**
     * Sends chat notification to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getNotification: function(chatbot, args) {
        chat.prepareMessages(chatbot, args, true);

        let formatMessage = {
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
            message: args.notification + (args.message ? ' (' + chat.formatMessage(formatMessage) + ')' : ''),
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
                    message: Object.assign({}, values)
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

        chatbot.messages[args.channel].push(values);
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
                            chat.getMessages(chatbot, args);
                        });
                    } else {
                        chat.getMessages(chatbot, args);
                    }
                });
            });
        }
    },
    /**
     * Loads BTTV emotes over API to database und bttvEmotes array
     * 
     * @param {object} args
     * @returns {undefined}
     */
    prepareBttvEmotes: function(args) {
        let channelId = args['room-id'];
        let channel = args.channel.slice(1);

        if (typeof chat.bttvEmotes[channel] === 'undefined') {
            chat.bttvEmotes[channel] = {};

            let options = {
                url: 'https://api.betterttv.net/3/cached/emotes/global',
                method: 'GET',
                json: true
            };

            // get global emotes
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body[0].id !== 'undefined') {
                    for (let i = 0; i < body.length; i++) {
                        chat.bttvEmotes[channel][body[i].code] = 'https://cdn.betterttv.net/emote/' + body[i].id + '/1x';
                        let emoteArgs = {
                            code: body[i].code,
                            typeId: body[i].id,
                            type: 'bttv'
                        };

                        emote.addEmote(emoteArgs);
                    }
                }
            });

            options = {
                url: `https://api.betterttv.net/3/cached/users/twitch/${channelId}`,
                method: 'GET',
                json: true
            };

            // get channel emotes
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.sharedEmotes !== 'undefined') {
                    for (let i = 0; i < body.sharedEmotes.length; i++) {
                        chat.bttvEmotes[channel][body.sharedEmotes[i].code] = 'https://cdn.betterttv.net/emote/' + body.sharedEmotes[i].id + '/1x';
                        let emoteArgs = {
                            code: body.sharedEmotes[i].code,
                            typeId: body.sharedEmotes[i].id,
                            type: 'bttv'
                        };

                        emote.addEmote(emoteArgs);
                    }
                }
            });
        }
    },
    /**
     * Loads FFZ emotes over API to database und ffzEmotes array
     * 
     * @param {object} args
     * @returns {undefined}
     */
    prepareFfzEmotes: function(args) {
        let channel = args.channel.slice(1);

        if (typeof chat.ffzEmotes[channel] === 'undefined') {
            chat.ffzEmotes[channel] = {};

            let options = {
                url: 'https://api.frankerfacez.com/v1/set/global',
                method: 'GET',
                json: true
            };

            // get global emotes
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.default_sets !== 'undefined' && body.default_sets.length) {
                    let set = body.default_sets[0];
                    for (let i = 0; i < body.sets[set].emoticons.length; i++) {
                        chat.ffzEmotes[channel][body.sets[set].emoticons[i].name] = body.sets[set].emoticons[i].urls['1'];
                        let emoteArgs = {
                            code: body.sets[set].emoticons[i].name,
                            typeId: body.sets[set].emoticons[i].id,
                            type: 'ffz'
                        };

                        emote.addEmote(emoteArgs);
                    }
                }
            });

            options = {
                url: `https://api.frankerfacez.com/v1/room/${channel}`,
                method: 'GET',
                json: true
            };

            // get channel emotes
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.sets !== 'undefined') {
                    let set = body.room.set;
                    for (let i = 0; i < body.sets[set].emoticons.length; i++) {
                        chat.ffzEmotes[channel][body.sets[set].emoticons[i].name] = body.sets[set].emoticons[i].urls['1'];
                        let emoteArgs = {
                            code: body.sets[set].emoticons[i].name,
                            typeId: body.sets[set].emoticons[i].id,
                            type: 'ffz'
                        };

                        emote.addEmote(emoteArgs);
                    }
                }
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
    prepareMessages: function(chatbot, args, shift) {
        if (typeof chatbot.messages[args.channel] === 'undefined') {
            chatbot.messages[args.channel] = [];
        } else if (chatbot.messages[args.channel].length >= 100 && shift) {
            chatbot.messages[args.channel].shift();
        }
    }
};

module.exports = chat;
