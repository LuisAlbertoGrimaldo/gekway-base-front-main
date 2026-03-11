import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { Role } from './role.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private baseUrl = environment.apiUrlHost + '/roles';

    constructor(private api: ApiService) { }

    consulta(): Observable<Role[]> { return this.api.get<Role[]>(`${this.baseUrl}/consulta`); }
    alta(entidad: Role): Observable<Role> { return this.api.post<Role>(`${this.baseUrl}/insert`, entidad); }
    actualizar(entidad: Role): Observable<Role> { return this.api.put<Role>(`${this.baseUrl}/update`, entidad); }
    borrar(id: number): Observable<void> { return this.api.delete<void>(`${this.baseUrl}/delete/${id}`); }
    importarExcel(formData: FormData): Observable<void> { return this.api.post<void>(`${this.baseUrl}/importar`, formData); }

   consultaPermisosRol(rolId: number) {
    return this.api.get(`${this.baseUrl}/${rolId}/rolesPermiso`);
}

   agregarPermiso(rolId: number, permisoId: number): Observable<any> {
    return this.api.post(`${this.baseUrl}/${rolId}/rolesPermiso/${permisoId}`, {});
}

quitarPermiso(rolId: number, permisoId: number): Observable<any> {
    return this.api.delete(`${this.baseUrl}/${rolId}/rolesPermiso/${permisoId}`);
}





}
