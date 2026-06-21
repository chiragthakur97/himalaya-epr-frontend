import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatCardModule, DecimalPipe],
  template: `
    <mat-card class="summary-card" [style.--card-color]="color()">
      <mat-card-content>
        <div class="card-icon-wrap">
          <mat-icon>{{ icon() }}</mat-icon>
        </div>
        <div class="card-info">
          <span class="card-label">{{ title() }}</span>
          <span class="card-value">
            @if (prefix()) { <span class="card-prefix">{{ prefix() }}</span> }
            {{ value() | number }}
            @if (suffix()) { <span class="card-suffix">{{ suffix() }}</span> }
          </span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .summary-card {
      border-radius: 12px !important;
      border-left: 4px solid var(--card-color) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,.06) !important;
    }
    mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }
    .card-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: color-mix(in srgb, var(--card-color) 12%, white);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    mat-icon { color: var(--card-color); }
    .card-label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 20px;
      font-weight: 700;
      color: #1a237e;
    }
    .card-prefix, .card-suffix { font-size: 16px; }
  `,
})
export class SummaryCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<number | string>();
  readonly icon = input('analytics');
  readonly color = input('#3949ab');
  readonly prefix = input('');
  readonly suffix = input('');
}
