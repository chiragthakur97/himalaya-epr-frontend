import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Unit, CreateUnitDto, UpdateUnitDto } from '../interfaces/unit.interface';
import { environment } from '../../../environments/environment';
import { mapArray, unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class UnitService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products/units`;

  findAll() {
    return this.http.get<unknown>(this.base).pipe(mapArray<Unit>());
  }

  findOne(id: string) {
    return this.http
      .get<Unit | { data: Unit }>(`${this.base}/${id}`)
      .pipe(unwrapData<Unit>());
  }

  create(dto: CreateUnitDto) {
    return this.http
      .post<Unit | { data: Unit }>(this.base, dto)
      .pipe(unwrapData<Unit>());
  }

  update(id: string, dto: UpdateUnitDto) {
    return this.http
      .patch<Unit | { data: Unit }>(`${this.base}/${id}`, dto)
      .pipe(unwrapData<Unit>());
  }

  delete(id: string) {
    return this.http.delete<void | { data: unknown }>(`${this.base}/${id}`);
  }
}
