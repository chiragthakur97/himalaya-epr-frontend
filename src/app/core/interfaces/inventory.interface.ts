export interface InventoryHistoryItem {
  id: string;
  productId: string;
  transactionType: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType: string;
  referenceId: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface InventoryHistoryRow extends InventoryHistoryItem {
  typeLabel: string;
  referenceLabel: string;
}

export interface AddStockDto {
  productId: string;
  quantity: number;
  remarks?: string;
}

export interface RemoveStockDto {
  productId: string;
  quantity: number;
  remarks?: string;
}

export interface AdjustStockDto {
  productId: string;
  newQuantity: number;
  remarks?: string;
}

export interface InventoryHistoryParams {
  page?: number;
  limit?: number;
}
