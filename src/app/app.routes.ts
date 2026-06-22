import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.routes').then(m => m.CUSTOMER_ROUTES),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.PRODUCT_ROUTES),
      },
      {
        path: 'product-categories',
        loadChildren: () =>
          import('./features/product-categories/product-categories.routes').then(
            m => m.PRODUCT_CATEGORY_ROUTES
          ),
      },
      {
        path: 'units',
        loadChildren: () =>
          import('./features/units/units.routes').then(m => m.UNIT_ROUTES),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES),
      },
      {
        path: 'sales-orders',
        loadChildren: () =>
          import('./features/sales-orders/sales-orders.routes').then(m => m.SALES_ORDER_ROUTES),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payments/payments.routes').then(m => m.PAYMENT_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () =>
          import('./features/users/users.routes').then(m => m.USER_ROUTES),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
