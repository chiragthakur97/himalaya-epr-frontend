import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '../interfaces/auth.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { environment } from '../../../environments/environment';
import { unwrapData } from '../utils/http.util';
import { getDefaultPermittedRoute } from '../utils/permission.util';
import { PermissionConfigService } from './permission-config.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly permissionConfig = inject(PermissionConfigService);

  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _user = signal<User | null>(this.getStoredUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => {
    const t = this._token();
    if (!t) return false;
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  });

  constructor() {
    if (this.isAuthenticated()) {
      const user = this._user();
      if (!user?.permissions?.length) {
        this.clearSession(false);
        return;
      }
      this.permissionConfig.load();
      this.refreshProfile();
    }
  }

  /** Authenticate, load sidebar config, then return the best post-login route. */
  login(credentials: LoginRequest): Observable<string> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          const token = response.data.accessToken;
          const user = response.data.user as User;

          localStorage.setItem('ht_access_token', token);
          localStorage.setItem('ht_user', JSON.stringify(user));

          this._token.set(token);
          this._user.set(user);
        }),
        switchMap(() => this.permissionConfig.load$()),
        map(() => this.resolvePostLoginRoute()),
      );
  }

  resolvePostLoginRoute(): string {
    const permissions = this._user()?.permissions ?? [];
    const has = (permission: string) => permissions.includes(permission);
    return getDefaultPermittedRoute(this.permissionConfig.navigation(), has) ?? '/dashboard';
  }

  refreshProfile() {
    return this.http
      .get<ApiResponse<User>>(`${environment.apiUrl}/auth/profile`)
      .pipe(
        unwrapData<User>(),
        tap(user => this.mergeUser(user)),
      )
      .subscribe({ error: () => {} });
  }

  refreshPermissions() {
    return this.http
      .get<ApiResponse<string[]>>(`${environment.apiUrl}/auth/permissions`)
      .pipe(
        unwrapData<string[]>(),
        tap(permissions => {
          if (!permissions.length) return;
          const current = this._user();
          if (!current) return;
          this.mergeUser({ ...current, permissions });
        }),
      )
      .subscribe({ error: () => {} });
  }

  getProfile() {
    return this.http
      .get<ApiResponse<User>>(`${environment.apiUrl}/auth/profile`)
      .pipe(unwrapData<User>());
  }

  logout(): void {
    this.clearSession(true);
    void this.router.navigate(['/login']);
  }

  private mergeUser(incoming: User): void {
    const existing = this._user();
    const permissions = incoming.permissions?.length
      ? incoming.permissions
      : existing?.permissions ?? [];

    const merged: User = {
      ...(existing ?? {}),
      ...incoming,
      permissions,
    };

    localStorage.setItem('ht_user', JSON.stringify(merged));
    this._user.set(merged);
  }

  private clearSession(resetNavigation: boolean): void {
    localStorage.removeItem('ht_access_token');
    localStorage.removeItem('ht_user');
    this._token.set(null);
    this._user.set(null);
    if (resetNavigation) {
      this.permissionConfig.reset();
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('ht_access_token');
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('ht_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
