import { PaginationParams } from './api.interface';

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
export type PaymentMode = 'CASH' | 'GPAY' | 'PHONEPE' | 'PAYTM' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';

export interface SalesOrderItem {
  id?: string;
  productId: string;
  product?: { id: string; name: string; sku?: string; productCode?: string; currentStock?: number };
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface SalesOrderPayment {
  id: string;
  amount: number;
  paymentMode: PaymentMode;
  transactionReference?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: { id: string; name: string; mobile?: string; customerCode?: string };
  orderDate: string;
  items: SalesOrderItem[];
  payments?: SalesOrderPayment[];
  subtotal?: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderPaymentDto {
  amount: number;
  paymentMode: PaymentMode;
  transactionReference?: string;
  notes?: string;
}

export interface CreateSalesOrderDto {
  customerId: string;
  items: CreateOrderItemDto[];
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  orderDate?: string;
  orderStatus?: OrderStatus;
  payment?: CreateOrderPaymentDto;
}

export interface UpdateOrderStatusDto {
  orderStatus: OrderStatus;
  notes?: string;
}

export interface SalesOrderQueryParams extends PaginationParams {
  search?: string;
  customerId?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesReportSummary {
  totalSales?: number;
  totalOrders?: number;
  totalCollections?: number;
  outstandingAmount?: number;
}
