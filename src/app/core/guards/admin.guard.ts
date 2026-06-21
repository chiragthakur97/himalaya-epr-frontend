import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getUserRoleName } from '../interfaces/auth.interface';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = getUserRoleName(authService.user()).toUpperCase();
  return role === 'ADMIN' ? true : router.createUrlTree(['/dashboard']);
};
