import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatRippleModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly collapsed = input(false);
  readonly closeSidebar = output<void>();

  readonly authService = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  ];

  readonly comingSoon: NavItem[] = [
    { label: 'Customers',    icon: 'people',           route: '/customers'   },
    { label: 'Products',     icon: 'inventory_2',      route: '/products'    },
    { label: 'Inventory',    icon: 'warehouse',        route: '/inventory'   },
    { label: 'Sales Orders', icon: 'receipt_long',     route: '/sales'       },
    { label: 'Payments',     icon: 'payments',         route: '/payments'    },
    { label: 'Reports',      icon: 'bar_chart',        route: '/reports'     },
    { label: 'Settings',     icon: 'settings',         route: '/settings'    },
  ];

  onLinkClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
