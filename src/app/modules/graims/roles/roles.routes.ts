import { Route } from '@angular/router';

import { RolesComponent } from './roles.component';
import { RolePermissionsComponent } from './permisos/role-permissions.component';

export const rolesRoutes: Route[] = [

    {
        path: '',
        component: RolesComponent
    },

    {
        path: ':id/permisos',
        component: RolePermissionsComponent
    }

];