import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AddStockDto,
  RemoveStockDto,
  AdjustStockDto,
  InventoryHistoryItem,
  InventoryHistoryParams,
} from '../interfaces/inventory.interface';
import { environment } from '../../../environments/environment';
import { mapPaginated, toHttpParams, unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/inventory`;

  addStock(dto: AddStockDto) {
    return this.http.post<unknown>(`${this.base}/add-stock`, dto).pipe(unwrapData<unknown>());
  }

  removeStock(dto: RemoveStockDto) {
    return this.http.post<unknown>(`${this.base}/remove-stock`, dto).pipe(unwrapData<unknown>());
  }

  adjustStock(dto: AdjustStockDto) {
    return this.http.post<unknown>(`${this.base}/adjust-stock`, dto).pipe(unwrapData<unknown>());
  }

  getHistory(productId: string, params: InventoryHistoryParams = {}) {
    return this.http
      .get<unknown>(`${this.base}/history/${productId}`, {
        params: toHttpParams(params as Record<string, string | number | boolean>),
      })
      .pipe(mapPaginated<InventoryHistoryItem>());
  }
}
