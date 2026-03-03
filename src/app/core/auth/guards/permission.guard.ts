import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { PermissionService } from '../permission.service';
import { UserService } from 'app/core/user/user.service';
import { map, take, filter } from 'rxjs/operators';

export const PermissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permService = inject(PermissionService);
  const userService = inject(UserService);
  const router = inject(Router);

  const requiredPermission = route.data?.['permission'];
  const requiredModule = route.data?.['module'];

  // Si la ruta no requiere nada → pasa
  if (!requiredPermission && !requiredModule) return true;

  return userService.user$.pipe(
    // 🔥 esperar usuario real (evita carreras)
    filter(user => !!user),
    take(1),
    map(() => {

      // 🧠 SUPER ADMIN bypass total
      if (permService.isSuperAdmin()) {
        return true;
      }

      // 🧩 validar módulo primero
      if (requiredModule && !permService.hasModule(requiredModule)) {
        console.warn('⛔ módulo no activo:', requiredModule);
        return router.parseUrl('/sin-acceso');
      }

      // 🔐 validar permiso
      if (requiredPermission && !permService.has(requiredPermission)) {
        console.warn('⛔ permiso denegado:', requiredPermission);
        return router.parseUrl('/sin-acceso');
      }

      return true;
    })
  );
};