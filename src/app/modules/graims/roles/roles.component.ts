import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  inject,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { Router } from '@angular/router';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { RoleService } from './role.service';
import { Role } from './role.types';
import { NotificationService } from 'app/core/services/notification.service';
import { RolDialogComponent } from './role-dialog.component';
import { PERMISSIONS } from 'app/core/auth/guards/permissions';
import { HasPermissionDirective } from 'app/core/auth/has-permission.directive';

type FiltroKey = 'id' | 'nombre' | 'descripcion';

@Component({
  selector: 'role-consulta',
  standalone: true,
  templateUrl: './roles.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MatSortModule,
    MatPaginatorModule,
    HasPermissionDirective
  ]
})
export class RolesComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly titulo = 'Roles';
  readonly PERMISSIONS = PERMISSIONS;

  readonly accionesHeader = [
    {
      label: 'Limpiar filtros',
      icon: 'clear',
      color: 'warn',
      hasPermission: PERMISSIONS.ROL_VIEW_FILTRO,
      callback: () => this.limpiarTodosFiltros(),
      disabled: () => !this.totalFiltrosActivos
    },
    {
      label: 'Importar Excel',
      icon: 'upload',
      color: 'primary',
      hasPermission: PERMISSIONS.ROL_IMPORTAR_EXCEL,
      callback: () => this.fileInput.nativeElement.click()
    },
    {
      label: 'Nuevo Rol',
      icon: 'add',
      color: 'primary',
      hasPermission: PERMISSIONS.ROL_NEW,
      callback: () => this.abrirAltaDialog(),
      alignRight: true
    }
  ];

  readonly acciones = [
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      hasPermission: PERMISSIONS.ROL_EDIT,
      callback: (rol: Role) => this.abrirEdicionDialog(rol)
    },
    {
      label: 'Borrar',
      icon: 'delete',
      color: 'warn',
      hasPermission: PERMISSIONS.ROL_DELETE,
      callback: (rol: Role) => this.borrarRol(rol.id)
    },
    {
      label: 'Permisos',
      icon: 'security',
      color: 'primary',
      hasPermission: PERMISSIONS.ROL_EDIT,
      callback: (rol: Role) => this.verPermisos(rol)
    }
  ];

  readonly columns: { key: FiltroKey; label: string; filterable: boolean }[] = [
    { key: 'id', label: 'ID', filterable: true },
    { key: 'nombre', label: 'Nombre', filterable: true },
    { key: 'descripcion', label: 'Descripción', filterable: true }
  ];

  readonly displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'acciones'];
  readonly rolesDataSource = new MatTableDataSource<Role>([]);

  filtros: Record<FiltroKey, string> = {
    id: '',
    nombre: '',
    descripcion: ''
  };

  private filtrosCache: Record<FiltroKey, string> = this.filtros;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  columnaFiltroActiva: FiltroKey = 'id';
  loading = false;

  private roleService = inject(RoleService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // ========================
  // LIFECYCLE
  // ========================
  ngOnInit(): void {
    this.configurarFiltro();
    this.cargarRoles();
  }

  ngAfterViewInit(): void {
    this.rolesDataSource.sort = this.sort;
    this.rolesDataSource.paginator = this.paginator;
  }

  // ========================
  // FILTROS
  // ========================
  get totalFiltrosActivos(): number {
    return Object.values(this.filtros).filter(v => v?.trim()).length;
  }

  get columnaFiltroActivaLabel(): string {
    const col = this.columns.find(c => c.key === this.columnaFiltroActiva);
    return col?.label || '';
  }

  setColumnaFiltroActiva(col: FiltroKey): void {
    this.columnaFiltroActiva = col;
  }

  tieneFiltro(columna: FiltroKey): boolean {
    return !!this.filtros[columna]?.trim();
  }

  private configurarFiltro(): void {

    this.rolesDataSource.filterPredicate = (data: Role) => {

      const f = this.filtrosCache;

      return (
        (!f.id || data.id?.toString().includes(f.id)) &&
        (!f.nombre || data.nombre?.toLowerCase().includes(f.nombre.toLowerCase())) &&
        (!f.descripcion || data.descripcion?.toLowerCase().includes(f.descripcion.toLowerCase()))
      );

    };

  }

  aplicarFiltros(): void {
    this.filtrosCache = { ...this.filtros };
    this.rolesDataSource.filter = Math.random().toString();
  }

  aplicarFiltrosDebounce(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.aplicarFiltros(), 250);
  }

  limpiarFiltro(columna: FiltroKey): void {
    this.filtros[columna] = '';
    this.aplicarFiltros();
  }

  limpiarTodosFiltros(): void {

    (Object.keys(this.filtros) as FiltroKey[])
      .forEach(key => (this.filtros[key] = ''));

    this.aplicarFiltros();

  }

  // ========================
  // DATA
  // ========================
  private actualizarDataSource(data: Role[]): void {
    this.rolesDataSource.data = [...data];
  }

  cargarRoles(): void {

    this.loading = true;

    this.roleService
      .consulta()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: data => this.actualizarDataSource(data),
        error: () => this.notification.notifyError('Error al cargar roles')
      });

  }

  // ========================
  // DIALOGOS
  // ========================
  private abrirDialogo(data: Role | null) {

    return this.dialog.open(RolDialogComponent, {
      width: '400px',
      data
    }).afterClosed();

  }

  abrirAltaDialog(): void {

    this.abrirDialogo(null).subscribe(result => {

      if (!result) return;

      this.roleService.alta(result).subscribe({
        next: nuevo => {
          this.notification.notifySuccess('Rol creado correctamente');
          this.actualizarDataSource([...this.rolesDataSource.data, nuevo]);
        },
        error: () => this.notification.notifyError('Error al crear rol')
      });

    });

  }

  abrirEdicionDialog(rol: Role): void {

    this.abrirDialogo({ ...rol }).subscribe(result => {

      if (!result) return;

      this.roleService.actualizar(result).subscribe({
        next: actualizado => {

          this.notification.notifySuccess('Rol actualizado correctamente');

          const data = this.rolesDataSource.data.map(r =>
            r.id === actualizado.id ? actualizado : r
          );

          this.actualizarDataSource(data);

        },
        error: () => this.notification.notifyError('Error al actualizar rol')
      });

    });

  }

  borrarRol(id: number): void {

    this.roleService.borrar(id).subscribe({
      next: () => {

        this.notification.notifySuccess('Rol eliminado correctamente');

        const data = this.rolesDataSource.data.filter(r => r.id !== id);
        this.actualizarDataSource(data);

      },
      error: () => this.notification.notifyError('Error al eliminar rol')
    });

  }

  // ========================
  // IMPORTAR
  // ========================
  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    this.roleService.importarExcel(formData).subscribe({
      next: () => {
        this.notification.notifySuccess('Roles importados correctamente');
        this.cargarRoles();
      },
      error: err => {
        this.notification.notifyError(err.error || 'Error al importar roles');
      }
    });

  }

  // ========================
  // PERMISOS
  // ========================
  verPermisos(rol: Role): void {
    this.router.navigate(
        ['/roles', rol.id, 'permisos'],
        {
            state: { rolNombre: rol.nombre }
        }
    );

  }

}