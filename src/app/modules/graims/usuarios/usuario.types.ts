export interface Usuario {
  id?: number;

  empresaId: number;
  empresaNombre?: string;

  nombre: string;
  correo: string;

  telefonoMovil?: string;
  telefonoFijo?: string;
  direccion?: string;

  estado?: boolean;
  verificado?: boolean;

  esSuperAdmin?: boolean;
}