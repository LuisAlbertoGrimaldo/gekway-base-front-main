import { Injectable } from "@angular/core";
import { ApiService } from "app/core/services/api.service";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Usuario } from "./usuario.types";

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl = environment.apiUrlHost + '/usuarios';
  constructor(private api: ApiService) { }

  consulta(empresaId?: number): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(`${this.baseUrl}/consulta${empresaId ? '?empresaId=' + empresaId : ''}`);
  }
  alta(entidad: Usuario): Observable<Usuario> { return this.api.post<Usuario>(`${this.baseUrl}/insert`, entidad); }
  actualizar(entidad: Usuario): Observable<Usuario> { return this.api.put<Usuario>(`${this.baseUrl}/update`, entidad); }
  borrar(id: number): Observable<void> { return this.api.delete<void>(`${this.baseUrl}/delete/${id}`); }



  consultaRolesUsuario(rolId: number) {
    return this.api.get(`${this.baseUrl}/${rolId}/usuariosRol`);
  }

  agregarRol(usuarioId: number, rolId: number): Observable<any> {
    return this.api.post(`${this.baseUrl}/${usuarioId}/usuariosRol/${rolId}`, {});
  }

  quitarRol(usuarioId: number, rolId: number): Observable<any> {
    return this.api.delete(`${this.baseUrl}/${usuarioId}/usuariosRol/${rolId}`);
  }


}