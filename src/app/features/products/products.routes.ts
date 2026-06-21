import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./product-list/product-list.component').then(m => m.ProductListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent),
  },
  {
    path: 'low-stock',
    loadComponent: () =>
      import('./product-low-stock/product-low-stock.component').then(m => m.ProductLowStockComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent),
  },
];
