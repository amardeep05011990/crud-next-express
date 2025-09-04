import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const permissionGuard = (permission: string): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.hasPermission(permission)) return true;
    router.navigate(['/403']);
    return false;
  };
};
