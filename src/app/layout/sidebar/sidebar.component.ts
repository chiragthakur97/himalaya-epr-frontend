import {

  Component,

  input,

  output,

  computed,

  effect,

  inject,

  OnDestroy,

  ChangeDetectionStrategy,

} from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { MatRippleModule } from '@angular/material/core';

import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';

import { PermissionService } from '../../core/services/permission.service';

import { PermissionConfigService } from '../../core/services/permission-config.service';

import { getUserDisplayName, getUserRoleName } from '../../core/interfaces/auth.interface';



@Component({

  selector: 'app-sidebar',

  standalone: true,

  changeDetection: ChangeDetectionStrategy.OnPush,

  imports: [RouterLink, RouterLinkActive, MatIconModule, MatRippleModule, MatTooltipModule],

  templateUrl: './sidebar.component.html',

  styleUrl: './sidebar.component.scss',

})

export class SidebarComponent implements OnDestroy {

  readonly collapsed = input(false);

  readonly closeSidebar = output<void>();



  readonly authService = inject(AuthService);

  private readonly permissionService = inject(PermissionService);

  private readonly configService = inject(PermissionConfigService);



  private readonly recoveryTimer = window.setInterval(() => this.recoverSession(), 60_000);

  private readonly focusHandler = () => this.recoverSession();



  readonly navItems = computed(() =>

    this.configService

      .navigation()

      .filter((item) => item.group === 'main' && this.permissionService.has(item.permission)),

  );



  readonly usersRolesItems = computed(() =>

    this.configService

      .navigation()

      .filter(

        (item) => item.group === 'users_roles' && this.permissionService.has(item.permission),

      ),

  );



  readonly adminItems = computed(() =>

    this.configService

      .navigation()

      .filter(

        (item) => item.group === 'administration' && this.permissionService.has(item.permission),

      ),

  );



  readonly showUsersRolesSection = computed(() => this.usersRolesItems().length > 0);

  readonly showAdminSection = computed(() => this.adminItems().length > 0);

  readonly menuEmpty = computed(

    () =>

      this.authService.isAuthenticated() &&

      this.navItems().length === 0 &&

      this.usersRolesItems().length === 0 &&

      this.adminItems().length === 0,

  );



  constructor() {

    effect(() => {

      if (this.authService.isAuthenticated()) {

        this.recoverSession();

      }

    });



    window.addEventListener('focus', this.focusHandler);

  }



  ngOnDestroy(): void {

    window.clearInterval(this.recoveryTimer);

    window.removeEventListener('focus', this.focusHandler);

  }



  displayName = () => getUserDisplayName(this.authService.user());

  roleName = () => getUserRoleName(this.authService.user());



  onLinkClick(): void {

    this.closeSidebar.emit();

  }



  logout(): void {

    this.authService.logout();

  }



  private recoverSession(): void {
    if (!this.authService.isAuthenticated()) return;

    if (!this.configService.navigation().length) {
      this.configService.ensureLoaded();
    }

    const user = this.authService.user();
    if (!user) return;

    const visibleCount =
      this.navItems().length + this.usersRolesItems().length + this.adminItems().length;
    const hasPermissions = (user.permissions?.length ?? 0) > 0;
    const hasNavigation = this.configService.navigation().length > 0;

    if (!hasPermissions || (hasNavigation && !visibleCount)) {
      this.authService.refreshPermissions();
    }
  }
}


