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
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../../../core/interfaces/customer.interface';
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
  readonly outstandingBalance = signal(0);
  private customerId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    alternateMobile: ['', Validators.pattern(/^\d{10}$/)],
    email: [''],
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
        this.outstandingBalance.set(customer.outstandingBalance);
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

    if (this.isEdit() && this.customerId) {
      const updatePayload: UpdateCustomerDto = {
        name: raw.name.trim(),
        mobile: raw.mobile.trim(),
        alternateMobile: raw.alternateMobile.trim() || null,
        email: raw.email.trim() || null,
        address: raw.address.trim() || null,
        gstNumber: raw.gstNumber.trim() || null,
        creditLimit: raw.creditLimit,
        notes: raw.notes.trim() || null,
        isActive: raw.isActive,
      };

      this.service.update(this.customerId, updatePayload).subscribe({
        next: customer => {
          this.saving.set(false);
          this.snackBar.open('Customer updated', 'Dismiss', { duration: 3000 });
          this.router.navigate(['/customers', customer.id]);
        },
        error: err => {
          this.saving.set(false);
          this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        },
      });
      return;
    }

    const createPayload: CreateCustomerDto = {
      name: raw.name.trim(),
      mobile: raw.mobile.trim(),
      alternateMobile: raw.alternateMobile.trim() || undefined,
      email: raw.email.trim() || undefined,
      address: raw.address.trim() || undefined,
      gstNumber: raw.gstNumber.trim() || undefined,
      creditLimit: raw.creditLimit,
      openingBalance: raw.openingBalance > 0 ? raw.openingBalance : undefined,
      notes: raw.notes.trim() || undefined,
      isActive: raw.isActive,
    };

    this.service.create(createPayload).subscribe({
      next: customer => {
        this.saving.set(false);
        this.snackBar.open('Customer created', 'Dismiss', { duration: 3000 });
        this.router.navigate(['/customers', customer.id]);
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
