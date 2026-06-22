import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import {
  DashboardSummary,
  DashboardCharts,
  TopCustomer,
  TopProduct,
  PaymentModeBreakdown,
  SummaryCard,
} from '../../core/interfaces/dashboard.interface';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { getUserDisplayName } from '../../core/interfaces/auth.interface';
import {
  buildLast30DaysChart,
  formatPaymentModeLabel,
  greetingForHour,
  hasChartActivity,
} from '../../core/utils/dashboard.util';
import { forkJoin } from 'rxjs';
import { extractError } from '../../core/utils/http.util';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    CurrencyInrPipe,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChart') paymentChartRef!: ElementRef<HTMLCanvasElement>;

  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);

  private salesChart: Chart<'line'> | null = null;
  private paymentChart: Chart<'doughnut'> | null = null;
  private chartsPending = false;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly topCustomers = signal<TopCustomer[]>([]);
  readonly topProducts = signal<TopProduct[]>([]);
  readonly paymentModes = signal<PaymentModeBreakdown[]>([]);
  readonly hasSalesChartData = signal(false);

  readonly featuredCards = signal<SummaryCard[]>([]);
  readonly statCards = signal<SummaryCard[]>([]);

  readonly greeting = greetingForHour();
  readonly userName = () => getUserDisplayName(this.authService.user());
  readonly formatPaymentMode = formatPaymentModeLabel;

  readonly customerColumns = ['rank', 'customer', 'orders', 'revenue'];
  readonly productColumns = ['rank', 'product', 'sold', 'revenue'];

  readonly quickActions = [
    { label: 'New Order', icon: 'add_shopping_cart', route: '/sales-orders/create', color: '#3949ab' },
    { label: 'Add Stock', icon: 'inventory', route: '/inventory', color: '#2e7d32' },
    { label: 'New Customer', icon: 'person_add', route: '/customers/create', color: '#6a1b9a' },
    { label: 'New Product', icon: 'add_box', route: '/products/create', color: '#1565c0' },
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    if (this.chartsPending) {
      this.renderCharts();
    }
  }

  ngOnDestroy(): void {
    this.salesChart?.destroy();
    this.paymentChart?.destroy();
  }

  refresh(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary: this.dashboardService.getSummary(),
      charts: this.dashboardService.getCharts(),
      topCustomers: this.dashboardService.getTopCustomers(),
      topProducts: this.dashboardService.getTopProducts(),
      paymentModes: this.dashboardService.getPaymentModes(),
    }).subscribe({
      next: data => {
        this.summary.set(data.summary);
        this.topCustomers.set(data.topCustomers);
        this.topProducts.set(data.topProducts);
        this.paymentModes.set(data.paymentModes);
        this.hasSalesChartData.set(
          hasChartActivity(data.charts.sales) || hasChartActivity(data.charts.collections)
        );
        this.buildSummaryCards(data.summary);
        this.loading.set(false);
        this.cdr.detectChanges();

        this.chartsPending = true;
        setTimeout(() => {
          this.renderCharts(data.charts, data.paymentModes);
          this.chartsPending = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(extractError(err));
        this.cdr.detectChanges();
      },
    });
  }

  private buildSummaryCards(s: DashboardSummary): void {
    this.featuredCards.set([
      {
        title: "Today's Sales",
        value: s.todaySales,
        icon: 'point_of_sale',
        color: '#fff',
        gradient: 'linear-gradient(135deg, #3949ab 0%, #5c6bc0 100%)',
        prefix: '₹',
        featured: true,
      },
      {
        title: "Today's Collections",
        value: s.todayCollections,
        icon: 'account_balance',
        color: '#fff',
        gradient: 'linear-gradient(135deg, #00897b 0%, #26a69a 100%)',
        prefix: '₹',
        featured: true,
      },
      {
        title: 'Monthly Sales',
        value: s.monthlySales,
        subtitle: `Collections this month: ₹${s.monthlyCollections.toLocaleString('en-IN')}`,
        icon: 'trending_up',
        color: '#fff',
        gradient: 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%)',
        prefix: '₹',
        featured: true,
      },
      {
        title: 'Outstanding Due',
        value: s.outstandingAmount,
        icon: 'account_balance_wallet',
        color: '#fff',
        gradient: 'linear-gradient(135deg, #e65100 0%, #fb8c00 100%)',
        prefix: '₹',
        featured: true,
        route: '/sales-orders',
      },
    ]);

    this.statCards.set([
      {
        title: 'Active Customers',
        value: s.totalCustomers,
        icon: 'groups',
        color: '#3949ab',
        route: '/customers',
      },
      {
        title: 'Active Products',
        value: s.totalProducts,
        icon: 'inventory_2',
        color: '#1565c0',
        route: '/products',
      },
      {
        title: 'Low Stock Items',
        value: s.lowStockCount,
        icon: 'production_quantity_limits',
        color: '#c62828',
        route: '/inventory',
      },
      {
        title: 'Pending Orders',
        value: s.pendingOrders,
        icon: 'pending_actions',
        color: '#f57f17',
        route: '/sales-orders',
      },
    ]);
  }

  private renderCharts(
    charts?: DashboardCharts,
    modes: PaymentModeBreakdown[] = this.paymentModes()
  ): void {
    if (charts) {
      this.renderSalesChart(charts);
    }
    this.renderPaymentChart(modes);
  }

  private renderSalesChart(charts: DashboardCharts): void {
    if (!this.salesChartRef?.nativeElement) return;
    this.salesChart?.destroy();

    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const series = buildLast30DaysChart(charts);
    const cfg: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: series.labels,
        datasets: [
          {
            label: 'Sales',
            data: series.sales,
            borderColor: '#3949ab',
            backgroundColor: 'rgba(57, 73, 171, 0.12)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#3949ab',
          },
          {
            label: 'Collections',
            data: series.collections,
            borderColor: '#00897b',
            backgroundColor: 'rgba(0, 137, 123, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#00897b',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: { usePointStyle: true, boxWidth: 8, padding: 16 },
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ₹${Number(ctx.raw).toLocaleString('en-IN')}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 8, font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: {
              font: { size: 11 },
              callback: v => '₹' + Number(v).toLocaleString('en-IN'),
            },
          },
        },
      },
    };
    this.salesChart = new Chart(ctx, cfg);
  }

  private renderPaymentChart(modes: PaymentModeBreakdown[]): void {
    if (!this.paymentChartRef?.nativeElement || !modes.length) return;
    this.paymentChart?.destroy();

    const ctx = this.paymentChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = ['#3949ab', '#00897b', '#fb8c00', '#e53935', '#8e24aa', '#1e88e5', '#6d4c41'];
    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: modes.map(m => formatPaymentModeLabel(m.paymentMode)),
        datasets: [{
          data: modes.map(m => m.total),
          backgroundColor: colors.slice(0, modes.length),
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const m = modes[ctx.dataIndex];
                return ` ₹${m.total.toLocaleString('en-IN')} (${m.percentage.toFixed(1)}%)`;
              },
            },
          },
        },
      },
    };
    this.paymentChart = new Chart(ctx, cfg);
  }
}
