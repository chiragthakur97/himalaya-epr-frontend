import { PaginationParams } from './api.interface';
import { PaymentMode } from './sales-order.interface';

export interface Payment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customer?: { id: string; name: string; customerCode?: string };
  salesOrderId: string | null;
  salesOrder?: { id: string; orderNumber: string };
  amount: number;
  paymentMode: PaymentMode;
  transactionReference: string | null;
  notes: string | null;
  paymentDate: string;
  createdAt?: string;
}

export interface CreatePaymentDto {
  customerId: string;
  salesOrderId?: string;
  amount: number;
  paymentMode: PaymentMode;
  transactionReference?: string;
  notes?: string;
}

export interface PaymentQueryParams extends PaginationParams {
  customerId?: string;
  salesOrderId?: string;
  paymentMode?: PaymentMode;
  dateFrom?: string;
  dateTo?: string;
}
