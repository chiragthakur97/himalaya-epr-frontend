import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CustomerAutocompleteComponent } from '../../../shared/components/customer-autocomplete/customer-autocomplete.component';
import { ProductAutocompleteComponent } from '../../../shared/components/product-autocomplete/product-autocomplete.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { Customer } from '../../../core/interfaces/customer.interface';
import { Product } from '../../../core/interfaces/product.interface';
import { OrderStatus, PaymentMode } from '../../../core/interfaces/sales-order.interface';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { extractError } from '../../../core/utils/http.util';
import { formatOrderStatus, formatPaymentMode, PAYMENT_MODE_LABELS, todayDate, formatDateForApi } from '../../../core/utils/sales-order.util';
import { QuickAddCustomerDialogComponent } from '../../../shared/dialogs/quick-add-customer-dialog/quick-add-customer-dialog.component';

interface OrderItemRow {
  productId: string;
  productName: string;
  productCode: string;
  unitName: string;
  currentStock: number;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-sales-order-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    PageHeaderComponent,
    CustomerAutocompleteComponent,
    ProductAutocompleteComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
  ],
  templateUrl: './sales-order-create.component.html',
  styleUrl: './sales-order-create.component.scss',
})
export class SalesOrderCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SalesOrderService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  @ViewChild(CustomerAutocompleteComponent) private customerPicker?: CustomerAutocompleteComponent;
  @ViewChild(ProductAutocompleteComponent) private productPicker?: ProductAutocompleteComponent;

  readonly saving = signal(false);
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly items = signal<OrderItemRow[]>([]);

  readonly createOrderStatuses: OrderStatus[] = ['DRAFT', 'CONFIRMED'];
  readonly paymentModes = Object.entries(PAYMENT_MODE_LABELS) as [PaymentMode, string][];
  readonly maxOrderDate = todayDate();

  readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    orderDate: [todayDate(), Validators.required],
    discountAmount: [0, [Validators.min(0)]],
    taxAmount: [0, [Validators.min(0)]],
    notes: [''],
    orderStatus: ['CONFIRMED' as OrderStatus],
    includePayment: [false],
    paymentAmount: [0, [Validators.min(0)]],
    paymentMode: ['CASH' as PaymentMode],
    transactionReference: [''],
    paymentNotes: [''],
  });

  readonly subtotal = computed(() =>
    this.items().reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  );

  readonly grandTotal = computed(() =>
    this.subtotal() - (this.form.controls.discountAmount.value ?? 0) + (this.form.controls.taxAmount.value ?? 0)
  );

  readonly hasStockIssues = computed(() =>
    this.items().some(i => i.quantity > i.currentStock)
  );

  readonly itemColumns = ['product', 'quantity', 'unitPrice', 'lineTotal', 'stock', 'actions'];

  formatOrderStatus = formatOrderStatus;
  formatPaymentMode = formatPaymentMode;

  onCustomerSelected(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.form.patchValue({ customerId: customer.id });
    this.form.controls.customerId.markAsTouched();
  }

  openQuickAddCustomer(): void {
    this.dialog
      .open(QuickAddCustomerDialogComponent, {
        width: '420px',
        maxWidth: '95vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((customer: Customer | undefined) => {
        if (!customer) return;
        this.customerPicker?.selectCustomer(customer);
        this.snackBar.open(`${customer.name} added and selected`, 'Dismiss', { duration: 3000 });
      });
  }

  addProduct(product: Product): void {
    if (this.items().some(i => i.productId === product.id)) {
      this.snackBar.open('Product already in this order', 'Dismiss', { duration: 3000 });
      return;
    }
    this.items.update(list => [
      ...list,
      {
        productId: product.id,
        productName: product.name,
        productCode: product.productCode,
        unitName: product.unit?.name ?? product.unit?.shortCode ?? '',
        currentStock: product.currentStock,
        quantity: 1,
        unitPrice: product.sellingPrice,
      },
    ]);
    this.productPicker?.clearSelection();
  }

  updateItem(index: number, field: 'quantity' | 'unitPrice', value: number): void {
    if (Number.isNaN(value) || value < 0) return;
    this.items.update(list => {
      const copy = [...list];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  removeItem(index: number): void {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  lineTotal(item: OrderItemRow): number {
    return item.quantity * item.unitPrice;
  }

  onPaymentToggle(enabled: boolean): void {
    if (enabled) {
      this.form.patchValue({ paymentAmount: Math.max(0, this.grandTotal()) });
    }
  }

  fillFullPayment(): void {
    this.form.patchValue({ paymentAmount: Math.max(0, this.grandTotal()) });
  }

  onSubmit(): void {
    if (this.saving()) return;

    this.form.markAllAsTouched();

    if (!this.form.controls.customerId.value || !this.selectedCustomer()) {
      this.snackBar.open('Select a customer from the search dropdown', 'Dismiss', { duration: 4000 });
      return;
    }

    if (this.items().length === 0) {
      this.snackBar.open('Add at least one product to the order', 'Dismiss', { duration: 4000 });
      return;
    }

    if (this.form.controls.orderDate.invalid) {
      this.snackBar.open('Choose a valid order date (today or earlier)', 'Dismiss', { duration: 4000 });
      return;
    }

    if (this.form.invalid) {
      this.snackBar.open('Please fix the highlighted fields before submitting', 'Dismiss', { duration: 4000 });
      return;
    }

    if (this.hasStockIssues()) {
      this.snackBar.open('Some items exceed available stock. Reduce quantities before submitting.', 'Dismiss', {
        duration: 5000,
      });
      return;
    }

    const raw = this.form.getRawValue();

    if (raw.includePayment && raw.paymentAmount <= 0) {
      this.snackBar.open('Enter payment amount or turn off "Record payment now"', 'Dismiss', { duration: 4000 });
      return;
    }

    if (this.grandTotal() < 0) {
      this.snackBar.open('Order total cannot be negative. Reduce discount or adjust items.', 'Dismiss', {
        duration: 4000,
      });
      return;
    }

    this.saving.set(true);

    let orderDate: string;
    try {
      orderDate = formatDateForApi(raw.orderDate);
    } catch {
      this.saving.set(false);
      this.snackBar.open('Choose a valid order date', 'Dismiss', { duration: 4000 });
      return;
    }

    const dto = {
      customerId: raw.customerId,
      orderDate,
      items: this.items().map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discountAmount: raw.discountAmount,
      taxAmount: raw.taxAmount,
      notes: raw.notes || undefined,
      orderStatus: raw.orderStatus,
      payment:
        raw.includePayment && raw.paymentAmount > 0
          ? {
              amount: raw.paymentAmount,
              paymentMode: raw.paymentMode,
              transactionReference: raw.transactionReference || undefined,
              notes: raw.paymentNotes || undefined,
            }
          : undefined,
    };

    this.service.create(dto).subscribe({
      next: order => {
        this.saving.set(false);
        this.snackBar.open('Order created successfully', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/sales-orders', order.id]);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  submitHint(): string {
    if (!this.selectedCustomer()) return 'Step 1: Select a customer';
    if (this.items().length === 0) return 'Step 2: Add at least one product';
    return 'Ready to create order';
  }
}
