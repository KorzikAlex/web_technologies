import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

export const authGuard = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
) => {
    const brokerId = localStorage.getItem('brokerId');

    // Если пользователь не авторизован и пытается зайти на защищенную страницу
    if (!brokerId && to.name !== 'login') {
        next({ name: 'login' });
        return;
    }

    // Если пользователь авторизован и пытается зайти на страницу входа
    if (brokerId && to.name === 'login') {
        next({ name: 'broker', params: { brokerId } });
        return;
    }

    next();
};
