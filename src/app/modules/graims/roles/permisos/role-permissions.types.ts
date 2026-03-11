export interface RolePermission {

    id: number;

    nombre: string;

    codigo: string;

    modulo: string;

    seleccionado: boolean;

    loading?: boolean;
    guardado?: boolean;

}

export interface RolePermissionGroup {

    modulo: string;

    permisos: RolePermission[];

}