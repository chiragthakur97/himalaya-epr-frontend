import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteDialogData {
  title?: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
}

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">warning</mat-icon>
      {{ data.title ?? 'Confirm Deactivation' }}
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      @if (data.itemName) {
        <p class="item-name"><strong>{{ data.itemName }}</strong></p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">
        {{ data.confirmLabel ?? 'Deactivate' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2 { display: flex; align-items: center; gap: 8px; }
    p { margin: 0 0 8px; color: #374151; }
    .item-name { color: #c62828; }
  `,
})
export class DeleteDialogComponent {
  readonly data = inject<DeleteDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent, boolean>);
}
