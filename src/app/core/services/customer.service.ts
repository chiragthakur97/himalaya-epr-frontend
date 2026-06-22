import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryParams,
  LedgerEntry,
  LedgerQueryParams,
} from '../interfaces/customer.interface';
import { PaginatedResult } from '../interfaces/api.interface';
import { environment } from '../../../environments/environment';
import { mapPaginated, toHttpParams, unwrapData, mapArray } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/customers`;

  findAll(params: CustomerQueryParams = {}) {
    return this.http
      .get<unknown>(this.base, { params: toHttpParams(params as Record<string, string | number | boolean>) })
      .pipe(mapPaginated<Customer>());
  }

  findOne(id: string) {
    return this.http.get<Customer | { data: Customer }>(`${this.base}/${id}`).pipe(unwrapData<Customer>());
  }

  create(dto: CreateCustomerDto) {
    return this.http.post<Customer | { data: Customer }>(this.base, dto).pipe(unwrapData<Customer>());
  }

  update(id: string, dto: UpdateCustomerDto) {
    return this.http.patch<Customer | { data: Customer }>(`${this.base}/${id}`, dto).pipe(unwrapData<Customer>());
  }

  deactivate(id: string) {
    return this.http
      .patch<Customer | { data: Customer }>(`${this.base}/${id}/deactivate`, {})
      .pipe(unwrapData<Customer>());
  }

  getLedger(id: string, params: LedgerQueryParams = {}) {
    return this.http
      .get<unknown>(`${this.base}/${id}/ledger`, {
        params: toHttpParams(params as Record<string, string | number | boolean>),
      })
      .pipe(mapPaginated<LedgerEntry>());
  }

  downloadLedgerCsv(id: string, params: Pick<LedgerQueryParams, 'dateFrom' | 'dateTo'> = {}) {
    return this.http.get(`${this.base}/${id}/ledger/export`, {
      params: toHttpParams(params as Record<string, string | number | boolean>),
      responseType: 'blob',
    });
  }
}
