import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AssetUploadComponent } from '../../../shared/components/asset-upload/asset-upload.component';
import { SettingsService } from '../../../core/services/settings.service';
import { PermissionService } from '../../../core/services/permission.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { BankAccount, CompanySettings } from '../../../core/interfaces/settings.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-settings-hub',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule,
    MatCheckboxModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    AssetUploadComponent,
    HasPermissionDirective,
  ],
  templateUrl: './settings-hub.component.html',
  styleUrl: './settings-hub.component.scss',
})
export class SettingsHubComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(SettingsService);
  private readonly permissionService = inject(PermissionService);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly settings = signal<CompanySettings | null>(null);
  readonly bankAccounts = signal<BankAccount[]>([]);
  readonly bankColumns = ['bankName', 'accountNumber', 'ifscCode', 'isPrimary', 'actions'];

  readonly companyForm = this.fb.nonNullable.group({
    companyName: ['', Validators.required],
    ownerName: ['', Validators.required],
    tagline: [''],
    mobile: ['', Validators.required],
    email: [''],
    address: [''],
    city: [''],
    state: [''],
    pinCode: [''],
    website: [''],
    gstNumber: [''],
    panNumber: [''],
  });

  readonly invoiceForm = this.fb.nonNullable.group({
    invoicePrefix: ['HT', Validators.required],
    invoiceFooterNote: [''],
    defaultGstRate: [18, [Validators.required, Validators.min(0)]],
    showQrOnInvoice: [true],
  });

  readonly upiForm = this.fb.nonNullable.group({
    upiId: [''],
  });

  readonly brandingForm = this.fb.nonNullable.group({
    primaryColor: ['#1e3a5f'],
  });

  readonly termsForm = this.fb.nonNullable.group({
    invoiceTerms: [''],
  });

  readonly systemForm = this.fb.nonNullable.group({
    erpVersion: ['Himalaya ERP v1.0'],
    dateFormat: ['dd-MMM-yyyy'],
    currency: ['INR'],
    timezone: ['Asia/Kolkata'],
  });

  readonly bankForm = this.fb.nonNullable.group({
    bankName: ['', Validators.required],
    accountHolderName: ['', Validators.required],
    accountNumber: ['', Validators.required],
    ifscCode: ['', Validators.required],
    branchName: [''],
    accountType: ['Current'],
    isPrimary: [false],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: bundle => {
        this.settings.set(bundle.settings);
        this.bankAccounts.set(bundle.bankAccounts);
        this.patchForms(bundle.settings);
        this.applyReadOnlyForms();
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  private patchForms(s: CompanySettings): void {
    this.companyForm.patchValue({
      companyName: s.companyName,
      ownerName: s.ownerName,
      tagline: s.tagline ?? '',
      mobile: s.mobile,
      email: s.email ?? '',
      address: s.address ?? '',
      city: s.city ?? '',
      state: s.state ?? '',
      pinCode: s.pinCode ?? '',
      website: s.website ?? '',
      gstNumber: s.gstNumber ?? '',
      panNumber: s.panNumber ?? '',
    });
    this.invoiceForm.patchValue({
      invoicePrefix: s.invoicePrefix,
      invoiceFooterNote: s.invoiceFooterNote ?? '',
      defaultGstRate: s.defaultGstRate ?? 18,
      showQrOnInvoice: s.showQrOnInvoice ?? true,
    });
    this.upiForm.patchValue({ upiId: s.upiId ?? '' });
    this.brandingForm.patchValue({ primaryColor: s.primaryColor ?? '#1e3a5f' });
    this.termsForm.patchValue({
      invoiceTerms: (s.invoiceTerms ?? []).join('\n'),
    });
    this.systemForm.patchValue({
      erpVersion: s.erpVersion,
      dateFormat: s.dateFormat,
      currency: s.currency,
      timezone: s.timezone,
    });
  }

  private applyReadOnlyForms(): void {
    if (this.permissionService.has('settings.edit')) return;
    [
      this.companyForm,
      this.invoiceForm,
      this.upiForm,
      this.brandingForm,
      this.termsForm,
      this.systemForm,
      this.bankForm,
    ].forEach(form => form.disable({ emitEvent: false }));
  }

  saveCompany(): void {
    if (this.companyForm.invalid) return;
    this.saveSection(this.companyForm.getRawValue());
  }

  saveInvoice(): void {
    if (this.invoiceForm.invalid) return;
    this.saveSection(this.invoiceForm.getRawValue());
  }

  saveUpi(): void {
    this.saveSection(this.upiForm.getRawValue());
  }

  saveBranding(): void {
    this.saveSection(this.brandingForm.getRawValue());
  }

  saveTerms(): void {
    const raw = this.termsForm.getRawValue().invoiceTerms;
    const invoiceTerms = raw
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);
    this.saveSection({ invoiceTerms });
  }

  saveSystem(): void {
    if (this.systemForm.invalid) return;
    this.saveSection(this.systemForm.getRawValue());
  }

  private saveSection(payload: Record<string, unknown>): void {
    this.saving.set(true);
    this.service.update(payload).subscribe({
      next: settings => {
        this.settings.set(settings);
        this.saving.set(false);
        this.snackBar.open('Settings saved', 'Dismiss', { duration: 3000 });
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  onAssetUploaded(field: 'logoUrl' | 'signatureUrl' | 'stampUrl' | 'upiQrUrl', url: string): void {
    const current = this.settings();
    if (current) this.settings.set({ ...current, [field]: url });
  }

  addBankAccount(): void {
    if (this.bankForm.invalid) return;
    this.saving.set(true);
    this.service.createBankAccount(this.bankForm.getRawValue()).subscribe({
      next: account => {
        this.bankAccounts.update(list => [...list, account]);
        this.bankForm.reset({ accountType: 'Current', isPrimary: false });
        this.saving.set(false);
        this.snackBar.open('Bank account added', 'Dismiss', { duration: 3000 });
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  deleteBankAccount(id: string): void {
    this.service.deleteBankAccount(id).subscribe({
      next: () => {
        this.bankAccounts.update(list => list.filter(a => a.id !== id));
        this.snackBar.open('Bank account removed', 'Dismiss', { duration: 3000 });
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  assetUrl(path: string | null | undefined): string | null {
    return this.service.assetUrl(path);
  }
}
