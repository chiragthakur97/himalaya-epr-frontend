import {
  Component,
  inject,
  signal,
  computed,
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CustomerAutocompleteComponent } from '../../../shared/components/customer-autocomplete/customer-autocomplete.component';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { ProductService } from '../../../core/services/product.service';
import { Customer } from '../../../core/interfaces/customer.interface';
import { Product } from '../../../core/interfaces/product.interface';
import { OrderStatus, PaymentMode } from '../../../core/interfaces/sales-order.interface';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { extractError } from '../../../core/utils/http.util';

interface OrderItemRow {
  productId: string;
  productName: string;
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
    MatTooltipModule,
    MatTableModule,
    PageHeaderComponent,
    CustomerAutocompleteComponent,
    CurrencyInrPipe,
  ],
  templateUrl: './sales-order-create.component.html',
  styleUrl: './sales-order-create.component.scss',
})
export class SalesOrderCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SalesOrderService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly items = signal<OrderItemRow[]>([]);
  readonly productSearch = signal('');
  readonly productOptions = signal<Product[]>([]);

  readonly orderStatuses: OrderStatus[] = ['DRAFT', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
  readonly paymentModes: PaymentMode[] = ['CASH', 'GPAY', 'PHONEPE', 'PAYTM', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'];

  readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
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

  readonly itemColumns = ['product', 'quantity', 'unitPrice', 'lineTotal', 'stock', 'actions'];

  onCustomerSelected(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.form.patchValue({ customerId: customer.id });
  }

  searchProducts(term: string): void {
    this.productSearch.set(term);
    if (term.length < 1) {
      this.productOptions.set([]);
      return;
    }
    this.productService.findAll({ search: term, limit: 15, isActive: true }).subscribe(res => {
      this.productOptions.set(res.data);
    });
  }

  addProduct(product: Product): void {
    if (this.items().some(i => i.productId === product.id)) {
      this.snackBar.open('Product already added', 'Dismiss', { duration: 3000 });
      return;
    }
    this.items.update(list => [
      ...list,
      {
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        quantity: 1,
        unitPrice: product.sellingPrice,
      },
    ]);
    this.productOptions.set([]);
    this.productSearch.set('');
  }

  updateItem(index: number, field: 'quantity' | 'unitPrice', value: number): void {
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

  onSubmit(): void {
    if (this.form.invalid || this.items().length === 0 || this.saving()) {
      this.form.markAllAsTouched();
      if (this.items().length === 0) {
        this.snackBar.open('Add at least one product', 'Dismiss', { duration: 3000 });
      }
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    const dto = {
      customerId: raw.customerId,
      items: this.items().map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discountAmount: raw.discountAmount,
      taxAmount: raw.taxAmount,
      notes: raw.notes || undefined,
      orderStatus: raw.orderStatus,
      payment: raw.includePayment && raw.paymentAmount > 0
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
        this.snackBar.open('Order created', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/sales-orders', order.id]);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
