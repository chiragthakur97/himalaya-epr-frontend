import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { SearchToolbarComponent } from '../../../shared/components/search-toolbar/search-toolbar.component';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { RoleListItem } from '../../../core/interfaces/permission.interface';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { DeleteDialogComponent } from '../../../shared/dialogs/delete-dialog/delete-dialog.component';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-role-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    DataTableComponent,
    SearchToolbarComponent,
    HasPermissionDirective,
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  private readonly service = inject(RoleService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly permissionService = inject(PermissionService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly roles = signal<RoleListItem[]>([]);
  readonly search = signal('');

  readonly createForm = this.fb.nonNullable.group({
    name: [''],
    description: [''],
  });

  readonly columns: TableColumn<RoleListItem>[] = [
    { key: 'name', header: 'Role Name' },
    { key: 'description', header: 'Description' },
    { key: 'userCount', header: 'Users', type: 'number' },
    { key: 'isActive', header: 'Status', type: 'boolean' },
    { key: 'createdAt', header: 'Created', type: 'date' },
  ];

  readonly actions = computed(() =>
    this.permissionService.filterActions<TableAction & { permission?: string }>([
      { icon: 'security', label: 'Edit Permissions', action: 'permissions', permission: 'users.edit' },
      { icon: 'content_copy', label: 'Clone', action: 'clone', permission: 'users.create' },
      { icon: 'toggle_on', label: 'Enable/Disable', action: 'toggle', permission: 'users.edit' },
      { icon: 'delete', label: 'Delete', action: 'delete', color: 'warn', permission: 'users.delete' },
    ]),
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.findAll(this.search()).subscribe({
      next: data => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.load();
  }

  createRole(): void {
    const { name, description } = this.createForm.getRawValue();
    if (!name.trim()) {
      this.snackBar.open('Role name is required', 'Dismiss', { duration: 3000 });
      return;
    }
    this.service.create({ name: name.trim(), description: description.trim() || undefined }).subscribe({
      next: role => {
        this.snackBar.open('Role created', 'Dismiss', { duration: 3000 });
        this.createForm.reset();
        this.router.navigate(['/roles', role.id, 'permissions']);
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  onAction(e: { action: string; row: RoleListItem }): void {
    switch (e.action) {
      case 'permissions':
        this.router.navigate(['/roles', e.row.id, 'permissions']);
        break;
      case 'clone':
        this.cloneRole(e.row);
        break;
      case 'toggle':
        this.toggleRole(e.row);
        break;
      case 'delete':
        this.deleteRole(e.row);
        break;
    }
  }

  private cloneRole(role: RoleListItem): void {
    const name = `${role.name} (Copy)`;
    this.service.clone(role.id, { name }).subscribe({
      next: () => {
        this.snackBar.open('Role cloned', 'Dismiss', { duration: 3000 });
        this.load();
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  private toggleRole(role: RoleListItem): void {
    const action = role.isActive ? 'deactivate' : 'activate';
    const req = role.isActive ? this.service.deactivate(role.id) : this.service.activate(role.id);
    req.subscribe({
      next: () => {
        this.snackBar.open(`Role ${action}d`, 'Dismiss', { duration: 3000 });
        this.load();
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  private deleteRole(role: RoleListItem): void {
    if (role.isSystem) {
      this.snackBar.open('System roles cannot be deleted', 'Dismiss', { duration: 3000 });
      return;
    }
    this.dialog
      .open(DeleteDialogComponent, {
        data: { message: 'Delete this role?', itemName: role.name },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.service.remove(role.id).subscribe({
          next: () => {
            this.snackBar.open('Role deleted', 'Dismiss', { duration: 3000 });
            this.load();
          },
          error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
        });
      });
  }
}
