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
import { DecimalPipe, NgClass } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import {
  DashboardSummary,
  DashboardCharts,
  TopCustomer,
  TopProduct,
  PaymentMode,
  SummaryCard,
} from '../../core/interfaces/dashboard.interface';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    NgClass,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('salesChart')   salesChartRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChart') paymentChartRef!: ElementRef<HTMLCanvasElement>;

  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  private salesChart:   Chart | null = null;
  private paymentChart: Chart | null = null;

  readonly loading    = signal(true);
  readonly error      = signal<string | null>(null);

  readonly summary     = signal<DashboardSummary | null>(null);
  readonly charts      = signal<DashboardCharts | null>(null);
  readonly topCustomers = signal<TopCustomer[]>([]);
  readonly topProducts  = signal<TopProduct[]>([]);
  readonly paymentModes = signal<PaymentMode[]>([]);

  readonly summaryCards = signal<SummaryCard[]>([]);

  readonly customerColumns = ['rank', 'name', 'total_purchases', 'total_paid', 'outstanding'];
  readonly productColumns  = ['rank', 'name', 'sku', 'quantity_sold', 'total_revenue', 'stock'];

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Charts rendered after data loads in loadDashboard()
  }

  ngOnDestroy(): void {
    this.salesChart?.destroy();
    this.paymentChart?.destroy();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      summary:      this.dashboardService.getSummary().pipe(catchError(() => of(this.mockSummary()))),
      charts:       this.dashboardService.getCharts().pipe(catchError(() => of(this.mockCharts()))),
      topCustomers: this.dashboardService.getTopCustomers().pipe(catchError(() => of(this.mockTopCustomers()))),
      topProducts:  this.dashboardService.getTopProducts().pipe(catchError(() => of(this.mockTopProducts()))),
      paymentModes: this.dashboardService.getPaymentModes().pipe(catchError(() => of(this.mockPaymentModes()))),
    }).subscribe({
      next: data => {
        this.summary.set(data.summary);
        this.charts.set(data.charts);
        this.topCustomers.set(data.topCustomers);
        this.topProducts.set(data.topProducts);
        this.paymentModes.set(data.paymentModes);
        this.buildSummaryCards(data.summary);
        this.loading.set(false);
        this.cdr.detectChanges();
        // Wait one tick for ViewChild canvas to render
        setTimeout(() => {
          this.renderSalesChart(data.charts);
          this.renderPaymentChart(data.paymentModes);
          this.cdr.detectChanges();
        }, 50);
      },
      error: err => {
        this.error.set('Failed to load dashboard data.');
        this.loading.set(false);
        this.cdr.detectChanges();
        console.error(err);
      },
    });
  }

  private buildSummaryCards(s: DashboardSummary): void {
    this.summaryCards.set([
      {
        title: "Today's Sales",
        value: s.today_sales,
        icon: 'trending_up',
        color: '#3949ab',
        prefix: '₹',
      },
      {
        title: 'Monthly Sales',
        value: s.monthly_sales,
        icon: 'bar_chart',
        color: '#0097a7',
        prefix: '₹',
      },
      {
        title: "Today's Collections",
        value: s.today_collections,
        icon: 'payments',
        color: '#2e7d32',
        prefix: '₹',
      },
      {
        title: 'Outstanding Amount',
        value: s.outstanding_amount,
        icon: 'account_balance_wallet',
        color: '#e65100',
        prefix: '₹',
      },
      {
        title: 'Customers',
        value: s.customer_count,
        icon: 'people',
        color: '#6a1b9a',
      },
      {
        title: 'Products',
        value: s.product_count,
        icon: 'inventory_2',
        color: '#1565c0',
      },
      {
        title: 'Low Stock',
        value: s.low_stock_count,
        icon: 'warning',
        color: '#c62828',
      },
      {
        title: 'Pending Orders',
        value: s.pending_orders,
        icon: 'pending_actions',
        color: '#f57f17',
      },
    ]);
  }

  private renderSalesChart(charts: DashboardCharts): void {
    if (!this.salesChartRef) return;
    this.salesChart?.destroy();

    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const d = charts.sales_trend;
    const cfg: ChartConfiguration = {
      type: 'line',
      data: {
        labels: d.labels,
        datasets: d.datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          borderColor: i === 0 ? '#3949ab' : '#26a69a',
          backgroundColor: i === 0
            ? 'rgba(57,73,171,.1)'
            : 'rgba(38,166,154,.1)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: i === 0 ? '#3949ab' : '#26a69a',
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true },
          },
          tooltip: { bodyFont: { family: 'Inter' }, titleFont: { family: 'Inter' } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
          y: {
            grid: { color: 'rgba(0,0,0,.05)' },
            ticks: {
              font: { family: 'Inter', size: 11 },
              callback: v => '₹' + Number(v).toLocaleString('en-IN'),
            },
          },
        },
      },
    };
    this.salesChart = new Chart(ctx, cfg);
  }

  private renderPaymentChart(modes: PaymentMode[]): void {
    if (!this.paymentChartRef || !modes.length) return;
    this.paymentChart?.destroy();

    const ctx = this.paymentChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const COLORS = ['#3949ab','#26a69a','#ffa726','#ef5350','#ab47bc','#42a5f5'];
    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: modes.map(m => m.mode),
        datasets: [{
          data: modes.map(m => m.total_amount),
          backgroundColor: COLORS.slice(0, modes.length),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'right',
            labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true, padding: 16 },
          },
          tooltip: {
            bodyFont: { family: 'Inter' },
            callbacks: {
              label: ctx => {
                const m = modes[ctx.dataIndex];
                return ` ₹${Number(ctx.raw).toLocaleString('en-IN')} (${m.percentage.toFixed(1)}%)`;
              },
            },
          },
        },
      },
    };
    this.paymentChart = new Chart(ctx, cfg);
  }

  refresh(): void {
    this.loadDashboard();
  }

  // ── Mock data (fallback when API not yet available) ───────────────────────

  private mockSummary(): DashboardSummary {
    return {
      today_sales: 182500,
      monthly_sales: 4230000,
      today_collections: 95000,
      outstanding_amount: 1340000,
      customer_count: 342,
      product_count: 1248,
      low_stock_count: 23,
      pending_orders: 17,
    };
  }

  private mockCharts(): DashboardCharts {
    const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
      sales_trend: {
        labels,
        datasets: [
          {
            label: 'Sales',
            data: [320000,410000,380000,520000,490000,610000,580000,720000,670000,810000,750000,920000],
          },
          {
            label: 'Collections',
            data: [280000,360000,320000,480000,440000,560000,520000,650000,610000,740000,680000,850000],
          },
        ],
      },
    };
  }

  private mockTopCustomers(): TopCustomer[] {
    return [
      { id:1, name:'Sharma General Store',    total_purchases:520000, total_paid:450000, outstanding:70000 },
      { id:2, name:'Patel Wholesale Depot',   total_purchases:480000, total_paid:480000, outstanding:0 },
      { id:3, name:'Rai Brothers Traders',    total_purchases:390000, total_paid:350000, outstanding:40000 },
      { id:4, name:'Thapa Supermart',          total_purchases:340000, total_paid:300000, outstanding:40000 },
      { id:5, name:'Gurung & Sons Retailers',  total_purchases:290000, total_paid:290000, outstanding:0 },
    ];
  }

  private mockTopProducts(): TopProduct[] {
    return [
      { id:1, name:'Basmati Rice 5kg',     sku:'RICE-BAS-5K', quantity_sold:1240, total_revenue:372000, current_stock:450 },
      { id:2, name:'Sunflower Oil 1L',     sku:'OIL-SUN-1L',  quantity_sold:980,  total_revenue:294000, current_stock:320 },
      { id:3, name:'Sugar 1kg',            sku:'SUGR-1KG',    quantity_sold:870,  total_revenue:174000, current_stock:12 },
      { id:4, name:'Toor Dal 500g',        sku:'DAL-TOOR-5H', quantity_sold:760,  total_revenue:152000, current_stock:85 },
      { id:5, name:'Wheat Flour 10kg',     sku:'ATTA-10KG',   quantity_sold:640,  total_revenue:192000, current_stock:230 },
    ];
  }

  private mockPaymentModes(): PaymentMode[] {
    return [
      { mode:'Cash',       total_amount:520000, transaction_count:142, percentage:38.8 },
      { mode:'UPI',        total_amount:410000, transaction_count:98,  percentage:30.6 },
      { mode:'Bank Transfer', total_amount:260000, transaction_count:34, percentage:19.4 },
      { mode:'Cheque',     total_amount:90000,  transaction_count:12,  percentage:6.7 },
      { mode:'Credit',     total_amount:60000,  transaction_count:8,   percentage:4.5 },
    ];
  }
}
