import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, PortalRole } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = route.data['role'] as PortalRole | undefined;
  const user = auth.user();

  if (!user) {
    return router.createUrlTree(['/login']);
  }
  if (role && user.role !== role) {
    return router.createUrlTree([`/${user.role}`]);
  }
  return true;
};
