import {inject} from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

export const accessGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    // Перенаправляем на страницу логина, если не авторизован
    router.navigate(['/login']);
    return false;
};
