import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { UnitService } from '../../../core/services/unit.service';
import { ProductCategory } from '../../../core/interfaces/category.interface';
import { Unit } from '../../../core/interfaces/unit.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-product-form',
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
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly unitService = inject(UnitService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isEdit = signal(false);
  readonly categories = signal<ProductCategory[]>([]);
  readonly categoriesLoading = signal(true);
  readonly units = signal<Unit[]>([]);
  readonly unitsLoading = signal(true);
  private productId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: [''],
    categoryId: ['', Validators.required],
    unitId: ['', Validators.required],
    brand: [''],
    purchasePrice: [0, [Validators.required, Validators.min(0)]],
    sellingPrice: [0, [Validators.required, Validators.min(0)]],
    minimumStock: [0, [Validators.min(0)]],
    gstPercentage: [0, [Validators.min(0), Validators.max(100)]],
    openingStock: [0, [Validators.min(0)]],
    description: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadUnits();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(s => s.path === 'edit')) {
      this.isEdit.set(true);
      this.productId = id;
      this.form.controls.openingStock.disable();
      this.loadProduct(id);
    }
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.categoryService.findAll().subscribe({
      next: categories => {
        this.categories.set(categories);
        this.categoriesLoading.set(false);
      },
      error: err => {
        this.categoriesLoading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  private loadUnits(): void {
    this.unitsLoading.set(true);
    this.unitService.findAll().subscribe({
      next: units => {
        this.units.set(units);
        this.unitsLoading.set(false);
      },
      error: err => {
        this.unitsLoading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  private ensureCategoryOption(category: { id: string; name: string }): void {
    if (!this.categories().some(c => c.id === category.id)) {
      this.categories.update(list => [...list, { id: category.id, name: category.name }]);
    }
  }

  private ensureUnitOption(unit: { id: string; name: string; shortCode: string }): void {
    if (!this.units().some(u => u.id === unit.id)) {
      this.units.update(list => [...list, unit]);
    }
  }

  private loadProduct(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: product => {
        if (product.category) {
          this.ensureCategoryOption(product.category);
        }
        if (product.unit) {
          this.ensureUnitOption({
            id: product.unit.id,
            name: product.unit.name,
            shortCode: product.unit.shortCode ?? product.unit.name,
          });
        }
        this.form.patchValue({
          name: product.name,
          sku: product.sku ?? '',
          categoryId: product.categoryId,
          unitId: product.unitId,
          brand: product.brand ?? '',
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          minimumStock: product.minimumStock,
          gstPercentage: product.gstPercentage,
          description: product.description ?? '',
          isActive: product.isActive,
        });
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/products']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();

    if (this.isEdit() && this.productId) {
      const { openingStock: _openingStock, ...updateFields } = raw;
      const updatePayload = {
        ...updateFields,
        sku: raw.sku || undefined,
        brand: raw.brand || undefined,
        description: raw.description || undefined,
      };

      this.service.update(this.productId, updatePayload).subscribe({
        next: product => {
          this.saving.set(false);
          this.snackBar.open('Product updated', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/products', product.id]);
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
      return;
    }

    const createPayload = {
      ...raw,
      sku: raw.sku || undefined,
      brand: raw.brand || undefined,
      description: raw.description || undefined,
      openingStock: raw.openingStock || undefined,
    };

    this.service.create(createPayload).subscribe({
      next: product => {
        this.saving.set(false);
        this.snackBar.open('Product created', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/products', product.id]);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
