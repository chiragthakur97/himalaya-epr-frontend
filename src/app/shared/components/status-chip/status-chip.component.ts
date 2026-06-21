import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule, NgClass],
  template: `
    <span class="status-chip" [ngClass]="chipClass()">{{ label() }}</span>
  `,
  styles: `
    .status-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .chip-success { background: #e8f5e9; color: #2e7d32; }
    .chip-warning { background: #fff8e1; color: #f57f17; }
    .chip-danger  { background: #ffebee; color: #c62828; }
    .chip-info    { background: #e8eaf6; color: #3949ab; }
    .chip-neutral { background: #f3f4f6; color: #6b7280; }
    .chip-purple  { background: #f3e5f5; color: #6a1b9a; }
    .chip-teal    { background: #e0f2f1; color: #00695c; }
    .chip-orange  { background: #fff3e0; color: #e65100; }
  `,
})
export class StatusChipComponent {
  readonly status = input.required<string>();

  label(): string {
    return this.status().replace(/_/g, ' ');
  }

  chipClass(): string {
    const s = this.status().toUpperCase();
    const map: Record<string, string> = {
      ACTIVE: 'chip-success',
      INACTIVE: 'chip-neutral',
      PAID: 'chip-success',
      UNPAID: 'chip-danger',
      PARTIALLY_PAID: 'chip-warning',
      CONFIRMED: 'chip-info',
      DRAFT: 'chip-neutral',
      DELIVERED: 'chip-success',
      CANCELLED: 'chip-danger',
      OPENING_STOCK: 'chip-purple',
      STOCK_IN: 'chip-success',
      SALE: 'chip-info',
      ADJUSTMENT: 'chip-orange',
      MANUAL: 'chip-neutral',
      ORDER: 'chip-info',
      PURCHASE: 'chip-teal',
    };
    return map[s] ?? 'chip-neutral';
  }
}
