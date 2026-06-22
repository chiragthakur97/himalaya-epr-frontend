import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { getUserRoleName } from '../interfaces/auth.interface';

export const settingsGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const role = getUserRoleName(authService.user()).toUpperCase();
  return role === 'ADMIN' || role === 'MANAGER' ? true : router.createUrlTree(['/dashboard']);
};
