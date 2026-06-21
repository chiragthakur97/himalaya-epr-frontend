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
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchToolbarComponent } from '../../../shared/components/search-toolbar/search-toolbar.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { DeleteDialogComponent } from '../../../shared/dialogs/delete-dialog/delete-dialog.component';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-product-list',
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
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly service = inject(ProductService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly products = signal<Product[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly search = signal('');
  readonly statusFilter = signal<boolean | null>(null);

  readonly columns: TableColumn<Product>[] = [
    { key: 'productCode', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'brand', header: 'Brand' },
    { key: 'purchasePrice', header: 'Purchase', type: 'currency' },
    { key: 'sellingPrice', header: 'Selling', type: 'currency' },
    { key: 'currentStock', header: 'Stock', type: 'number' },
    { key: 'minimumStock', header: 'Min Stock', type: 'number' },
    { key: 'gstPercentage', header: 'GST %', type: 'number' },
    { key: 'isActive', header: 'Status', type: 'boolean' },
  ];

  readonly actions: TableAction[] = [
    { icon: 'visibility', label: 'View', action: 'view' },
    { icon: 'edit', label: 'Edit', action: 'edit' },
    { icon: 'block', label: 'Deactivate', action: 'deactivate', color: 'warn' },
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
        isActive: this.statusFilter() ?? undefined,
      })
      .subscribe({
        next: res => {
          this.products.set(res.data);
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

  onAction(event: { action: string; row: Product }): void {
    const { action, row } = event;
    if (action === 'view') this.router.navigate(['/products', row.id]);
    else if (action === 'edit') this.router.navigate(['/products', row.id, 'edit']);
    else if (action === 'deactivate') this.deactivate(row);
  }

  deactivate(product: Product): void {
    if (!product.isActive) return;
    this.dialog
      .open(DeleteDialogComponent, {
        data: { message: 'Deactivate this product?', itemName: product.name },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.service.deactivate(product.id).subscribe({
          next: () => {
            this.snackBar.open('Product deactivated', 'Dismiss', { duration: 3000 });
            this.load();
          },
          error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
        });
      });
  }
}
