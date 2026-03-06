import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { UserService } from 'app/core/user/user.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {

    private _userService = inject(UserService);
    private _router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot) {

        const requiredPermission = route.data?.['permission'];
        const requiredRole = route.data?.['role'];

        return this._userService.user$.pipe(
            take(1),
            map((user: any) => {

                if (!user) {
                    this._router.navigate(['/sign-in']);
                    return false;
                }

                // 🔥 SUPER ADMIN SIEMPRE PASA
                if (user.superAdmin) {
                    return true;
                }

                // --------------------------
                // VALIDAR PERMISOS
                // --------------------------

                if (requiredPermission) {

                    const permissions = Array.isArray(requiredPermission)
                        ? requiredPermission
                        : [requiredPermission];

                    const hasPermission = permissions.some(p =>
                        user.permissions?.includes(p)
                    );

                    if (!hasPermission) {
                        console.log('⛔ permiso denegado:', permissions);
                        this._router.navigate(['/sin-acceso']);
                        return false;
                    }
                }

                // --------------------------
                // VALIDAR ROLES
                // --------------------------

                if (requiredRole) {

                    const roles = Array.isArray(requiredRole)
                        ? requiredRole
                        : [requiredRole];

                    const hasRole = roles.some(r =>
                        user.roles?.includes(r)
                    );

                    if (!hasRole) {
                        console.log('⛔ rol denegado:', roles);
                        this._router.navigate(['/sin-acceso']);
                        return false;
                    }
                }

                return true;

            })
        );
    }
}