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
import { ProductAutocompleteComponent } from '../../../shared/components/product-autocomplete/product-autocomplete.component';
import { InventoryService } from '../../../core/services/inventory.service';
import { Product } from '../../../core/interfaces/product.interface';
import { InventoryReferenceType } from '../../../core/interfaces/inventory.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-remove-stock',
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
    ProductAutocompleteComponent,
  ],
  templateUrl: '../add-stock/stock-form.component.html',
  styleUrl: '../add-stock/stock-form.component.scss',
})
export class RemoveStockComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InventoryService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly title = 'Remove Stock';
  readonly subtitle = 'Decrease product stock quantity';
  readonly submitLabel = 'Remove Stock';
  readonly saving = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly referenceTypes: InventoryReferenceType[] = ['MANUAL', 'ORDER', 'PURCHASE', 'ADJUSTMENT'];

  readonly form = this.fb.nonNullable.group({
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    referenceType: ['MANUAL' as InventoryReferenceType],
    referenceId: [''],
    remarks: [''],
  });

  onProductSelected(product: Product): void {
    this.selectedProduct.set(product);
    this.form.patchValue({ productId: product.id });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    this.service
      .removeStock({
        productId: raw.productId,
        quantity: raw.quantity,
        referenceType: raw.referenceType,
        referenceId: raw.referenceId || undefined,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snackBar.open('Stock removed successfully', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/inventory/history']);
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }
}
