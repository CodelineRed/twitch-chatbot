const config       = require('../../app/chatbot.json');
const database     = require('./database');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4, validate: uuidValid} = require('uuid');

const emote = {
    newList: [],
    '7tvList': {},
    bttvList: {},
    ffzList: {},
    /**
     * Adds an emote and/or chat_emote_join to database
     * 
     * @param {object} args
     * @returns {undefined}
     */
    add: function(args) {
        let time = moment().unix();
        let from = 'emote';
        let where = [
            'code = ?',
            'type_id = ?'
        ];
        let prepare = [
            args.code,
            args.typeId
        ];

        database.find('*', from, '', where, '', '', 1, prepare, function(rows) {
            // if emote found
            if (rows.length && typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                let values = {
                    emoteUuid: rows[0].uuid,
                    chatUuid: args.uuid,
                    updatedAt: time,
                    createdAt: time
                };

                database.insert('chat_emote_join', [values]);
            } else if (!rows.length && emote.newList.indexOf(args.code) === -1 && (typeof args.typeId === 'string' || typeof args.typeId === 'number')) {
                emote.newList.push(args.code);
                let values = {
                    uuid: uuidv4(),
                    typeId: args.typeId,
                    type: typeof args.type === 'undefined' || args.type === null ? 'ttv' : args.type,
                    code: args.code,
                    updatedAt: time,
                    createdAt: time
                };

                database.insert('emote', [values], function() {
                    if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                        let valuesJoin = {
                            emoteUuid: values.uuid,
                            chatUuid: args.uuid,
                            updatedAt: time,
                            createdAt: time
                        };

                        database.insert('chat_emote_join', [valuesJoin]);
                    }
                });
            }
        });
    },
    /**
     * Returns message with 7TV emote images
     * 
     * @param {string} message
     * @param {string} rawMessage
     * @param {object} args
     * @returns {string}
     */
    encode7tv: function(message, rawMessage, args) {
        return emote.encodeThirdParty(message, rawMessage, args, '7tv');
    },
    /**
     * Returns message with BTTV emote images
     * 
     * @param {string} message
     * @param {string} rawMessage
     * @param {object} args
     * @returns {string}
     */
    encodeBttv: function(message, rawMessage, args) {
        return emote.encodeThirdParty(message, rawMessage, args, 'bttv');
    },
    /**
     * Returns message with FFZ emote images
     * 
     * @param {string} message
     * @param {string} rawMessage
     * @param {object} args
     * @returns {string}
     */
    encodeFfz: function(message, rawMessage, args) {
        return emote.encodeThirdParty(message, rawMessage, args, 'ffz');
    },
    /**
     * Returns message with third party emote images
     * 
     * @param {string} message
     * @param {string} rawMessage
     * @param {object} args
     * @param {string} type
     * @returns {string}
     */
    encodeThirdParty: function(message, rawMessage, args, type) {
        let emoteCodes = Object.keys(emote[type + 'List'][args.channel]);
        for (let i = 0; i < emoteCodes.length; i++) {
            let regexEmote = emoteCodes[i].replace(/(\(|\))/g, '\\$1');
            let regex = new RegExp('\\b' + regexEmote + '\\b', 'g');

            // if special chars in emote
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(regexEmote)) { // eslint-disable-line no-useless-escape
                regex = new RegExp(regexEmote, 'g');
            }

            if (regex.test(rawMessage)) {
                if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                    for (let j = 0; j < (rawMessage.match(regex) || []).length; j++) {
                        let emoteArgs = {
                            uuid: args.uuid,
                            code: emoteCodes[i],
                            typeId: emote[type + 'List'][args.channel][emoteCodes[i]]['typeId'],
                            type: type
                        };
                        emote.add(emoteArgs);
                    }
                }

                let image = emote[type + 'List'][args.channel][emoteCodes[i]].image;
                let isStackable = emote[type + 'List'][args.channel][emoteCodes[i]].isStackable;
                message = message.replace(regex, emote.generateImage(image, args.lazy, isStackable));
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
    encodeTwitch: function(message, args) {
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
                            splitText.splice(emoteCode[0], 1, emote.generateImage('http://static-cdn.jtvnw.net/emoticons/v2/' + i + '/default/dark/2.0', args.lazy, false));

                            if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                                let emoteArgs = {
                                    uuid: args.uuid,
                                    code: ttvEmote,
                                    typeId: i,
                                    type: 'ttv'
                                };

                                emote.add(emoteArgs);
                            }
                        }
                    }
                }
            }
        }
        return splitText.join('');
    },
    /**
     * Returns HTML emote image tag
     * 
     * @param {string} url Emote URL
     * @param {boolean} isLazy Lazy load image. default: false
     * @param {boolean} isStackable Emote overlays previous emote in chat. default: false
     * @returns {string}
     */
    generateImage: function(url, isLazy = false, isStackable = false) {
        let image = '';
        let imgClass = typeof isLazy === 'boolean' && isLazy ? ' lazy' : '';
        imgClass += typeof isStackable === 'boolean' && isStackable ? ' is-stackable' : '';

        if (typeof config.performance === 'number' && config.performance === 0) {
            if (/7tv/.test(url)) {
                image += ' ';
                url = 'img/7tv-placeholder-emote.png';
            } else if (/frankerfacez/.test(url)) {
                image += ' ';
                url = 'img/ffz-placeholder-emote.png';
            } else if (/betterttv/.test(url)) {
                image += ' ';
                url = 'img/bttv-placeholder-emote.png';
            } else if (/\.gif$/.test(url)) {
                url = 'img/placeholder-emote.png';
            }
        }

        image += '<img class="emote' + imgClass + '" src="' + url + '">';
        return image;
    },
    /**
     * Loads 7TV emotes over API to database and 7tvList array
     * 
     * @param {object} args
     * @returns {undefined}
     */
    prepare7tv: function(args) {
        let channelId = args['room-id'];
        let channel = args.channel.slice(1);

        if (typeof emote['7tvList'][channel] === 'undefined') {
            emote['7tvList'][channel] = {};

            let options = {
                url: 'https://7tv.io/v3/emote-sets/62cdd34e72a832540de95857',
                method: 'GET',
                json: true
            };

            // get global emotes
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.emotes !== 'undefined') {
                    for (let i = 0; i < body.emotes.length; i++) {
                        emote['7tvList'][channel][body.emotes[i].name] = {
                            code: body.emotes[i].name,
                            image: 'https://cdn.7tv.app/emote/' + body.emotes[i].id + '/1x.webp',
                            typeId: body.emotes[i].id,
                            isStackable: body.emotes[i].data.flags === 256
                        };

                        let emoteArgs = {
                            code: body.emotes[i].name,
                            typeId: body.emotes[i].id,
                            type: '7tv'
                        };

                        emote.add(emoteArgs);
                    }
                }
            });
            
            options = {
                url: `https://7tv.io/v3/users/twitch/${channelId}`,
                method: 'GET',
                json: true
            };

            // get channel emotes
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }

                if (typeof body.emote_set !== 'undefined') {
                    for (let i = 0; i < body.emote_set.emotes.length; i++) {
                        emote['7tvList'][channel][body.emote_set.emotes[i].name] = {
                            code: body.emote_set.emotes[i].name,
                            image: 'https://cdn.7tv.app/emote/' + body.emote_set.emotes[i].id + '/1x.webp',
                            typeId: body.emote_set.emotes[i].id,
                            isStackable: body.emote_set.emotes[i].data.flags === 256
                        };

                        let emoteArgs = {
                            code: body.emote_set.emotes[i].name,
                            typeId: body.emote_set.emotes[i].id,
                            type: '7tv'
                        };

                        emote.add(emoteArgs);
                    }
                }
            });
        }
    },
    /**
     * Loads BTTV emotes over API to database and bttvList array
     * 
     * @param {object} args
     * @returns {undefined}
     */
    prepareBttv: function(args) {
        let channelId = args['room-id'];
        let channel = args.channel.slice(1);

        if (typeof emote.bttvList[channel] === 'undefined') {
            emote.bttvList[channel] = {};

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
                    let stackableEmotes = ['cvHazmat', 'cvMask'];

                    for (let i = 0; i < body.length; i++) {
                        emote.bttvList[channel][body[i].code] = {
                            code: body[i].code,
                            image: 'https://cdn.betterttv.net/emote/' + body[i].id + '/1x',
                            typeId: body[i].id,
                            isStackable: stackableEmotes.indexOf(body[i].code) >= 0
                        };

                        let emoteArgs = {
                            code: body[i].code,
                            typeId: body[i].id,
                            type: 'bttv'
                        };

                        emote.add(emoteArgs);
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
                        emote.bttvList[channel][body.sharedEmotes[i].code] = {
                            code: body.sharedEmotes[i].code,
                            image: 'https://cdn.betterttv.net/emote/' + body.sharedEmotes[i].id + '/1x',
                            typeId: body.sharedEmotes[i].id,
                            isStackable: false
                        };

                        let emoteArgs = {
                            code: body.sharedEmotes[i].code,
                            typeId: body.sharedEmotes[i].id,
                            type: 'bttv'
                        };

                        emote.add(emoteArgs);
                    }
                }
            });
        }
    },
    /**
     * Loads FFZ emotes over API to database and ffzList array
     * 
     * @param {object} args
     * @returns {undefined}
     */
    prepareFfz: function(args) {
        let channel = args.channel.slice(1);

        if (typeof emote.ffzList[channel] === 'undefined') {
            emote.ffzList[channel] = {};

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
                        emote.ffzList[channel][body.sets[set].emoticons[i].name] = {
                            code: body.sets[set].emoticons[i].name,
                            image: body.sets[set].emoticons[i].urls['1'],
                            typeId: body.sets[set].emoticons[i].id,
                            isStackable: false
                        };

                        let emoteArgs = {
                            code: body.sets[set].emoticons[i].name,
                            typeId: body.sets[set].emoticons[i].id,
                            type: 'ffz'
                        };

                        emote.add(emoteArgs);
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
                        emote.ffzList[channel][body.sets[set].emoticons[i].name] = {
                            code: body.sets[set].emoticons[i].name,
                            image: body.sets[set].emoticons[i].urls['1'],
                            typeId: body.sets[set].emoticons[i].id,
                            isStackable: false
                        };

                        let emoteArgs = {
                            code: body.sets[set].emoticons[i].name,
                            typeId: body.sets[set].emoticons[i].id,
                            type: 'ffz'
                        };

                        emote.add(emoteArgs);
                    }
                }
            });
        }
    }
};

module.exports = emote;
