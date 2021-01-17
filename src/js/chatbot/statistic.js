const database = require('./database');
const chat     = require('./chat');
const moment   = require('moment');
const request  = require('request');

const statistic = {
    /**
     * Sends viewer count numbers to frontend for generating a chart
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getChart: function(chatbot, args) {
        let select = 'vc.count, vc.game';
        let from = 'viewer_count AS vc';
        let where = [
            'vc.channel_id = $id',
            'vc.created_at >= strftime($format, $start)',
            'vc.created_at <= strftime($format, $end)'
        ];
        let prepare = {
            $id: chatbot.channels[args.channel].id,
            $format: '%s',
            $start: args.start,
            $end: args.end
        };

        database.find(select, from, '', where, '', '', 0, prepare, function(rows) {
            let backgroundColor = [];
            let data = [];
            let labels = [];

            if (rows.length) {
                let colors = ['#2e97bf', '#fff'];
                let colorState = true;
                let currentGame = rows[0].game;

                for (let i = 0; i < rows.length; i++) {
                    labels.push(rows[i].game);
                    data.push(rows[i].count);

                    if (rows[i].game !== currentGame) {
                        colorState = !colorState;
                        currentGame = rows[i].game;
                        //labels.push(currentGame);
                    }
                    //else if (i > 0) {labels.push('');}

                    backgroundColor.push(colorState ? colors[0] : colors[1]);
                }
            }

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        backgroundColor: backgroundColor,
                        data: data,
                        labels: labels
                    },
                    method: 'setChart',
                    ref: 'statistic',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sends misc numbers to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getMisc: function(chatbot, args) {
        let select = '(SELECT COUNT(cuj.user_id) FROM channel_user_join AS cuj WHERE cuj.channel_id = $id AND cuj.created_at >= strftime($format, $start) AND cuj.created_at <= strftime($format, $end) GROUP BY cuj.channel_id) AS newUsers, ';
        select += '(SELECT COUNT(*) FROM (SELECT DISTINCT ch.user_id FROM chat AS ch WHERE ch.channel_id = $id AND ch.created_at >= strftime($format, $start) AND ch.created_at <= strftime($format, $end))) AS allUsers, ';
        select += '(SELECT COUNT(ch.channel_id) FROM chat AS ch WHERE ch.channel_id = $id AND ch.created_at >= strftime($format, $start) AND ch.created_at <= strftime($format, $end) AND (ch.type = \'chat\' OR ch.type = \'action\') GROUP BY ch.channel_id) AS messages, ';
        select += '(SELECT COUNT(ch.channel_id) FROM chat AS ch JOIN chat_emote_join AS cej ON ch.uuid = cej.chat_uuid WHERE ch.channel_id = $id AND cej.created_at >= strftime($format, $start) AND cej.created_at <= strftime($format, $end) GROUP BY ch.channel_id) AS usedEmotes, ';
        select += '(SELECT COUNT(ch.channel_id) FROM chat AS ch WHERE ch.channel_id = $id AND ch.created_at >= strftime($format, $start) AND ch.created_at <= strftime($format, $end) AND ch.notification LIKE \'[Cheer]%\' GROUP BY ch.channel_id) AS cheers, ';
        select += '(SELECT MIN(vc.count) FROM viewer_count AS vc WHERE vc.channel_id = $id AND vc.created_at >= strftime($format, $start) AND vc.created_at <= strftime($format, $end) GROUP BY vc.channel_id) AS minViewer, ';
        select += '(SELECT MAX(vc.count) FROM viewer_count AS vc WHERE vc.channel_id = $id AND vc.created_at >= strftime($format, $start) AND vc.created_at <= strftime($format, $end) GROUP BY vc.channel_id) AS maxViewer, ';
        select += '(SELECT ROUND(AVG(vc.count), 0) FROM viewer_count AS vc WHERE vc.channel_id = $id AND vc.created_at >= strftime($format, $start) AND vc.created_at <= strftime($format, $end) GROUP BY vc.channel_id) AS avgViewer';

        let prepare = {
            $id: chatbot.channels[args.channel].id,
            $format: '%s',
            $start: args.start,
            $end: args.end
        };

        database.find(select, '', '', [], '', '', 0, prepare, function(rows) {
            select = 'ch.notification';
            let from = 'chat AS ch';
            let where = [
                'ch.channel_id = $id',
                'ch.notification LIKE \'[Cheer]%\'',
                'ch.created_at >= strftime($format, $start)',
                'ch.created_at <= strftime($format, $end)'
            ];

            database.find(select, from, '', where, '', '', 0, prepare, function(cheerRows) {
                // calculate total of all bits
                if (cheerRows.length) {
                    rows[0].bits = 0;
                    for (let i = 0; i < cheerRows.length; i++) {
                        rows[0].bits += parseInt(cheerRows[i].notification.replace(/(.*) ([0-9]+) (.*)/g, '$2'));
                    }
                }

                if (chatbot.socket !== null) {
                    const call = {
                        args: {
                            channel: args.channel,
                            misc: rows[0]
                        },
                        method: 'setMisc',
                        ref: 'statistic',
                        env: 'browser'
                    };

                    chatbot.socket.write(JSON.stringify(call));
                }
            });
        });
    },
    /**
     * Sends purges numbers to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getPurges: function(chatbot, args) {
        let selectPre = '(SELECT COUNT(ch.channel_id) FROM chat AS ch WHERE ch.channel_id = $id ';
        selectPre += 'AND ch.created_at >= strftime($format, $start) AND ch.created_at <= strftime($format, $end) AND ch.purge LIKE ';
        let select = selectPre + '\'%deleted%\' GROUP BY ch.channel_id) AS deletedMessages, ';
        select += selectPre + '\'%message":"%s"%\' GROUP BY ch.channel_id) AS timeoutedMessages, ';
        select += selectPre + '\'%s","showMessage":true%\' GROUP BY ch.channel_id) AS timeoutedUsers, ';
        select += selectPre + '\'%banned%\' GROUP BY ch.channel_id) AS bannnedUsers';
        let prepare = {
            $id: chatbot.channels[args.channel].id,
            $format: '%s',
            $start: args.start,
            $end: args.end
        };

        database.find(select, '', '', [], '', '', 0, prepare, function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        purges: rows[0]
                    },
                    method: 'setPurges',
                    ref: 'statistic',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sends stream dates to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getStreamDates: function(chatbot, args) {
        let channels = Object.keys(chatbot.channels);
        let oauthToken = '';

        // get oauthToken by any channel
        for (let i = 0; i < channels.length; i++) {
            if (typeof chatbot.channels[channels[i]].oauthToken === 'string' 
                && chatbot.channels[channels[i]].oauthToken.length && !oauthToken.length) {
                oauthToken = chatbot.channels[channels[i]].oauthToken;
            }
        }

        // if oauthToken found
        if (oauthToken.length) {
            let options = {
                url: `https://api.twitch.tv/helix/videos?user_id=${chatbot.channels[args.channel].id}&type=archive&first=100`,
                method: 'GET',
                json: true,
                headers: {
                    'Accept': 'application/vnd.twitchtv.v5+json',
                    'Authorization': `Bearer ${oauthToken}`,
                    'Client-ID': chatbot.config.clientIdToken
                }
            };

            // get list of past broadcasts and live stream
            request(options, (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                let streamDates = [];

                if (typeof body.data !== 'undefined') {
                    for (let i = 0; i < body.data.length; i++) {
                        let durationArr = body.data[i].duration.replace('s', '').replace(/([hm])/g, '-').split('-').reverse();
                        let dateObj = {
                            id: body.data[i].id,
                            title: body.data[i].title,
                            start: moment(body.data[i].created_at).unix(),
                            end: moment(body.data[i].created_at).add({
                                hours: typeof durationArr[2] !== 'undefined' ? durationArr[2] : 0,
                                minutes: typeof durationArr[1] !== 'undefined' ? durationArr[1] : 0,
                                seconds: typeof durationArr[0] !== 'undefined' ? durationArr[0] : 0
                            }).unix()
                        };
                        streamDates.push(dateObj);
                    }
                }

                if (chatbot.socket !== null) {
                    const call = {
                        args: {
                            channel: args.channel,
                            streamDates: streamDates
                        },
                        method: 'setStreamDates',
                        ref: 'statistic',
                        env: 'browser'
                    };

                    chatbot.socket.write(JSON.stringify(call));
                }
            });
        } else {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        streamDates: []
                    },
                    method: 'setStreamDates',
                    ref: 'statistic',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        }
    },
    /**
     * Sends sub numbers to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getSubs: function(chatbot, args) {
        let selectPre = '(SELECT COUNT(ch.channel_id) FROM chat AS ch WHERE ch.channel_id = $id ';
        selectPre += 'AND ch.created_at >= strftime($format, $start) AND ch.created_at <= strftime($format, $end) AND ch.notification LIKE ';
        let select = selectPre + '\'[Sub]%\' GROUP BY ch.channel_id) AS new, ';
        select += selectPre + '\'[Sub]%Tier%\' GROUP BY ch.channel_id) AS newPaid, ';
        select += selectPre + '\'[Sub]%Prime%\' GROUP BY ch.channel_id) AS newPrime, ';
        select += selectPre + '\'[Subgift]%channel%\' GROUP BY ch.channel_id) AS gifted, ';
        select += selectPre + '\'[Subgift]%\' AND ch.notification NOT LIKE \'[Subgift]%channel%\' GROUP BY ch.channel_id) AS giftedRandom, ';
        select += selectPre + '\'[Anongiftpaidupgrade]%\' GROUP BY ch.channel_id) AS anonUpgrade, ';
        select += selectPre + '\'[Resub]%\' GROUP BY ch.channel_id) AS resubs, ';
        select += selectPre + '\'[Resub]%Tier%\' GROUP BY ch.channel_id) AS resubsPaid, ';
        select += selectPre + '\'[Resub]%Prime%\' GROUP BY ch.channel_id) AS resubsPrime, ';
        select += selectPre + '\'[Submysterygift]%\' GROUP BY ch.channel_id) AS bombs';
        let prepare = {
            $id: chatbot.channels[args.channel].id,
            $format: '%s',
            $start: args.start,
            $end: args.end
        };

        database.find(select, '', '', [], '', '', 0, prepare, function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        subs: rows[0]
                    },
                    method: 'setSubs',
                    ref: 'statistic',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sends top cahtters to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getTopChatters: function(chatbot, args) {
        let select = 'u.name AS name, COUNT(ch.message) AS amount';
        let from = 'chat AS ch';
        let join = 'JOIN user AS u ON ch.user_id = u.id';
        let where = [
            'channel_id = $id',
            'type IN (\'chat\', \'action\')',
            `u.name COLLATE NOCASE NOT IN ('${chatbot.bots.join('\',\'')}')`,
            'ch.created_at >= strftime($format, $start)',
            'ch.created_at <= strftime($format, $end)'
        ];
        let group = 'ch.user_id';
        let order = 'amount DESC';
        let limit = args.limit;
        let prepare = {
            $id: chatbot.channels[args.channel].id,
            $format: '%s',
            $start: args.start,
            $end: args.end
        };

        database.find(select, from, join, where, group, order, limit, prepare, function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        list: rows
                    },
                    method: 'setTopChatters',
                    ref: 'statistic',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sends top emotes to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getTopEmotes: function(chatbot, args) {
        let select = 'e.uuid, e.code, e.type_id AS typeId, e.type, COUNT(e.code) AS amount, ';
        select += 'e.updated_at AS updatedAt, e.created_at AS createdAt';
        let from = 'chat AS ch';
        let join = 'JOIN chat_emote_join AS cej ON ch.uuid = cej.chat_uuid ';
        join += 'JOIN emote AS e ON cej.emote_uuid = e.uuid';
        let where = [
            'channel_id = $id',
            `e.type IN (${args.select})`,
            'cej.created_at >= strftime($format, $start)',
            'cej.created_at <= strftime($format, $end)'
        ];
        let group = 'e.code';
        let order = 'amount DESC, code COLLATE NOCASE ASC';
        let limit = args.limit;
        let prepare = {
            $id: chatbot.channels[args.channel].id,
            $format: '%s',
            $start: args.start,
            $end: args.end
        };
        args.lazy = false;

        database.find(select, from, join, where, group, order, limit, prepare, function(rows) {
            // get emote image
            for (let i = 0; i < rows.length; i++) {
                rows[i].image = '';

                if (rows[i].type === 'bttv') {
                    rows[i].image = chat.encodeBttvEmotes(rows[i].code, args);
                } else if (rows[i].type === 'ffz') {
                    rows[i].image = chat.encodeFfzEmotes(rows[i].code, args);
                } else {
                    let id = rows[i].typeId;
                    let emotes = {};
                    emotes[id] = ['0-' + (rows[i].code.length - 1)];
                    rows[i].image = chat.encodeTwitchEmotes(rows[i].code, {emotes: emotes, lazy: args.lazy});
                }
            }

            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        type: args.type,
                        list: rows
                    },
                    method: 'setTopEmotes',
                    ref: 'statistic',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sends top words to frontend
     * 
     * @param {object} chatbot
     * @param {object} args
     * @returns {undefined}
     */
    getTopWords: function(chatbot, args) {
        let select = 'lower(message) AS words';
        let from = 'chat';
        let where = [
            'channel_id = $id',
            `lower(message) GLOB '*${args.prefix}[a-z0-9]*'`,
            'created_at >= strftime($format, $start)',
            'created_at <= strftime($format, $end)'
        ];
        let order = 'message COLLATE NOCASE ASC';
        let prepare = {
            $id: chatbot.channels[args.channel].id,
            $format: '%s',
            $start: args.start,
            $end: args.end
        };

        database.find(select, from, '', where, '', order, 0, prepare, function(rows) {
            if (chatbot.socket !== null) {
                const call = {
                    args: {
                        channel: args.channel,
                        type: args.type,
                        list: statistic.sumUpDirtyTopList(rows, args.prefix, args.limit)
                    },
                    method: 'setTopWords',
                    ref: 'statistic',
                    env: 'browser'
                };

                chatbot.socket.write(JSON.stringify(call));
            }
        });
    },
    /**
     * Sums up list of dulicated words and merge to one clean list
     * 
     * @param {array} rows [{name: 'Lorem', amount: 1337}]
     * @param {string} prefix
     * @param {integer} limit
     * @returns {array}
     */
    sumUpDirtyTopList: function(rows, prefix, limit) {
        let topListObject = {};
        let topList = [];
        let regex = new RegExp(prefix + '[a-z0-9]+', 'gi');

        // sum up duplicate words
        for (let i = 0; i < rows.length; i++) {
            let matches = rows[i].words.match(regex);

            for (let j = 0; j < matches.length; j++) {
                let cleanMatch = matches[j].replace(prefix, '');

                // if cleanMatch not in topList
                if (typeof topListObject[cleanMatch] === 'undefined') {
                    topListObject[cleanMatch] = {word: matches[j], amount: 1};
                } else {
                    topListObject[cleanMatch].amount++;
                }
            }
        }

        // convert object to array
        let topListKeys = Object.keys(topListObject);
        for (let i = 0; i < topListKeys.length; i++) {
            topList.push(topListObject[topListKeys[i]]);
        }

        // sort DESC and limit list
        topList.sort((a,b) => (a.amount < b.amount) ? 1 : ((b.amount < a.amount) ? -1 : 0));
        return topList.slice(0, limit);
    }
};

module.exports = statistic;
