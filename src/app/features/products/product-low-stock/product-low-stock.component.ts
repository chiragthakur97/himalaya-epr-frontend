import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-product-low-stock',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    DataTableComponent,
  ],
  templateUrl: './product-low-stock.component.html',
  styleUrl: './product-low-stock.component.scss',
})
export class ProductLowStockComponent implements OnInit {
  private readonly service = inject(ProductService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly products = signal<Product[]>([]);

  readonly columns: TableColumn<Product>[] = [
    { key: 'productCode', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'currentStock', header: 'Current Stock', type: 'number', cellClass: 'text-danger' },
    { key: 'minimumStock', header: 'Min Stock', type: 'number' },
    { key: 'brand', header: 'Brand' },
  ];

  ngOnInit(): void {
    this.service.getLowStock().subscribe({
      next: data => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }
}
