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
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { SalesOrder, OrderStatus, PaymentStatus } from '../../../core/interfaces/sales-order.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-sales-order-list',
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
  ],
  templateUrl: './sales-order-list.component.html',
  styleUrl: './sales-order-list.component.scss',
})
export class SalesOrderListComponent implements OnInit {
  private readonly service = inject(SalesOrderService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly orders = signal<SalesOrder[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly orderStatus = signal<OrderStatus | null>(null);
  readonly paymentStatus = signal<PaymentStatus | null>(null);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  readonly orderStatusOptions: StatusOption[] = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  readonly paymentStatusOptions: StatusOption[] = [
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Paid', value: 'PAID' },
  ];

  readonly columns: TableColumn<SalesOrder>[] = [
    { key: 'orderNumber', header: 'Order #' },
    { key: 'customer.name', header: 'Customer' },
    { key: 'orderDate', header: 'Date', type: 'date' },
    { key: 'totalAmount', header: 'Total', type: 'currency' },
    { key: 'paidAmount', header: 'Paid', type: 'currency' },
    { key: 'outstandingAmount', header: 'Outstanding', type: 'currency' },
    { key: 'paymentStatus', header: 'Payment', type: 'status' },
    { key: 'orderStatus', header: 'Status', type: 'status' },
  ];

  readonly actions: TableAction[] = [
    { icon: 'visibility', label: 'View', action: 'view' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service
      .findAll({
        page: this.pageIndex() + 1,
        limit: this.pageSize(),
        search: this.search() || undefined,
        orderStatus: this.orderStatus() ?? undefined,
        paymentStatus: this.paymentStatus() ?? undefined,
        dateFrom: this.dateFrom() || undefined,
        dateTo: this.dateTo() || undefined,
      })
      .subscribe({
        next: res => {
          this.orders.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: err => {
          this.loading.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  onSearch(v: string): void { this.search.set(v); this.pageIndex.set(0); this.load(); }
  onDateFrom(v: string): void { this.dateFrom.set(v); this.pageIndex.set(0); this.load(); }
  onDateTo(v: string): void { this.dateTo.set(v); this.pageIndex.set(0); this.load(); }
  onClear(): void {
    this.search.set(''); this.orderStatus.set(null); this.paymentStatus.set(null);
    this.dateFrom.set(''); this.dateTo.set(''); this.pageIndex.set(0); this.load();
  }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); this.load(); }
  onAction(e: { action: string; row: SalesOrder }): void {
    if (e.action === 'view') this.router.navigate(['/sales-orders', e.row.id]);
  }
}
