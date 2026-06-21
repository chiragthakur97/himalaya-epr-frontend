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
import { CustomerService } from '../../../core/services/customer.service';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-customer-form',
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
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isEdit = signal(false);
  private customerId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    alternateMobile: [''],
    email: ['', Validators.email],
    address: [''],
    gstNumber: [''],
    creditLimit: [0, [Validators.min(0)]],
    openingBalance: [0, [Validators.min(0)]],
    notes: [''],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(s => s.path === 'edit')) {
      this.isEdit.set(true);
      this.customerId = id;
      this.form.controls.openingBalance.disable();
      this.loadCustomer(id);
    }
  }

  private loadCustomer(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: customer => {
        this.form.patchValue({
          name: customer.name,
          mobile: customer.mobile,
          alternateMobile: customer.alternateMobile ?? '',
          email: customer.email ?? '',
          address: customer.address ?? '',
          gstNumber: customer.gstNumber ?? '',
          creditLimit: customer.creditLimit,
          notes: customer.notes ?? '',
          isActive: customer.isActive,
        });
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/customers']);
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
      ...raw,
      alternateMobile: raw.alternateMobile || undefined,
      email: raw.email || undefined,
      address: raw.address || undefined,
      gstNumber: raw.gstNumber || undefined,
      notes: raw.notes || undefined,
    };

    const req$ = this.isEdit() && this.customerId
      ? this.service.update(this.customerId, payload)
      : this.service.create(payload);

    req$.subscribe({
      next: customer => {
        this.saving.set(false);
        this.snackBar.open(
          this.isEdit() ? 'Customer updated' : 'Customer created',
          'Dismiss',
          { duration: 3000 }
        );
        this.router.navigate(['/customers', customer.id]);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
