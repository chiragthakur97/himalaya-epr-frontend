export interface DashboardSummary {
  today_sales: number;
  monthly_sales: number;
  today_collections: number;
  outstanding_amount: number;
  customer_count: number;
  product_count: number;
  low_stock_count: number;
  pending_orders: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardCharts {
  sales_trend: ChartData;
  collection_trend?: ChartData;
}

export interface TopCustomer {
  id: number;
  name: string;
  total_purchases: number;
  total_paid: number;
  outstanding: number;
}

export interface TopProduct {
  id: number;
  name: string;
  sku: string;
  quantity_sold: number;
  total_revenue: number;
  current_stock: number;
}

export interface PaymentMode {
  mode: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface SummaryCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  prefix?: string;
  suffix?: string;
  trend?: number;
}
