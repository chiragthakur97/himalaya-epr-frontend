import {
  Component,
  input,
  inject,
  signal,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, LedgerEntry } from '../../../core/interfaces/customer.interface';
import { extractError } from '../../../core/utils/http.util';
import {
  downloadBlob,
  openLedgerPrintView,
} from '../../../core/utils/ledger.util';
import { formatDateForApi } from '../../../core/utils/sales-order.util';

function toApiDate(date: Date | null): string | undefined {
  if (!date) return undefined;
  return formatDateForApi(date);
}

@Component({
  selector: 'app-customer-ledger-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    DataTableComponent,
  ],
  templateUrl: './customer-ledger-panel.component.html',
  styleUrl: './customer-ledger-panel.component.scss',
})
export class CustomerLedgerPanelComponent {
  readonly customerId = input.required<string>();
  readonly customer = input<Customer | null>(null);
  readonly previewMode = input(false);

  private readonly service = inject(CustomerService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly entries = signal<LedgerEntry[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);

  readonly dateFromControl = new FormControl<Date | null>(null);
  readonly dateToControl = new FormControl<Date | null>(null);

  readonly columns: TableColumn<LedgerEntry>[] = [
    { key: 'createdAt', header: 'Date', type: 'date' },
    { key: 'referenceType', header: 'Type', type: 'status' },
    { key: 'description', header: 'Particulars' },
    { key: 'debit', header: 'Debit (Dr)', type: 'currency' },
    { key: 'credit', header: 'Credit (Cr)', type: 'currency' },
    { key: 'balance', header: 'Balance', type: 'currency' },
  ];

  constructor() {
    effect(() => {
      const id = this.customerId();
      if (id) this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    const limit = this.previewMode() ? 10 : this.pageSize();
    const page = this.previewMode() ? 1 : this.pageIndex() + 1;

    this.service
      .getLedger(this.customerId(), {
        page,
        limit,
        dateFrom: toApiDate(this.dateFromControl.value),
        dateTo: toApiDate(this.dateToControl.value),
      })
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

  applyFilters(): void {
    this.pageIndex.set(0);
    this.load();
  }

  clearFilters(): void {
    this.dateFromControl.setValue(null);
    this.dateToControl.setValue(null);
    this.pageIndex.set(0);
    this.load();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  printLedger(): void {
    const customer = this.customer();
    if (!customer) {
      this.snackBar.open('Customer details not loaded yet', 'Dismiss', { duration: 3000 });
      return;
    }

    this.service
      .getLedger(this.customerId(), {
        page: 1,
        limit: 100,
        dateFrom: toApiDate(this.dateFromControl.value),
        dateTo: toApiDate(this.dateToControl.value),
      })
      .subscribe({
        next: res => {
          openLedgerPrintView(
            customer.name,
            customer.customerCode,
            customer.outstandingBalance,
            [...res.data].reverse(),
            toApiDate(this.dateFromControl.value),
            toApiDate(this.dateToControl.value),
          );
          if (res.meta.total > res.data.length) {
            this.snackBar.open(
              `Printed ${res.data.length} of ${res.meta.total} entries. Download CSV for the full ledger.`,
              'Dismiss',
              { duration: 5000 },
            );
          }
        },
        error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
      });
  }

  downloadCsv(): void {
    this.exporting.set(true);
    this.service
      .downloadLedgerCsv(this.customerId(), {
        dateFrom: toApiDate(this.dateFromControl.value),
        dateTo: toApiDate(this.dateToControl.value),
      })
      .subscribe({
        next: blob => {
          const code = this.customer()?.customerCode ?? 'customer';
          downloadBlob(blob, `ledger-${code}-${new Date().toISOString().slice(0, 10)}.csv`);
          this.exporting.set(false);
        },
        error: err => {
          this.exporting.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }
}
