import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchToolbarComponent } from '../../../shared/components/search-toolbar/search-toolbar.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { CustomerService } from '../../../core/services/customer.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Customer } from '../../../core/interfaces/customer.interface';
import { DeleteDialogComponent } from '../../../shared/dialogs/delete-dialog/delete-dialog.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-customer-list',
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
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  private readonly service = inject(CustomerService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly permissionService = inject(PermissionService);

  readonly loading = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<boolean | null>(null);

  readonly columns: TableColumn<Customer>[] = [
    { key: 'customerCode', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'email', header: 'Email' },
    { key: 'outstandingBalance', header: 'Outstanding', type: 'currency' },
    { key: 'creditLimit', header: 'Credit Limit', type: 'currency' },
    { key: 'isActive', header: 'Status', type: 'boolean' },
  ];

  readonly actions = computed(() =>
    this.permissionService.filterActions<TableAction & { permission?: string }>([
      { icon: 'visibility', label: 'View', action: 'view' },
      { icon: 'edit', label: 'Edit', action: 'edit', permission: 'customers.edit' },
      { icon: 'receipt_long', label: 'Ledger', action: 'ledger' },
      { icon: 'block', label: 'Deactivate', action: 'deactivate', color: 'warn', permission: 'customers.delete' },
    ]),
  );

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
        isActive: this.statusFilter() ?? undefined,
      })
      .subscribe({
        next: res => {
          this.customers.set(res.data);
          this.total.set(res.meta.total);
          this.loading.set(false);
        },
        error: err => {
          this.loading.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.pageIndex.set(0);
    this.load();
  }

  onStatusChange(value: string | boolean | null): void {
    this.statusFilter.set(typeof value === 'boolean' ? value : null);
    this.pageIndex.set(0);
    this.load();
  }

  onClearFilters(): void {
    this.search.set('');
    this.statusFilter.set(null);
    this.pageIndex.set(0);
    this.load();
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  onAction(event: { action: string; row: Customer }): void {
    const { action, row } = event;
    if (action === 'view') {
      this.router.navigate(['/customers', row.id]);
    } else if (action === 'edit') {
      this.router.navigate(['/customers', row.id, 'edit']);
    } else if (action === 'ledger') {
      this.router.navigate(['/customers', row.id, 'ledger']);
    } else if (action === 'deactivate') {
      this.deactivate(row);
    }
  }

  deactivate(customer: Customer): void {
    if (!customer.isActive) return;
    this.dialog
      .open(DeleteDialogComponent, {
        data: {
          message: 'Are you sure you want to deactivate this customer?',
          itemName: customer.name,
        },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.service.deactivate(customer.id).subscribe({
          next: () => {
            this.snackBar.open('Customer deactivated', 'Dismiss', { duration: 3000 });
            this.load();
          },
          error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
        });
      });
  }
}
