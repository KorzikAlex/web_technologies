import type { CanActivateFn } from '@angular/router';

export const accessGuard: CanActivateFn = (route, state) => {
    return true;
};
