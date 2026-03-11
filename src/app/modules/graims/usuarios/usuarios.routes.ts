import { Route } from '@angular/router';
import { UsuariosComponent } from './usuarios.component';
import { UsuarioRolesComponent } from './usuarios-roles/usuario-roles.component';

export const usuariosRoutes: Route[] = [
    {
        path: '',
        component: UsuariosComponent
    },
    {
        path: ':id/roles',
        component: UsuarioRolesComponent
    }
];