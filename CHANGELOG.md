# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.16.0] - 2024-04-13
### Added
- formatNumber filter
- list of channels loaded
- date-short in i18n-locales.js
- hidden OAuth Token in modal

### Changed
- lazy to isLazy = false in emote.generateImage()
- isStackable to isStackable = false in emote.generateImage()

### Removed
- title from emote.generateImage()

### Fixed
- an error where emote count was multiplied with 2
- an error where viewerCount.add() prompted an error where no error was

## [1.15.0] - 2024-03-28
### Added
- support for 7TV emotes
- bug report button in [`partial/navigation.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/navigation.vue)

### Changed
- @babel/core 7.23.5 to 7.24.3
- @babel/plugin-transform-modules-amd 7.23.3 to 7.24.1
- datatables.net 1.13.8 to 1.13.11
- datatables.net-bs4 1.13.8 to 1.13.11
- eslint-plugin-import 2.29.0 to 2.29.1
- gulp-vue-single-file-component 1.2.8 to 1.2.10
- moment 2.29.4 to 2.30.1
- sqlite3 5.1.6 to 5.1.7
- vanilla-lazyload 17.8.5 to 18.0.0
- vue 2.7.15 to 2.7.16

### Fixed
- emote statistic for BTTV and FFZ
- space in chat messages

## [1.14.0] - 2023-12-30
### Added
- [`migration/version-1.14.0.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/data/migration/version-1.14.0.js)
- translations in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js)
- title/ date combinationen to `setChart()` in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- whisper output to `onMessage()` in [`chatbot.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/chatbot.js)

### Changed
- [`data/chatbot.dist.sqlite3`](https://github.com/CodelineRed/twitch-chatbot/blob/main/data/chatbot.dist.sqlite3)
- `emote.add()` in [`chatbot/emote.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/emote.js)
- `statistic.getChart()` in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- `viewerCount.add()` in [`chatbot/viewer-count.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/viewer-count.js)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.23.2 to 7.23.5
- @babel/plugin-transform-modules-amd 7.23.0 to 7.23.3
- datatables.net 1.13.6 to 1.13.8
- datatables.net-bs4 1.13.6 to 1.13.8

### Fixed
- viewer count from a wrong channel was saved
- whispers breaking the bot

## [1.13.0] - 2023-11-05
### Added
- styling in [`public/adminer.php`](https://github.com/CodelineRed/twitch-chatbot/blob/main/public/adminer.php)
- `command-deprecated` in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js)
- translation in [`app/i18n-locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/app/i18n-locales.js)
- 4 new breakpoints in [`page/channel.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/channel.vue)
- `shortLabels` in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- `deprecated` array in [`partial/commands.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/commands.vue)
- `checkDeprecated()` in [`partial/commands.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/commands.vue)
- `command.name` condition in [`partial/commands.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/commands.vue)
- `.no-wrap` in [`module/_general.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/module/_general.scss)
- 4 new breakpoints in [`scss/_variables.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/_variables.scss)

