define(["exports", "vue", "@fortawesome/fontawesome-svg-core", "@fortawesome/free-brands-svg-icons", "@fortawesome/free-regular-svg-icons", "@fortawesome/free-solid-svg-icons", "@fortawesome/vue-fontawesome"], function (_exports, _vue, _fontawesomeSvgCore, _freeBrandsSvgIcons, _freeRegularSvgIcons, _freeSolidSvgIcons, _vueFontawesome) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _vue = _interopRequireDefault(_vue);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  _fontawesomeSvgCore.library.add(_freeBrandsSvgIcons.faEthereum, _freeBrandsSvgIcons.faFontAwesomeFlag, _freeBrandsSvgIcons.faTwitch, _freeBrandsSvgIcons.faYoutube);

  _fontawesomeSvgCore.library.add(_freeRegularSvgIcons.faSadCry, _freeRegularSvgIcons.faQuestionCircle);

  _fontawesomeSvgCore.library.add(_freeSolidSvgIcons.faAward, _freeSolidSvgIcons.faBolt, _freeSolidSvgIcons.faChartPie, _freeSolidSvgIcons.faCheckCircle, _freeSolidSvgIcons.faChevronRight, _freeSolidSvgIcons.faCogs, _freeSolidSvgIcons.faCommentDots, _freeSolidSvgIcons.faCopy, _freeSolidSvgIcons.faCrown, _freeSolidSvgIcons.faEdit, _freeSolidSvgIcons.faExternalLinkAlt, _freeSolidSvgIcons.faGavel, _freeSolidSvgIcons.faGem, _freeSolidSvgIcons.faGift, _freeSolidSvgIcons.faGlobe, _freeSolidSvgIcons.faHammer, _freeSolidSvgIcons.faHdd, _freeSolidSvgIcons.faHome, _freeSolidSvgIcons.faMoneyBill, _freeSolidSvgIcons.faPlay, _freeSolidSvgIcons.faRobot, _freeSolidSvgIcons.faSave, _freeSolidSvgIcons.faSnowflake, _freeSolidSvgIcons.faStar, _freeSolidSvgIcons.faStepForward, _freeSolidSvgIcons.faSync, _freeSolidSvgIcons.faTerminal, _freeSolidSvgIcons.faTh, _freeSolidSvgIcons.faTicketAlt, _freeSolidSvgIcons.faTimes, _freeSolidSvgIcons.faTrain, _freeSolidSvgIcons.faTrashAlt, _freeSolidSvgIcons.faTrophy, _freeSolidSvgIcons.faVideo, _freeSolidSvgIcons.faWrench);

  _vue.default.component('font-awesome-icon', _vueFontawesome.FontAwesomeIcon);

  _vue.default.component('font-awesome-layers', _vueFontawesome.FontAwesomeLayers);

  var _default = _fontawesomeSvgCore.library;
  _exports.default = _default;
});