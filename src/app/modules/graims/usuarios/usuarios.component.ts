import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  inject
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
import { MatCheckboxModule } from '@angular/material/checkbox';

import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.types';
import { NotificationService } from 'app/core/services/notification.service';
import { UsuarioDialogComponent } from './usuario-dialog.component';
import { HasPermissionDirective } from 'app/core/auth/has-permission.directive';
import { PERMISSIONS } from 'app/core/auth/guards/permissions';

type FiltroKey = 'id' | 'nombre' | 'correo' | 'empresa';

type ColumnKey = FiltroKey | 'estado' | 'superAdmin';

interface TableColumn {
  key: ColumnKey;
  label: string;
  filterable: boolean;
  visible: boolean;
}

interface HeaderAction {
  label: string;
  icon: string;
  color?: string;
  callback?: () => void;
  disabled?: () => boolean;
  hasPermission?: string;
  alignRight?: boolean;
  menu?: string;
}

@Component({
  selector: 'usuario-consulta',
  standalone: true,
  templateUrl: './usuarios.component.html',
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
    MatCheckboxModule,
    HasPermissionDirective
  ]
})
export class UsuariosComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly titulo = 'Usuarios';
  readonly PERMISSIONS = PERMISSIONS;

  readonly accionesHeader = [
  {
    label: 'Limpiar filtros',
    icon: 'clear',
    color: 'warn',
    callback: () => this.limpiarTodosFiltros(),
    disabled: () => !this.totalFiltrosActivos
  },
  {
    label: 'Nuevo Usuario',
    icon: 'add',
    color: 'primary',
    callback: () => this.abrirAltaDialog(),
    hasPermission: PERMISSIONS.USUARIO_NEW,
    alignRight: true
  }
];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID', filterable: true, visible: true },
    { key: 'nombre', label: 'Nombre', filterable: true, visible: true },
    { key: 'correo', label: 'Correo', filterable: true, visible: true },
    { key: 'empresa', label: 'Empresa', filterable: true, visible: true },
    { key: 'estado', label: 'Estado', filterable: false, visible: true },
    { key: 'superAdmin', label: 'Super Admin', filterable: false, visible: false }
  ];

  get displayedColumns(): string[] {
    return [
      ...this.columns.filter(c => c.visible).map(c => c.key),
      'acciones'
    ];
  }

  usuariosDataSource = new MatTableDataSource<Usuario>([]);

  filtros: Record<FiltroKey, string> = {
    id: '',
    nombre: '',
    correo: '',
    empresa: ''
  };

  private filtrosCache: Record<FiltroKey, string> = { ...this.filtros };

  columnaFiltroActiva: FiltroKey = 'id';

  private debounceTimer?: ReturnType<typeof setTimeout>;

  loading = false;

  private usuarioService = inject(UsuarioService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  ngOnInit(): void {

    const config = localStorage.getItem('usuarios-columnas');

    if (config) {
      this.columns = JSON.parse(config);
    }

    this.configurarFiltro();

    this.cargarUsuarios();

  }

  ngAfterViewInit(): void {

    this.usuariosDataSource.sort = this.sort;
    this.usuariosDataSource.paginator = this.paginator;

  }

  get totalFiltrosActivos(): number {
    return Object.values(this.filtros).filter(v => v?.trim()).length;
  }

  get columnaFiltroActivaLabel(): string {
    const col = this.columns.find(c => c.key === this.columnaFiltroActiva);
    return col?.label || '';
  }

  setColumnaFiltroActiva(col: ColumnKey): void {

    if (this.esFiltroKey(col)) {
      this.columnaFiltroActiva = col;
    }

  }

  tieneFiltro(columna: ColumnKey): boolean {

    if (!this.esFiltroKey(columna)) return false;

    return !!this.filtros[columna]?.trim();

  }

  guardarColumnas(): void {

    localStorage.setItem(
      'usuarios-columnas',
      JSON.stringify(this.columns)
    );

  }

  private esFiltroKey(col: ColumnKey): col is FiltroKey {
    return ['id', 'nombre', 'correo', 'empresa'].includes(col);
  }

  private configurarFiltro(): void {

    this.usuariosDataSource.filterPredicate = (data: Usuario, filter: string) => {

      const f = JSON.parse(filter);

      return (
        (!f.id || data.id?.toString().includes(f.id)) &&
        (!f.nombre || data.nombre?.toLowerCase().includes(f.nombre.toLowerCase())) &&
        (!f.correo || data.correo?.toLowerCase().includes(f.correo.toLowerCase()))
      );

    };

  }

  aplicarFiltros(): void {

    this.filtrosCache = { ...this.filtros };

    this.usuariosDataSource.filter = JSON.stringify(this.filtrosCache);

  }

  aplicarFiltrosDebounce(): void {

    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(
      () => this.aplicarFiltros(),
      250
    );

  }

  limpiarFiltro(columna: ColumnKey): void {

    if (!this.esFiltroKey(columna)) return;

    this.filtros[columna] = '';

    this.aplicarFiltros();

  }

  limpiarTodosFiltros(): void {

    Object.keys(this.filtros).forEach(key => {
      this.filtros[key as FiltroKey] = '';
    });

    this.aplicarFiltros();

  }

  cargarUsuarios(): void {

    this.loading = true;

    this.usuarioService
      .consulta()
      .pipe(finalize(() => this.loading = false))
      .subscribe({

        next: data => {
          this.usuariosDataSource.data = data;
        },

        error: () =>
          this.notification.notifyError('Error al cargar usuarios')

      });

  }

  abrirAltaDialog(): void {

    this.dialog.open(
      UsuarioDialogComponent,
      {
        width: '450px',
        data: null,
        autoFocus: false
      }
    ).afterClosed()
      .subscribe(result => {

        if (!result) return;

        this.usuarioService.alta(result).subscribe({

          next: () => {

            this.notification.notifySuccess('Usuario creado');

            this.cargarUsuarios();

          }

        });

      });

  }

  abrirEdicionDialog(usuario: Usuario): void {

    this.dialog.open(
      UsuarioDialogComponent,
      { width: '400px', data: usuario }
    ).afterClosed()
      .subscribe(result => {

        if (!result) return;

        this.usuarioService.actualizar(result).subscribe({

          next: () => {

            this.notification.notifySuccess('Usuario actualizado');

            this.cargarUsuarios();

          }

        });

      });

  }

  borrarUsuario(id: number): void {

    this.usuarioService.borrar(id).subscribe({

      next: () => {

        this.notification.notifySuccess('Usuario eliminado');

        this.cargarUsuarios();

      }

    });

  }

  verRoles(usuario: Usuario): void {

    this.router.navigate(
      ['/usuarios', usuario.id, 'roles'],
      {
        state: { usuarioNombre: usuario.nombre }
      }
    );

  }

}