const i18next = require('i18next');
const config  = require('../../app/chatbot.json');

const en = {
    'attendee': 'Attendee',
    'attendee_plural': 'Attendees',
    'change-channel-1': 'Stream Title and Game has changed to "{{0}}" - "{{1}}"',
    'change-channel-2': 'Stream Title has changed to "{{0}}"',
    'change-channel-3': 'Stream Game has changed to "{{0}}"',
    'command-about': 'Software made by InsanityMeetsHH. Version: {{0}} ({{1}}) - Bug report: {{- 2}}',
    'command-commands': 'The bot commands for this channel: !about, !cc, !plan and !d[0-99](w[0-9])',
    'command-executed': '* Executed {{0}} command by {{1}} at {{2}}',
    'command-playlist-1-1': '@{{0}} - Now "{{1}}" until {{2}} - Next "{{3}}"',
    'command-playlist-1-2': '@{{0}} - Now "{{1}}" - Next "{{2}}"',
    'command-playlist-2-1': '@{{0}} - Now "{{1}}" until {{2}}',
    'command-playlist-2-2': '@{{0}} - Now "{{1}}"',
    'command-playlist-3': '@{{0}} - No further videos in playlist',
    'command-roll-dice-1': '@{{0}} {{1, lowercase}} d{{2}}w{{3}}: {{4}} = {{5}}',
    'command-roll-dice-2': '@{{0}} {{1, lowercase}} d{{2}}: {{3}} = {{4}}',
    'could-not-change-channel-1': 'Couldn\'t change Title and Game',
    'could-not-change-channel-2': 'Couldn\'t change Title',
    'could-not-change-channel-3': 'Couldn\'t change Game',
    'down': 'Down',
    'entry': 'Entry',
    'entry_plural': 'Entries',
    'keyword': 'Keyword',
    'multiple-choice': 'Multiple Choice',
    'no': 'No',
    'playlist-added': '* Added playlist "{{0}}"',
    'playlist-cleared': '* Cleared playlist "{{0}}"',
    'playlist-merged': '* Merged {{0}} $t(video-lower, {"count": {{0}} }) from "{{1}}" to "{{2}}"',
    'playlist-removed': '* Removed playlist "{{0}}"',
    'playlist-resetted': '* Resetted playlist "{{0}}"',
    'playlist-switched': '* Switched to playlist "{{0}}"',
    'playlist-updated': '* Updated playlist "{{0}}"',
    'poll': 'Poll',
    'poll-added': '* Added poll "{{0}}"',
    'poll-announcement': '$t(poll): {{0}} |{{1}} $t(multiple-choice): {{2}}{{3}}',
    'poll-removed': '* Removed poll "{{0}}"',
    'poll-result': '$t(poll) $t(result): {{0}} |{{1}} $t(attendee, {"count": {{2}} }): {{2}} | $t(vote, {"count": {{3}} }): {{3}}',
    'poll-winner': '$t(poll) $t(winner): {{0}} {{1}}% ({{2}} $t(vote, {"count": {{2}} }))',
    'raffle': 'Raffle',
    'raffle-added': '* Added raffle "{{0}}"',
    'raffle-announcement': '$t(raffle): {{0}} | $t(keyword): {{1}}',
    'raffle-removed': '* Removed raffle "{{0}}"',
    'raffle-result-1': '$t(raffle) $t(summary): {{0}} | $t(winner): @{{1}} | $t(attendee, {"count": {{2}} }): {{2}} | $t(entry, {"count": {{3}} }): {{3}}',
    'raffle-result-2': '$t(raffle) $t(summary): {{0}} | $t(attendee, {"count": {{1}} }): {{1}} | $t(entry, {"count": {{2}} }): {{2}}',
    'raffle-winner': '$t(raffle) $t(winner): @{{0}}',
    'result': 'Result',
    'rolled': 'Rolled',
    'summary': 'Summary',
    'up': 'Up',
    'video': 'Video',
    'video_plural': 'Videos',
    'video-lower': 'video',
    'video-lower_plural': 'videos',
    'video-added': '* Added video "{{0}}" to playlist "{{1}}"',
    'video-moved': '* Moved video "{{0}}" {{1, lowercase}} in playlist "{{2}}"',
    'video-removed': '* Removed video "{{0}}" from playlist "{{1}}"',
    'video-updated': '* Updated video "{{0}}" in playlist "{{1}}"',
    'videos-removed': '* Removed {{0}} $t(video-lower, {"count": {{0}} }) from "{{1}}"',
    'vote': 'Vote',
    'vote_plural': 'Votes',
    'winner': 'Winner',
    'yes': 'Yes',

    'dp': '.',
    'ts': ',',
    'date': 'YYYY-MM-DD',
    'time': 'hh:mm',
    'time-suffix': 'hh:mm a',
    'time-long': 'hh:mm:ss',
    'time-long-suffix': 'hh:mm:ss a',
    'datetime': 'YYYY-MM-DD hh:mm:ss',
    'datetime-suffix': 'YYYY-MM-DD hh:mm:ss a',
    'timezone': 'America/New_York'
};