### Changed
- code for code refactoring in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- code for code refactoring in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- code for code refactoring in [`chatbot/playlist.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/playlist.js)
- code for code refactoring in [`chatbot/poll.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/poll.js)
- code for code refactoring in [`chatbot/raffle.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/raffle.js)
- code for code refactoring in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- code for code refactoring in [`chatbot/video.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/video.js)
- playlist header in [`page/channel.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/channel.vue)
- code for code refactoring in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- chart y-axes to dynamic value in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- code for code refactoring in [`partial/chat.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/chat.vue)
- code for code refactoring in [`partial/commands.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/commands.vue)
- `getOauthTokenLink()` in [`partial/navigation.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/partial/navigation.vue)
- update video button label in [`partial/playlist.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/playlist.vue)
- update video button label in [`partial/playlist.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/playlist.vue)
- update video button label in [`partial/poll.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/poll.vue)
- update video button label in [`partial/raffle.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/raffle.vue)
- [`scss/_variables.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/_variables.scss)
- [`.gitignore`](https://github.com/CodelineRed/twitch-chatbot/blob/main/.gitignore)
- port 8080 to 80 in [`docker-compose.videos-folder.yml`](https://github.com/CodelineRed/twitch-chatbot/blob/main/docker-compose.videos-folder.yml)
- port 8080 to 80 in [`docker-compose.yml`](https://github.com/CodelineRed/twitch-chatbot/blob/main/docker-compose.yml)
- `favicon()` in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.20.5 to 7.23.2
- @babel/plugin-transform-modules-amd 7.19.6 to 7.23.0
- @fortawesome/vue-fontawesome 2.0.9 to 2.0.10
- babel-eslint 10.1.0 to 9.0.0
- browser-sync 2.27.10 to 2.29.3
- datatables.net 1.13.1 to 1.13.6
- datatables.net-bs4 1.13.1 to 1.13.6
- eslint-plugin-import 2.26.0 to 2.29.0
- gulp-vue-single-file-component 1.2.5 to 1.2.8
- jquery 3.6.1 to 3.7.1
- sqlite3 5.1.2 to 5.1.6
- vanilla-lazyload 17.8.3 to 17.8.5
- vue 2.7.14 to 2.7.15
- yargs 17.6.2 to 17.7.2

### Removed
- unnecessary composer from [`docker-compose.yml`](https://github.com/CodelineRed/twitch-chatbot/blob/main/docker-compose.yml)
- branch master and replaced with [`main`](https://github.com/CodelineRed/twitch-chatbot/blob/main)

### Fixed
- Twitch API requests in [`chatbot/attendee.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/attendee.js)
- `showIntro()` in [`chatbot/app.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/app.js)
- `update()` in [`chatbot/counter.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/counter.js)
- `updateCounter()` in [`partial/counter.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/counter.vue)
- missing translation in [`partial/poll.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/poll.vue)

## [1.12.0] - 2022-12-13
### Added
- `package-lock.json` back again to fix `vueLint` task

