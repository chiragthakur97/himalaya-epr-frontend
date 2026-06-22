import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./payment-list/payment-list.component').then(m => m.PaymentListComponent),
  },
  {
    path: 'create',
    canActivate: [permissionGuard('payments.create')],
    loadComponent: () =>
      import('./payment-form/payment-form.component').then(m => m.PaymentFormComponent),
  },
];
