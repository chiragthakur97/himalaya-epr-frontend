import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Payment, CreatePaymentDto, PaymentQueryParams } from '../interfaces/payment.interface';
import { environment } from '../../../environments/environment';
import { mapPaginated, toHttpParams, unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/payments`;

  findAll(params: PaymentQueryParams = {}) {
    return this.http
      .get<unknown>(this.base, { params: toHttpParams(params as Record<string, string | number | boolean>) })
      .pipe(mapPaginated<Payment>());
  }

  findOne(id: string) {
    return this.http.get<Payment | { data: Payment }>(`${this.base}/${id}`).pipe(unwrapData<Payment>());
  }

  create(dto: CreatePaymentDto) {
    return this.http.post<Payment | { data: Payment }>(this.base, dto).pipe(unwrapData<Payment>());
  }

  getByCustomer(customerId: string, params: PaymentQueryParams = {}) {
    return this.http
      .get<unknown>(`${this.base}/customer/${customerId}`, {
        params: toHttpParams(params as Record<string, string | number | boolean>),
      })
      .pipe(mapPaginated<Payment>());
  }
}
