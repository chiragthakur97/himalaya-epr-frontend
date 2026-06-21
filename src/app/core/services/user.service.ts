import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppUser, CreateUserDto, UpdateUserDto } from '../interfaces/user.interface';
import { environment } from '../../../environments/environment';
import { mapArray, unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  findAll() {
    return this.http.get<unknown>(this.base).pipe(mapArray<AppUser>());
  }

  findOne(id: string) {
    return this.http.get<AppUser | { data: AppUser }>(`${this.base}/${id}`).pipe(unwrapData<AppUser>());
  }

  create(dto: CreateUserDto) {
    return this.http.post<AppUser | { data: AppUser }>(this.base, dto).pipe(unwrapData<AppUser>());
  }

  update(id: string, dto: UpdateUserDto) {
    return this.http.patch<AppUser | { data: AppUser }>(`${this.base}/${id}`, dto).pipe(unwrapData<AppUser>());
  }

  deactivate(id: string) {
    return this.http
      .patch<AppUser | { data: AppUser }>(`${this.base}/${id}/deactivate`, {})
      .pipe(unwrapData<AppUser>());
  }
}