const de = {
    'attendee': 'Teilnehmer',
    'attendee_plural': 'Teilnehmer',
    'change-channel-1': 'Stream-Titel und Spiel wurde geändert in "{{0}}" - "{{1}}"',
    'change-channel-2': 'Stream-Titel wurde geändert in "{{0}}"',
    'change-channel-3': 'Stream-Spiel wurde geändert in "{{0}}"',
    'command-about': 'Software erstellt von InsanityMeetsHH. Version: {{0}} ({{1}}) - Fehler melden: {{- 2}}',
    'command-commands': 'Die Befehle für diesen Kanal: !about, !cc, !plan und !d[0-99](w[0-9])',
    'command-executed': '* Befehl {{0}} von {{1}} im Kanal {{2}} ausgeführt',
    'command-playlist-1-1': '@{{0}} - Jetzt "{{1}}" bis {{2}} - Nächstes "{{3}}"',
    'command-playlist-1-2': '@{{0}} - Jetzt "{{1}}" - Nächstes "{{2}}"',
    'command-playlist-2-1': '@{{0}} - Jetzt "{{1}}" bis {{2}}',
    'command-playlist-2-2': '@{{0}} - Jetzt "{{1}}"',
    'command-playlist-3': '@{{0}} - Keine weiteren Videos in der Playlist',
    'could-not-change-channel-1': 'Konnte Titel und Spiel nicht ändern',
    'could-not-change-channel-2': 'Konnte Titel nicht ändern',
    'could-not-change-channel-3': 'Konnte Spiel nicht ändern',
    'down': 'Unten',
    'entry': 'Eintrag',
    'entry_plural': 'Einträge',
    'keyword': 'Schlüsselwort',
    'multiple-choice': 'Mehrfachauswahl',
    'no': 'Nein',
    'playlist-added': '* Playlist "{{0}}" hinzugefügt',
    'playlist-cleared': '* Playlist "{{0}}" geleert',
    'playlist-merged': '* {{0}} $t(video, {"count": {{0}} }) von "{{1}}" an "{{2}}" hinzugefügt',
    'playlist-removed': '* Playlist "{{0}}" entfernt',
    'playlist-resetted': '* Playlist "{{0}}" zurückgesetzt',
    'playlist-switched': '* Zur Playlist "{{0}}" gewechselt',
    'playlist-updated': '* Playlist "{{0}}" aktualisiert',
    'poll': 'Umfrage',
    'poll-added': '* $t(poll) "{{0}}" hinzugefügt',
    'poll-removed': '* $t(poll) "{{0}}" entfernt',
    'raffle': 'Verlosung',
    'raffle-added': '* $t(raffle) "{{0}}" hinzugefügt',
    'raffle-removed': '* $t(raffle) "{{0}}" entfernt',
    'result': 'Ergebnis',
    'rolled': 'Rollt',
    'summary': 'Zusammenfassung',
    'up': 'Oben',
    'video-added': '* Video "{{0}}" zur Playlist "{{1}}" hinzugefügt',
    'video-moved': '* Video "{{0}}" in Playlist "{{2}}" nach {{1, lowercase}} verschoben',
    'video-removed': '* Video "{{0}}" von Playlist "{{1}}" entfernt',
    'video-updated': '* Video "{{0}}" in Playlist "{{1}}" aktualisiert',
    'videos-removed': '* {{0}} $t(video, {"count": {{0}} }) von Playlist "{{1}}" entfernt',
    'vote': 'Stimme',
    'vote_plural': 'Stimmen',
    'winner': 'Gewinner',
    'yes': 'Ja',

    'dp': ',',
    'ts': '.',
    'date': 'DD.MM.YYYY',
    'time': 'HH:mm',
    'time-suffix': 'HH:mm \\U\\h\\r',
    'time-long': 'HH:mm:ss',
    'time-long-suffix': 'HH:mm:ss \\U\\h\\r',
    'datetime': 'DD.MM.YYYY HH:mm:ss',
    'datetime-suffix': 'DD.MM.YYYY HH:mm:ss \\U\\h\\r',
    'timezone': 'Europe/Berlin'
};

i18next.init({
    lng: config.locale,
    fallbackLng: 'en',
    resources: {
        de: {translation: de},
        en: {translation: en}
    },
    interpolation: {
        format: function(value, format, lng) {
            if (format === 'uppercase' && typeof value === 'string') {
                return value.toUpperCase();
            }

            if (format === 'lowercase' && typeof value === 'string') {
                return value.toLowerCase();
            }

            if (format === 'ucfirst' && typeof value === 'string') {
                return value.charAt(0).toUpperCase() + value.slice(1);
            }

            return value;
        }
    }
});

module.exports = i18next;