### Changed
- task `vueLint` to be enabled in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
- [`.gitignore`](https://github.com/CodelineRed/twitch-chatbot/blob/main/.gitignore)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @fortawesome/vue-fontawesome 2.0.6 to 2.0.9

## [1.11.0] - 2022-12-11
### Added
- [`screenshots/chatbot-cli-intro.png`](https://github.com/CodelineRed/twitch-chatbot/blob/main/screenshots/chatbot-cli-intro.png)
- `getOauthToken()` in [`chatbot/app.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/app.js)
- `showIntro()` in [`chatbot/app.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/app.js)
- `getGameById()` in [`chatbot/video.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/video.js)
- `modifyChannel()` in [`chatbot/video.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/video.js)
- `--intro` in [`chatbot.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/chatbot.js)
- composer in [`docker-compose.yml`](https://github.com/CodelineRed/twitch-chatbot/blob/main/docker-compose.yml)
- chalk 4.1.2

### Changed
- nickname in [`public/adminer.php`](https://github.com/CodelineRed/twitch-chatbot/blob/main/public/adminer.php)
- nickname in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js)
- nickname in [`chatbot/utility.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/utility.js)
- `twitchClipFile()` in [`app/filters.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/vue/app/filters.js)
- [`scss/_variables.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/_variables.scss)
- nickname in [`chatbot.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/chatbot.js)
- nickname in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
- task `vueLint` to be disabled in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
- [`.gitignore`](https://github.com/CodelineRed/twitch-chatbot/blob/main/.gitignore)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.16.0 to 7.20.5
- @babel/plugin-transform-modules-amd 7.16.0 to 7.19.6
- bootstrap 4.6.1 to 4.6.2
- browser-sync 2.27.7 to 2.27.10
- datatables.net 1.11.3 to 1.13.1
- datatables.net-bs4 1.11.3 to 1.13.1
- del 6.0.0 to 6.1.1
- eslint-plugin-import 2.25.2 to 2.26.0
- gulp-sass 5.0.0 to 5.1.0
- gulp-vue-single-file-component 1.1.7 to 1.2.5
- jquery 3.6.0 to 3.6.1
- vanilla-lazyload 17.5.0 to 17.8.3
- vue 2.6.14 to 2.7.14
- vue-i18n 8.26.5 to 8.28.2
- vue-router 3.5.3 to 3.6.5

### Removed
- `composer.lock`

### Fixed
- Twitch API requests in [`chatbot/attendee.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/attendee.js)
- Twitch API requests in [`chatbot/channel.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/channel.js)
- Twitch API requests in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- Twitch API requests in [`chatbot/video.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/video.js)
- Twitch API requests in [`chatbot/viewer-count.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/viewer-count.js)
- duplicated id error at insert in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js)
- `getAudios()` in [`method/audio.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/vue/method/audio.js)

## [1.10.0] - 2021-12-20
### Added
- [`chatbot/utility.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/utility.js)
- options `--rc` and `--sv` in [`chatbot.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/chatbot.js)
- clarification what "Total" means in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- semver-compare 1.0.0

### Changed
- [`.gitignore`](https://github.com/CodelineRed/twitch-chatbot/blob/main/.gitignore)
- link to documentation in [`lib/bootstrap.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/lib/bootstrap.scss)

### Fixed
- favicon path in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
- banned user quantity

### Removed
- `package-lock.json`

## [1.9.3] - 2021-10-31
### Fixed
- rollDice, diceDuel and diceDuelAccept in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)

## [1.9.2] - 2021-10-30
### Changed
- `blacklist` to `blocklist` in [`app/filters.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/app/filters.js)
- @babel/core 7.15.8 to 7.16.0
- @babel/plugin-transform-modules-amd 7.14.5 to 7.16.0
- @fortawesome/vue-fontawesome 2.0.2 to 2.0.6
- bootstrap 4.6.0 to 4.6.1
- browser-sync 2.27.5 to 2.27.7
- eslint-plugin-import 2.24.2 to 2.25.2
- eslint-plugin-vue 7.19.0 to 7.20.0
- i18next 21.2.4 to 21.3.3
- linkify-html 3.0.2 to 3.0.3
- linkifyjs 3.0.1 to 3.0.3
- vue-router 3.5.2 to 3.5.3

## [1.9.1] - 2021-10-09
### Added
- `!yourcommand --st` for command status in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js) - `command.defaultList.customCommand()`
- if the user calls `!yourcommand`, user will be mentioned automatically
- `command-status` in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js)

### Changed
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.15.5 to 7.15.8
- eslint-plugin-vue 7.18.0 to 7.19.1
- i18next 21.2.3 to 21.2.4

### Fixed
- streamer and moderators couldn't mention a user
- `!yourcommand --off` showed just `Updated command "!yourcommand"`

## [1.9.0] - 2021-10-02
### Added
- new functionality how custom commands can be maintained in chat (see [`README.md`](https://github.com/CodelineRed/twitch-chatbot#chatbot-commands-for-broadcaster-and-moderators))
- new functionality how bot list can be maintained in chat (see [`README.md`](https://github.com/CodelineRed/twitch-chatbot#chatbot-commands-for-broadcaster-and-moderators))
- software abort if database file not exists in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js) - `database.open()`
- display of animated Twitch emotes in [`chatbot/emote.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/emote.js) - `emote.encodeTwitch()`
- yargs in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- `command.defaultCommands` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- linkify-html 3.0.2
- sass 1.32.13

### Changed
- require for linkifyHtml in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- translations in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js) due to i18next upgrade
- `command.addCustomCommand()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- `command.updateCustomCommand()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- [`import-videos-folder.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/import-videos-folder.js)
- [`migration.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/migration.js)
- require for gulp-sass in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- [`UPGRADE.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/UPGRADE.md)
- @babel/core 7.12.16 to 7.15.5
- @babel/plugin-transform-modules-amd 7.12.13 to 7.14.5
- @fortawesome/fontawesome-free 5.15.2 to 5.15.4
- @fortawesome/fontawesome-svg-core 1.2.34 to 1.2.36
- @fortawesome/free-brands-svg-icons 5.15.2 to 5.15.4
- @fortawesome/free-regular-svg-icons 5.15.2 to 5.15.4
- @fortawesome/free-solid-svg-icons 5.15.2 to 5.15.4
- browser-sync 2.26.14 to 2.27.5
- datatables.net 1.10.23 to 1.11.3
- datatables.net-bs4 1.10.23 to 1.11.3
- eslint-plugin-import 2.22.1 to 2.24.2
- eslint-plugin-vue 7.5.0 to 7.19.0
- glob 7.1.6 to 7.2.0
- gulp-autoprefixer 7.0.1 to 8.0.0
- gulp-sass 4.1.0 to 5.0.0
- gulp-uglify-es 2.0.0 to 3.0.0
- gulp-vue-single-file-component 1.0.15 to 1.1.7
- jquery 3.5.1 to 3.6.0
- i18next 19.8.7 to 21.2.3
- linkifyjs 2.1.9 to 3.0.1
- sqlite3 5.0.1 to 5.0.2
- tmi.js 1.7.1 to 1.8.5
- vanilla-lazyload 17.3.1 to 17.5.0
- vue 2.6.12 to 2.6.14
- vue-i18n 8.22.4 to 8.26.5
- vue-router 3.5.1 to 3.5.2
- yargs 16.2.0 to 17.2.1

### Deprecated
- !adbot, !addcc, !rmbot, !rmcc, !tglcc and !updcc (will be removed in 2.0)

### Fixed
- wrong return parameter `streamDates` in `statistic.getStreamDates()`
- commands table (frontend). Being on page 2 and click on save caused a jump to page 1. [`method/data-table.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/method/data-table.js) - `updateDataTableRow()`
- users with no badges can produced a software crash by calling !addbot, !addcc, !bots, !rmbot, !rmcc, !tglcc or !updcc
- bots with underscore in name couldn't be maintained by !addbot and !rmbot
- after `bot.remove()` bot wasn't removed from `bot.list`
- FrankerFaceZ emotes couldn't be initialize

## [1.8.0] - 2021-02-13
### Added
- [`chatbot/attendee.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/attendee.js)
- [`chatbot/bot.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/bot.js)
- [`chatbot/user-choice.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/user-choice.js)
- [`chatbot/video.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/video.js)

### Changed
- `audio.getAudios()` to `audio.getList()`
- `channel.getChannels()` to `channel.getList()`
- `channel.getChannelDisplayName()` to `channel.getDisplayName()`
- `channel.saveChannelToken()` to `channel.saveToken()`
- `chat.addBot()` to `bot.add()`
- `chat.encodeBttvEmotes()` to `emote.encodeBttv()`
- `chat.encodeFfzEmotes()` to `emote.encodeFfz()`
- `chat.encodeThirdPartyEmote()` to `emote.encodeThirdParty()`
- `chat.encodeTwitchEmotes()` to `emote.encodeTwitch()`
- `chat.generateEmoteImage()` to `emote.generateImage()`
- `chat.getMessages()` to `chat.getList()`
- `chat.prepareBttvEmotes()` to `emote.prepareBttv()`
- `chat.prepareFfzEmotes()` to `emote.prepareFfz()`
- `chat.removeBot()` to `bot.remove()`
- `command.getCommands()` to `command.getList()`
- `command.updateCommand()` to `command.update()`
- `command.updateCommandLastExec()` to `command.updateLastExec()`
- `command.commandList` to `command.defaultList`
- `counter.getCounter()` to `counter.get()`
- `counter.updateCounter()` to `counter.update()`
- `emote.addEmote()` to `emote.add()`
- `playlist.addPlaylist()` to `playlist.add()`
- `playlist.addVideo()` to `video.add()`
- `playlist.clearActivePlaylist()` to `playlist.clearActive()`
- `playlist.getActivePlaylist()` to `playlist.getActive()`
- `playlist.getLocalVideoMeta()` to `video.getLocalVideoMeta()`
- `playlist.getPlaylist()` to `playlist.get()`
- `playlist.getPlaylistConfig()` to `playlist.getConfig()`
- `playlist.getPlaylists()` to `playlist.getList()`
- `playlist.getPlaylistSearchResults()` to `playlist.getSearchResults()`
- `playlist.getTwitchClipMeta()` to `video.getTwitchClipMeta()`
- `playlist.getTwitchVideoMeta()` to `video.getTwitchVideoMeta()`
- `playlist.getVideo()` to `video.get()`
- `playlist.getVideoIndexFromVideos()` to `video.getIndexFromVideos()`
- `playlist.getVideoSearchResults()` to `video.getSearchResults()`
- `playlist.getYoutubeVideoMeta()` to `video.getYoutubeVideoMeta()`
- `playlist.mergePlaylists()` to `playlist.merge()`
- `playlist.moveVideo()` to `video.move()`
- `playlist.resetActivePlaylist()` to `playlist.resetActive()`
- `playlist.removePlaylist()` to `playlist.remove()`
- `playlist.removeVideo()` to `video.remove()`
- `playlist.switchPlaylist()` to `playlist.swap()`
- `playlist.updatePlaylist()` to `playlist.update()`
- `playlist.updateVideo()` to `video.update()`
- `raffle.addAttendee()` to `attendee.add()`
- `raffle.addRaffle()` to `raffle.add()`
- `raffle.announceRaffleToChat()` to `raffle.announceToChat()`
- `raffle.closeRaffle()` to `raffle.close()`
- `raffle.getActivePoll()` to `raffle.getActive()`
- `raffle.getRafflesraffle.getRaffles()` to `raffle.getList()`
- `raffle.getRaffleWinner()` to `raffle.getWinner()`
- `raffle.raffleResultToChat()` to `raffle.resultToChat()`
- `raffle.removeRaffle()` to `raffle.remove()`
- `raffle.startRaffle()` to `raffle.start()`
- `poll.addPoll()` to `poll.add()`
- `poll.addUserChoice()` to `userChoice.add()`
- `poll.announcePollToChat()` to `poll.announceToChat()`
- `poll.closePoll()` to `poll.close()`
- `poll.getActivePoll()` to `poll.getActive()`
- `poll.getPolls()` to `poll.getList()`
- `poll.getPollWinner()` to `poll.getWinner()`
- `poll.pollResultToChat()` to `poll.resultToChat()`
- `poll.removePoll()` to `poll.remove()`
- `poll.startPoll()` to `poll.start()`
- `user.addUser()` to `user.add()`
- `viewerCount.addViewerCount()` to `viewerCount.add()`
- `getTopEmotes()` in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- `getTopEmotes()` in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- `getStreamDates()` in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- `audioNodes` to `sound` in [`method/audio.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/method/audio.js)
- @babel/core 7.12.10 to 7.12.16
- @babel/plugin-transform-modules-amd 7.12.1 to 7.12.13
- vanilla-lazyload 17.3.0 to 17.3.1
- i18next 19.8.5 to 19.8.7

### Fixed
- missing bootstrap utility `progress` in [`lib/boostrap.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/lib/boostrap.scss)
- `generateUrl()` in [`player/twitch-clip.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/player/twitch-clip.vue)

### Removed
- !info, !sendeplan, !programm from `playlistInfo()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)

## [1.7.0] - 2021-01-30
### Added
- new install guides
- index in [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- `html` at `watchAndReload()` in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)

### Changed
- [`public/adminer.php`](https://github.com/CodelineRed/twitch-chatbot/blob/main/public/adminer.php)
- [`public/.htaccess`](https://github.com/CodelineRed/twitch-chatbot/blob/main/public/.htaccess)
- [`.gitignore`](https://github.com/CodelineRed/twitch-chatbot/blob/main/.gitignore)
- order of properties at `browserSyncDocker` in [`app/gulpfile.dist.json`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/app/gulpfile.dist.json)
- browser-sync 2.26.13 to 2.26.14
- i18next 19.8.4 to 19.8.5
- vue-router 3.4.9 to 3.5.1

### Removed
- `adminer/adminer-4.6.2.php` and replaced with composer installation

## [1.6.1] - 2021-01-24
### Fixed
- missing bootstrap utilities `display` and `flex` in [`lib/boostrap.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/lib/boostrap.scss)

## [1.6.0] - 2021-01-24
### Added
- `bots()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- `addBot()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- `rmBot()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- `getTopWords()` in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- `sumUpDirtyTopList` in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- top chatters statistic in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- top hashtags statistic in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- top commands statistic in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- button to show OAuth Token for channel in [`page/channel.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/channel.vue)

### Changed
- some property names to have everything equal
- [`lib/boostrap.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/lib/boostrap.scss)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- [`UPGRADE.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/UPGRADE.md)
- @fortawesome/fontawesome-free 5.13.1 to 5.15.2
- @fortawesome/fontawesome-svg-core 1.2.32 to 1.2.34
- @fortawesome/free-brands-svg-icons 5.13.0 to 5.15.2
- @fortawesome/free-regular-svg-icons 5.13.0 to 5.15.2
- @fortawesome/free-solid-svg-icons 5.13.0 to 5.15.2
- bootstrap 4.5.3 to 4.6.0
- eslint-plugin-vue 7.3.0 to 7.5.0
- sqlite3 5.0.0 to 5.0.1
- tmi.js 1.7.0 to 1.7.1
- vue-i18n 8.22.2 to 8.22.4

### Fixed
- third party emote encoding in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- pushing duplacated bots in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js) - prepareBotTable()

## [1.5.0] - 2020-12-20
### Added
- `performance` in [`app/chatbot.dist.json`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/app/chatbot.dist.json)
- placeholder images for emotes

### Changed
- `generateEmoteImage()` in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.12.9 to 7.12.10
- @fortawesome/vue-fontawesome 2.0.0 to 2.0.2
- datatables.net 1.10.22 to 1.10.23
- datatables.net-bs4 1.10.22 to 1.10.23
- eslint-plugin-vue 7.1.0 to 7.3.0
- gulp-favicons 2.4.0 to 3.0.0
- tmi.js 1.5.0 to 1.7.0
- uuid 8.3.1 to 8.3.2
- yargs 16.1.1 to 16.2.0

## [1.4.0] - 2020-12-02
### Added
- `backup` in [`app/chatbot.dist.json`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/app/chatbot.dist.json)

### Changed
- `backup()` in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.12.7 to 7.12.9
- vanilla-lazyload 17.1.3 to 17.3.0

## [1.3.0] - 2020-11-21
### Added
- custom commands feature
- viewer count error message
- `removeCustomCommand()` in [`chatbot/app.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/app.js)
- 6 audio files from [Dracon](https://twitter.com/DraconTV)
- SCSS variables for badges and chat colors in [`scss/_variables.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/_variables.scss)
- GlitchCon 2020 badge in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js) and [`module/_chat.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/module/_chat.scss)
- translations in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js)
- [`migration/version-1.3.0.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/data/migration/version-1.3.0.js)
- [`UPGRADE.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/UPGRADE.md)

### Changed
- `prepareCommands()` in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js)
- [`partial/commands.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/commands.vue)
- [`data/chatbot.dist.sqlite3`](https://github.com/CodelineRed/twitch-chatbot/blob/main/data/chatbot.dist.sqlite3)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.12.0 to 7.12.7
- @babel/plugin-transform-modules-amd 7.10.5 to 7.12.1
- browser-sync 2.26.12 to 2.26.13
- chart.js 2.9.3 to 2.9.4
- eslint-plugin-vue 7.0.1 to 7.1.0
- gulp-sourcemaps 2.6.5 to 3.0.0
- gulp-vue-single-file-component 1.0.14 to 1.0.15
- i18next 19.8.2 to 19.8.4
- vanilla-lazyload 17.1.2 to 17.1.3
- vue-i18n 8.22.0 to 8.22.2
- vue-router 3.4.6 to 3.4.9
- yargs 16.0.3 to 16.1.1

### Fixed
- commands save button tooltip translation in [`partial/commands.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/commands.vue)
- statistic button tooltip translation in [`page/channel.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/channel.vue)
- commands search field size in [`module/_commands.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/module/_commands.scss)
- logic bug in [`migration.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/migration.js)

## [1.2.1] - 2020-10-30
### Changed
- `prepareBttvEmotes()` arguments in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- `prepareFfzEmotes()` arguments in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- `prepareBotTable()` arguments in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js)
- all date picker locale to dynamic locale
- all API request to one standard style

