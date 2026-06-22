import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SalesOrderService } from '../../../core/services/sales-order.service';
import { SettingsService } from '../../../core/services/settings.service';
import { SalesOrder } from '../../../core/interfaces/sales-order.interface';
import { CompanySettings } from '../../../core/interfaces/settings.interface';
import { extractError } from '../../../core/utils/http.util';
import { formatPaymentMode } from '../../../core/utils/sales-order.util';
import {
  amountInWords,
  buildUpiPayUrl,
  deriveTaxBreakdown,
  fmtDateTime,
  fmtInvoiceDate,
  fmtRupee,
  paymentModeStyle,
  paymentStatusClass,
  paymentStatusLabel,
  qrCodeUrl,
  watermarkMeta,
} from '../../../core/utils/invoice.util';

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatSnackBarModule, LoadingSpinnerComponent],
  templateUrl: './invoice-preview.component.html',
  styleUrl: './invoice-preview.component.scss',
})
export class InvoicePreviewComponent implements OnInit {
  private readonly service = inject(SalesOrderService);
  private readonly settingsService = inject(SettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly order = signal<SalesOrder | null>(null);
  readonly companySettings = signal<CompanySettings | null>(null);

  readonly generatedAt = fmtDateTime(new Date());

  fmtRupee = fmtRupee;
  fmtInvoiceDate = fmtInvoiceDate;
  amountInWords = amountInWords;
  paymentStatusLabel = paymentStatusLabel;
  paymentStatusClass = paymentStatusClass;
  paymentModeStyle = paymentModeStyle;
  formatPaymentMode = formatPaymentMode;
  watermarkMeta = watermarkMeta;
  qrCodeUrl = qrCodeUrl;
  buildUpiPayUrl = buildUpiPayUrl;
  assetUrl = (path: string | null | undefined) => this.settingsService.assetUrl(path);

  taxBreakdown = (
    subtotal: number,
    discountAmount: number,
    taxAmount: number,
    defaultGstRate: number,
  ) => deriveTaxBreakdown(subtotal, discountAmount, taxAmount, defaultGstRate);

  private orderId = '';

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.orderId) {
      this.router.navigate(['/sales-orders']);
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.settingsService.getAll().subscribe({
      next: bundle => {
        this.companySettings.set(bundle.settings);
        this.service.findOne(this.orderId).subscribe({
          next: order => {
            this.order.set(order);
            this.loading.set(false);
          },
          error: err => {
            this.loading.set(false);
            this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
            this.router.navigate(['/sales-orders']);
          },
        });
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
      },
    });
  }

  printInvoice(): void {
    window.print();
  }

  downloadPdf(): void {
    this.service.downloadInvoice(this.orderId).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.order()?.invoiceNumber ?? this.order()?.orderNumber ?? this.orderId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.load();
      },
      error: err => this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 }),
    });
  }

  showQr(o: SalesOrder): boolean {
    const s = this.companySettings();
    return (
      !!s?.showQrOnInvoice &&
      !!s?.upiId &&
      o.outstandingAmount > 0 &&
      o.orderStatus !== 'CANCELLED'
    );
  }

  invoiceNumber(o: SalesOrder): string {
    return o.invoiceNumber ?? 'Pending';
  }

  termsList(): string[] {
    const terms = this.companySettings()?.invoiceTerms;
    return terms?.length ? terms : [];
  }

  sortedPayments(o: SalesOrder) {
    return [...(o.payments ?? [])].sort(
      (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
    );
  }
}
