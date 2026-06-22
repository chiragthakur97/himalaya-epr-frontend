import { Routes } from '@angular/router';

export const UNIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./unit-list/unit-list.component').then(m => m.UnitListComponent),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./unit-form/unit-form.component').then(m => m.UnitFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./unit-form/unit-form.component').then(m => m.UnitFormComponent),
  },
];
