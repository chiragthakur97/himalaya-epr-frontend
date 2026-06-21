import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, LedgerEntry } from '../../../core/interfaces/customer.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-customer-ledger',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    DataTableComponent,
  ],
  templateUrl: './customer-ledger.component.html',
  styleUrl: './customer-ledger.component.scss',
})
export class CustomerLedgerComponent implements OnInit {
  private readonly service = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly customer = signal<Customer | null>(null);
  readonly entries = signal<LedgerEntry[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  readonly columns: TableColumn<LedgerEntry>[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'reference', header: 'Reference' },
    { key: 'type', header: 'Type', type: 'status' },
    { key: 'debit', header: 'Debit', type: 'currency' },
    { key: 'credit', header: 'Credit', type: 'currency' },
    { key: 'balance', header: 'Balance', type: 'currency' },
  ];

  readonly customerId = this.route.snapshot.paramMap.get('id') ?? '';

  ngOnInit(): void {
    if (!this.customerId) {
      this.router.navigate(['/customers']);
      return;
    }
    this.service.findOne(this.customerId).subscribe({
      next: c => this.customer.set(c),
      error: () => this.router.navigate(['/customers']),
    });
    this.loadLedger();
  }

  loadLedger(): void {
    this.loading.set(true);
    this.service
      .getLedger(this.customerId, { page: this.pageIndex() + 1, limit: this.pageSize() })
      .subscribe({
        next: res => {
          this.entries.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: err => {
          this.loading.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadLedger();
  }
}
