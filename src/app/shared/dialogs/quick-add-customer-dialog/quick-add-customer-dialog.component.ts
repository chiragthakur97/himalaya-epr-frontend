import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/interfaces/customer.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-quick-add-customer-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>person_add</mat-icon>
      Quick Add Customer
    </h2>

    <mat-dialog-content>
      <p class="intro">Add a new customer and use them on this order right away.</p>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Customer name</mat-label>
          <input matInput formControlName="name" autocomplete="name" />
          @if (form.controls.name.touched && form.controls.name.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mobile number</mat-label>
          <input matInput formControlName="mobile" maxlength="10" inputmode="numeric" />
          @if (form.controls.mobile.touched && form.controls.mobile.hasError('required')) {
            <mat-error>Mobile is required</mat-error>
          }
          @if (form.controls.mobile.touched && form.controls.mobile.hasError('pattern')) {
            <mat-error>Enter a 10-digit mobile number</mat-error>
          }
        </mat-form-field>
      </form>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" [disabled]="saving()" (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" type="button" [disabled]="saving()" (click)="save()">
        @if (saving()) {
          <mat-spinner diameter="20" />
        } @else {
          Add & Select
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }

    .intro {
      margin: 0 0 1rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .full-width {
      width: 100%;
    }

    .error {
      margin: 0.75rem 0 0;
      color: #c62828;
      font-size: 0.8125rem;
    }
  `,
})
export class QuickAddCustomerDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CustomerService);
  private readonly dialogRef = inject(MatDialogRef<QuickAddCustomerDialogComponent, Customer | undefined>);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
  });

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    this.service
      .create({
        name: raw.name.trim(),
        mobile: raw.mobile.trim(),
      })
      .subscribe({
        next: customer => this.dialogRef.close(customer),
        error: err => {
          this.saving.set(false);
          this.error.set(extractError(err));
        },
      });
  }
}
