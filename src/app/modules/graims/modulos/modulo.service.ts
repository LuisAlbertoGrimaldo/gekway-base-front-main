import { Injectable } from "@angular/core";
import { ApiService } from "app/core/services/api.service";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Modulo } from "./modulo.types";

@Injectable({ providedIn: 'root' })
export class ModuloService {
  private baseUrl = environment.apiUrlHost + '/modulos';
  constructor(private api: ApiService) {}

  consulta(): Observable<Modulo[]> { return this.api.get<Modulo[]>(`${this.baseUrl}/consulta`); }
  alta(entidad: Modulo): Observable<Modulo> { return this.api.post<Modulo>(`${this.baseUrl}/insert`, entidad); }
  actualizar(entidad: Modulo): Observable<Modulo> { return this.api.put<Modulo>(`${this.baseUrl}/update`, entidad); }
  borrar(id: number): Observable<void> { return this.api.delete<void>(`${this.baseUrl}/delete/${id}`); }
}