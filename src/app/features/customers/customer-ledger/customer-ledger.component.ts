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
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CustomerLedgerPanelComponent } from '../customer-ledger-panel/customer-ledger-panel.component';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/interfaces/customer.interface';

@Component({
  selector: 'app-customer-ledger',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    CustomerLedgerPanelComponent,
  ],
  templateUrl: './customer-ledger.component.html',
  styleUrl: './customer-ledger.component.scss',
})
export class CustomerLedgerComponent implements OnInit {
  private readonly service = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly customer = signal<Customer | null>(null);
  readonly customerId = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/customers']);
      return;
    }
    this.customerId.set(id);
    this.service.findOne(id).subscribe({
      next: c => this.customer.set(c),
      error: () => this.router.navigate(['/customers']),
    });
  }
}
