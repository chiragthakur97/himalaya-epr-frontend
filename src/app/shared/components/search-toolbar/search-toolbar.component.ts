import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface StatusOption {
  label: string;
  value: string | boolean | null;
}

@Component({
  selector: 'app-search-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './search-toolbar.component.html',
  styleUrl: './search-toolbar.component.scss',
})
export class SearchToolbarComponent implements OnInit, OnDestroy {
  readonly searchPlaceholder = input('Search…');
  readonly showStatusFilter = input(false);
  readonly statusOptions = input<StatusOption[]>([
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ]);
  readonly showDateRange = input(false);
  readonly showModeFilter = input(false);
  readonly modeOptions = input<StatusOption[]>([]);
  readonly modeLabel = input('Mode');

  readonly searchChange = output<string>();
  readonly statusChange = output<string | boolean | null>();
  readonly modeChange = output<string | null>();
  readonly dateFromChange = output<string>();
  readonly dateToChange = output<string>();
  readonly clearFilters = output<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl<string | boolean | null>(null);
  readonly modeControl = new FormControl<string | null>(null);
  readonly dateFromControl = new FormControl<Date | null>(null);
  readonly dateToControl = new FormControl<Date | null>(null);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(v => this.searchChange.emit(v));

    this.statusControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => this.statusChange.emit(v));
    this.modeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => this.modeChange.emit(v));
    this.dateFromControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      this.dateFromChange.emit(v ? this.formatDate(v) : '');
    });
    this.dateToControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(v => {
      this.dateToChange.emit(v ? this.formatDate(v) : '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClear(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusControl.setValue(null, { emitEvent: false });
    this.modeControl.setValue(null, { emitEvent: false });
    this.dateFromControl.setValue(null, { emitEvent: false });
    this.dateToControl.setValue(null, { emitEvent: false });
    this.clearFilters.emit();
  }

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
