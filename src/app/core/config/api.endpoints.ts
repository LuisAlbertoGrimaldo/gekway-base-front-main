import { environment } from "environments/environment";

const BASE = environment.apiUrlHost;

export const API = {

  auth: {
    login: `${BASE}/auth/sign-in`,
    refresh: `${BASE}/auth/sign-in-with-token`,
    forgotPassword: `${BASE}/auth/forgot-password`,
    resetPassword: `${BASE}/auth/reset-password`
  },

  empresas: {
    consulta: `${BASE}/empresas/consulta`,
    insert: `${BASE}/empresas/insert`,
    update: `${BASE}/empresas/update`,
    delete: (id: number) => `${BASE}/empresas/delete/${id}`
  },

  usuarios: {
    consulta: `${BASE}/usuarios/consulta`,
    insert: `${BASE}/usuarios/insert`,
    update: `${BASE}/usuarios/update`,
    delete: (id: number) => `${BASE}/usuarios/delete/${id}`
  },

  roles: {
    consulta: `${BASE}/roles/consulta`,
    insert: `${BASE}/roles/insert`,
    update: `${BASE}/roles/update`,
    delete: (id: number) => `${BASE}/roles/delete/${id}`
  }

};