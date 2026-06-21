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

export type UpdateCustomerDto = Partial<Omit<CreateCustomerDto, 'openingBalance'>>;

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
  isActive?: boolean;
}

export interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  type: string;
  debit: number;
  credit: number;
  balance: number;
}
