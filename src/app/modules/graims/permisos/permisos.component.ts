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

import { PermisoService } from './permiso.service';
import { Permiso } from './permiso.types';
import { NotificationService } from 'app/core/services/notification.service';
import { PermisoDialogComponent } from './permiso-dialog.component';
import { HasPermissionDirective } from 'app/core/auth/has-permission.directive';
import { PERMISSIONS } from 'app/core/auth/guards/permissions';

type FiltroKey = 'id' | 'nombre' | 'codigo';

@Component({
  selector: 'permiso-consulta',
  standalone: true,
  templateUrl: './permisos.component.html',
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
export class PermisosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly titulo = 'Permisos';
  readonly PERMISSIONS = PERMISSIONS;

  readonly accionesHeader = [
    {
      label: 'Limpiar filtros',
      icon: 'clear',
      color: 'warn',
      hasPermission: PERMISSIONS.PERMISO_VIEW_FILTRO,
      callback: () => this.limpiarTodosFiltros(),
      disabled: () => !this.totalFiltrosActivos
    },
    {
      label: 'Importar Excel',
      icon: 'upload',
      color: 'primary',
      hasPermission: PERMISSIONS.PERMISO_IMPORTAR_EXCEL,
      callback: () => this.fileInput.nativeElement.click()
    },
    {
      label: 'Nuevo Permiso',
      icon: 'add',
      color: 'primary',
      hasPermission: PERMISSIONS.PERMISO_NEW,
      callback: () => this.abrirAltaDialog(),
      alignRight: true
    }
  ];

  readonly acciones = [
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      hasPermission: PERMISSIONS.PERMISO_EDIT,
      callback: (permiso: Permiso) => this.abrirEdicionDialog(permiso)
    },
    {
      label: 'Borrar',
      icon: 'delete',
      color: 'warn',
      hasPermission: PERMISSIONS.PERMISO_DELETE,
      callback: (permiso: Permiso) => this.borrarPermiso(permiso.id)
    }
  ];

  readonly columns: { key: FiltroKey; label: string; filterable: boolean }[] = [
    { key: 'id', label: 'ID', filterable: true },
    { key: 'nombre', label: 'Nombre', filterable: true },
    { key: 'codigo', label: 'Código', filterable: true }
  ];

  readonly displayedColumns: string[] = ['id', 'nombre', 'codigo', 'acciones'];
  readonly permisosDataSource = new MatTableDataSource<Permiso>([]);

  filtros: Record<FiltroKey, string> = { id: '', nombre: '', codigo: '' };
  private filtrosCache: Record<FiltroKey, string> = this.filtros;
  private debounceTimer?: ReturnType<typeof setTimeout>;
  columnaFiltroActiva: FiltroKey = 'id';
  loading = false;

  private permisoService = inject(PermisoService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.configurarFiltro();
    this.cargarPermisos();
  }

  ngAfterViewInit(): void {
    this.permisosDataSource.sort = this.sort;
    this.permisosDataSource.paginator = this.paginator;
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
    this.permisosDataSource.filterPredicate = (data: Permiso) => {
      const f = this.filtrosCache;
      return (
        (!f.id || data.id?.toString().includes(f.id)) &&
        (!f.nombre || data.nombre?.toLowerCase().includes(f.nombre.toLowerCase())) &&
        (!f.codigo || data.codigo?.toLowerCase().includes(f.codigo.toLowerCase()))
      );
    };
  }

  aplicarFiltros(): void {
    this.filtrosCache = { ...this.filtros };
    this.permisosDataSource.filter = Math.random().toString();
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

  private actualizarDataSource(data: Permiso[]): void {
    this.permisosDataSource.data = [...data];
  }

  cargarPermisos(): void {
    this.loading = true;
    this.permisoService
      .consulta()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: data => this.actualizarDataSource(data),
        error: () => this.notification.notifyError('Error al cargar permisos')
      });
  }

  private abrirDialogo(data: Permiso | null) {
    return this.dialog.open(PermisoDialogComponent, { width: '400px', data }).afterClosed();
  }

  abrirAltaDialog(): void {
    this.abrirDialogo(null).subscribe(result => {
      if (!result) return;
      this.permisoService.alta(result).subscribe({
        next: nuevo => {
          this.notification.notifySuccess('Permiso creado correctamente');
          this.actualizarDataSource([...this.permisosDataSource.data, nuevo]);
        },
        error: () => this.notification.notifyError('Error al crear permiso')
      });
    });
  }

  abrirEdicionDialog(permiso: Permiso): void {
    this.abrirDialogo({ ...permiso }).subscribe(result => {
      if (!result) return;
      this.permisoService.actualizar(result).subscribe({
        next: actualizado => {
          this.notification.notifySuccess('Permiso actualizado correctamente');
          const data = this.permisosDataSource.data.map(p => p.id === actualizado.id ? actualizado : p);
          this.actualizarDataSource(data);
        },
        error: () => this.notification.notifyError('Error al actualizar permiso')
      });
    });
  }

  borrarPermiso(id: number): void {
    this.permisoService.borrar(id).subscribe({
      next: () => {
        this.notification.notifySuccess('Permiso eliminado correctamente');
        const data = this.permisosDataSource.data.filter(p => p.id !== id);
        this.actualizarDataSource(data);
      },
      error: () => this.notification.notifyError('Error al eliminar permiso')
    });
  }

 /* onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.permisoService.importarExcel(formData).subscribe({
      next: () => {
        this.notification.notifySuccess('Permisos importados correctamente');
        this.cargarPermisos();
      },
      error: err => this.notification.notifyError(err.error || 'Error al importar permisos')
    });
  }*/
}