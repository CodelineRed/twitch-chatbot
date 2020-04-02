import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
    faEthereum as fabEthereum,
    faFontAwesomeFlag as fabFontAwesomeFlag,
    faTwitch as fabTwitch
} from '@fortawesome/free-brands-svg-icons';

import {
    faSadCry as farSadCry
} from '@fortawesome/free-regular-svg-icons';

import {
    faAward as fasAward,
    faBolt as fasBolt,
    faCheckCircle as fasCheckCircle,
    faChevronRight as fasChevronRight,
    faCogs as fasCogs,
    faCrown as fasCrown,
    faExternalLinkAlt as fasExternalLinkAlt,
    faGavel as fasGavel,
    faGem as fasGem,
    faGift as fasGift,
    faGlobe as fasGlobe,
    faHammer as fasHammer,
    faHome as fasHome,
    faMoneyBill as fasMoneyBill,
    faPlay as fasPlay,
    faRobot as fasRobot,
    faSave as fasSave,
    faSnowflake as fasSnowflake,
    faStar as fasStar,
    faStepForward as fasStepForward,
    faSync as fasSync,
    faTicketAlt as fasTicketAlt,
    faTrain as fasTrain,
    faTrashAlt as fasTrashAlt,
    faVideo as fasVideo,
    faWrench as fasWrench
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(fabEthereum, fabFontAwesomeFlag, fabTwitch);
library.add(farSadCry);
library.add(
    fasAward, fasBolt, fasCheckCircle, fasChevronRight, fasCogs, fasCrown, fasExternalLinkAlt, 
    fasGavel, fasGem, fasGift, fasGlobe, fasHammer, fasHome, fasMoneyBill, fasPlay, 
    fasRobot, fasSave, fasSnowflake, fasStar, fasStepForward, fasSync, fasTicketAlt, 
    fasTrain, fasTrashAlt, fasVideo, fasWrench
);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('font-awesome-layers', FontAwesomeLayers);

export default library;
