import { PaginationParams } from './api.interface';

export interface CategoryRef {
  id: string;
  name: string;
}

export interface UnitRef {
  id: string;
  name: string;
  symbol?: string;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  sku: string | null;
  categoryId: string;
  category?: CategoryRef;
  unitId: string;
  unit?: UnitRef;
  brand: string | null;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  gstPercentage: number;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  sku?: string;
  categoryId: string;
  unitId: string;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  minimumStock?: number;
  gstPercentage?: number;
  openingStock?: number;
  description?: string;
  isActive?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductQueryParams extends PaginationParams {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface InventoryHistoryEntry {
  id: string;
  date: string;
  transactionType: string;
  quantity: number;
  reference: string | null;
  remarks: string | null;
  product?: { id: string; name: string; productCode?: string };
}
