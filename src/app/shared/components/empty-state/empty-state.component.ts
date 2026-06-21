import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      @if (description()) {
        <p>{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      color: #6b7280;
    }
    mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #c0c0d0;
      margin-bottom: 12px;
    }
    h3 {
      margin: 0 0 8px;
      color: #374151;
      font-size: 16px;
      font-weight: 600;
    }
    p {
      margin: 0 0 16px;
      font-size: 14px;
      max-width: 360px;
    }
  `,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('No data found');
  readonly description = input('');
}
