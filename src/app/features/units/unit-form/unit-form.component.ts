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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { UnitService } from '../../../core/services/unit.service';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-unit-form',
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
    LoadingSpinnerComponent,
  ],
  templateUrl: './unit-form.component.html',
  styleUrl: './unit-form.component.scss',
})
export class UnitFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UnitService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isEdit = signal(false);
  private unitId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    shortCode: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(s => s.path === 'edit')) {
      this.isEdit.set(true);
      this.unitId = id;
      this.loadUnit(id);
    }
  }

  private loadUnit(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: unit => {
        this.form.patchValue({
          name: unit.name,
          shortCode: unit.shortCode,
        });
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/units']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const payload = this.form.getRawValue();

    const req$ =
      this.isEdit() && this.unitId
        ? this.service.update(this.unitId, payload)
        : this.service.create(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open(
          this.isEdit() ? 'Unit updated' : 'Unit created',
          'Dismiss',
          { duration: 3000 }
        );
        this.router.navigate(['/units']);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
