import { createRouter, createWebHistory } from 'vue-router';
import { AdminPage, BasicLayout, LoginPage, BrokerPage } from '@/pages';
import { authGuard } from '@/guard/authGuard';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '',
            name: 'layout',
            component: BasicLayout,
            redirect: () => {
                const brokerId = localStorage.getItem('brokerId');
                return brokerId ? { name: 'broker', params: { brokerId } } : { name: 'login' };
            },
            children: [
                {
                    path: '/admin',
                    name: 'admin',
                    meta: {
                        name: 'Панель администратора',
                    },
                    component: AdminPage,
                },
                {
                    path: '/broker/:brokerId',
                    name: 'broker',
                    meta: {
                        name: 'Страница брокера',
                    },
                    component: BrokerPage,
                },
            ],
            beforeEnter: [],
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
        },
    ],
});

router.beforeEach(authGuard);

export default router;
