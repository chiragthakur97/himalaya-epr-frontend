import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product.interface';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-product-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [formControl]="control"
        [matAutocomplete]="auto"
        [placeholder]="placeholder()"
      />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onSelect($event.option.value)">
        @for (p of products(); track p.id) {
          <mat-option [value]="p">
            {{ p.name }} ({{ p.productCode }}) — Stock: {{ p.currentStock }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `.full-width { width: 100%; }`,
})
export class ProductAutocompleteComponent implements OnInit {
  readonly label = input('Product');
  readonly placeholder = input('Search product…');
  readonly initialProductId = input<string | null>(null);

  readonly productSelected = output<Product>();

  private readonly service = inject(ProductService);
  readonly products = signal<Product[]>([]);
  readonly control = new FormControl<string | Product>('');

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(v => {
          const search = typeof v === 'string' ? v : v?.name ?? '';
          if (!search || search.length < 1) return of({ data: [], meta: { total: 0, page: 1, limit: 20 } });
          return this.service.findAll({ search, limit: 20, isActive: true });
        })
      )
      .subscribe(res => this.products.set(res.data));

    const id = this.initialProductId();
    if (id) {
      this.service.findOne(id).subscribe(p => {
        this.control.setValue(p, { emitEvent: false });
        this.productSelected.emit(p);
      });
    }
  }

  displayFn(product: Product | string): string {
    return typeof product === 'string' ? product : `${product.name} (${product.productCode})`;
  }

  onSelect(product: Product): void {
    this.productSelected.emit(product);
  }

  clearSelection(): void {
    this.control.setValue('', { emitEvent: false });
    this.products.set([]);
  }
}
