import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { UserService } from '../../../core/services/user.service';
import { PermissionService } from '../../../core/services/permission.service';
import { AppUser } from '../../../core/interfaces/user.interface';
import { DeleteDialogComponent } from '../../../shared/dialogs/delete-dialog/delete-dialog.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    DataTableComponent,
    HasPermissionDirective,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly service = inject(UserService);
  private readonly permissionService = inject(PermissionService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly users = signal<AppUser[]>([]);

  readonly columns: TableColumn<AppUser>[] = [
    { key: 'fullName', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'role.name', header: 'Role' },
    { key: 'isActive', header: 'Status', type: 'boolean' },
    { key: 'createdAt', header: 'Created', type: 'date' },
  ];

  private readonly allActions: (TableAction & { permission?: string })[] = [
    { icon: 'edit', label: 'Edit', action: 'edit', permission: 'users.edit' },
    { icon: 'lock_reset', label: 'Reset Password', action: 'reset-password', permission: 'users.edit' },
    { icon: 'check_circle', label: 'Activate', action: 'activate', permission: 'users.edit' },
    { icon: 'block', label: 'Deactivate', action: 'deactivate', permission: 'users.edit', color: 'warn' },
  ];

  readonly actions = computed(() => this.permissionService.filterActions(this.allActions));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({
      next: data => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  onAction(e: { action: string; row: AppUser }): void {
    switch (e.action) {
      case 'edit':
        this.router.navigate(['/users', e.row.id, 'edit']);
        break;
      case 'reset-password':
        this.resetPassword(e.row);
        break;
      case 'activate':
        this.activate(e.row);
        break;
      case 'deactivate':
        this.deactivate(e.row);
        break;
    }
  }

  resetPassword(user: AppUser): void {
    this.dialog
      .open(ResetPasswordDialogComponent, {
        width: '420px',
        data: { userName: user.fullName },
      })
      .afterClosed()
      .subscribe(password => {
        if (!password) return;
        this.service.resetPassword(user.id, password).subscribe({
          next: () => {
            this.snackBar.open('Password reset successfully', 'Dismiss', { duration: 3000 });
          },
          error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
        });
      });
  }

  activate(user: AppUser): void {
    if (user.isActive) return;
    this.service.activate(user.id).subscribe({
      next: () => {
        this.snackBar.open('User activated', 'Dismiss', { duration: 3000 });
        this.load();
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  deactivate(user: AppUser): void {
    if (!user.isActive) return;
    this.dialog
      .open(DeleteDialogComponent, {
        data: { message: 'Deactivate this user?', itemName: user.fullName },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.service.deactivate(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deactivated', 'Dismiss', { duration: 3000 });
            this.load();
          },
          error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
        });
      });
  }
}
