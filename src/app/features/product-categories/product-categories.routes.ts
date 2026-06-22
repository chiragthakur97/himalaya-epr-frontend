import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const PRODUCT_CATEGORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./category-list/category-list.component').then(m => m.CategoryListComponent),
  },
  {
    path: 'create',
    canActivate: [permissionGuard('products.create')],
    loadComponent: () =>
      import('./category-form/category-form.component').then(m => m.CategoryFormComponent),
  },
  {
    path: ':id/edit',
    canActivate: [permissionGuard('products.edit')],
    loadComponent: () =>
      import('./category-form/category-form.component').then(m => m.CategoryFormComponent),
  },
];
