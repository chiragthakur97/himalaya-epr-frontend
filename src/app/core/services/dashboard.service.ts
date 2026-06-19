import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DashboardSummary,
  DashboardCharts,
  TopCustomer,
  TopProduct,
  PaymentMode,
} from '../interfaces/dashboard.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dashboard`;

  getSummary() {
    return this.http.get<DashboardSummary>(`${this.base}/summary`);
  }

  getCharts() {
    return this.http.get<DashboardCharts>(`${this.base}/charts`);
  }

  getTopCustomers() {
    return this.http.get<TopCustomer[]>(`${this.base}/top-customers`);
  }

  getTopProducts() {
    return this.http.get<TopProduct[]>(`${this.base}/top-products`);
  }

  getPaymentModes() {
    return this.http.get<PaymentMode[]>(`${this.base}/payment-modes`);
  }
}
