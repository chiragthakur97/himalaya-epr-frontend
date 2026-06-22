import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CloneRoleDto,
  CreateRoleDto,
  PermissionMatrixModule,
  RoleDetail,
  RoleListItem,
} from '../interfaces/permission.interface';
import { environment } from '../../../environments/environment';
import { mapArray, unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/roles`;
  private readonly permissionsBase = `${environment.apiUrl}/permissions`;

  findAll(search?: string) {
    const params = search?.trim() ? { search: search.trim() } : undefined;
    return this.http.get<unknown>(this.base, { params }).pipe(mapArray<RoleListItem>());
  }

  findOne(id: string) {
    return this.http.get<RoleDetail | { data: RoleDetail }>(`${this.base}/${id}`).pipe(unwrapData<RoleDetail>());
  }

  getMatrix() {
    return this.http
      .get<{ data: PermissionMatrixModule[] }>(`${this.permissionsBase}/matrix`)
      .pipe(unwrapData<PermissionMatrixModule[]>());
  }

  create(dto: CreateRoleDto) {
    return this.http.post<RoleDetail | { data: RoleDetail }>(this.base, dto).pipe(unwrapData<RoleDetail>());
  }

  update(id: string, dto: Partial<CreateRoleDto>) {
    return this.http.patch<RoleDetail | { data: RoleDetail }>(`${this.base}/${id}`, dto).pipe(unwrapData<RoleDetail>());
  }

  updatePermissions(id: string, permissionKeys: string[]) {
    return this.http
      .patch<RoleDetail | { data: RoleDetail }>(`${this.base}/${id}/permissions`, { permissionKeys })
      .pipe(unwrapData<RoleDetail>());
  }

  clone(id: string, dto: CloneRoleDto) {
    return this.http
      .post<RoleDetail | { data: RoleDetail }>(`${this.base}/${id}/clone`, dto)
      .pipe(unwrapData<RoleDetail>());
  }

  activate(id: string) {
    return this.http.patch<RoleDetail | { data: RoleDetail }>(`${this.base}/${id}/activate`, {}).pipe(unwrapData<RoleDetail>());
  }

  deactivate(id: string) {
    return this.http.patch<RoleDetail | { data: RoleDetail }>(`${this.base}/${id}/deactivate`, {}).pipe(unwrapData<RoleDetail>());
  }

  remove(id: string) {
    return this.http.delete<unknown>(`${this.base}/${id}`);
  }
}
