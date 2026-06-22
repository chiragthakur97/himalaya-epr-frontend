import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { getUserDisplayName, getUserRoleName } from '../../core/interfaces/auth.interface';

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

  readonly isAdmin = computed(() => getUserRoleName(this.authService.user()).toUpperCase() === 'ADMIN');

  readonly canManageSettings = computed(() => {
    const role = getUserRoleName(this.authService.user()).toUpperCase();
    return role === 'ADMIN' || role === 'MANAGER';
  });

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Customers', icon: 'people', route: '/customers' },
    { label: 'Products', icon: 'inventory_2', route: '/products' },
    { label: 'Categories', icon: 'category', route: '/product-categories' },
    { label: 'Units', icon: 'straighten', route: '/units' },
    { label: 'Inventory', icon: 'warehouse', route: '/inventory' },
    { label: 'Sales Orders', icon: 'receipt_long', route: '/sales-orders' },
    { label: 'Payments', icon: 'payments', route: '/payments' },
  ];

  readonly adminNavItems: NavItem[] = [
    { label: 'Users', icon: 'manage_accounts', route: '/users' },
  ];

  readonly inventorySubItems: NavItem[] = [
    { label: 'Stock Management', icon: 'warehouse', route: '/inventory' },
  ];

  displayName = () => getUserDisplayName(this.authService.user());
  roleName = () => getUserRoleName(this.authService.user());

  onLinkClick(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
