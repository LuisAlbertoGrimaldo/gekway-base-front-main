import { ApiService } from "./api.service";
import { Observable } from "rxjs";

export abstract class CrudService<T> {

  protected abstract resource: string;

  constructor(protected api: ApiService) {}

  consulta(): Observable<T[]> {
    return this.api.get<T[]>(`${this.resource}/consulta`);
  }

  insert(data: T): Observable<T> {
    return this.api.post<T>(`${this.resource}/insert`, data);
  }

  update(data: T): Observable<T> {
    return this.api.put<T>(`${this.resource}/update`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.resource}/delete/${id}`);
  }

}