import { Injectable } from "@angular/core";
import { CrudService } from "app/core/services/crud.service";
import { ApiService } from "app/core/services/api.service";
import { API_RESOURCES } from "app/core/config/api.resources";
import { Empresa } from "./empresa.types";

@Injectable({ providedIn: 'root' })
export class EmpresaService extends CrudService<Empresa> {

  protected resource = API_RESOURCES.empresas;

  constructor(api: ApiService) {
    super(api);
  }

}