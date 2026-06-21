import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ProductCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../interfaces/category.interface';
import { environment } from '../../../environments/environment';
import { mapArray, unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products/categories`;

  findAll() {
    return this.http.get<unknown>(this.base).pipe(mapArray<ProductCategory>());
  }

  findOne(id: string) {
    return this.http
      .get<ProductCategory | { data: ProductCategory }>(`${this.base}/${id}`)
      .pipe(unwrapData<ProductCategory>());
  }

  create(dto: CreateCategoryDto) {
    return this.http
      .post<ProductCategory | { data: ProductCategory }>(this.base, dto)
      .pipe(unwrapData<ProductCategory>());
  }

  update(id: string, dto: UpdateCategoryDto) {
    return this.http
      .patch<ProductCategory | { data: ProductCategory }>(`${this.base}/${id}`, dto)
      .pipe(unwrapData<ProductCategory>());
  }

  delete(id: string) {
    return this.http.delete<void | { data: unknown }>(`${this.base}/${id}`);
  }
}
