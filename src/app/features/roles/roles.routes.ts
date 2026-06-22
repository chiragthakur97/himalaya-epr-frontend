import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./role-list/role-list.component').then(m => m.RoleListComponent),
    canActivate: [permissionGuard('users.view')],
  },
  {
    path: ':id/permissions',
    loadComponent: () =>
      import('./role-permissions/role-permissions.component').then(m => m.RolePermissionsComponent),
    canActivate: [permissionGuard('users.edit')],
  },
];
