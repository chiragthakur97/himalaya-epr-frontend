import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-spinner" [class.fullscreen]="fullscreen()">
      <mat-spinner [diameter]="diameter()" />
      @if (message()) {
        <p>{{ message() }}</p>
      }
    </div>
  `,
  styles: `
    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 48px 24px;
      color: #6b7280;
      font-size: 14px;
    }
    .loading-spinner.fullscreen {
      min-height: 320px;
    }
  `,
})
export class LoadingSpinnerComponent {
  readonly message = input('Loading…');
  readonly diameter = input(48);
  readonly fullscreen = input(true);
}
