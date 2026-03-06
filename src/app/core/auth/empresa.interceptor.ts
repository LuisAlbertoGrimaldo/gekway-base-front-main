import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PermissionService } from './permission.service';

export const empresaInterceptor: HttpInterceptorFn = (req, next) => {

    const permissionService = inject(PermissionService);
    const empresaId = permissionService.getEmpresaId();

    if (!empresaId) {
        return next(req);
    }

    const cloned = req.clone({
        headers: req.headers.set('X-Empresa-Id', empresaId.toString())
    });

    return next(cloned);
};