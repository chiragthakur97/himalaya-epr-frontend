import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-hub/inventory-hub.component').then(m => m.InventoryHubComponent),
  },
  { path: 'history', redirectTo: '', pathMatch: 'full' },
  { path: 'add-stock', redirectTo: '', pathMatch: 'full' },
  { path: 'remove-stock', redirectTo: '', pathMatch: 'full' },
  { path: 'adjust-stock', redirectTo: '', pathMatch: 'full' },
];
