export interface UsuarioRoles {

    id: number;

    nombre: string;

    descripcion?: string;

    seleccionado: boolean;

    loading?: boolean;

    guardado?: boolean;

}

export interface UsuarioRolesGroup {

    modulo: string;

    roles: UsuarioRoles[];

}