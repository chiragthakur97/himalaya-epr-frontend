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
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/interfaces/user.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-user-form',
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
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly isEdit = signal(false);
  readonly availableRoles = signal<Role[]>([]);
  private userId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    roleId: ['', Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadRoles();

    if (id && this.route.snapshot.url.some(s => s.path === 'edit')) {
      this.isEdit.set(true);
      this.userId = id;
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();
      this.loadUser(id);
    } else {
      this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  private loadRoles(): void {
    this.roleService.findAll().subscribe({
      next: roles => this.availableRoles.set(roles),
      error: () => this.availableRoles.set([]),
    });
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: user => {
        this.form.patchValue({
          fullName: user.fullName,
          email: user.email,
          roleId: user.role.id,
          isActive: user.isActive,
        });
        if (!this.availableRoles().some(r => r.id === user.role.id)) {
          this.availableRoles.update(list => [...list, user.role]);
        }
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/users']);
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

    if (this.isEdit() && this.userId) {
      this.service
        .update(this.userId, {
          fullName: raw.fullName,
          email: raw.email,
          roleId: raw.roleId,
          isActive: raw.isActive,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.snackBar.open('User updated', 'Dismiss', { duration: 3000 });
            this.router.navigate(['/users']);
          },
          error: err => {
            this.saving.set(false);
            this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
          },
        });
    } else {
      this.service
        .create({
          fullName: raw.fullName,
          email: raw.email,
          password: raw.password,
          roleId: raw.roleId,
          isActive: raw.isActive,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.snackBar.open('User created', 'Dismiss', { duration: 3000 });
            this.router.navigate(['/users']);
          },
          error: err => {
            this.saving.set(false);
            this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
          },
        });
    }
  }
}
