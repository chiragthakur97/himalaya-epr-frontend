import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard, defaultRouteGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
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
        canActivate: [permissionGuard('reports.view')],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'customers',
        canActivate: [permissionGuard('customers.view')],
        loadChildren: () =>
          import('./features/customers/customers.routes').then(m => m.CUSTOMER_ROUTES),
      },
      {
        path: 'products',
        canActivate: [permissionGuard('products.view')],
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.PRODUCT_ROUTES),
      },
      {
        path: 'product-categories',
        canActivate: [permissionGuard('products.view')],
        loadChildren: () =>
          import('./features/product-categories/product-categories.routes').then(
            m => m.PRODUCT_CATEGORY_ROUTES
          ),
      },
      {
        path: 'units',
        canActivate: [permissionGuard('products.view')],
        loadChildren: () =>
          import('./features/units/units.routes').then(m => m.UNIT_ROUTES),
      },
      {
        path: 'inventory',
        canActivate: [permissionGuard('inventory.view')],
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES),
      },
      {
        path: 'sales-orders',
        canActivate: [permissionGuard('sales_orders.view')],
        loadChildren: () =>
          import('./features/sales-orders/sales-orders.routes').then(m => m.SALES_ORDER_ROUTES),
      },
      {
        path: 'payments',
        canActivate: [permissionGuard('payments.view')],
        loadChildren: () =>
          import('./features/payments/payments.routes').then(m => m.PAYMENT_ROUTES),
      },
      {
        path: 'settings',
        canActivate: [permissionGuard('settings.view')],
        loadChildren: () =>
          import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
      },
      {
        path: 'users',
        canActivate: [permissionGuard('users.view')],
        loadChildren: () =>
          import('./features/users/users.routes').then(m => m.USER_ROUTES),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles.routes').then(m => m.ROLE_ROUTES),
      },
      { path: '', pathMatch: 'full', canActivate: [defaultRouteGuard], children: [] },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
