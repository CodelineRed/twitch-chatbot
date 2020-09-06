define(["exports", "../component/page/home", "../component/page/channel", "../component/partial/chat", "../component/partial/counter", "../component/partial/player", "../component/partial/poll", "../component/partial/raffle", "../component/page/token", "../component/page/error-page"], function (_exports, _home, _channel, _chat, _counter, _player, _poll, _raffle, _token, _errorPage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _home = _interopRequireDefault(_home);
  _channel = _interopRequireDefault(_channel);
  _chat = _interopRequireDefault(_chat);
  _counter = _interopRequireDefault(_counter);
  _player = _interopRequireDefault(_player);
  _poll = _interopRequireDefault(_poll);
  _raffle = _interopRequireDefault(_raffle);
  _token = _interopRequireDefault(_token);
  _errorPage = _interopRequireDefault(_errorPage);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  const routes = [{
    component: _home.default,
    name: 'index',
    path: '',
    meta: {
      title: 'i18n.nav-home - i18n.app',
      layout: 'default'
    }
  }, {
    component: _channel.default,
    name: 'channel',
    path: '/channel/:channel',
    meta: {
      title: 'router.param-channel - i18n.app',
      layout: 'default'
    }
  }, {
    component: _chat.default,
    name: 'chat',
    path: '/channel/:channel/chat',
    meta: {
      title: 'router.param-channel - i18n.chat',
      layout: 'empty'
    }
  }, {
    component: _counter.default,
    name: 'counter',
    path: '/channel/:channel/counter',
    meta: {
      title: 'router.param-channel - i18n.counter',
      layout: 'empty'
    }
  }, {
    component: _player.default,
    name: 'player',
    path: '/channel/:channel/player',
    meta: {
      title: 'router.param-channel - i18n.player',
      layout: 'empty'
    }
  }, {
    component: _poll.default,
    name: 'poll',
    path: '/channel/:channel/poll',
    meta: {
      title: 'router.param-channel - i18n.poll',
      layout: 'empty'
    }
  }, {
    component: _raffle.default,
    name: 'raffle',
    path: '/channel/:channel/raffle',
    meta: {
      title: 'router.param-channel - i18n.raffle',
      layout: 'empty'
    }
  }, {
    component: _token.default,
    name: 'token',
    path: '/token/:token/:property',
    meta: {
      title: 'i18n.nav-token - i18n.app',
      layout: 'default'
    }
  }, {
    component: _errorPage.default,
    path: '*',
    meta: {
      title: 'i18n.nav-error - i18n.app',
      layout: 'default'
    }
  }];
  var _default = routes;
  _exports.default = _default;
});