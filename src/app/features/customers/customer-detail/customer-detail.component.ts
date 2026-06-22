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
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { SummaryCardComponent } from '../../../shared/components/summary-card/summary-card.component';
import { StatusChipComponent } from '../../../shared/components/status-chip/status-chip.component';
import { CustomerLedgerPanelComponent } from '../customer-ledger-panel/customer-ledger-panel.component';
import { CustomerService } from '../../../core/services/customer.service';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { Customer } from '../../../core/interfaces/customer.interface';
import { extractError } from '../../../core/utils/http.util';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    SummaryCardComponent,
    StatusChipComponent,
    CustomerLedgerPanelComponent,
    HasPermissionDirective,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
})
export class CustomerDetailComponent implements OnInit {
  private readonly service = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly customer = signal<Customer | null>(null);
  readonly customerId = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/customers']);
      return;
    }
    this.customerId.set(id);
    this.load(id);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.service.findOne(id).subscribe({
      next: customer => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.snackBar.open(extractError(err), 'Dismiss', { duration: 4000 });
        this.router.navigate(['/customers']);
      },
    });
  }
}
