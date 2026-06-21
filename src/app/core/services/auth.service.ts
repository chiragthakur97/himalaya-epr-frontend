import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, User } from '../interfaces/auth.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

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

  login(credentials: LoginRequest) {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          const token = response.data.accessToken;
          const user = response.data.user;

          localStorage.setItem('ht_access_token', token);
          localStorage.setItem('ht_user', JSON.stringify(user));

          this._token.set(token);
          this._user.set(user);
        })
      );
  }

  getProfile() {
    return this.http.get<User>(`${environment.apiUrl}/auth/profile`);
  }

  logout(): void {
    localStorage.removeItem('ht_access_token');
    localStorage.removeItem('ht_user');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('ht_access_token');
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem('ht_user');
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
