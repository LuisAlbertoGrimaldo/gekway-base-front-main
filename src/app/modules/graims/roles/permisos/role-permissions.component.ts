import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { FormsModule } from '@angular/forms';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';

import { RoleService } from '../role.service';
import { RolePermission, RolePermissionGroup } from './role-permissions.types';
import { NotificationService } from 'app/core/services/notification.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'role-permissions',
    standalone: true,
    templateUrl: './role-permissions.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule
    ]
})
export class RolePermissionsComponent implements OnInit {

    rolId!: number;

    rolNombre = '';

    loading = false;

    filtro = '';

    permisosAgrupados: RolePermissionGroup[] = [];
    permisosOriginales: RolePermission[] = [];

    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private roleService = inject(RoleService);
    private notification = inject(NotificationService);
    private router = inject(Router);

    ngOnInit(): void {

        this.rolId = Number(this.route.snapshot.paramMap.get('id'));

        const nav = history.state;

        if (nav?.rolNombre) {
            this.rolNombre = nav.rolNombre;
        }

        this.cargarPermisos();

    }

    cargarPermisos(): void {

        this.loading = true;

        this.roleService
            .consultaPermisosRol(this.rolId)
            .pipe(finalize(() => {

                this.loading = false;
                this.cdr.markForCheck();

            }))
            .subscribe({

                next: (data: RolePermission[]) => {

                    this.permisosOriginales = data;

                    this.permisosAgrupados = this.agruparPorModulo(data);

                    this.cdr.markForCheck();

                },

                error: () =>
                    this.notification.notifyError('Error al cargar permisos')

            });

    }

    agruparPorModulo(permisos: RolePermission[]): RolePermissionGroup[] {

        const map = new Map<string, RolePermission[]>();

        permisos.forEach(p => {

            if (!map.has(p.modulo)) {
                map.set(p.modulo, []);
            }

            map.get(p.modulo)!.push(p);

        });

        return Array.from(map.entries()).map(([modulo, permisos]) => ({
            modulo,
            permisos
        }));

    }

    buscarPermisos(): void {

        if (!this.filtro) {

            this.permisosAgrupados = this.agruparPorModulo(this.permisosOriginales);

        } else {

            const filtrados = this.permisosOriginales.filter(p =>
                p.nombre.toLowerCase().includes(this.filtro.toLowerCase())
            );

            this.permisosAgrupados = this.agruparPorModulo(filtrados);

        }

        this.cdr.markForCheck();

    }

    togglePermiso(permiso: RolePermission) {

        permiso.loading = true;
        permiso.guardado = false;

        this.cdr.markForCheck();

        const request = permiso.seleccionado
            ? this.roleService.quitarPermiso(this.rolId, permiso.id)
            : this.roleService.agregarPermiso(this.rolId, permiso.id);

        request
            .pipe(finalize(() => {

                permiso.loading = false;
                this.cdr.markForCheck();

            }))
            .subscribe({

                next: () => {

                    permiso.seleccionado = !permiso.seleccionado;

                    permiso.guardado = true;

                    this.cdr.markForCheck();

                    setTimeout(() => {

                        permiso.guardado = false;
                        this.cdr.markForCheck();

                    }, 2000);

                },

                error: () =>
                    this.notification.notifyError('Error al actualizar permiso')

            });

    }

    toggleModulo(grupo: RolePermissionGroup, event: any) {

        const checked = event.checked;

        grupo.permisos.forEach(p => {

            if (p.seleccionado !== checked) {

                this.togglePermiso(p);

            }

        });

    }

    toggleTodos(event: any) {

        const checked = event.checked;

        this.permisosAgrupados.forEach(g => {

            g.permisos.forEach(p => {

                if (p.seleccionado !== checked) {

                    this.togglePermiso(p);

                }

            });

        });

    }

    moduloCompleto(grupo: RolePermissionGroup): boolean {

        return grupo.permisos.every(p => p.seleccionado);

    }

    todosSeleccionados(): boolean {

        return this.permisosAgrupados.every(g =>
            g.permisos.every(p => p.seleccionado)
        );

    }

    contadorModulo(grupo: RolePermissionGroup): string {

        const activos = grupo.permisos.filter(p => p.seleccionado).length;

        return `${activos}/${grupo.permisos.length}`;

    }

    trackByPermiso(index: number, permiso: RolePermission) {

        return permiso.id;

    }

    volver() {

        this.router.navigate(['/roles']);

    }

}