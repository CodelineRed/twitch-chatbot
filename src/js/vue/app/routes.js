import Home from '../component/page/home';
import Channel from '../component/page/channel';
import Chat from '../component/partial/chat';
import Counter from '../component/partial/counter';
import Player from '../component/partial/player';
import Poll from '../component/partial/poll';
import Raffle from '../component/partial/raffle';
import Statistic from '../component/page/statistic';
import Token from '../component/page/token';
import ErrorPage from '../component/page/error-page';

const routes = [
    {
        component: Home,
        name: 'index',
        path: '',
        meta: {
            title: 'i18n.nav-home - i18n.app',
            layout: 'default'
        }
    },
    {
        component: Channel,
        name: 'channel',
        path: '/channel/:channel',
        meta: {
            title: 'router.param-channel - i18n.app',
            layout: 'default'
        }
    },
    {
        component: Chat,
        name: 'chat',
        path: '/channel/:channel/chat',
        meta: {
            title: 'router.param-channel - i18n.chat',
            layout: 'empty'
        }
    },
    {
        component: Counter,
        name: 'counter',
        path: '/channel/:channel/counter',
        meta: {
            title: 'router.param-channel - i18n.counter',
            layout: 'empty'
        }
    },
    {
        component: Player,
        name: 'player',
        path: '/channel/:channel/player',
        meta: {
            title: 'router.param-channel - i18n.player',
            layout: 'empty'
        }
    },
    {
        component: Poll,
        name: 'poll',
        path: '/channel/:channel/poll',
        meta: {
            title: 'router.param-channel - i18n.poll',
            layout: 'empty'
        }
    },
    {
        component: Raffle,
        name: 'raffle',
        path: '/channel/:channel/raffle',
        meta: {
            title: 'router.param-channel - i18n.raffle',
            layout: 'empty'
        }
    },
    {
        component: Statistic,
        name: 'statistic',
        path: '/channel/:channel/statistic',
        meta: {
            title: 'router.param-channel - i18n.statistic',
            layout: 'default'
        }
    },
    {
        component: Token,
        name: 'token',
        path: '/token/:token/:property',
        meta: {
            title: 'i18n.nav-token - i18n.app',
            layout: 'default'
        }
    },
    {
        component: ErrorPage,
        path: '*',
        meta: {
            title: 'i18n.nav-error - i18n.app',
            layout: 'default'
        }
    }
];

export default routes;
