import { PaginationParams } from './api.interface';

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  mobile: string;
  alternateMobile: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  creditLimit: number;
  outstandingBalance: number;
  isActive: boolean;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  creditLimit?: number;
  openingBalance?: number;
  notes?: string;
  isActive?: boolean;
}

export type UpdateCustomerDto = Partial<
  Omit<CreateCustomerDto, 'openingBalance' | 'alternateMobile' | 'email' | 'address' | 'gstNumber' | 'notes'>
> & {
  alternateMobile?: string | null;
  email?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
};

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

export interface LedgerQueryParams extends PaginationParams {
  dateFrom?: string;
  dateTo?: string;
}

export type LedgerReferenceType = 'OPENING_BALANCE' | 'ORDER' | 'PAYMENT' | 'ADJUSTMENT';

export interface LedgerEntry {
  id: string;
  customerId: string;
  referenceType: LedgerReferenceType;
  referenceId: string | null;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  createdAt: string;
  createdBy?: string | null;
}
