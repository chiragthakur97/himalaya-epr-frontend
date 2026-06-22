import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);

  readonly appHasPermission = input.required<string>();
  readonly appHasPermissionMode = input<'all' | 'any'>('all');
  readonly appHasPermissions = input<string[]>([]);

  private visible = false;

  constructor() {
    effect(() => {
      const allowed = this.checkAccess();
      if (allowed && !this.visible) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.visible = true;
      } else if (!allowed && this.visible) {
        this.viewContainer.clear();
        this.visible = false;
      }
    });
  }

  private checkAccess(): boolean {
    const extra = this.appHasPermissions();
    const primary = this.appHasPermission();

    if (extra.length === 0) {
      return this.permissionService.has(primary);
    }

    const all = [primary, ...extra];
    return this.appHasPermissionMode() === 'any'
      ? this.permissionService.hasAny(...all)
      : this.permissionService.hasAll(...all);
  }
}
