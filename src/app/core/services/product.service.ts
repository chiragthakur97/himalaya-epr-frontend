import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryParams,
  InventoryHistoryEntry,
} from '../interfaces/product.interface';
import { environment } from '../../../environments/environment';
import { mapPaginated, toHttpParams, unwrapData, mapArray } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  findAll(params: ProductQueryParams = {}) {
    return this.http
      .get<unknown>(this.base, { params: toHttpParams(params as Record<string, string | number | boolean>) })
      .pipe(mapPaginated<Product>());
  }

  findOne(id: string) {
    return this.http.get<Product | { data: Product }>(`${this.base}/${id}`).pipe(unwrapData<Product>());
  }

  create(dto: CreateProductDto) {
    return this.http.post<Product | { data: Product }>(this.base, dto).pipe(unwrapData<Product>());
  }

  update(id: string, dto: UpdateProductDto) {
    return this.http.patch<Product | { data: Product }>(`${this.base}/${id}`, dto).pipe(unwrapData<Product>());
  }

  deactivate(id: string) {
    return this.http
      .patch<Product | { data: Product }>(`${this.base}/${id}/deactivate`, {})
      .pipe(unwrapData<Product>());
  }

  getLowStock() {
    return this.http.get<unknown>(`${this.base}/low-stock`).pipe(mapArray<Product>());
  }

  getInventory(id: string, params: ProductQueryParams = {}) {
    return this.http
      .get<unknown>(`${this.base}/${id}/inventory`, {
        params: toHttpParams(params as Record<string, string | number | boolean>),
      })
      .pipe(mapPaginated<InventoryHistoryEntry>());
  }
}
