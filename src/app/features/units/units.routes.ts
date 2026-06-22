import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const UNIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./unit-list/unit-list.component').then(m => m.UnitListComponent),
  },
  {
    path: 'create',
    canActivate: [permissionGuard('products.create')],
    loadComponent: () =>
      import('./unit-form/unit-form.component').then(m => m.UnitFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard('products.edit')],
    loadComponent: () =>
      import('./unit-form/unit-form.component').then(m => m.UnitFormComponent),
  },
];
