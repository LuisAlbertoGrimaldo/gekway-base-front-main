import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { PermissionService } from './permission.service';

/*@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective {
  private permissionService = inject(PermissionService);

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef
  ) {}

  @Input() set hasPermission(permission: string) {
    this.vcr.clear();
    if (this.permissionService.has(permission)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}*/
@Directive({
  selector: '[hasPermission]'
})
export class HasPermissionDirective {
  private permissionService = inject(PermissionService);

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef
  ) {}

  @Input() set hasPermission(permission: string) {
    this.render(permission);
  }

  @Input() set hasModule(module: string) {
    this._module = module;
    this.render(this._permission);
  }

  private _permission?: string;
  private _module?: string;

  private render(permission?: string) {
    this.vcr.clear();

    const okModule = !this._module || this.permissionService.hasModule(this._module);
    const okPerm = !permission || this.permissionService.has(permission);

    if (okModule && okPerm) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
