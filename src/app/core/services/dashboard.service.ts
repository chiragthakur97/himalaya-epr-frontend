import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DashboardSummary,
  DashboardCharts,
  TopCustomer,
  TopProduct,
  PaymentModeBreakdown,
} from '../interfaces/dashboard.interface';
import { environment } from '../../../environments/environment';
import { mapArray, unwrapData } from '../utils/http.util';
import { ApiResponse } from '../interfaces/api.interface';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/dashboard`;

  getSummary() {
    return this.http
      .get<DashboardSummary | ApiResponse<DashboardSummary>>(`${this.base}/summary`)
      .pipe(unwrapData<DashboardSummary>());
  }

  getCharts() {
    return this.http
      .get<DashboardCharts | ApiResponse<DashboardCharts>>(`${this.base}/charts`)
      .pipe(unwrapData<DashboardCharts>());
  }

  getTopCustomers() {
    return this.http
      .get<unknown>(`${this.base}/top-customers`)
      .pipe(mapArray<TopCustomer>());
  }

  getTopProducts() {
    return this.http
      .get<unknown>(`${this.base}/top-products`)
      .pipe(mapArray<TopProduct>());
  }

  getPaymentModes() {
    return this.http.get<unknown>(`${this.base}/payment-modes`).pipe(
      mapArray<{ paymentMode: string; total: number; count: number }>(),
      map(modes => {
        const total = modes.reduce((sum, m) => sum + m.total, 0);
        return modes.map(
          (m): PaymentModeBreakdown => ({
            ...m,
            percentage: total > 0 ? (m.total / total) * 100 : 0,
          })
        );
      })
    );
  }
}
