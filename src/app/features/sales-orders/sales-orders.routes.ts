import { Routes } from '@angular/router';

export const SALES_ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sales-order-list/sales-order-list.component').then(m => m.SalesOrderListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./sales-order-create/sales-order-create.component').then(m => m.SalesOrderCreateComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./sales-order-detail/sales-order-detail.component').then(m => m.SalesOrderDetailComponent),
  },
];
