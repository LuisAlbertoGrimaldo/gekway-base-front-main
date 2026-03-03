import { Injectable } from "@angular/core";
import { ApiService } from "app/core/services/api.service";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Permiso } from "./permiso.types";

@Injectable({ providedIn: 'root' })
export class PermisoService {
  private baseUrl = environment.apiUrlHost + '/permisos';
  constructor(private api: ApiService) {}

  consulta(moduloId?: number): Observable<Permiso[]> {
    return this.api.get<Permiso[]>(`${this.baseUrl}/consulta${moduloId ? '?moduloId=' + moduloId : ''}`);
  }
  alta(entidad: Permiso): Observable<Permiso> { return this.api.post<Permiso>(`${this.baseUrl}/insert`, entidad); }
  actualizar(entidad: Permiso): Observable<Permiso> { return this.api.put<Permiso>(`${this.baseUrl}/update`, entidad); }
  borrar(id: number): Observable<void> { return this.api.delete<void>(`${this.baseUrl}/delete/${id}`); }
}