### Fixed
- BTTV API

## [1.2.0] - 2020-10-16
### Added
- `diceDuel()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- `diceDuelAccept()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- stream dates select box in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- `getStreamDates()` in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- `setStreamDates()` in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- `getStreamDates()` in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- translations in [`app/i18n-locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/app/i18n-locales.js)
- translations in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js)

### Changed
- `getChart()` in [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- `commands()` to show only active commands in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- `rollDice()` in [`chatbot/command.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/command.js)
- [`chatbot/app.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/app.js)
- [`public/adminer.php`](https://github.com/CodelineRed/twitch-chatbot/blob/main/public/adminer.php)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- @babel/core 7.11.6 to 7.12.0
- @fortawesome/fontawesome-free 5.14.0 to 5.15.1
- @fortawesome/fontawesome-svg-core 1.2.30 to 1.2.32
- @fortawesome/free-brands-svg-icons 5.14.0 to 5.15.1
- @fortawesome/free-regular-svg-icons 5.14.0 to 5.15.1
- @fortawesome/free-solid-svg-icons 5.14.0 to 5.15.1
- bootstrap 4.5.2 to 4.5.3
- datatables.net 1.10.21 to 1.10.22
- datatables.net-bs4 1.10.21 to 1.10.22
- del 5.1.0 to 6.0.0
- eslint-plugin-import 2.22.0 to 2.22.1
- eslint-plugin-vue 6.2.2 to 7.0.1
- gulp-vue-single-file-component 1.0.12 to 1.0.14
- i18next 19.7.0 to 19.8.2
- moment 2.28.0 to 2.29.1
- uuid 8.3.0 to 8.3.1
- vue-i18n 8.21.1 to 8.22.0
- vue-router 3.4.3 to 3.4.6
- yargs 15.4.1 to 16.0.3

### Fixed
- purges total calculation in [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- tooltips and popovers which are visible after route change in [`app/router.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/app/router.js)
- meta date format of videos in [`chatbot/playlist.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/playlist.js)
- override of video name and sub name by autofill in [`partial/playlist.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/playlist.vue)

