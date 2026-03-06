import {
    HttpErrorResponse,
    HttpInterceptorFn
} from '@angular/common/http';

import { inject } from '@angular/core';

import {
    catchError,
    switchMap,
    throwError
} from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);

    if (
        req.url.includes('/auth/sign-in') ||
        req.url.includes('/auth/sign-in-with-token')
    ) {
        return next(req);
    }

    const token = authService.accessToken;

    if (token) {

        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

    }

    return next(req).pipe(

        catchError((error: HttpErrorResponse) => {

            if (error.status !== 401) {
                return throwError(() => error);
            }

            return authService.refresh().pipe(

                switchMap(() => {

                    const newToken = authService.accessToken;

                    const retryReq = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${newToken}`
                        }
                    });

                    return next(retryReq);

                }),

                catchError(err => {

                    authService.signOut();

                    return throwError(() => err);

                })

            );

        })

    );

};