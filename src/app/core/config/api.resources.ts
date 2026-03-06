import { environment } from "environments/environment";

const BASE = environment.apiUrlHost;

export const API_RESOURCES = {

  empresas: `${BASE}/empresas`,
  usuarios: `${BASE}/usuarios`,
  roles: `${BASE}/roles`,
  permisos: `${BASE}/permisos`,
  modulos: `${BASE}/modulos`

};