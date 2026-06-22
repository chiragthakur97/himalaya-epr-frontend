import {
  DashboardSummary,
  DashboardCharts,
  DailyDataPoint,
  PaymentModeBreakdown,
} from '../interfaces/dashboard.interface';
import { formatPaymentMode } from './sales-order.util';

export function buildLast30DaysChart(charts: DashboardCharts): {
  labels: string[];
  sales: number[];
  collections: number[];
} {
  const salesMap = new Map(
    charts.sales.map(p => [normalizeDateKey(p.date), p.amount])
  );
  const collectionsMap = new Map(
    charts.collections.map(p => [normalizeDateKey(p.date), p.amount])
  );

  const labels: string[] = [];
  const sales: number[] = [];
  const collections: number[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    sales.push(salesMap.get(key) ?? 0);
    collections.push(collectionsMap.get(key) ?? 0);
  }

  return { labels, sales, collections };
}

function normalizeDateKey(date: string): string {
  return date.slice(0, 10);
}

export function formatPaymentModeLabel(mode: string): string {
  return formatPaymentMode(mode);
}

export function greetingForHour(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function hasChartActivity(points: DailyDataPoint[]): boolean {
  return points.some(p => p.amount > 0);
}
