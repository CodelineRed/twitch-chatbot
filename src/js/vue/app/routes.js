import Home from '../component/page/home';
import Channel from '../component/page/channel';
import Chat from '../component/partial/chat';
import Counter from '../component/partial/counter';
import Player from '../component/partial/player';
import Poll from '../component/partial/poll';
import About from '../component/page/about';
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
        component: About,
        name: 'about',
        path: '/about',
        meta: {
            title: 'i18n.nav-about - i18n.app',
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
