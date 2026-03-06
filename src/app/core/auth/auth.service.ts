import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, catchError, Observable, of, switchMap, throwError } from 'rxjs';

import { jwtDecode } from 'jwt-decode';

import { UserService } from 'app/core/user/user.service';
import { PermissionService } from './permission.service';
import { NavigationBuilderService } from 'app/core/navigation/navigation-builder.service';
import { AuthUtils } from './auth.utils';
import { filter, take } from 'rxjs';

import { environment } from 'environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {

    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _permissionService = inject(PermissionService);
    private _navigationBuilder = inject(NavigationBuilderService);

    private _authenticated = false;

    private refreshTimer: any;

    private refreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    private authChannel = new BroadcastChannel('auth_channel');

    // ------------------------------------------------
    // ACCESS TOKEN
    // ------------------------------------------------

    constructor() {

    this.authChannel.onmessage = (event) => {

        const data = event.data;

        if (data.type === 'TOKEN_REFRESHED') {

            localStorage.setItem('accessToken', data.token);

        }

        if (data.type === 'LOGOUT') {

            // logout remoto (no volver a emitir evento)
            this.signOut(false).subscribe();

        }

    };

}

    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // ------------------------------------------------
    // REFRESH TOKEN
    // ------------------------------------------------

    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    // ------------------------------------------------
    // LOGIN
    // ------------------------------------------------

    signIn(credentials: { email: string; password: string }): Observable<any> {

        const payload = {
            correo: credentials.email,
            password: credentials.password
        };

        return this._httpClient.post(`${environment.apiUrlHost}/auth/sign-in`, payload).pipe(

            switchMap((response: any) => {

                this.accessToken = response.accessToken;
                this.refreshToken = response.refreshToken;

                const jwt: any = jwtDecode(response.accessToken);

                this._permissionService.loadSession({
                    permissions: jwt.permissions || [],
                    modules: [],
                    superAdmin: jwt.superAdmin,
                    empresaId: jwt.empresaId
                });

                this._userService.user = jwt;

                this._authenticated = true;

                this._navigationBuilder.refreshNavigation();

                this.startTokenTimer();

                return of(response);
            })
        );
    }

    // ------------------------------------------------
    // REFRESH TOKEN
    // ------------------------------------------------

    refresh(): Observable<any> {

    if (!this.refreshToken) {
        return throwError(() => 'No refresh token');
    }

    // si ya hay un refresh en curso, esperar el resultado
    if (this.refreshing) {

        return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => of(token))
        );
    }

    this.refreshing = true;
    this.refreshTokenSubject.next(null);

    return this._httpClient.post(`${environment.apiUrlHost}/auth/sign-in-with-token`, {
        refreshToken: this.refreshToken
    }).pipe(

        switchMap((response: any) => {

            const newToken = response.accessToken;

            // guardar token
            this.accessToken = newToken;

            // liberar estado refresh primero
            this.refreshing = false;

            // liberar cola de requests
            this.refreshTokenSubject.next(newToken);

            // avisar a otras pestañas
            this.authChannel.postMessage({
                type: 'TOKEN_REFRESHED',
                token: newToken
            });

            const jwt: any = jwtDecode(newToken);

            this._permissionService.loadSession({
                permissions: jwt.permissions || [],
                modules: [],
                superAdmin: jwt.superAdmin,
                empresaId: jwt.empresaId
            });

            this._navigationBuilder.refreshNavigation();

            this.startTokenTimer();

            return of(response);

        }),

        catchError(err => {

            this.refreshing = false;

            this.signOut();

            return throwError(() => err);

        })
    );
}

    // ------------------------------------------------
    // AUTO LOGIN
    // ------------------------------------------------

    signInUsingToken(): Observable<boolean> {

        const token = this.accessToken;

        if (!token) {
            return of(false);
        }

        if (AuthUtils.isTokenExpired(token)) {
            return of(false);
        }

        try {

            const jwt: any = jwtDecode(token);

            this._permissionService.loadSession({
                permissions: jwt.permissions || [],
                modules: [],
                superAdmin: jwt.superAdmin,
                empresaId: jwt.empresaId
            });

            this._userService.user = jwt;

            this._authenticated = true;

            this._navigationBuilder.refreshNavigation();

            this.startTokenTimer();

            return of(true);

        } catch {

            return of(false);

        }

    }

    // ------------------------------------------------
    // TOKEN TIMER
    // ------------------------------------------------

    startTokenTimer() {

        const token = this.accessToken;

        if (!token) return;

        const jwt: any = jwtDecode(token);

        const expires = jwt.exp * 1000;

        const timeout = expires - Date.now() - 60000;

        clearTimeout(this.refreshTimer);

        if (timeout <= 0) {

            this.refresh().subscribe({
                next: () => this.startTokenTimer(),
                error: () => this.signOut()
            });

            return;
        }

        this.refreshTimer = setTimeout(() => {

            this.refresh().subscribe({
                next: () => this.startTokenTimer(),
                error: () => this.signOut()
            });

        }, timeout);

    }

    // ------------------------------------------------
    // LOGOUT
    // ------------------------------------------------

    signOut(broadcast: boolean = true): Observable<any> {

        clearTimeout(this.refreshTimer);

        this.refreshing = false;

        this.refreshTokenSubject.next(null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // solo avisar si el logout se originó aquí
        if (broadcast) {
            this.authChannel.postMessage({
                type: 'LOGOUT'
            });
        }

        this._permissionService.clear();

        this._authenticated = false;

        return of(true);
    }

    // ------------------------------------------------
    // CHECK AUTH
    // ------------------------------------------------

    check(): Observable<boolean> {

        if (this._authenticated) {
            return of(true);
        }

        const token = this.accessToken;

        if (!token) {
            return of(false);
        }

        if (AuthUtils.isTokenExpired(token)) {

            if (!this.refreshToken) {
                return of(false);
            }

            return this.refresh().pipe(
                switchMap(() => of(true)),
                catchError(() => of(false))
            );
        }

        return this.signInUsingToken();
    }

    // ------------------------------------------------
    // MÉTODOS FUSE
    // ------------------------------------------------

    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', { email });
    }

    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', { password });
    }

    signUp(user: any): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    unlockSession(credentials: any): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

}