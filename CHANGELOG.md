# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0]
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
