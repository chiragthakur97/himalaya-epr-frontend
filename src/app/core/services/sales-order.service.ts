import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  SalesOrder,
  CreateSalesOrderDto,
  UpdateOrderStatusDto,
  SalesOrderQueryParams,
  SalesReportSummary,
} from '../interfaces/sales-order.interface';
import { environment } from '../../../environments/environment';
import { mapPaginated, toHttpParams, unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class SalesOrderService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/sales-orders`;

  findAll(params: SalesOrderQueryParams = {}) {
    return this.http
      .get<unknown>(this.base, { params: toHttpParams(params as Record<string, string | number | boolean>) })
      .pipe(mapPaginated<SalesOrder>());
  }

  findOne(id: string) {
    return this.http.get<SalesOrder | { data: SalesOrder }>(`${this.base}/${id}`).pipe(unwrapData<SalesOrder>());
  }

  create(dto: CreateSalesOrderDto) {
    return this.http
      .post<SalesOrder | { data: SalesOrder }>(this.base, dto)
      .pipe(unwrapData<SalesOrder>());
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto) {
    return this.http
      .patch<SalesOrder | { data: SalesOrder }>(`${this.base}/${id}/status`, dto)
      .pipe(unwrapData<SalesOrder>());
  }

  getByCustomer(customerId: string, params: SalesOrderQueryParams = {}) {
    return this.http
      .get<unknown>(`${this.base}/customer/${customerId}`, {
        params: toHttpParams(params as Record<string, string | number | boolean>),
      })
      .pipe(mapPaginated<SalesOrder>());
  }

  getTodayReport() {
    return this.http
      .get<SalesReportSummary | { data: SalesReportSummary }>(`${this.base}/reports/today`)
      .pipe(unwrapData<SalesReportSummary>());
  }

  getMonthlyReport(year: number, month: number) {
    return this.http
      .get<SalesReportSummary | { data: SalesReportSummary }>(`${this.base}/reports/monthly`, {
        params: { year, month },
      })
      .pipe(unwrapData<SalesReportSummary>());
  }

  getOutstandingReport() {
    return this.http
      .get<SalesReportSummary | { data: SalesReportSummary }>(`${this.base}/reports/outstanding`)
      .pipe(unwrapData<SalesReportSummary>());
  }

  viewInvoiceUrl(id: string): string {
    return `${this.base}/${id}/invoice`;
  }

  downloadInvoice(id: string) {
    return this.http.get(`${this.base}/${id}/invoice/download`, { responseType: 'blob' });
  }
}
