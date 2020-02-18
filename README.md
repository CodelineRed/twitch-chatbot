# Twitch Chatbot - InsanityMeetsHH

This application based on [Gulp Skeleton 5](https://github.com/InsanityMeetsHH/gulp-templating/tree/5.x).

## Required
* [Node.js](http://nodejs.org/en/download/) 8
* [npm](http://www.npmjs.com/get-npm) `$ npm i npm@latest -g`
* [gulp-cli](https://www.npmjs.com/package/gulp-cli) `$ npm i gulp-cli@latest -g`
* PHP => 5.3
* [Docker](https://www.docker.com/)

## Quick start
```bash
$ git clone https://github.com/InsanityMeetsHH/twitch-chatbot.git
$ cd [app-name]
$ npm i
Open .env and fill out everything
$ docker-compose up 
$ node chatbot.js 
```
Open [localhost:8080](http://localhost:8080) for Web-GUI.
Get `TWITCH_TOKEN` from [Twitch Chat OAuth Password Generator](https://twitchapps.com/tmi/).

## Sources
* [Twitch Messaging Interface](https://github.com/tmijs/docs/tree/gh-pages/_posts)
* [noopkat/twitch-count-chatbot](https://github.com/noopkat/twitch-count-chatbot)
* [Glitch Twitch Chatbot](https://glitch.com/edit/#!/twitch-chatbot)
