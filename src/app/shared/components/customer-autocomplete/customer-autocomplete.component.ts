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
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/interfaces/customer.interface';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-customer-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [formControl]="control" [matAutocomplete]="auto" [placeholder]="placeholder()" />
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn" (optionSelected)="onSelect($event.option.value)">
        @for (c of customers(); track c.id) {
          <mat-option [value]="c">
            {{ c.name }} ({{ c.customerCode }}) — {{ c.mobile }}
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `.full-width { width: 100%; }`,
})
export class CustomerAutocompleteComponent implements OnInit {
  readonly label = input('Customer');
  readonly placeholder = input('Search customer…');
  readonly initialCustomerId = input<string | null>(null);

  readonly customerSelected = output<Customer>();

  private readonly service = inject(CustomerService);
  readonly customers = signal<Customer[]>([]);
  readonly control = new FormControl<string | Customer>('');

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
      .subscribe(res => this.customers.set(res.data));

    const id = this.initialCustomerId();
    if (id) {
      this.service.findOne(id).subscribe(c => this.control.setValue(c, { emitEvent: false }));
    }
  }

  displayFn(customer: Customer | string): string {
    return typeof customer === 'string' ? customer : `${customer.name} (${customer.customerCode})`;
  }

  onSelect(customer: Customer): void {
    this.customerSelected.emit(customer);
  }
}
