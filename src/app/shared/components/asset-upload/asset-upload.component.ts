import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingsService } from '../../../core/services/settings.service';
import { SettingsAssetType } from '../../../core/interfaces/settings.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-asset-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="asset-upload">
      @if (previewUrl()) {
        <img [src]="previewUrl()!" [alt]="label()" class="preview" />
      } @else {
        <div class="placeholder">
          <mat-icon>image</mat-icon>
          <span>No {{ label() }} uploaded</span>
        </div>
      }
      <div class="actions">
        <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />
        <button mat-stroked-button type="button" [disabled]="uploading()" (click)="fileInput.click()">
          @if (uploading()) {
            <mat-spinner diameter="18" />
          } @else {
            <mat-icon>upload</mat-icon>
          }
          Upload {{ label() }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .asset-upload {
      display: grid;
      gap: 0.75rem;
    }
    .preview {
      max-width: 180px;
      max-height: 100px;
      object-fit: contain;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 0.35rem;
      background: #fff;
    }
    .placeholder {
      width: 180px;
      height: 100px;
      border: 1px dashed #d1d5db;
      border-radius: 6px;
      display: grid;
      place-content: center;
      gap: 0.25rem;
      color: #9ca3af;
      font-size: 0.75rem;
      text-align: center;
    }
    .actions button {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
  `,
})
export class AssetUploadComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly assetType = input.required<SettingsAssetType>();
  readonly label = input<string>('Image');
  readonly currentUrl = input<string | null>(null);

  readonly uploaded = output<string>();

  readonly uploading = signal(false);
  readonly previewUrl = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.previewUrl.set(this.settingsService.assetUrl(this.currentUrl()));
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.settingsService.uploadAsset(this.assetType(), file).subscribe({
      next: (res: { url: string }) => {
        const url = this.settingsService.assetUrl(res.url);
        this.previewUrl.set(url);
        this.uploaded.emit(res.url);
        this.uploading.set(false);
        this.snackBar.open(`${this.label()} uploaded`, 'Dismiss', { duration: 3000 });
        input.value = '';
      },
      error: (err: unknown) => {
        this.uploading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        input.value = '';
      },
    });
  }
}
