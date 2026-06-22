import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authService = inject(AuthService);

  readonly permissions = computed<string[]>(() => this.authService.user()?.permissions ?? []);

  has(permission: string): boolean {
    if (!permission) return true;
    return this.permissions().includes(permission);
  }

  hasAny(...permissions: string[]): boolean {
    const set = this.permissions();
    return permissions.some((p) => set.includes(p));
  }

  hasAll(...permissions: string[]): boolean {
    const set = this.permissions();
    return permissions.every((p) => set.includes(p));
  }

  filterActions<T extends { permission?: string }>(actions: T[]): Omit<T, 'permission'>[] {
    return actions
      .filter((action) => !action.permission || this.has(action.permission))
      .map(({ permission: _permission, ...action }) => action as Omit<T, 'permission'>);
  }
}
