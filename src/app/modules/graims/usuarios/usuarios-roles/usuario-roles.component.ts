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

import { UsuarioService } from '../usuario.service';
import { UsuarioRoles } from './usuario-roles.types';
import { NotificationService } from 'app/core/services/notification.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'usuario-roles',
    standalone: true,
    templateUrl: './usuario-roles.component.html',
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
        MatInputModule
    ]
})
export class UsuarioRolesComponent implements OnInit {

    usuarioId!: number;
    usuarioNombre = '';

    loading = false;

    filtro = '';

    roles: UsuarioRoles[] = [];
    rolesOriginales: UsuarioRoles[] = [];

    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);

    private usuarioService = inject(UsuarioService);
    private notification = inject(NotificationService);
    private router = inject(Router);

    ngOnInit(): void {

        this.usuarioId = Number(this.route.snapshot.paramMap.get('id'));

        const nav = history.state;

        if (nav?.usuarioNombre) {
            this.usuarioNombre = nav.usuarioNombre;
        }

        this.cargarRoles();

    }

    cargarRoles(): void {

        this.loading = true;

        this.usuarioService
            .consultaRolesUsuario(this.usuarioId)
            .pipe(finalize(() => {

                this.loading = false;
                this.cdr.markForCheck();

            }))
            .subscribe({

                next: (data: UsuarioRoles[]) => {

                    this.rolesOriginales = data;
                    this.roles = [...data];

                    this.cdr.markForCheck();

                },

                error: () =>
                    this.notification.notifyError('Error al cargar roles')

            });

    }

    buscarRoles(): void {

        if (!this.filtro) {

            this.roles = [...this.rolesOriginales];

        } else {

            this.roles = this.rolesOriginales.filter(r =>
                r.nombre.toLowerCase().includes(this.filtro.toLowerCase())
            );

        }

        this.cdr.markForCheck();

    }

    toggleRol(rol: UsuarioRoles) {

        rol.loading = true;
        rol.guardado = false;

        this.cdr.markForCheck();

        const request = rol.seleccionado
            ? this.usuarioService.quitarRol(this.usuarioId, rol.id)
            : this.usuarioService.agregarRol(this.usuarioId, rol.id);

        request
            .pipe(finalize(() => {

                rol.loading = false;
                this.cdr.markForCheck();

            }))
            .subscribe({

                next: () => {

                    rol.seleccionado = !rol.seleccionado;

                    rol.guardado = true;

                    this.cdr.markForCheck();

                    setTimeout(() => {

                        rol.guardado = false;
                        this.cdr.markForCheck();

                    }, 2000);

                },

                error: () =>
                    this.notification.notifyError('Error al actualizar rol')

            });

    }

    todosSeleccionados(): boolean {

        return this.roles.every(r => r.seleccionado);

    }

    toggleTodos(event: any) {

        const checked = event.checked;

        this.roles.forEach(r => {

            if (r.seleccionado !== checked) {

                this.toggleRol(r);

            }

        });

    }

    trackByRol(index: number, rol: UsuarioRoles) {

        return rol.id;

    }

    volver() {

        this.router.navigate(['/usuarios']);

    }

}