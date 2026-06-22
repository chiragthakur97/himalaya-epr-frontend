import { Routes } from '@angular/router';
import { settingsGuard } from '../../core/guards/settings.guard';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [settingsGuard],
    loadComponent: () =>
      import('./settings-hub/settings-hub.component').then(m => m.SettingsHubComponent),
  },
];
