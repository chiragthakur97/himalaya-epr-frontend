import { PaginationParams } from './api.interface';

export type InventoryReferenceType = 'MANUAL' | 'ORDER' | 'PURCHASE' | 'ADJUSTMENT';

export interface AddStockDto {
  productId: string;
  quantity: number;
  referenceType?: InventoryReferenceType;
  referenceId?: string;
  remarks?: string;
}

export interface RemoveStockDto {
  productId: string;
  quantity: number;
  referenceType?: InventoryReferenceType;
  referenceId?: string;
  remarks?: string;
}

export interface AdjustStockDto {
  productId: string;
  newQuantity: number;
  remarks?: string;
}

export interface InventoryHistoryItem {
  id: string;
  date: string;
  productId: string;
  product?: { id: string; name: string; productCode?: string; sku?: string };
  transactionType: string;
  quantity: number;
  reference: string | null;
  remarks: string | null;
}

export interface InventoryHistoryParams extends PaginationParams {
  productId?: string;
}
