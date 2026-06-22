import { InventoryHistoryItem } from '../interfaces/inventory.interface';

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  OPENING_STOCK: 'Opening Stock',
  STOCK_IN: 'Stock In',
  STOCK_OUT: 'Stock Out',
  SALE: 'Sale',
  ADJUSTMENT: 'Physical Count',
  RETURN: 'Return',
};

export const REFERENCE_TYPE_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  ORDER: 'Sales Order',
  PURCHASE: 'Purchase',
  ADJUSTMENT: 'Physical Count',
};

export function formatTransactionType(type: string): string {
  return TRANSACTION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ');
}

export function formatInventoryReference(item: Pick<InventoryHistoryItem, 'referenceType' | 'referenceId'>): string {
  const label = REFERENCE_TYPE_LABELS[item.referenceType] ?? item.referenceType;
  if (item.referenceId) {
    return `${label} (${item.referenceId.slice(0, 8)}…)`;
  }
  return label;
}

export function mapInventoryHistoryRow(item: InventoryHistoryItem) {
  return {
    ...item,
    typeLabel: formatTransactionType(item.transactionType),
    referenceLabel: formatInventoryReference(item),
  };
}
