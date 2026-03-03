import { Injectable, inject } from '@angular/core';
import { AppNavigationItem } from './app-navigation-item';
import { PermissionService } from 'app/core/auth/permission.service';

@Injectable({ providedIn: 'root' })
export class NavigationFilterService {

  private permService = inject(PermissionService);

  filterNavigation(items: AppNavigationItem[]): AppNavigationItem[] {
    return items
      .map(item => this.filterItem(item))
      .filter(Boolean) as AppNavigationItem[];
  }

  private filterItem(item: AppNavigationItem): AppNavigationItem | null {

    // 🔐 validar módulo
    if (item.module && !this.permService.hasModule(item.module)) {
      return null;
    }

    // 🔐 validar permiso
    if (item.permission && !this.permService.has(item.permission)) {
      return null;
    }

    // 🧩 procesar hijos (importante para grupos)
    if (item.children?.length) {
      const children = this.filterNavigation(item.children);

      // si el grupo se queda vacío → ocultarlo
      if (!children.length && item.type === 'group') {
        return null;
      }

      return { ...item, children };
    }

    return item;
  }
}