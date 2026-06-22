import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const SALES_ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sales-order-list/sales-order-list.component').then(m => m.SalesOrderListComponent),
  },
  {
    path: 'create',
    canActivate: [permissionGuard('sales_orders.create')],
    loadComponent: () =>
      import('./sales-order-create/sales-order-create.component').then(m => m.SalesOrderCreateComponent),
  },
  {
    path: ':id/invoice',
    loadComponent: () =>
      import('./invoice-preview/invoice-preview.component').then(m => m.InvoicePreviewComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./sales-order-detail/sales-order-detail.component').then(m => m.SalesOrderDetailComponent),
  },
];
