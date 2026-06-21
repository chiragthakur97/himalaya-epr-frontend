import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CustomerAutocompleteComponent } from '../../../shared/components/customer-autocomplete/customer-autocomplete.component';
import { PaymentService } from '../../../core/services/payment.service';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { Customer } from '../../../core/interfaces/customer.interface';
import { SalesOrder } from '../../../core/interfaces/sales-order.interface';
import { PaymentMode } from '../../../core/interfaces/sales-order.interface';
import { CurrencyInrPipe } from '../../../shared/pipes/currency-inr.pipe';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-payment-form',
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
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    CustomerAutocompleteComponent,
    CurrencyInrPipe,
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly orderService = inject(SalesOrderService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly customerOrders = signal<SalesOrder[]>([]);

  readonly paymentModes: PaymentMode[] = ['CASH', 'GPAY', 'PHONEPE', 'PAYTM', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER'];

  readonly form = this.fb.nonNullable.group({
    customerId: ['', Validators.required],
    salesOrderId: [''],
    amount: [0, [Validators.required, Validators.min(1)]],
    paymentMode: ['CASH' as PaymentMode, Validators.required],
    transactionReference: [''],
    notes: [''],
  });

  onCustomerSelected(customer: Customer): void {
    this.form.patchValue({ customerId: customer.id, salesOrderId: '' });
    this.orderService.getByCustomer(customer.id, { limit: 50 }).subscribe({
      next: res => this.customerOrders.set(res.data.filter(o => o.outstandingAmount > 0)),
      error: () => this.customerOrders.set([]),
    });
  }

  onOrderSelected(orderId: string): void {
    const order = this.customerOrders().find(o => o.id === orderId);
    if (order) {
      this.form.patchValue({ amount: order.outstandingAmount });
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    this.paymentService
      .create({
        customerId: raw.customerId,
        salesOrderId: raw.salesOrderId || undefined,
        amount: raw.amount,
        paymentMode: raw.paymentMode,
        transactionReference: raw.transactionReference || undefined,
        notes: raw.notes || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snackBar.open('Payment recorded', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/payments']);
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }
}
