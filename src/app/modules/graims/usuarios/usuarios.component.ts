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

import { UsuarioService } from './usuario.service';
import { Usuario } from './usuario.types';
import { NotificationService } from 'app/core/services/notification.service';
import { UsuarioDialogComponent } from './usuario-dialog.component';
import { HasPermissionDirective } from 'app/core/auth/has-permission.directive';
import { PERMISSIONS } from 'app/core/auth/guards/permissions';

type FiltroKey = 'id' | 'nombre' | 'correo';

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
      hasPermission: PERMISSIONS.USUARIO_VIEW_FILTRO,
      callback: () => this.limpiarTodosFiltros(),
      disabled: () => !this.totalFiltrosActivos
    },
    {
      label: 'Importar Excel',
      icon: 'upload',
      color: 'primary',
      hasPermission: PERMISSIONS.USUARIO_IMPORTAR_EXCEL,
      callback: () => this.fileInput.nativeElement.click()
    },
    {
      label: 'Nuevo Usuario',
      icon: 'add',
      color: 'primary',
      hasPermission: PERMISSIONS.USUARIO_NEW,
      callback: () => this.abrirAltaDialog(),
      alignRight: true
    }
  ];

  readonly acciones = [
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      hasPermission: PERMISSIONS.USUARIO_EDIT,
      callback: (usuario: Usuario) => this.abrirEdicionDialog(usuario)
    },
    {
      label: 'Borrar',
      icon: 'delete',
      color: 'warn',
      hasPermission: PERMISSIONS.USUARIO_DELETE,
      callback: (usuario: Usuario) => this.borrarUsuario(usuario.id)
    }
  ];

  readonly columns: { key: FiltroKey; label: string; filterable: boolean }[] = [
    { key: 'id', label: 'ID', filterable: true },
    { key: 'nombre', label: 'Nombre', filterable: true },
    { key: 'correo', label: 'Correo', filterable: true }
  ];

  readonly displayedColumns: string[] = ['id', 'nombre', 'correo', 'acciones'];
  readonly usuariosDataSource = new MatTableDataSource<Usuario>([]);

  filtros: Record<FiltroKey, string> = { id: '', nombre: '', correo: '' };
  private filtrosCache: Record<FiltroKey, string> = this.filtros;
  private debounceTimer?: ReturnType<typeof setTimeout>;
  columnaFiltroActiva: FiltroKey = 'id';
  loading = false;

  private usuarioService = inject(UsuarioService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
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

  setColumnaFiltroActiva(col: FiltroKey): void {
    this.columnaFiltroActiva = col;
  }

  tieneFiltro(columna: FiltroKey): boolean {
    return !!this.filtros[columna]?.trim();
  }

  private configurarFiltro(): void {
    this.usuariosDataSource.filterPredicate = (data: Usuario) => {
      const f = this.filtrosCache;
      return (
        (!f.id || data.id?.toString().includes(f.id)) &&
        (!f.nombre || data.nombre?.toLowerCase().includes(f.nombre.toLowerCase())) &&
        (!f.correo || data.correo?.toLowerCase().includes(f.correo.toLowerCase()))
      );
    };
  }

  aplicarFiltros(): void {
    this.filtrosCache = { ...this.filtros };
    this.usuariosDataSource.filter = Math.random().toString();
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
    (Object.keys(this.filtros) as FiltroKey[]).forEach(key => (this.filtros[key] = ''));
    this.aplicarFiltros();
  }

  private actualizarDataSource(data: Usuario[]): void {
    this.usuariosDataSource.data = [...data];
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.usuarioService
      .consulta()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: data => this.actualizarDataSource(data),
        error: () => this.notification.notifyError('Error al cargar usuarios')
      });
  }

  private abrirDialogo(data: Usuario | null) {
    return this.dialog.open(UsuarioDialogComponent, { width: '400px', data }).afterClosed();
  }

  abrirAltaDialog(): void {
    this.abrirDialogo(null).subscribe(result => {
      if (!result) return;
      this.usuarioService.alta(result).subscribe({
        next: nuevo => {
          this.notification.notifySuccess('Usuario creado correctamente');
          this.actualizarDataSource([...this.usuariosDataSource.data, nuevo]);
        },
        error: () => this.notification.notifyError('Error al crear usuario')
      });
    });
  }

  abrirEdicionDialog(usuario: Usuario): void {
    this.abrirDialogo({ ...usuario }).subscribe(result => {
      if (!result) return;
      this.usuarioService.actualizar(result).subscribe({
        next: actualizado => {
          this.notification.notifySuccess('Usuario actualizado correctamente');
          const data = this.usuariosDataSource.data.map(u => u.id === actualizado.id ? actualizado : u);
          this.actualizarDataSource(data);
        },
        error: () => this.notification.notifyError('Error al actualizar usuario')
      });
    });
  }

  borrarUsuario(id: number): void {
    this.usuarioService.borrar(id).subscribe({
      next: () => {
        this.notification.notifySuccess('Usuario eliminado correctamente');
        const data = this.usuariosDataSource.data.filter(u => u.id !== id);
        this.actualizarDataSource(data);
      },
      error: () => this.notification.notifyError('Error al eliminar usuario')
    });
  }

  /*onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.usuarioService.importarExcel(formData).subscribe({
      next: () => {
        this.notification.notifySuccess('Usuarios importados correctamente');
        this.cargarUsuarios();
      },
      error: err => this.notification.notifyError(err.error || 'Error al importar usuarios')
    });
  }*/
}