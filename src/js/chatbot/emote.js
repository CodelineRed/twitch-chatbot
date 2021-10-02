const config       = require('../../app/chatbot.json');
const database     = require('./database');
const moment       = require('moment');
const request      = require('request');
const {v4: uuidv4, validate: uuidValid} = require('uuid');

const emote = {
    newList: [],
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
        let where = ['code = ?'];
        let prepare = [args.code];

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
     * Returns message with BTTV emote images
     * 
     * @param {string} message
     * @param {object} args
     * @returns {string}
     */
    encodeBttv: function(message, args) {
        return emote.encodeThirdParty(message, args, 'bttv');
    },
    /**
     * Returns message with FFZ emote images
     * 
     * @param {string} message
     * @param {object} args
     * @returns {string}
     */
    encodeFfz: function(message, args) {
        return emote.encodeThirdParty(message, args, 'ffz');
    },
    /**
     * Returns message with third party emote images
     * 
     * @param {string} message
     * @param {object} args
     * @returns {string}
     */
    encodeThirdParty: function(message, args, type) {
        let emoteCodes = Object.keys(emote[type + 'List'][args.channel]);
        for (let i = 0; i < emoteCodes.length; i++) {
            let regexEmote = emoteCodes[i].replace(/(\(|\))/g, '\\$1');
            let regex = new RegExp('\\b' + regexEmote + '\\b', 'g');

            // if special chars in emote
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(regexEmote)) { // eslint-disable-line no-useless-escape
                regex = new RegExp(regexEmote, 'g');
            }

            if (regex.test(message)) {
                if (typeof args.uuid === 'string' && uuidValid(args.uuid)) {
                    for (let j = 0; j < (message.match(regex) || []).length; j++) {
                        let emoteArgs = {
                            uuid: args.uuid,
                            code: emoteCodes[i],
                            type: type
                        };
                        emote.add(emoteArgs);
                    }
                }

                message = message.replace(regex, emote.generateImage(emote[type + 'List'][args.channel][emoteCodes[i]], emoteCodes[i], args.lazy));
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
                            splitText.splice(emoteCode[0], 1, emote.generateImage('http://static-cdn.jtvnw.net/emoticons/v2/' + i + '/default/dark/2.0', ttvEmote, args.lazy));

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
     * @param {string} url
     * @param {string} title
     * @param {boolean} lazy optional (default: true)
     * @returns {string}
     */
    generateImage: function(url, title, lazy) {
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
                    for (let i = 0; i < body.length; i++) {
                        emote.bttvList[channel][body[i].code] = 'https://cdn.betterttv.net/emote/' + body[i].id + '/1x';
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
                        emote.bttvList[channel][body.sharedEmotes[i].code] = 'https://cdn.betterttv.net/emote/' + body.sharedEmotes[i].id + '/1x';
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
                        emote.ffzList[channel][body.sets[set].emoticons[i].name] = body.sets[set].emoticons[i].urls['1'];
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
                        emote.ffzList[channel][body.sets[set].emoticons[i].name] = body.sets[set].emoticons[i].urls['1'];
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
