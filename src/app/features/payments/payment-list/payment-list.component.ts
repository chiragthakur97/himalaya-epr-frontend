import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchToolbarComponent, StatusOption } from '../../../shared/components/search-toolbar/search-toolbar.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { PaymentService } from '../../../core/services/payment.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { Payment } from '../../../core/interfaces/payment.interface';
import { PaymentMode } from '../../../core/interfaces/sales-order.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    SearchToolbarComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
})
export class PaymentListComponent implements OnInit {
  private readonly service = inject(PaymentService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly payments = signal<Payment[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly paymentMode = signal<PaymentMode | null>(null);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  readonly modeOptions: StatusOption[] = [
    { label: 'Cash', value: 'CASH' },
    { label: 'GPay', value: 'GPAY' },
    { label: 'PhonePe', value: 'PHONEPE' },
    { label: 'Paytm', value: 'PAYTM' },
    { label: 'Card', value: 'CARD' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Other', value: 'OTHER' },
  ];

  readonly columns: TableColumn<Payment>[] = [
    { key: 'paymentNumber', header: 'Payment #' },
    { key: 'customer.name', header: 'Customer' },
    { key: 'salesOrder.orderNumber', header: 'Order' },
    { key: 'amount', header: 'Amount', type: 'currency' },
    { key: 'paymentMode', header: 'Mode', type: 'status' },
    { key: 'transactionReference', header: 'Reference' },
    { key: 'paymentDate', header: 'Date', type: 'date' },
  ];

  readonly actions: TableAction[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service
      .findAll({
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        paymentMode: this.paymentMode() ?? undefined,
        dateFrom: this.dateFrom() || undefined,
        dateTo: this.dateTo() || undefined,
      })
      .subscribe({
        next: res => {
          this.payments.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: err => {
          this.loading.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  onModeChange(v: string | boolean | null): void {
    this.paymentMode.set(typeof v === 'string' ? (v as PaymentMode) : null);
    this.pageIndex.set(0);
    this.load();
  }

  onDateFrom(v: string): void { this.dateFrom.set(v); this.pageIndex.set(0); this.load(); }
  onDateTo(v: string): void { this.dateTo.set(v); this.pageIndex.set(0); this.load(); }
  onClear(): void { this.paymentMode.set(null); this.dateFrom.set(''); this.dateTo.set(''); this.pageIndex.set(0); this.load(); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); this.load(); }
}
