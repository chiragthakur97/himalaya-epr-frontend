import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { AppPermissionConfig, NavConfigItem } from '../interfaces/permission.interface';
import { environment } from '../../../environments/environment';
import { unwrapData } from '../utils/http.util';

const NAV_CACHE_KEY = 'ht_app_navigation';

@Injectable({ providedIn: 'root' })
export class PermissionConfigService {
  private readonly http = inject(HttpClient);

  private readonly _navigation = signal<NavConfigItem[]>(this.readCache());
  private readonly _loaded = signal(this._navigation().length > 0);

  readonly navigation = this._navigation.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  /** Restore navigation from cache immediately, then refresh from API. */
  load(): void {
    this.load$().subscribe();
  }

  /** Returns navigation once available (cache, API, or empty after error). */
  load$(): Observable<NavConfigItem[]> {
    if (this._loaded() && this._navigation().length) {
      return of(this._navigation());
    }

    const cached = this.readCache();
    if (cached.length && !this._navigation().length) {
      this._navigation.set(cached);
      this._loaded.set(true);
    }

    return this.http
      .get<{ data: AppPermissionConfig }>(`${environment.apiUrl}/auth/app-config`)
      .pipe(
        unwrapData<AppPermissionConfig>(),
        map(config => {
          const nav = config.navigation ?? [];
          if (nav.length) {
            this.setNavigation(nav);
          } else if (cached.length) {
            this._navigation.set(cached);
          }
          this._loaded.set(true);
          return this._navigation();
        }),
        catchError(() => {
          if (!this._navigation().length && cached.length) {
            this._navigation.set(cached);
          }
          this._loaded.set(true);
          return of(this._navigation());
        }),
      );
  }

  ensureLoaded(): void {
    if (!this._loaded()) {
      this.load();
    }
  }

  setNavigation(nav: NavConfigItem[]): void {
    this._navigation.set(nav);
    this._loaded.set(true);
    try {
      sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify(nav));
    } catch {
      /* ignore quota errors */
    }
  }

  reset(): void {
    this._navigation.set([]);
    this._loaded.set(false);
    try {
      sessionStorage.removeItem(NAV_CACHE_KEY);
    } catch {
      /* ignore */
    }
  }

  private readCache(): NavConfigItem[] {
    try {
      const raw = sessionStorage.getItem(NAV_CACHE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as NavConfigItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
