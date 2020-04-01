# Twitch Chatbot - InsanityMeetsHH

This application based on [Vue Skeleton](https://github.com/InsanityMeetsHH/vue-skeleton).

## Required
* [Node.js](http://nodejs.org/en/download/)
* [npm](http://www.npmjs.com/get-npm) `$ npm i npm@latest -g`
* [gulp-cli](https://www.npmjs.com/package/gulp-cli) `$ npm i gulp-cli@latest -g`
* PHP >= 5.3
* [Docker](https://www.docker.com/) ([for installation with Docker](https://github.com/InsanityMeetsHH/twitch-chatbot/tree/develop#installation-with-docker))

## Installation (Recommended)
```bash
$ git clone https://github.com/InsanityMeetsHH/twitch-chatbot.git [app-name]
$ cd [app-name]
$ git checkout develop
$ (optional) rm -rf .git (unix) / rmdir .git /s (windows)
$ npm i
$ gulp build
$ -- Add username, tmiToken and channels to src/app/chatbot.json ---
$ node chatbot.js
$ gulp (in development)
```
Change `browserSyncInit` task in [`gulpfile.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/gulpfile.js), if you want to use Docker as server.

## Project Commands
|                     | Description                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| gulp                | watch files and start [BrowserSync](https://www.npmjs.com/package/browser-sync)                                                  |
| gulp build          | executes following tasks: cleanUp, scss, scssLint, js, jsLint, jsRequire, json, img, font, svg, vue, vueLint, vueJs, vueJsLint   |
| gulp lintAll        | executes following tasks: scssLint, jsLint, vueLint, vueJsLint                                                                   |
| gulp cleanUp        | clean up public folder                                                                                                           |
| gulp font           | copy font files                                                                                                                  |
| gulp img            | copy and compress images                                                                                                         |
| gulp js             | uglify, minify and concat js files                                                                                               |
| gulp jsLint         | checks js follows [lint rules](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/app/js-lint.json)               | 
| gulp jsRequire      | copy, uglify and rename files for requirejs                                                                                      |
| gulp json           | copy and minify json files                                                                                                       |
| gulp scss           | compile, minify and concat scss files                                                                                            |
| gulp scssLint       | checks scss follows [lint rules](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/app/scss-lint.json)           |
| gulp svg            | copy and compress svg files                                                                                                      |
| gulp vue            | transpile vue files                                                                                                              |
| gulp vueLint        | checks vue follows [lint rules](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/app/vue-lint.json)             |
| gulp vueJs          | transpile vue js files                                                                                                           |
| gulp vueJsLint      | checks vue js follows [lint rules](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/app/import-lint.json)       |
| gulp chatbotLint    | checks chatbot js follows [lint rules](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/app/import-lint.json)   |
| gulp watch          | watch scss, js, json, vue, chatbot, img, font and svg files                                                                      |

## Ports
|                     | Description                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| 3000                | [BrowserSync](https://www.npmjs.com/package/browser-sync)                                                                        |
| 3001                | [BrowserSync UI](https://www.npmjs.com/package/browser-sync)                                                                     |
| 3050                | Docker Container (twitch-chatbot)                                                                                                |
| 3100                | Main Window (Skateboard Socket for Web UI)                                                                                       |
| 3110                | Chat Window (Skateboard Socket for Web UI)                                                                                       |
| 3120                | Video Window (Skateboard Socket for Web UI)                                                                                      |
| 3130                | Raffle Window (Skateboard Socket for Web UI)                                                                                     |
| 3140                | Poll Window (Skateboard Socket for Web UI)                                                                                       |
| 3150                | Counter Window (Skateboard Socket for Web UI)                                                                                    |

## Chatbot Commands
|                     | Description                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| about               | !about, !chatbot, !bug, !help                                                                                                    |
| counter             | counter increased if users counts from 1 - 99 without interruption                                                                |
| playlistInfo        | !info, !plan, !programm, !sendeplan                                                                                              |
| rollDice            | e.g. !d6 or !d56w6 - first digit can be from 1 - 99 and second from 1 - 9                                                        |

## Web UI Features
### Chat
* Timestamp
* Badges
* Custom User Color
* "/me" Messages
* Cheers
* Subs, Resubs, Sub Gifts (random and specific), Gift Upgrades
* Bans, Timeouts, Deletes
* Now Hosting, Hosted By, Raided By, Unhost
* Clickable Links
* Twitch Emotes

### Playlist
* Play local files which saved in `public/video/`
* Play YouTube Videos
* Skip Videos
* Move Videos
* Remove Videos
* Clear Playlist
* Remove Played Videos
* Reset Playlist
* Add Video
* playlistInfo Command
* Video url `/channel/[channel]/video` to use browser source in OBS

### Commands
* Cooldown
* Active State
* Last Execution Time

## Localization
* [`i18n-locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/js/vue/app/i18n-locales.js)
* [`langswitch.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/js/vue/component/partial/langswitch.vue)

## Installation with [Docker](https://www.docker.com/)
* Get project via `$ git clone https://github.com/InsanityMeetsHH/twitch-chatbot.git` or [zip download](https://github.com/InsanityMeetsHH/twitch-chatbot/archive/develop.zip)
* Open a command prompt on your OS (if not already open) and navigate to the project folder
* `$ git checkout develop`
* `$ npm i`
* `$ gulp build`
* `$ docker-compose up -d`
* Open [localhost:3050](http://localhost:3050) for website
* If you want to remove the container `$ docker rm twitch-chatbot -f`
* If you want to remove the volume `$ docker volume rm DIRNAME_logs` (first remove matching container)

## Links
* [Twitch Messaging Interface](https://github.com/tmijs/docs/tree/gh-pages/_posts)
* [Twitch TMI Token](https://twitchapps.com/tmi/)
* [Twitch API Token](https://dev.twitch.tv/)
* [ESLint Js Rules](https://eslint.org/docs/rules/)
* [ESLint Vue Rules](https://vuejs.github.io/eslint-plugin-vue/rules/)
* [ESLint Import Rules](https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules)
* [Sass Lint Rules](https://github.com/sasstools/sass-lint/tree/develop/docs/rules)
* [Vue SFC](https://github.com/nfplee/gulp-vue-single-file-component)
* [Path to RegExp](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0#parameters)
* [Moment Parsing (Date Format)](https://momentjs.com/docs/#/parsing/)
