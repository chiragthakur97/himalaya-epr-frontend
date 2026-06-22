import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { PermissionConfigService } from '../services/permission-config.service';
import { AuthService } from '../services/auth.service';
import { getDefaultPermittedRoute } from '../utils/permission.util';

function redirectWhenDenied(): ReturnType<CanActivateFn> {
  const permissionService = inject(PermissionService);
  const configService = inject(PermissionConfigService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const permissions = permissionService.permissions();
  const fallback =
    getDefaultPermittedRoute(configService.navigation(), p => permissionService.has(p)) ??
    (permissions.length ? authService.resolvePostLoginRoute() : null);

  if (fallback) {
    return router.createUrlTree([fallback]);
  }

  if (!configService.loaded()) {
    configService.ensureLoaded();
  }

  if (permissions.length) {
    return router.createUrlTree([authService.resolvePostLoginRoute()]);
  }

  authService.logout();
  return router.createUrlTree(['/login']);
}

export function permissionGuard(permission: string): CanActivateFn {
  return () => {
    const permissionService = inject(PermissionService);
    if (permissionService.has(permission)) return true;
    return redirectWhenDenied();
  };
}

export const defaultRouteGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree([authService.resolvePostLoginRoute()]);
};
