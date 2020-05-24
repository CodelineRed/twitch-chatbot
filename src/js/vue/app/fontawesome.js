import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faEthereum as fabEthereum,
    faFontAwesomeFlag as fabFontAwesomeFlag,
    faTwitch as fabTwitch,
    faYoutube as fabYoutube
} from '@fortawesome/free-brands-svg-icons';

import {
    faSadCry as farSadCry,
    faQuestionCircle as farQuestionCircle
} from '@fortawesome/free-regular-svg-icons';

import {
    faAward as fasAward,
    faBolt as fasBolt,
    faChartPie as fasChartPie,
    faCheckCircle as fasCheckCircle,
    faChevronRight as fasChevronRight,
    faCogs as fasCogs,
    faCommentDots as fasCommentDots,
    faCopy as fasCopy,
    faCrown as fasCrown,
    faEdit as fasEdit,
    faExternalLinkAlt as fasExternalLinkAlt,
    faGavel as fasGavel,
    faGem as fasGem,
    faGift as fasGift,
    faGlobe as fasGlobe,
    faHammer as fasHammer,
    faHdd as fasHdd,
    faHome as fasHome,
    faMoneyBill as fasMoneyBill,
    faPlay as fasPlay,
    faRobot as fasRobot,
    faSave as fasSave,
    faSnowflake as fasSnowflake,
    faStar as fasStar,
    faStepForward as fasStepForward,
    faSync as fasSync,
    faTerminal as fasTerminal,
    faTh as fasTh,
    faTicketAlt as fasTicketAlt,
    faTimes as fasTimes,
    faTrain as fasTrain,
    faTrashAlt as fasTrashAlt,
    faTrophy as fasTrophy,
    faVideo as fasVideo,
    faWrench as fasWrench
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(fabEthereum, fabFontAwesomeFlag, fabTwitch, fabYoutube);
library.add(farSadCry, farQuestionCircle);
library.add(
    fasAward, fasBolt, fasChartPie, fasCheckCircle, fasChevronRight, fasCogs, 
    fasCommentDots, fasCopy, fasCrown, fasEdit, fasExternalLinkAlt, fasGavel, 
    fasGem, fasGift, fasGlobe, fasHammer, fasHdd, fasHome, fasMoneyBill, 
    fasPlay, fasRobot, fasSave, fasSnowflake, fasStar, fasStepForward, fasSync, 
    fasTerminal, fasTh, fasTicketAlt, fasTimes, fasTrain, fasTrashAlt, 
    fasTrophy, fasVideo, fasWrench
);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);

export default library;
