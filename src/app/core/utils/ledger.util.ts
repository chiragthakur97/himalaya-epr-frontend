import { LedgerEntry, LedgerReferenceType } from '../interfaces/customer.interface';

export const LEDGER_TYPE_LABELS: Record<LedgerReferenceType, string> = {
  OPENING_BALANCE: 'Opening Balance',
  ORDER: 'Sales Order',
  PAYMENT: 'Payment Received',
  ADJUSTMENT: 'Adjustment',
};

export function formatLedgerType(type: LedgerReferenceType | string): string {
  return LEDGER_TYPE_LABELS[type as LedgerReferenceType] ?? String(type).replace(/_/g, ' ');
}

export function formatLedgerDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLedgerAmount(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ledgerDrCrHint(entry: LedgerEntry): string {
  if (entry.debit > 0) return 'Customer owes more (Dr)';
  if (entry.credit > 0) return 'Payment / credit (Cr)';
  return '';
}

export function openLedgerPrintView(
  customerName: string,
  customerCode: string,
  outstandingBalance: number,
  entries: LedgerEntry[],
  dateFrom?: string,
  dateTo?: string,
): void {
  const period =
    dateFrom || dateTo
      ? `${dateFrom ? formatLedgerDate(dateFrom) : 'Start'} — ${dateTo ? formatLedgerDate(dateTo) : 'Today'}`
      : 'All entries';

  const rows = entries
    .map(
      entry => `
      <tr>
        <td>${formatLedgerDate(entry.createdAt)}</td>
        <td>${formatLedgerType(entry.referenceType)}</td>
        <td>${escapeHtml(entry.description)}</td>
        <td class="num">${entry.debit > 0 ? formatLedgerAmount(entry.debit) : '—'}</td>
        <td class="num">${entry.credit > 0 ? formatLedgerAmount(entry.credit) : '—'}</td>
        <td class="num">${formatLedgerAmount(entry.balance)}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ledger — ${escapeHtml(customerName)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1a237e; padding: 24px; }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .meta { color: #555; margin-bottom: 20px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f5f7ff; text-transform: uppercase; font-size: 11px; }
    .num { text-align: right; white-space: nowrap; }
    .summary { margin-top: 16px; font-weight: bold; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Customer Ledger</h1>
  <div class="meta">
    <div><strong>${escapeHtml(customerName)}</strong> (${escapeHtml(customerCode)})</div>
    <div>Period: ${period}</div>
    <div>Generated: ${formatLedgerDate(new Date().toISOString())}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Type</th>
        <th>Particulars</th>
        <th>Debit (Dr)</th>
        <th>Credit (Cr)</th>
        <th>Balance</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="6">No entries in selected period.</td></tr>'}</tbody>
  </table>
  <div class="summary">Outstanding Balance: ${formatLedgerAmount(outstandingBalance)}</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