## [1.1.0] - 2020-09-29
### Added
- [`page/statistic.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/page/statistic.vue)
- [`chatbot/statistic.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/statistic.js)
- [`screenshots/statistic.png`](https://github.com/CodelineRed/twitch-chatbot/blob/main/screenshots/statistic.png)
- statistic methods to [`chatbot/app.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/app.js)
- "lazy" to generateEmoteImage() in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- translations in [`app/i18n-locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/app/i18n-locales.js)
- translation in [`chatbot/locales.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/locales.js)
- statistic route in [`app/routes.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/app/routes.js)
- CSS classes `.btn-fs1rem` and `.tile-background`
- [`plugin/chartjs.scss`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/scss/plugin/chartjs.scss)
- `Chart.bundle.js` to js task in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
- [`chatbot/viewer-count.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/viewer-count.js)
- chart.js 2.9.3

### Changed
- "from" optional to `find()` in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js)
- order of methods in [`partial/channels.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/partial/channels.vue)
- order of dependencies and devDependencies in [`package.json`](https://github.com/CodelineRed/twitch-chatbot/blob/main/package.json)
- [`chatbot.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/chatbot.js)
- [`README.md`](https://github.com/CodelineRed/twitch-chatbot/blob/main/README.md)
- [`.gitignore`](https://github.com/CodelineRed/twitch-chatbot/blob/main/.gitignore)
- some SCSS files
- vue-i18n 8.21.0 to 8.21.1
- moment 2.27.0 to 2.28.0

### Fixed
- `encodeBttvEmotes()` in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- `encodeFfzEmotes()` in [`chatbot/chat.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/chat.js)
- docu from `prepareChannelTable()` in [`chatbot/database.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/chatbot/database.js)
- translation in [`page/channel.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/page/channel.vue)
- JavaScript error in [`partial/counter.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/partial/counter.vue)

## [1.0.1] - 2020-09-06
### Fixed
- JavaScript error in [`partial/langswitch.vue`](https://github.com/CodelineRed/twitch-chatbot/blob/main/src/js/vue/component/partial/langswitch.vue)
- cleanUp task in [`gulpfile.js`](https://github.com/CodelineRed/twitch-chatbot/blob/main/gulpfile.js)
