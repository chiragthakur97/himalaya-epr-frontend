import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProductAutocompleteComponent } from '../../../shared/components/product-autocomplete/product-autocomplete.component';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryHistoryItem } from '../../../core/interfaces/inventory.interface';
import { Product } from '../../../core/interfaces/product.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-inventory-history',
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
    ProductAutocompleteComponent,
    EmptyStateComponent,
  ],
  templateUrl: './inventory-history.component.html',
  styleUrl: './inventory-history.component.scss',
})
export class InventoryHistoryComponent implements OnInit {
  private readonly service = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly entries = signal<InventoryHistoryItem[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly selectedProductId = signal<string | null>(null);

  readonly columns: TableColumn<InventoryHistoryItem>[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'product.name', header: 'Product' },
    { key: 'transactionType', header: 'Type', type: 'status' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'reference', header: 'Reference' },
    { key: 'remarks', header: 'Remarks' },
  ];

  ngOnInit(): void {
    // History requires productId — show empty until product selected
  }

  onProductSelected(product: Product): void {
    this.selectedProductId.set(product.id);
    this.pageIndex.set(0);
    this.load(product.id);
  }

  load(productId: string): void {
    this.loading.set(true);
    this.service
      .getHistory(productId, { page: this.pageIndex() + 1, limit: this.pageSize() })
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
    const id = this.selectedProductId();
    if (id) this.load(id);
  }
}
