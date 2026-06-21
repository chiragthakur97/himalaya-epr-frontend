import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyInr', standalone: true })
export class CurrencyInrPipe implements PipeTransform {
  transform(value: number | null | undefined, showSymbol = true): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return showSymbol ? '₹0' : '0';
    }
    const formatted = Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return showSymbol ? `₹${formatted}` : formatted;
  }
}
