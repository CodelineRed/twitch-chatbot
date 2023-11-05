const i18next = require('i18next');
const config  = require('../../app/chatbot.json');

const en = {
    'attendee_one': 'Attendee',
    'attendee_other': 'Attendees',
    'bot_one': 'Bot',
    'bot_other': 'Bots',
    'bot-added': 'Added bot "{{0}}"',
    'bot-exists': 'Bot "{{0}}" exists already',
    'bot-list': '$t(bot, {"count": {{0}} }): {{1}}',
    'bot-not-exists': 'Bot "{{0}}" doesn\'t exist',
    'bot-removed': 'Removed bot "{{0}}"',
    'change-channel-1': 'Stream Title and Game has changed to "{{0}}" - "{{1}}"',
    'change-channel-2': 'Stream Title has changed to "{{0}}"',
    'change-channel-3': 'Stream Game has changed to "{{0}}"',
    'channels-loaded': '* All Channels are loaded',
    'command-about': 'Software made by CodelineRed. Version: {{0}} ({{1}}) - Bug report: {{- 2}}',
    'command-commands': 'The bot commands for this channel: {{0}}',
    'command-deprecated': 'The command "{{0}}" is deprecated! Please use the new commands.',
    'command-executed': '* Executed {{0}} command by {{1}} at {{2}}',
    'command-playlist-1-1': '@{{0}} - Now "{{1}}" until {{2}} - Next "{{3}}"',
    'command-playlist-1-2': '@{{0}} - Now "{{1}}" - Next "{{2}}"',
    'command-playlist-2-1': '@{{0}} - Now "{{1}}" until {{2}}',
    'command-playlist-2-2': '@{{0}} - Now "{{1}}"',
    'command-playlist-3': '@{{0}} - No further videos in playlist',
    'command-roll-dice-1': '@{{0}} {{1, lowercase}} d{{2}}w{{3}}: {{4}} = {{5}}',
    'command-roll-dice-2': '@{{0}} {{1, lowercase}} d{{2}}: {{3}} = {{4}}',
    'command-status': '@{{0}} Text: {{1}} | Cooldown: {{2}}s | Active: {{3}}',
    'could-not-change-channel-1': 'Couldn\'t change Title and Game',
    'could-not-change-channel-2': 'Couldn\'t change Title',
    'could-not-change-channel-3': 'Couldn\'t change Game',
    'custom-command-added': 'Added command "{{0}} {{1}}"',
    'custom-command-removed': 'Removed command "{{0}}"',
    'custom-command-toggled-0': 'Toggled command "{{0}}" inactive',
    'custom-command-toggled-1': 'Toggled command "{{0}}" active',
    'custom-command-updated': 'Updated command "{{0}} {{1}}"',
    'database-backup': '* Backup was created. {{0}}',
    'database-bot': '* Added "{{0}}" bot from BTTV to database',
    'database-channel': '* Added channel "{{0}}" to database',
    'database-command': '* Added {{0}} commands to database',
    'database-command-relation': '* Added {{0}} commands relations for "{{1}}" to database',
    'database-counter': '* Added counter "General" for "{{0}}" to database',
    'database-file-missing': '* Database file is missing',
    'database-playlist': '* Added playlist "General" for "{{0}}" to database',
    'dice-duel': 'Dice Duel',
    'dice-duel-result': '$t(dice-duel): $t(winner) {{0}} ({{1}}) | $t(loser) {{2}} ({{3}})',
    'dice-duel-result-even': '$t(dice-duel): Even between {{0}} and {{1}} ({{2}})',
    'dice-duel-request': '@{{0}} you are challenged by {{1}}. Enter "!dda" in chat to go into duel!',
    'down': 'Down',
    'entry_one': 'Entry',
    'entry_other': 'Entries',
    'ivf-added-playlist': '* Added playlist "{{0}}"',
    'ivf-added-videos': '* Added {{0}} {{1, lowercase}} in {{2}} {{3, lowercase}} in {{4}}',
    'ivf-added-video': '* Added video "{{0}}" to playlist "{{1}}" (#{{2}})',
    'ivf-all-video-exists': '* All videos already exists in database',
    'ivf-folder-not-found': '* Folder not found ({{0}})',
    'ivf-found-channel': '* Found channel "{{0}}"',
    'ivf-found-playlist': '* Found playlist "{{0}}"',
    'ivf-found-videos': '* Found {{0}} {{1, lowercase}} overall',
    'ivf-channel-is-missing': '* Option --channel is missing or empty',
    'ivf-identity-is-missing': '* Option --identity is missing or empty',
    'keyword': 'Keyword',
    'loser': 'Loser',
    'migration-all-executed': '* All migrations already executed',
    'migration-file-executed': '* File "{{0}}" was already executed in the past',
    'migration-file-incorrect': '* File "{{0}}" is incorrect',
    'migration-executed': '* Executed {{0}} {{1, lowercase}}',
    'multiple-choice': 'Multiple Choice',
    'no': 'No',
    'playlist_one': 'Playlist',
    'playlist_other': 'Playlists',
    'playlist-added': '* Added playlist "{{0}}"',
    'playlist-cleared': '* Cleared playlist "{{0}}"',
    'playlist-merged': '* Merged {{0}} {{1, lowercase}} from "{{2}}" to "{{3}}"',
    'playlist-removed': '* Removed playlist "{{0}}"',
    'playlist-resetted': '* Resetted playlist "{{0}}"',
    'playlist-swaped': '* Swaped to playlist "{{0}}"',
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
    'version-text': '* CodelineRed / Twitch Chatbot {{0}}',
    'version-text-ahead': '* Software is newer than latest release ({{0}})',
    'version-text-behind': '* Software update available ({{0}})\r\n* Visit https://github.com/CodelineRed/twitch-chatbot for more information',
    'version-text-latest': '* Software is up to date',
    'video_one': 'Video',
    'video_other': 'Videos',
    'video-added': '* Added video "{{0}}" to playlist "{{1}}"',
    'video-moved': '* Moved video "{{0}}" {{1, lowercase}} in playlist "{{2}}"',
    'video-removed': '* Removed video "{{0}}" from playlist "{{1}}"',
    'video-updated': '* Updated video "{{0}}" in playlist "{{1}}"',
    'videos-removed': '* Removed {{0}} {{1, lowercase}} from "{{2}}"',
    'viewer-count-error': '* Error in viewer count: {{0}}',
    'viewer-count-fix': '* Fix error by clicking "Connect Twitch Account with Chatbot" button in frontend',
    'vote_one': 'Vote',
    'vote_other': 'Votes',
    'winner': 'Winner',
    'yes': 'Yes',

    'dp': '.', // decimal point
    'ts': ',', // thousands separator
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
    'attendee_one': 'Teilnehmer',
    'attendee_other': 'Teilnehmer',
    'bot-added': 'Bot "{{0}}" hinzugefügt',
    'bot-exists': 'Bot "{{0}}" existiert bereits ',
    'bot-not-exists': 'Bot "{{0}}" existiert nicht ',
    'bot-removed': 'Bot "{{0}}" entfernt',
    'change-channel-1': 'Stream-Titel und Spiel wurde geändert in "{{0}}" - "{{1}}"',
    'change-channel-2': 'Stream-Titel wurde geändert in "{{0}}"',
    'change-channel-3': 'Stream-Spiel wurde geändert in "{{0}}"',
    'channels-loaded': '* Alle Kanäle wurden geladen',
    'command-about': 'Software erstellt von CodelineRed. Version: {{0}} ({{1}}) - Fehler melden: {{- 2}}',
    'command-commands': 'Die Befehle für diesen Kanal: {{0}}',
    'command-deprecated': 'Der Befehl "{{0}}" ist veraltet! Bitte benutze die neuen Befehle.',
    'command-executed': '* Befehl {{0}} von {{1}} im Kanal {{2}} ausgeführt',
    'command-playlist-1-1': '@{{0}} - Jetzt "{{1}}" bis {{2}} - Nächstes "{{3}}"',
    'command-playlist-1-2': '@{{0}} - Jetzt "{{1}}" - Nächstes "{{2}}"',
    'command-playlist-2-1': '@{{0}} - Jetzt "{{1}}" bis {{2}}',
    'command-playlist-2-2': '@{{0}} - Jetzt "{{1}}"',
    'command-playlist-3': '@{{0}} - Keine weiteren Videos in der Playlist',
    'command-status': '@{{0}} Text: {{1}} | Cooldown: {{2}}s | Aktiv: {{3}}',
    'could-not-change-channel-1': 'Konnte Titel und Spiel nicht ändern',
    'could-not-change-channel-2': 'Konnte Titel nicht ändern',
    'could-not-change-channel-3': 'Konnte Spiel nicht ändern',
    'custom-command-added': 'Befehl "{{0}} {{1}}" hinzugefügt',
    'custom-command-removed': 'Befehl "{{0}}" entfernt',
    'custom-command-toggled-0': 'Befehl "{{0}}" ist jetzt inaktiv',
    'custom-command-toggled-1': 'Befehl "{{0}}" ist jetzt aktive',
    'custom-command-updated': 'Befehl "{{0}} {{1}}" aktualisiert',
    'database-backup': '* Backup wurde erstellt. {{0}}',
    'database-bot': '* Bot "{{0}}" von BTTV wurde zur Datenbank hinzugefügt',
    'database-channel': '* Kanal "{{0}}" wurde zur Datenbank hinzugefügt',
    'database-command': '* Befehl {{0}} wurde zur Datenbank hinzugefügt',
    'database-command-relation': '* {{0}} Befehls-Beziehungen für "{{1}}" wurde zur Datenbank hinzugefügt',
    'database-counter': '* Zähler "General" für "{{0}}" wurde zur Datenbank hinzugefügt',
    'database-file-missing': '* Datenbank-Datei existiert nicht',
    'database-playlist': '* Playlist "General" für "{{0}}" wurde zur Datenbank hinzugefügt',
    'dice-duel': 'Würfel Duell',
    'dice-duel-result': '$t(dice-duel): $t(winner) {{0}} ({{1}}) | $t(loser) {{2}} ({{3}})',
    'dice-duel-result-even': '$t(dice-duel): Gleichstand zwischen {{0}} und {{1}} ({{2}})',
    'dice-duel-request': '@{{0}} du wurdest von {{1}} herausgefordert. Schreibe "!dda" in den Chat um ins Duell zugehen!',
    'down': 'Unten',
    'entry_one': 'Eintrag',
    'entry_other': 'Einträge',
    'ivf-added-playlist': '* Playlist "{{0}}" hinzugefügt',
    'ivf-added-videos': '* {{0}} {{1}} zu {{2}} {{3}} in {{4}} hinzugefügt',
    'ivf-added-video': '* Video "{{0}}" zur Playlist "{{1}}" hinzugefügt (#{{2}})',
    'ivf-all-video-exists': '* Alle Videos sind bereits in der Datenbank',
    'ivf-folder-not-found': '* Ordner nicht gefunden ({{0}})',
    'ivf-found-channel': '* Kanal gefunden "{{0}}"',
    'ivf-found-playlist': '* Playlist gefunden "{{0}}"',
    'ivf-found-videos': '* {{0}} {{1, lowercase}} insgesamt gefunden',
    'ivf-channel-is-missing': '* Option --channel ist nicht vorhanden oder leer',
    'ivf-identity-is-missing': '* Option --identity ist nicht vorhanden oder leer',
    'keyword': 'Schlüsselwort',
    'loser': 'Verlierer',
    'migration-all-executed': '* Alle migrationen wurden bereits ausgeführt',
    'migration-file-executed': '* Datei "{{0}}" wurde bereits in der Vergangenheit ausgeführt',
    'migration-file-incorrect': '* Datei "{{0}}" ist fehlerhaft',
    'migration-executed': '* {{0}} wurde nach {{1, lowercase}} ausgeführt',
    'multiple-choice': 'Mehrfachauswahl',
    'no': 'Nein',
    'playlist_one': 'Playlist',
    'playlist_other': 'Playlisten',
    'playlist-added': '* Playlist "{{0}}" hinzugefügt',
    'playlist-cleared': '* Playlist "{{0}}" geleert',
    'playlist-merged': '* {{0}} {{1}} von "{{2}}" an "{{3}}" hinzugefügt',
    'playlist-removed': '* Playlist "{{0}}" entfernt',
    'playlist-resetted': '* Playlist "{{0}}" zurückgesetzt',
    'playlist-swaped': '* Zur Playlist "{{0}}" gewechselt',
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
    'version-text-ahead': '* Software ist aktueller als die neuste Veröffentlichung ({{0}})',
    'version-text-behind': '* Software update verfügbar ({{0}})\r\n* Besuche https://github.com/CodelineRed/twitch-chatbot für mehr Informationen',
    'version-text-latest': '* Software ist aktuell',
    'video-added': '* Video "{{0}}" zur Playlist "{{1}}" hinzugefügt',
    'video-moved': '* Video "{{0}}" in Playlist "{{2}}" nach {{1, lowercase}} verschoben',
    'video-removed': '* Video "{{0}}" von Playlist "{{1}}" entfernt',
    'video-updated': '* Video "{{0}}" in Playlist "{{1}}" aktualisiert',
    'videos-removed': '* {{0}} {{1}} von Playlist "{{2}}" entfernt',
    'viewer-count-error': '* Fehler in viewer count: {{0}}',
    'viewer-count-fix': '* Klicke auf den "Verbinde Twitch-Account mit Chatbot"-Button im Frontend um den Fehler zu beheben',
    'vote_one': 'Stimme',
    'vote_other': 'Stimmen',
    'winner': 'Gewinner',
    'yes': 'Ja',

    'dp': ',', // decimal point
    'ts': '.', // thousands separator
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
