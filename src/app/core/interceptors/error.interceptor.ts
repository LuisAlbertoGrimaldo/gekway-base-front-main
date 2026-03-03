import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notification: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'Ocurrió un error inesperado';

        if (error.error?.message) {
          message = error.error.message; // mensaje del backend
        } else if (error.status === 0) {
          message = 'No se pudo conectar con el servicio externo';
        } else if (error.status === 404) {
          message = 'Recurso no encontrado en la API externa';
        } else if (error.status === 503) {
          message = 'El servicio externo no está disponible';
        }

        this.notification.notifyError(message);
        return throwError(() => error);
      })
    );
  }
}
