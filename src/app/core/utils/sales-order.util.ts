import { OrderStatus, PaymentMode, PaymentStatus } from '../interfaces/sales-order.interface';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Draft',
  CONFIRMED: 'Confirmed',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Unpaid',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: 'Cash',
  GPAY: 'Google Pay',
  PHONEPE: 'PhonePe',
  PAYTM: 'Paytm',
  CARD: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
  OTHER: 'Other',
};

export function formatOrderStatus(status: OrderStatus | string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? String(status).replace(/_/g, ' ');
}

export function formatPaymentMode(mode: PaymentMode | string): string {
  return PAYMENT_MODE_LABELS[mode as PaymentMode] ?? String(mode).replace(/_/g, ' ');
}

export function todayDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDateForApi(date: Date | string): string {
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid order date');
  }
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
