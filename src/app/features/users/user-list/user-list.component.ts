import {
  Component,
  OnInit,
  inject,
  signal,
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
import { AppUser } from '../../../core/interfaces/user.interface';
import { DeleteDialogComponent } from '../../../shared/dialogs/delete-dialog/delete-dialog.component';
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
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly service = inject(UserService);
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

  readonly actions: TableAction[] = [
    { icon: 'edit', label: 'Edit', action: 'edit' },
    { icon: 'block', label: 'Deactivate', action: 'deactivate', color: 'warn' },
  ];

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
    if (e.action === 'edit') this.router.navigate(['/users', e.row.id, 'edit']);
    else if (e.action === 'deactivate') this.deactivate(e.row);
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
