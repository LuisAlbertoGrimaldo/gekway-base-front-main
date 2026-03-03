import { Injectable } from "@angular/core";
import { ApiService } from "app/core/services/api.service";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { Empresa } from "./empresa.types";

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private baseUrl = environment.apiUrlHost + '/empresas';
  constructor(private api: ApiService) {}

  consulta(): Observable<Empresa[]> { return this.api.get<Empresa[]>(`${this.baseUrl}/consulta`); }
  alta(entidad: Empresa): Observable<Empresa> { return this.api.post<Empresa>(`${this.baseUrl}/insert`, entidad); }
  actualizar(entidad: Empresa): Observable<Empresa> { return this.api.put<Empresa>(`${this.baseUrl}/update`, entidad); }
  borrar(id: number): Observable<void> { return this.api.delete<void>(`${this.baseUrl}/delete/${id}`); }
}