export interface Usuario {
  id?: number;
  empresaId: number;
  nombre: string;
  correo: string;
  telefonoMovil?: string;
  telefonoFijo?: string;
  direccion?: string;
  estado?: boolean;
  verificado?: boolean;
  esSuperAdmin?: boolean;
}