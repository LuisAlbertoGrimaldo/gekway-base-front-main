import { Observable } from "rxjs";

export abstract class CrudService<T> {
  abstract consulta(): Observable<T[]>;
  abstract alta(entidad: T): Observable<void>;
  abstract actualizar(entidad: T): Observable<void>;
  abstract borrar(id: number): Observable<void>;
  abstract importarExcel(formData: FormData): Observable<void>;
}
