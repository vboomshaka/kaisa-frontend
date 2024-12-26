import {RouteRecordRaw} from 'vue-router';
import {useAccountStore} from "@/store";

const routes: RouteRecordRaw[] = [
    // {
    //   path: '/',
    //   name: 'home',
    //   redirect: '/home',
    //   meta: {
    //     title: '首页',
    //     renderMenu: false,
    //     icon: 'CreditCardOutlined',
    //   },
    // },
    {
        path: '/',
        name: '',
        redirect: (to) => {
            const authStore = useAccountStore();
            if (authStore.logged) {
                return {path: '/workplace'};
            } else {
                return {path: '/login'};
            }
        },
        meta: {
            title: '首页',
            renderMenu: false,
            icon: 'CreditCardOutlined',
        },
    },
    {
        path: '/front',
        name: '前端',
        meta: {
            renderMenu: false,
        },
        component: () => import('@/components/layout/FrontView.vue'),
        children: [
            {
                path: '/login',
                name: '登录',
                meta: {
                    icon: 'LoginOutlined',
                    view: 'blank',
                    target: '_blank',
                    cacheable: false,
                },
                component: () => import('@/pages/login'),
            },
        ],
    },
    {
        path: '/403',
        name: '403',
        props: true,
        meta: {
            renderMenu: false,
        },
        component: () => import('@/pages/Exp403.vue'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        props: true,
        meta: {
            icon: 'CreditCardOutlined',
            renderMenu: false,
            cacheable: false,
            _is404Page: true,
        },
        component: () => import('@/pages/Exp404.vue'),
    },
];

export default routes;
