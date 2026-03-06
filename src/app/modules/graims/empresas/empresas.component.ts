import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { BaseCrudComponent } from 'app/core/crud/base-crud.component';

import { Empresa } from './empresa.types';
import { EmpresaService } from './empresa.service';
import { EmpresaDialogComponent } from './empresa-dialog.component';

import { HasPermissionDirective } from 'app/core/auth/has-permission.directive';
import { PERMISSIONS } from 'app/core/auth/guards/permissions';

@Component({
  selector: 'empresa-consulta',
  standalone: true,
  templateUrl: './empresas.component.html',

  imports: [

    CommonModule,
    FormsModule,

    MatTableModule,
    MatPaginatorModule,
    MatSortModule,

    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,

    HasPermissionDirective

  ]
})
export class EmpresasComponent
  extends BaseCrudComponent<Empresa> {

  titulo = 'Empresas';

  readonly PERMISSIONS = PERMISSIONS;

  displayedColumns = ['id', 'nombre', 'acciones'];

  columns = [
    { key: 'id', label: 'ID', filterable: true },
    { key: 'nombre', label: 'Nombre', filterable: true }
  ];

  columnaFiltroActiva = 'id';

  private empresaService = inject(EmpresaService);
  private dialog = inject(MatDialog);

  constructor() {

    super();

    this.filtros = {
      id: '',
      nombre: ''
    };

  }

  consulta() {

    return this.empresaService.consulta();

  }

  // ========================
  // ACCIONES HEADER
  // ========================

  accionesHeader = [

    {
      label: 'Limpiar filtros',
      icon: 'clear',
      color: 'warn',
      hasPermission: PERMISSIONS.EMPRESA_VIEW_FILTRO,
      callback: () => this.limpiarTodosFiltros(),
      disabled: () => !this.totalFiltrosActivos
    },

    {
      label: 'Nueva Empresa',
      icon: 'add',
      color: 'primary',
      hasPermission: PERMISSIONS.EMPRESA_NEW,
      callback: () => this.abrirAltaDialog(),
      alignRight: true
    }

  ];

  // ========================
  // ACCIONES FILA
  // ========================

  acciones = [

    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      hasPermission: PERMISSIONS.EMPRESA_EDIT,
      callback: (empresa: Empresa) =>
        this.abrirEdicionDialog(empresa)
    },

    {
      label: 'Borrar',
      icon: 'delete',
      color: 'warn',
      hasPermission: PERMISSIONS.EMPRESA_DELETE,
      callback: (empresa: Empresa) =>
        this.borrarEmpresa(empresa.id)
    }

  ];

  // ========================
  // FILTROS
  // ========================

  setColumnaFiltroActiva(col: string): void {

    this.columnaFiltroActiva = col;

  }

  get columnaFiltroActivaLabel(): string {

    const col =
      this.columns.find(
        c => c.key === this.columnaFiltroActiva
      );

    return col?.label || '';

  }

  // ========================
  // DIALOGOS
  // ========================

  abrirAltaDialog(): void {

    this.dialog
      .open(EmpresaDialogComponent, {
        width: '400px'
      })
      .afterClosed()
      .subscribe(result => {

        if (!result) return;

        this.empresaService
          .insert(result)
          .subscribe(nuevo => {

            this.notification
              .notifySuccess('Empresa creada');

            this.agregar(nuevo);

          });

      });

  }

  abrirEdicionDialog(empresa: Empresa): void {

    this.dialog
      .open(EmpresaDialogComponent, {
        width: '400px',
        data: empresa
      })
      .afterClosed()
      .subscribe(result => {

        if (!result) return;

        this.empresaService
          .update(result)
          .subscribe(actualizado => {

            this.notification
              .notifySuccess('Empresa actualizada');

            this.actualizar(actualizado);

          });

      });

  }

  borrarEmpresa(id: number): void {

    this.empresaService
      .delete(id)
      .subscribe(() => {

        this.notification
          .notifySuccess('Empresa eliminada');

        this.eliminar(id);

      });

  }

}