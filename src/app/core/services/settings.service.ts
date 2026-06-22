import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BankAccount,
  CompanySettings,
  CompanySettingsBundle,
  CreateBankAccountPayload,
  SettingsAssetType,
  UpdateBankAccountPayload,
  UpdateSettingsPayload,
} from '../interfaces/settings.interface';
import { environment } from '../../../environments/environment';
import { unwrapData } from '../utils/http.util';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/settings`;

  getAll() {
    return this.http
      .get<CompanySettingsBundle | { data: CompanySettingsBundle }>(this.base)
      .pipe(unwrapData<CompanySettingsBundle>());
  }

  update(payload: UpdateSettingsPayload) {
    return this.http
      .patch<CompanySettings | { data: CompanySettings }>(this.base, payload)
      .pipe(unwrapData<CompanySettings>());
  }

  listBankAccounts() {
    return this.http
      .get<BankAccount[] | { data: BankAccount[] }>(`${this.base}/bank-accounts`)
      .pipe(unwrapData<BankAccount[]>());
  }

  createBankAccount(payload: CreateBankAccountPayload) {
    return this.http
      .post<BankAccount | { data: BankAccount }>(`${this.base}/bank-accounts`, payload)
      .pipe(unwrapData<BankAccount>());
  }

  updateBankAccount(id: string, payload: UpdateBankAccountPayload) {
    return this.http
      .patch<BankAccount | { data: BankAccount }>(`${this.base}/bank-accounts/${id}`, payload)
      .pipe(unwrapData<BankAccount>());
  }

  deleteBankAccount(id: string) {
    return this.http.delete(`${this.base}/bank-accounts/${id}`);
  }

  uploadAsset(type: SettingsAssetType, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ url: string; settings: CompanySettings } | { data: { url: string; settings: CompanySettings } }>(
        `${this.base}/assets/${type}`,
        formData,
      )
      .pipe(unwrapData<{ url: string; settings: CompanySettings }>());
  }

  assetUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const origin = environment.apiUrl.replace(/\/api\/v1$/, '');
    return `${origin}${path}`;
  }
}
