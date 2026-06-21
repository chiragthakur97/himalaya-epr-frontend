import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { SalesOrder, OrderStatus } from '../../../core/interfaces/sales-order.interface';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-sales-order-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTableModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    StatusChipComponent,
    CurrencyInrPipe,
    DateFormatPipe,
  ],
  templateUrl: './sales-order-detail.component.html',
  styleUrl: './sales-order-detail.component.scss',
})
export class SalesOrderDetailComponent implements OnInit {
  private readonly service = inject(SalesOrderService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly order = signal<SalesOrder | null>(null);
  readonly statusUpdating = signal(false);

  readonly orderStatuses: OrderStatus[] = ['DRAFT', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
  readonly itemColumns = ['product', 'quantity', 'unitPrice', 'lineTotal'];
  readonly paymentColumns = ['amount', 'paymentMode', 'transactionReference', 'createdAt'];

  private orderId = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.orderId) {
      this.router.navigate(['/sales-orders']);
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.findOne(this.orderId).subscribe({
      next: order => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/sales-orders']);
      },
    });
  }

  updateStatus(status: OrderStatus): void {
    this.statusUpdating.set(true);
    this.service.updateStatus(this.orderId, { orderStatus: status }).subscribe({
      next: order => {
        this.order.set(order);
        this.statusUpdating.set(false);
        this.snackBar.open('Status updated', 'Dismiss', { duration: 3000 });
      },
      error: err => {
        this.statusUpdating.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  downloadInvoice(): void {
    this.service.downloadInvoice(this.orderId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.order()?.orderNumber ?? this.orderId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  viewInvoice(): void {
    this.service.downloadInvoice(this.orderId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  printInvoice(): void {
    this.viewInvoice();
  }
}
