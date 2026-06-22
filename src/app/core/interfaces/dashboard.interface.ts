export interface DashboardSummary {
  todaySales: number;
  monthlySales: number;
  todayCollections: number;
  monthlyCollections: number;
  outstandingAmount: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
}

export interface DailyDataPoint {
  date: string;
  amount: number;
}

export interface DashboardCharts {
  sales: DailyDataPoint[];
  collections: DailyDataPoint[];
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  customerCode: string;
  totalRevenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productCode: string;
  totalSold: number;
  totalRevenue: number;
}

export interface PaymentModeBreakdown {
  paymentMode: string;
  total: number;
  count: number;
  percentage: number;
}

export interface SummaryCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  gradient?: string;
  prefix?: string;
  subtitle?: string;
  route?: string;
  featured?: boolean;
}
