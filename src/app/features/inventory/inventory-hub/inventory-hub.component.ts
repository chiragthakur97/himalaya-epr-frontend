import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProductAutocompleteComponent } from '../../../shared/components/product-autocomplete/product-autocomplete.component';
import { SummaryCardComponent } from '../../../shared/components/summary-card/summary-card.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { InventoryService } from '../../../core/services/inventory.service';
import { ProductService } from '../../../core/services/product.service';
import { InventoryHistoryRow } from '../../../core/interfaces/inventory.interface';
import { Product } from '../../../core/interfaces/product.interface';
import { extractError } from '../../../core/utils/http.util';
import { mapInventoryHistoryRow } from '../../../core/utils/inventory.util';

type StockAction = 'in' | 'out' | 'count';

@Component({
  selector: 'app-inventory-hub',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    DataTableComponent,
    ProductAutocompleteComponent,
    EmptyStateComponent,
    SummaryCardComponent,
    StatusChipComponent,
  ],
  templateUrl: './inventory-hub.component.html',
  styleUrl: './inventory-hub.component.scss',
})
export class InventoryHubComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loadingHistory = signal(false);
  readonly saving = signal(false);
  readonly loadingLowStock = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly lowStockProducts = signal<Product[]>([]);
  readonly history = signal<InventoryHistoryRow[]>([]);
  readonly historyTotal = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly selectedTab = signal(0);
  readonly initialProductId = signal<string | null>(null);

  readonly isLowStock = computed(() => {
    const p = this.selectedProduct();
    return p ? p.currentStock <= p.minimumStock : false;
  });

  countDelta(): number {
    const p = this.selectedProduct();
    if (!p) return 0;
    return parseFloat((this.countForm.controls.newQuantity.value - p.currentStock).toFixed(2));
  }

  readonly historyColumns: TableColumn<InventoryHistoryRow>[] = [
    { key: 'createdAt', header: 'Date & Time', type: 'date' },
    { key: 'typeLabel', header: 'Movement' },
    { key: 'quantity', header: 'Qty', type: 'number' },
    { key: 'stockBefore', header: 'Before', type: 'number' },
    { key: 'stockAfter', header: 'After', type: 'number' },
    { key: 'referenceLabel', header: 'Source' },
    { key: 'remarks', header: 'Notes' },
  ];

  readonly stockInForm = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(0.01)]],
    remarks: [''],
  });

  readonly stockOutForm = this.fb.nonNullable.group({
    quantity: [1, [Validators.required, Validators.min(0.01)]],
    remarks: [''],
  });

  readonly countForm = this.fb.nonNullable.group({
    newQuantity: [0, [Validators.required, Validators.min(0)]],
    remarks: [''],
  });

  ngOnInit(): void {
    this.loadLowStock();

    this.route.queryParamMap.subscribe(params => {
      const productId = params.get('productId');
      const action = params.get('action') as StockAction | null;
      this.initialProductId.set(productId);
      this.selectedTab.set(this.tabIndexForAction(action));

      if (productId && this.selectedProduct()?.id !== productId) {
        this.productService.findOne(productId).subscribe({
          next: product => this.selectProduct(product, false),
          error: () => this.snackBar.open('Product not found', 'Dismiss', { duration: 3000 }),
        });
      }
    });
  }

  private tabIndexForAction(action: StockAction | null): number {
    switch (action) {
      case 'out':
        return 1;
      case 'count':
        return 2;
      default:
        return 0;
    }
  }

  private actionForTab(index: number): StockAction {
    switch (index) {
      case 1:
        return 'out';
      case 2:
        return 'count';
      default:
        return 'in';
    }
  }

  loadLowStock(): void {
    this.loadingLowStock.set(true);
    this.productService.getLowStock().subscribe({
      next: products => {
        this.lowStockProducts.set(products);
        this.loadingLowStock.set(false);
      },
      error: () => this.loadingLowStock.set(false),
    });
  }

  onProductSelected(product: Product): void {
    this.selectProduct(product, true);
  }

  selectProduct(product: Product, updateUrl: boolean): void {
    this.selectedProduct.set(product);
    this.pageIndex.set(0);
    this.resetForms(product);
    this.loadHistory(product.id);

    if (updateUrl) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          productId: product.id,
          action: this.actionForTab(this.selectedTab()),
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  onTabChange(index: number): void {
    this.selectedTab.set(index);
    const product = this.selectedProduct();
    if (product) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { productId: product.id, action: this.actionForTab(index) },
        queryParamsHandling: 'merge',
      });
    }
  }

  private resetForms(product: Product): void {
    this.stockInForm.reset({ quantity: 1, remarks: '' });
    this.stockOutForm.reset({ quantity: 1, remarks: '' });
    this.countForm.reset({ newQuantity: product.currentStock, remarks: '' });
  }

  loadHistory(productId: string): void {
    this.loadingHistory.set(true);
    this.inventoryService
      .getHistory(productId, { page: this.pageIndex() + 1, limit: this.pageSize() })
      .subscribe({
        next: res => {
          this.history.set(res.data.map(mapInventoryHistoryRow));
          this.historyTotal.set(res.meta.total);
          this.loadingHistory.set(false);
        },
        error: err => {
          this.loadingHistory.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  refreshProductAndHistory(): void {
    const product = this.selectedProduct();
    if (!product) return;

    this.productService.findOne(product.id).subscribe({
      next: updated => {
        this.selectedProduct.set(updated);
        this.countForm.patchValue({ newQuantity: updated.currentStock });
        this.loadHistory(updated.id);
        this.loadLowStock();
      },
    });
  }

  submitStockIn(): void {
    const product = this.selectedProduct();
    if (!product || this.stockInForm.invalid || this.saving()) {
      this.stockInForm.markAllAsTouched();
      return;
    }

    const raw = this.stockInForm.getRawValue();
    this.saving.set(true);
    this.inventoryService
      .addStock({
        productId: product.id,
        quantity: raw.quantity,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snackBar.open('Stock added successfully', 'Dismiss', { duration: 3000 });
          this.stockInForm.patchValue({ quantity: 1, remarks: '' });
          this.refreshProductAndHistory();
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  submitStockOut(): void {
    const product = this.selectedProduct();
    if (!product || this.stockOutForm.invalid || this.saving()) {
      this.stockOutForm.markAllAsTouched();
      return;
    }

    const raw = this.stockOutForm.getRawValue();
    if (raw.quantity > product.currentStock) {
      this.snackBar.open(
        `Cannot remove ${raw.quantity}. Only ${product.currentStock} in stock.`,
        'Dismiss',
        { duration: 4000 }
      );
      return;
    }

    this.saving.set(true);
    this.inventoryService
      .removeStock({
        productId: product.id,
        quantity: raw.quantity,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snackBar.open('Stock removed successfully', 'Dismiss', { duration: 3000 });
          this.stockOutForm.patchValue({ quantity: 1, remarks: '' });
          this.refreshProductAndHistory();
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  submitPhysicalCount(): void {
    const product = this.selectedProduct();
    if (!product || this.countForm.invalid || this.saving()) {
      this.countForm.markAllAsTouched();
      return;
    }

    const raw = this.countForm.getRawValue();
    this.saving.set(true);
    this.inventoryService
      .adjustStock({
        productId: product.id,
        newQuantity: raw.newQuantity,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snackBar.open('Stock updated to match physical count', 'Dismiss', { duration: 3000 });
          this.refreshProductAndHistory();
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }

  onHistoryPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    const product = this.selectedProduct();
    if (product) this.loadHistory(product.id);
  }

  pickLowStockProduct(product: Product): void {
    this.selectProduct(product, true);
  }
}
