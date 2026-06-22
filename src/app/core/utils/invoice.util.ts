import { OrderStatus, PaymentStatus } from '../interfaces/sales-order.interface';

export const INVOICE_TAGLINE = 'Building Materials | Cement | Steel | Tiles';
export const DEFAULT_UPI_ID = 'himalayatraders@paytm';
export const ERP_VERSION = 'Himalaya ERP v1.0';
export const INVOICE_COMPANY = {
  name: 'Himalaya Traders',
  address: 'Main Market, Nangal',
  city: 'Nangal',
  state: 'Punjab',
  pinCode: '140126',
  mobile: '+91 XXXXX XXXXX',
  email: 'sales@himalayatraders.com',
  website: 'www.himalayatraders.com',
  gstNumber: null as string | null,
  panNumber: null as string | null,
};
export const DEFAULT_INVOICE_TERMS = [
  'Goods once sold will not be taken back.',
  'Subject to Punjab jurisdiction.',
  'Interest may be charged on overdue payments.',
  'Payment due within agreed credit period.',
];

export const PAYMENT_MODE_COLORS: Record<string, { bg: string; text: string }> = {
  CASH: { bg: '#dcfce7', text: '#166534' },
  GPAY: { bg: '#dbeafe', text: '#1e40af' },
  PHONEPE: { bg: '#f3e8ff', text: '#6b21a8' },
  PAYTM: { bg: '#e0f2fe', text: '#0369a1' },
  BANK_TRANSFER: { bg: '#ffedd5', text: '#9a3412' },
  CARD: { bg: '#fce7f3', text: '#9d174d' },
  CHEQUE: { bg: '#fef9c3', text: '#854d0e' },
  OTHER: { bg: '#f3f4f6', text: '#374151' },
};

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function fmtRupee(n: number): string {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtInvoiceDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtDateTime(d: Date = new Date()): string {
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const one = n % 10;
  return `${TENS[ten]}${one ? ` ${ONES[one]}` : ''}`.trim();
}

function threeDigits(n: number): string {
  if (n < 100) return twoDigits(n);
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return `${ONES[hundred]} Hundred${rest ? ` ${twoDigits(rest)}` : ''}`;
}

function integerToWords(n: number): string {
  if (n === 0) return 'Zero';
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000);
  if (crore) {
    parts.push(`${threeDigits(crore)} Crore`);
    n %= 10_000_000;
  }
  const lakh = Math.floor(n / 100_000);
  if (lakh) {
    parts.push(`${threeDigits(lakh)} Lakh`);
    n %= 100_000;
  }
  const thousand = Math.floor(n / 1000);
  if (thousand) {
    parts.push(`${threeDigits(thousand)} Thousand`);
    n %= 1000;
  }
  if (n) parts.push(threeDigits(n));
  return parts.join(' ');
}

export function amountInWords(amount: number): string {
  const safe = Math.max(0, amount);
  const rupees = Math.floor(safe);
  const paise = Math.round((safe - rupees) * 100);
  let words = `${integerToWords(rupees)} Rupees`;
  if (paise) words += ` and ${integerToWords(paise)} Paise`;
  return `${words} Only`;
}

export interface TaxBreakdown {
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
}

export function deriveTaxBreakdown(
  subtotal: number,
  discountAmount: number,
  taxAmount: number,
  defaultGstRate = 18,
): TaxBreakdown {
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  if (taxAmount <= 0 || taxableAmount <= 0) {
    return {
      taxableAmount,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
    };
  }
  const effectiveRate = parseFloat(((taxAmount / taxableAmount) * 100).toFixed(2));
  const halfRate = parseFloat((effectiveRate / 2).toFixed(2));
  return {
    taxableAmount,
    cgstAmount: parseFloat((taxAmount / 2).toFixed(2)),
    sgstAmount: parseFloat((taxAmount / 2).toFixed(2)),
    igstAmount: 0,
    cgstRate: halfRate || defaultGstRate / 2,
    sgstRate: halfRate || defaultGstRate / 2,
    igstRate: 0,
  };
}

export function paymentStatusLabel(status: PaymentStatus): string {
  if (status === 'PARTIALLY_PAID') return 'PARTIAL';
  return status;
}

export function paymentStatusClass(status: PaymentStatus): string {
  switch (status) {
    case 'PAID':
      return 'status-paid';
    case 'PARTIALLY_PAID':
      return 'status-partial';
    default:
      return 'status-unpaid';
  }
}

export function watermarkMeta(
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
  outstanding: number,
): { text: string; className: string } {
  if (orderStatus === 'CANCELLED') return { text: 'CANCELLED', className: 'wm-cancelled' };
  if (paymentStatus === 'PAID' || outstanding <= 0) return { text: 'PAID', className: 'wm-paid' };
  if (paymentStatus === 'PARTIALLY_PAID') return { text: 'PARTIAL', className: 'wm-partial' };
  return { text: 'UNPAID', className: 'wm-unpaid' };
}

export function buildUpiPayUrl(upiId: string, amount: number, invoiceNumber: string, payeeName: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `Invoice ${invoiceNumber}`,
  });
  return `upi://pay?${params.toString()}`;
}

export function qrCodeUrl(data: string, size = 120): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}

export function paymentModeStyle(mode: string): { bg: string; text: string } {
  return PAYMENT_MODE_COLORS[mode] ?? PAYMENT_MODE_COLORS['OTHER'];
}
