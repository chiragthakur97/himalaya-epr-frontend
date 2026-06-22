import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface ResetPasswordDialogData {
  userName: string;
}

@Component({
  selector: 'app-reset-password-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Reset Password</h2>
    <mat-dialog-content>
      <p>Set a new password for <strong>{{ data.userName }}</strong>.</p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New password</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="new-password" />
          @if (form.controls.password.hasError('required') && form.controls.password.touched) {
            <mat-error>Password is required</mat-error>
          }
          @if (form.controls.password.hasError('minlength') && form.controls.password.touched) {
            <mat-error>Minimum 8 characters</mat-error>
          }
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm password</mat-label>
          <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" />
          @if (form.hasError('mismatch') && form.controls.confirmPassword.touched) {
            <mat-error>Passwords do not match</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        Reset Password
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .full-width { width: 100%; }
    mat-dialog-content p { margin-bottom: 16px; color: #6b7280; }
  `,
})
export class ResetPasswordDialogComponent {
  readonly data = inject<ResetPasswordDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ResetPasswordDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: (group) => (group.value.password === group.value.confirmPassword ? null : { mismatch: true }) },
  );

  submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.controls.password.value);
  }
}
