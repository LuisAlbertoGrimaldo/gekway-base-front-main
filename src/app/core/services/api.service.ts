import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Inyección moderna sin constructor
  private http = inject(HttpClient);

  get<T>(url: string, options?: object): Observable<T> {
    return this.http.get<T>(url, options);
  }

  post<T>(url: string, body: any, options?: object): Observable<T> {
    return this.http.post<T>(url, body, options);
  }
  patch<T>(url: string, body: any, options?: object): Observable<T> {
    return this.http.patch<T>(url, body, options);
  }

  put<T>(url: string, body: any, options?: object): Observable<T> {
    return this.http.put<T>(url, body, options);
  }

  delete<T>(url: string, options?: object): Observable<T> {
    return this.http.delete<T>(url, options);
  }
}
