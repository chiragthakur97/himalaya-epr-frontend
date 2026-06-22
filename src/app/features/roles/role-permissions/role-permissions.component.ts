import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { RoleService } from '../../../core/services/role.service';
import { PermissionMatrixModule, RoleDetail } from '../../../core/interfaces/permission.interface';
import { normalizeMatrixSelection } from '../../../core/utils/permission.util';
import { extractError } from '../../../core/utils/http.util';

type MatrixAction = 'view' | 'create' | 'edit' | 'delete';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './role-permissions.component.html',
  styleUrl: './role-permissions.component.scss',
})
export class RolePermissionsComponent implements OnInit {
  private readonly service = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly role = signal<RoleDetail | null>(null);
  readonly matrix = signal<PermissionMatrixModule[]>([]);
  readonly selectedKeys = signal<Set<string>>(new Set());

  private roleId = '';

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.roleId) {
      this.router.navigate(['/roles']);
      return;
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getMatrix().subscribe({
      next: matrix => {
        this.matrix.set(matrix);
        this.service.findOne(this.roleId).subscribe({
          next: role => {
            this.role.set(role);
            this.selectedKeys.set(new Set(role.permissionKeys));
            this.loading.set(false);
          },
          error: err => {
            this.loading.set(false);
            this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
            this.router.navigate(['/roles']);
          },
        });
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  isChecked(mod: PermissionMatrixModule, action: MatrixAction): boolean {
    const key = mod.permissions[action]?.key;
    return key ? this.selectedKeys().has(key) : false;
  }

  isActionAvailable(mod: PermissionMatrixModule, action: MatrixAction): boolean {
    return !!mod.permissions[action];
  }

  toggle(mod: PermissionMatrixModule, action: MatrixAction, checked: boolean): void {
    const key = mod.permissions[action]?.key;
    if (!key) return;

    const next = new Set(this.selectedKeys());

    if (checked) {
      next.add(key);
    } else {
      next.delete(key);
      if (action === 'view') {
        (['create', 'edit', 'delete'] as MatrixAction[]).forEach(a => {
          const k = mod.permissions[a]?.key;
          if (k) next.delete(k);
        });
      }
    }

    const normalized = normalizeMatrixSelection(this.matrix(), [...next]);
    this.selectedKeys.set(new Set(normalized));
  }

  save(): void {
    this.saving.set(true);
    const keys = [...this.selectedKeys()];
    this.service.updatePermissions(this.roleId, keys).subscribe({
      next: role => {
        this.role.set(role);
        this.selectedKeys.set(new Set(role.permissionKeys));
        this.saving.set(false);
        this.snackBar.open('Permissions saved', 'Dismiss', { duration: 3000 });
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
