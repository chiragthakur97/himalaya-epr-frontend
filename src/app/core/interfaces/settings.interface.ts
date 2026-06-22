export interface CompanySettings {
  id: string;
  companyName: string;
  ownerName: string;
  tagline: string | null;
  mobile: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  website: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  invoicePrefix: string;
  invoiceFooterNote: string | null;
  defaultGstRate: number;
  showQrOnInvoice: boolean;
  upiId: string | null;
  upiQrUrl: string | null;
  logoUrl: string | null;
  signatureUrl: string | null;
  stampUrl: string | null;
  primaryColor: string | null;
  invoiceTerms: string[] | null;
  erpVersion: string;
  dateFormat: string;
  currency: string;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string | null;
  accountType: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanySettingsBundle {
  settings: CompanySettings;
  bankAccounts: BankAccount[];
}

export type SettingsAssetType = 'logo' | 'signature' | 'stamp' | 'qr';

export type UpdateSettingsPayload = Partial<
  Omit<CompanySettings, 'id' | 'createdAt' | 'updatedAt'>
>;

export interface CreateBankAccountPayload {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountType?: string;
  isPrimary?: boolean;
}

export type UpdateBankAccountPayload = Partial<
  CreateBankAccountPayload & { isActive: boolean }
>;
