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
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CategoryService } from '../../../core/services/category.service';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-category-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isEdit = signal(false);
  private categoryId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(s => s.path === 'edit')) {
      this.isEdit.set(true);
      this.categoryId = id;
      this.loadCategory(id);
    }
  }

  private loadCategory(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: category => {
        this.form.patchValue({
          name: category.name,
          description: category.description ?? '',
          isActive: category.isActive ?? true,
        });
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/product-categories']);
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
    const payload = {
      name: raw.name,
      description: raw.description || undefined,
      isActive: raw.isActive,
    };

    const req$ =
      this.isEdit() && this.categoryId
        ? this.service.update(this.categoryId, payload)
        : this.service.create(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(
          this.isEdit() ? 'Category updated' : 'Category created',
          'Dismiss',
          { duration: 3000 }
        );
        this.router.navigate(['/product-categories']);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
