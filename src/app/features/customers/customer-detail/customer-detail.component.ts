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
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SummaryCardComponent } from '../../../shared/components/summary-card/summary-card.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer, LedgerEntry } from '../../../core/interfaces/customer.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    SummaryCardComponent,
    StatusChipComponent,
    DataTableComponent,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
})
export class CustomerDetailComponent implements OnInit {
  private readonly service = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly customer = signal<Customer | null>(null);
  readonly ledgerEntries = signal<LedgerEntry[]>([]);

  readonly ledgerColumns: TableColumn<LedgerEntry>[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'reference', header: 'Reference' },
    { key: 'type', header: 'Type', type: 'status' },
    { key: 'debit', header: 'Debit', type: 'currency' },
    { key: 'credit', header: 'Credit', type: 'currency' },
    { key: 'balance', header: 'Balance', type: 'currency' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/customers']);
      return;
    }
    this.load(id);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: customer => {
        this.customer.set(customer);
        this.loadLedger(id);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/customers']);
      },
    });
  }

  private loadLedger(id: string): void {
    this.service.getLedger(id, { page: 1, limit: 10 }).subscribe({
      next: res => {
        this.ledgerEntries.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.ledgerEntries.set([]);
        this.loading.set(false);
      },
    });
  }
}
