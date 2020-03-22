import Home from '../component/page/home';
import Channel from '../component/page/channel';
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
