import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './app/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  providers: [
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
]
