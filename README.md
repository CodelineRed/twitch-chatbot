# Twitch Chatbot - InsanityMeetsHH

This application based on [Vue Skeleton](https://github.com/InsanityMeetsHH/vue-skeleton).

## Required
* [Node.js](http://nodejs.org/en/download/)
* [npm](http://www.npmjs.com/get-npm) `$ npm i npm@latest -g`
* [gulp-cli](https://www.npmjs.com/package/gulp-cli) `$ npm i gulp-cli@latest -g`
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
$ node migration.js
$ node chatbot.js
$ gulp (in development)
```
Change `browserSyncInit` task in [`gulpfile.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/gulpfile.js), if you want to use Docker as server.

## Project Commands
|                     | Description                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| gulp                | watch files and start [BrowserSync](https://www.npmjs.com/package/browser-sync)                                                  |
| gulp build          | executes following tasks: cleanUp, scss, scssLint, js, jsLint, jsRequire, json, img, font, svg, vue, vueLint, vueJs, vueJsLint   |
| gulp lintAll        | executes following tasks: scssLint, jsLint, vueJsLint, vueLint, chatbotLint                                                      |
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
| 3050                | Docker Container [twitch-chatbot](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/docker-compose.yml)                     |
| 3060                | Docker Container [twitch-chatbot-videos-folder](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/docker-compose.videos-folder.yml) |
| 3100                | Main Window (Skateboard Socket for Web UI)                                                                                       |
| 3110                | Chat Window (Skateboard Socket for Web UI)                                                                                       |
| 3120                | Player Window (Skateboard Socket for Web UI)                                                                                     |
| 3130                | Raffle Window (Skateboard Socket for Web UI)                                                                                     |
| 3140                | Poll Window (Skateboard Socket for Web UI)                                                                                       |
| 3150                | Counter Window (Skateboard Socket for Web UI)                                                                                    |

## [`chatbot.json`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/app/chatbot.dist.json)
|                     | Description                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| username            | Required - Twitch User Name                                                                                                      |
| tmiToken            | Required - [Twitch TMI Token](https://twitchapps.com/tmi/)                                                                       |
| clientIdToken       | Optional - [Twitch Client ID Token](https://dev.twitch.tv/) (is presetted)                                                       |
| youtubeToken        | Optional - [YouTube API Token](https://console.developers.google.com)                                                            |
| videosFolder        | Optional - Absolute path to videos folder with trailing slash                                                                    |
| locale              | Required - German and English are presetted                                                                                      |
| channels            | Required - List of Channels to connect                                                                                           |

## Chatbot Commands
|                     | Description                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| about               | !about, !chatbot, !cb, !bug, !bugs, !help                                                                                        |
| commands            | !commands, !cc                                                                                                                   |
| counter             | counter increased if users counts from 1 - 99 without interruption                                                               |
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
* BetterTTV Emotes
* FrankerFaceZ Emotes
* Popout URL `/channel/[channel]/chat` to use browser source in OBS (No pixel recommendation)

### Commands
* Cooldown
* Active State
* Last Execution Time

### Counter
* Popout URL `/channel/[channel]/counter` to use browser source in OBS (Pixel recommendation: 400x400px)

### Playlist
* Play Local MP4 files with `localhost:3060` domain. (See [`docker-compose.local-videos.yml`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/docker-compose.local-videos.yml))
* Play Twitch Clips and Videos (past broadcasts, highlights and video uploads)
* Play YouTube Videos
* Add Video
* Edit Video
* Skip Videos
* Move Videos
* Remove Video
* Remove Played Videos
* Remove Skipped Videos
* Add Playlist
* All Playlists
* Edit Playlist
* Switch Playlist
* Merge Playlists
* Remove Playlist
* Reset Playlist
* Clear Playlist
* playlistInfo Command
* Popout URL `/channel/[channel]/player` to use browser source in OBS (Pixel recommendation: 1920x1080px)
* Video name overlay in player
* Autofill video name, sub name and duration (Depence on `videosFolder`, `youtubeToken` and `clientIdToken` settings)
* Change stream title and / or game dynamic over [Nightbot](https://nightbot.tv/) (or some similar Bot)

### Autofill
| Player        | Name                               | Sub Name                | Duration |
|---------------|------------------------------------|-------------------------|----------|
| Local         | Yes<sup>1</sup> (Parsed File Name) | Yes (Modification Date) | Yes      |
| Twitch Clip   | Yes (Clip Title)                   | Yes (Game/ Category)    | Yes      |
| Twitch Video  | Yes (Video Title)                  | Yes (Game/ Category)    | Yes      |
| YouTube Video | Yes (Video Title)                  | Yes (First Video Tag)   | Yes      |

<sup>1</sup> `example_video-2020.mp4` parsed to `Example Video - 2020`

### Poll
* Start Poll
* Close Poll
* Remove Poll
* Copy Poll to Form
* All Polls Modal
* Announce Poll to Chat Button
* Result to Chat Button
* Animate Winner (If multiple options are equal than a random winner will be picked)
* Play Audio for Winner (Audio is only played in popout window)
* Play Audio loop for Poll (Audio is only played in popout window)
* Announce Winner to Chat
* Multiple Choice Yes/No
* Start Datetime
* End Datetime
* Datime Picker
* Popout URL `/channel/[channel]/poll` to use browser source in OBS (Pixel recommendation: 1000x563px by max. 6 options)

### Raffle
* Start Raffle
* Close Raffle
* Remove Raffle
* Copy Raffle to Form
* All Raffles Modal
* Announce Raffle to Chat Button
* Result to Chat Button
* Animate Winner
* Play Audio for Winner (Audio is only played in popout window)
* Play Audio loop for Poll (Audio is only played in popout window)
* Announce Winner to Chat
* Custom Keyword
* Multiplicators
* Start Datetime
* End Datetime
* Datime Picker
* Popout URL `/channel/[channel]/raffle` to use browser source in OBS (Pixel recommendation: 1000x563px)

### Bots
* Own [badge](https://fontawesome.com/icons/robot?style=solid) in Chat
* Preset of 5 Bots (Mod4YouBot, Moobot, Nightbot, StreamElements, Streamlabs)
* Bot autofilling with BetterTTV API

## [import-videos-folder.js](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/import-videos-folder.js)
| Option              | Description                                                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------|
| --help, -h          | Shows list of options                                                                                                            |
| --backup, -b        | Create an additional backup (default: false)                                                                                     |
| --channel, -c       | Channel name which owns the videos (required)                                                                                    |
| --identity, -i      | Channel id / Room id. (required if channel is not in databse)                                                                    |
| --log               | Show logs in CLI (default: true)                                                                                                 |
| --locale, -l        | Locale to use in date generation (default: en)                                                                                   |
| --subname, --sn     | Add date as sub name (default: true)                                                                                             |
| --version           | Show version number                                                                                                              |

Example execution: `$ node import-videos-folder.js -c InsanityMeetsHH`

### Import Requirements:
* `videosFolder` in [`chatbot.json`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/app/chatbot.dist.json) points to existing folder
* each folder under `videosFolder` corresponds to a playlist
* only MP4 files are allowed

The Script only imports videos which are not in the database.

## Localization
* Web UI: [`i18n-locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/js/vue/app/i18n-locales.js)
* Web UI: [`langswitch.vue`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/js/vue/component/partial/langswitch.vue)
* Node: [`locales.js`](https://github.com/InsanityMeetsHH/twitch-chatbot/blob/develop/src/js/chatbot/locales.js)

## Installation with [Docker](https://www.docker.com/)
* Get project via `$ git clone https://github.com/InsanityMeetsHH/twitch-chatbot.git` or [zip download](https://github.com/InsanityMeetsHH/twitch-chatbot/archive/develop.zip)
* Open a command prompt on your OS (if not already open) and navigate to the project folder
* `$ git checkout develop`
* `$ npm i`
* `$ gulp build`
* `$ -- Add username, tmiToken and channels to src/app/chatbot.json ---
* `$ node migration.js
* `$ node chatbot.js
* `$ docker-compose up -d`
* Open [localhost:3050](http://localhost:3050) for website or [localhost:3050/adminer.php](http://localhost:3050/adminer.php) for database gui
* If you want to remove the container `$ docker rm twitch-chatbot -f`
* If you want to remove the volume `$ docker volume rm DIRNAME_logs` (first remove matching container)

## Links
* [Twitch Messaging Interface](https://github.com/tmijs/docs/tree/gh-pages/_posts)
* [Twitch TMI Token](https://twitchapps.com/tmi/)
* [Twitch API Token](https://dev.twitch.tv/)
* [YouTube API Token](https://console.developers.google.com)
* [BetterTTV API](https://community.nightdev.com/t/is-there-a-bettertwitchtv-api/5223/3)
* [FrankerFaceZ API](https://www.frankerfacez.com/developers)
* [Spotify with Snip](https://github.com/dlrudie/Snip/releases)
* [Twitch Clip API](https://dev.twitch.tv/docs/v5/reference/clips#get-clip)
* [Twitch Clip Embed](https://dev.twitch.tv/docs/embed/video-and-clips/#non-interactive-iframes-for-clips)
* [Twitch Video API](https://dev.twitch.tv/docs/v5/reference/videos#get-video)
* [Twitch Video Embed](https://dev.twitch.tv/docs/embed/video-and-clips/#non-interactive-inline-frames-for-live-streams-and-vods)
* [ESLint Js Rules](https://eslint.org/docs/rules/)
* [ESLint Vue Rules](https://vuejs.github.io/eslint-plugin-vue/rules/)
* [ESLint Import Rules](https://github.com/benmosher/eslint-plugin-import/tree/master/docs/rules)
* [Sass Lint Rules](https://github.com/sasstools/sass-lint/tree/develop/docs/rules)
* [Vue SFC](https://github.com/nfplee/gulp-vue-single-file-component)
* [Path to RegExp](https://github.com/pillarjs/path-to-regexp/tree/v1.7.0#parameters)
* [Moment Parsing (Date Format)](https://momentjs.com/docs/#/parsing/)
* [SCSS Confetti](https://codepen.io/Event_Horizon/pen/wBKVQN)

## Freesound
* [Big Clap](https://freesound.org/people/kellieskitchen/sounds/209991/)
* [Cheering and Clapping](https://freesound.org/people/AlaskaRobotics/sounds/221568/)
* [Fan Fare 1](https://freesound.org/people/Suburbanwizard/sounds/423293/)
* [Fan Fare 2](https://freesound.org/people/humanoide9000/sounds/466133/)
* [Fan Fare 3](https://freesound.org/people/plasterbrain/sounds/397355/)
* [Winner Deep Voice](https://freesound.org/people/dersuperanton/sounds/435878/)
* [Winner Female Voice](https://freesound.org/people/tim.kahn/sounds/80618/)
* [Winner Robot Voice](https://freesound.org/people/Ionicsmusic/sounds/196892/)
