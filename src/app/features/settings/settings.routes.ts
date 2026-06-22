import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./settings-hub/settings-hub.component').then(m => m.SettingsHubComponent),
  },
];
