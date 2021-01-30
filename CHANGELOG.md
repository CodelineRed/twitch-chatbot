# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.0]
### Added
- new install guides
- index in [`README.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/README.md)
- `html` at `watchAndReload()` in [`gulpfile.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/gulpfile.js)

### Changed
- [`public/adminer.php`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/public/adminer.php)
- [`public/.htaccess`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/public/.htaccess)
- [`.gitignore`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/.gitignore)
- order of properties at `browserSyncDocker` in [`app/gulpfile.dist.json`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/app/gulpfile.dist.json)
- browser-sync 2.26.13 to 2.26.14
- i18next 19.8.4 to 19.8.5
- vue-router 3.4.9 to 3.5.1

### Removed
- `adminer/adminer-4.6.2.php` and replaced with composer installation

## [1.6.1] - 2021-01-24
### Fixed
- missing bootstrap utilities `display` and `flex` in [`lib/boostrap.scss`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/scss/lib/boostrap.scss)

## [1.6.0] - 2021-01-24
### Added
- `bots()` in [`chatbot/command.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/command.js)
- `addBot()` in [`chatbot/command.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/command.js)
- `rmBot()` in [`chatbot/command.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/command.js)
- `getTopWords()` in [`chatbot/statistic.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/statistic.js)
- `sumUpDirtyTopList` in [`chatbot/statistic.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/statistic.js)
- top chatters statistic in [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- top hashtags statistic in [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- top commands statistic in [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- button to show OAuth Token for channel in [`page/channel.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/channel.vue)

### Changed
- some property names to have everything equal
- [`lib/boostrap.scss`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/scss/lib/boostrap.scss)
- [`README.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/README.md)
- [`UPGRADE.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/UPGRADE.md)
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
- third party emote encoding in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js)
- pushing duplacated bots in [`chatbot/database.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/database.js) - prepareBotTable()

## [1.5.0] - 2020-12-20
### Added
- `performance` in [`app/chatbot.dist.json`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/app/chatbot.dist.json)
- placeholder images for emotes

### Changed
- `generateEmoteImage()` in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js)
- [`README.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/README.md)
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
- `backup` in [`app/chatbot.dist.json`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/app/chatbot.dist.json)

### Changed
- `backup()` in [`chatbot/database.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/database.js)
- [`README.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/README.md)
- @babel/core 7.12.7 to 7.12.9
- vanilla-lazyload 17.1.3 to 17.3.0

## [1.3.0] - 2020-11-21
### Added
- custom commands feature
- viewer count error message
- `removeCustomCommand()` in [`chatbot/app.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/app.js)
- 6 audio files from [Dracon](https://twitter.com/DraconTV)
- SCSS variables for badges and chat colors in [`scss/_variables.scss`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/scss/_variables.scss)
- GlitchCon 2020 badge in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js) and [`module/_chat.scss`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/scss/module/_chat.scss)
- translations in [`chatbot/locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/locales.js)
- [`migration/version-1.3.0.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/data/migration/version-1.3.0.js)
- [`UPGRADE.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/UPGRADE.md)

### Changed
- `prepareCommands()` in [`chatbot/database.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/database.js)
- [`partial/commands.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/partial/commands.vue)
- [`data/chatbot.dist.sqlite3`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/data/chatbot.dist.sqlite3)
- [`README.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/README.md)
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
- commands save button tooltip translation in [`partial/commands.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/partial/commands.vue)
- statistic button tooltip translation in [`page/channel.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/channel.vue)
- commands search field size in [`module/_commands.scss`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/scss/module/_commands.scss)
- logic bug in [`migration.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/migration.js)

## [1.2.1] - 2020-10-30
### Changed
- `prepareBttvEmotes()` arguments in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js)
- `prepareFfzEmotes()` arguments in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js)
- `prepareBotTable()` arguments in [`chatbot/database.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/database.js)
- all date picker locale to dynamic locale
- all API request to one standard style

### Fixed
- BTTV API

## [1.2.0] - 2020-10-16
### Added
- `diceDuel()` in [`chatbot/command.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/command.js)
- `diceDuelAccept()` in [`chatbot/command.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/command.js)
- stream dates select box in [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- `getStreamDates()` in [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- `setStreamDates()` in [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- `getStreamDates()` in [`chatbot/statistic.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/statistic.js)
- translations in [`app/i18n-locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/app/i18n-locales.js)
- translations in [`chatbot/locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/locales.js)

### Changed
- `getChart()` in [`chatbot/statistic.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/statistic.js)
- `commands()` to show only active commands in [`chatbot/command.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/command.js)
- `rollDice()` in [`chatbot/command.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/command.js)
- [`chatbot/app.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/app.js)
- [`public/adminer.php`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/public/adminer.php)
- [`README.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/README.md)
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
- purges total calculation in [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- tooltips and popovers which are visible after route change in [`app/router.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/app/router.js)
- meta date format of videos in [`chatbot/playlist.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/playlist.js)
- override of video name and sub name by autofill in [`partial/playlist.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/partial/playlist.vue)

## [1.1.0] - 2020-09-29
### Added
- [`page/statistic.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/page/statistic.vue)
- [`chatbot/statistic.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/statistic.js)
- [`screenshots/statistic.png`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/screenshots/statistic.png)
- statistic methods to [`chatbot/app.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/app.js)
- "lazy" to generateEmoteImage() in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js)
- translations in [`app/i18n-locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/app/i18n-locales.js)
- translation in [`chatbot/locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/locales.js)
- statistic route in [`app/routes.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/app/routes.js)
- CSS classes `.btn-fs1rem` and `.tile-background`
- [`plugin/chartjs.scss`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/scss/plugin/chartjs.scss)
- `Chart.bundle.js` to js task in [`gulpfile.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/gulpfile.js)
- [`chatbot/viewer-count.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/viewer-count.js)
- chart.js 2.9.3

### Changed
- "from" optional to `find()` in [`chatbot/database.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/database.js)
- order of methods in [`partial/channels.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/partial/channels.vue)
- order of dependencies and devDependencies in [`package.json`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/package.json)
- [`chatbot.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/chatbot.js)
- [`README.md`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/README.md)
- [`.gitignore`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/.gitignore)
- some SCSS files
- vue-i18n 8.21.0 to 8.21.1
- moment 2.27.0 to 2.28.0

### Fixed
- `encodeBttvEmotes()` in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js)
- `encodeFfzEmotes()` in [`chatbot/chat.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/chat.js)
- docu from `prepareChannelTable()` in [`chatbot/database.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/chatbot/database.js)
- translation in [`page/channel.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/page/channel.vue)
- JavaScript error in [`partial/counter.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/partial/counter.vue)

## [1.0.1] - 2020-09-06
### Fixed
- JavaScript error in [`partial/langswitch.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/src/js/vue/component/partial/langswitch.vue)
- cleanUp task in [`gulpfile.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/master/gulpfile.js)
