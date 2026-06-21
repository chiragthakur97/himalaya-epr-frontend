import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  { path: '', redirectTo: 'history', pathMatch: 'full' },
  {
    path: 'add-stock',
    loadComponent: () =>
      import('./add-stock/add-stock.component').then(m => m.AddStockComponent),
  },
  {
    path: 'remove-stock',
    loadComponent: () =>
      import('./remove-stock/remove-stock.component').then(m => m.RemoveStockComponent),
  },
  {
    path: 'adjust-stock',
    loadComponent: () =>
      import('./adjust-stock/adjust-stock.component').then(m => m.AdjustStockComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./inventory-history/inventory-history.component').then(m => m.InventoryHistoryComponent),
  },
];
