import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./user-list/user-list.component').then(m => m.UserListComponent),
  },
  {
    path: 'create',
    canActivate: [permissionGuard('users.create')],
    loadComponent: () =>
      import('./user-form/user-form.component').then(m => m.UserFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard('users.edit')],
    loadComponent: () =>
      import('./user-form/user-form.component').then(m => m.UserFormComponent),
  },
];
