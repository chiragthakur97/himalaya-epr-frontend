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
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SummaryCardComponent } from '../../../shared/components/summary-card/summary-card.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ProductService } from '../../../core/services/product.service';
import { Product, InventoryHistoryEntry } from '../../../core/interfaces/product.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    SummaryCardComponent,
    StatusChipComponent,
    DataTableComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly service = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly product = signal<Product | null>(null);
  readonly inventoryHistory = signal<InventoryHistoryEntry[]>([]);

  readonly historyColumns: TableColumn<InventoryHistoryEntry>[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'transactionType', header: 'Type', type: 'status' },
    { key: 'quantity', header: 'Quantity', type: 'number' },
    { key: 'reference', header: 'Reference' },
    { key: 'remarks', header: 'Remarks' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/products']);
      return;
    }
    this.load(id);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: product => {
        this.product.set(product);
        this.service.getInventory(id, { page: 1, limit: 20 }).subscribe({
          next: res => {
            this.inventoryHistory.set(res.data);
            this.loading.set(false);
          },
          error: () => {
            this.inventoryHistory.set([]);
            this.loading.set(false);
          },
        });
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/products']);
      },
    });
  }

  isLowStock(p: Product): boolean {
    return p.currentStock <= p.minimumStock;
  }
}
