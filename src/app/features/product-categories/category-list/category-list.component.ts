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
import { CategoryService } from '../../../core/services/category.service';
import { ProductCategory } from '../../../core/interfaces/category.interface';
import { DeleteDialogComponent } from '../../../shared/dialogs/delete-dialog/delete-dialog.component';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-category-list',
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
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly service = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly categories = signal<ProductCategory[]>([]);

  readonly columns: TableColumn<ProductCategory>[] = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'isActive', header: 'Status', type: 'boolean' },
  ];

  readonly actions: TableAction[] = [
    { icon: 'edit', label: 'Edit', action: 'edit' },
    { icon: 'delete', label: 'Delete', action: 'delete', color: 'warn' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.findAll().subscribe({
      next: data => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  onAction(event: { action: string; row: ProductCategory }): void {
    if (event.action === 'edit') {
      this.router.navigate(['/product-categories', event.row.id, 'edit']);
    } else if (event.action === 'delete') {
      this.deleteCategory(event.row);
    }
  }

  deleteCategory(category: ProductCategory): void {
    this.dialog
      .open(DeleteDialogComponent, {
        data: {
          title: 'Delete Category',
          message: 'Are you sure you want to delete this category? Products using it may be affected.',
          itemName: category.name,
          confirmLabel: 'Delete',
        },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.service.delete(category.id).subscribe({
          next: () => {
            this.snackBar.open('Category deleted', 'Dismiss', { duration: 3000 });
            this.load();
          },
          error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
        });
      });
  }
}
