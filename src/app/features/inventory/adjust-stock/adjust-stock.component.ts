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
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductAutocompleteComponent } from '../../../shared/components/product-autocomplete/product-autocomplete.component';
import { InventoryService } from '../../../core/services/inventory.service';
import { Product } from '../../../core/interfaces/product.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-adjust-stock',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    ProductAutocompleteComponent,
  ],
  templateUrl: './adjust-stock.component.html',
  styleUrl: '../add-stock/stock-form.component.scss',
})
export class AdjustStockComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InventoryService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly saving = signal(false);
  readonly selectedProduct = signal<Product | null>(null);

  readonly form = this.fb.nonNullable.group({
    productId: ['', Validators.required],
    newQuantity: [0, [Validators.required, Validators.min(0)]],
    remarks: [''],
  });

  onProductSelected(product: Product): void {
    this.selectedProduct.set(product);
    this.form.patchValue({ productId: product.id, newQuantity: product.currentStock });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();
    this.service
      .adjustStock({
        productId: raw.productId,
        newQuantity: raw.newQuantity,
        remarks: raw.remarks || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.snackBar.open('Stock adjusted successfully', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/inventory/history']);
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
  }
}
