import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DecimalPipe } from '@angular/common';
import { CurrencyInrPipe } from '../../pipes/currency-inr.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { StatusChipComponent } from '../status-chip/status-chip.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  type?: 'text' | 'currency' | 'date' | 'status' | 'boolean' | 'number';
  cellClass?: string;
}

export interface TableAction {
  icon: string;
  label: string;
  action: string;
  color?: 'primary' | 'warn';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    DecimalPipe,
    CurrencyInrPipe,
    DateFormatPipe,
    StatusChipComponent,
    EmptyStateComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends object = object> {
  readonly columns = input.required<TableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly loading = input(false);
  readonly totalCount = input(0);
  readonly pageIndex = input(0);
  readonly pageSize = input(20);
  readonly pageSizeOptions = input([10, 20, 50]);
  readonly actions = input<TableAction[]>([]);
  readonly emptyTitle = input('No records found');
  readonly emptyDescription = input('');
  readonly clickableRows = input(false);

  readonly pageChange = output<PageEvent>();
  readonly rowClick = output<T>();
  readonly actionClick = output<{ action: string; row: T }>();

  displayedColumns(): string[] {
    const cols = this.columns().map(c => c.key);
    return this.actions().length ? [...cols, 'actions'] : cols;
  }

  cellValue(row: T, key: string): unknown {
    return key.split('.').reduce<unknown>((obj, k) => {
      if (obj && typeof obj === 'object') {
        return (obj as Record<string, unknown>)[k];
      }
      return undefined;
    }, row);
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onRowClick(row: T): void {
    if (this.clickableRows()) {
      this.rowClick.emit(row);
    }
  }

  onAction(action: string, row: T, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }
}
