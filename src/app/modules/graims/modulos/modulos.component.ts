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

import { ModuloService } from './modulo.service';
import { Modulo } from './modulo.types';
import { NotificationService } from 'app/core/services/notification.service';
import { ModuloDialogComponent } from './modulo-dialog.component';
import { HasPermissionDirective } from 'app/core/auth/has-permission.directive';
import { PERMISSIONS } from 'app/core/auth/guards/permissions';

type FiltroKey = 'id' | 'nombre' | 'codigo';

@Component({
  selector: 'modulo-consulta',
  standalone: true,
  templateUrl: './modulos.component.html',
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
export class ModulosComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly titulo = 'Módulos';
  readonly PERMISSIONS = PERMISSIONS;

  readonly accionesHeader = [
    {
      label: 'Limpiar filtros',
      icon: 'clear',
      color: 'warn',
      hasPermission: PERMISSIONS.MODULO_VIEW_FILTRO,
      callback: () => this.limpiarTodosFiltros(),
      disabled: () => !this.totalFiltrosActivos
    },
   /* {
      label: 'Importar Excel',
      icon: 'upload',
      color: 'primary',
      hasPermission: PERMISSIONS.MODULO_IMPORTAR_EXCEL,
      callback: () => this.fileInput.nativeElement.click()
    },*/
    {
      label: 'Nuevo Módulo',
      icon: 'add',
      color: 'primary',
      hasPermission: PERMISSIONS.MODULO_NEW,
      callback: () => this.abrirAltaDialog(),
      alignRight: true
    }
  ];

  readonly acciones = [
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      hasPermission: PERMISSIONS.MODULO_EDIT,
      callback: (modulo: Modulo) => this.abrirEdicionDialog(modulo)
    },
    {
      label: 'Borrar',
      icon: 'delete',
      color: 'warn',
      hasPermission: PERMISSIONS.MODULO_DELETE,
      callback: (modulo: Modulo) => this.borrarModulo(modulo.id)
    }
  ];

  readonly columns: { key: FiltroKey; label: string; filterable: boolean }[] = [
    { key: 'id', label: 'ID', filterable: true },
    { key: 'nombre', label: 'Nombre', filterable: true },
    { key: 'codigo', label: 'Código', filterable: true }
  ];

  readonly displayedColumns: string[] = ['id', 'nombre', 'codigo', 'acciones'];
  readonly modulosDataSource = new MatTableDataSource<Modulo>([]);

  filtros: Record<FiltroKey, string> = { id: '', nombre: '', codigo: '' };
  private filtrosCache: Record<FiltroKey, string> = this.filtros;
  private debounceTimer?: ReturnType<typeof setTimeout>;
  columnaFiltroActiva: FiltroKey = 'id';
  loading = false;

  private moduloService = inject(ModuloService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.configurarFiltro();
    this.cargarModulos();
  }

  ngAfterViewInit(): void {
    this.modulosDataSource.sort = this.sort;
    this.modulosDataSource.paginator = this.paginator;
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
    this.modulosDataSource.filterPredicate = (data: Modulo) => {
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
    this.modulosDataSource.filter = Math.random().toString();
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

  private actualizarDataSource(data: Modulo[]): void {
    this.modulosDataSource.data = [...data];
  }

  cargarModulos(): void {
    this.loading = true;
    this.moduloService
      .consulta()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: data => this.actualizarDataSource(data),
        error: () => this.notification.notifyError('Error al cargar módulos')
      });
  }

  private abrirDialogo(data: Modulo | null) {
    return this.dialog.open(ModuloDialogComponent, { width: '400px', data }).afterClosed();
  }

  abrirAltaDialog(): void {
    this.abrirDialogo(null).subscribe(result => {
      if (!result) return;
      this.moduloService.alta(result).subscribe({
        next: nuevo => {
          this.notification.notifySuccess('Módulo creado correctamente');
          this.actualizarDataSource([...this.modulosDataSource.data, nuevo]);
        },
        error: () => this.notification.notifyError('Error al crear módulo')
      });
    });
  }

  abrirEdicionDialog(modulo: Modulo): void {
    this.abrirDialogo({ ...modulo }).subscribe(result => {
      if (!result) return;
      this.moduloService.actualizar(result).subscribe({
        next: actualizado => {
          this.notification.notifySuccess('Módulo actualizado correctamente');
          const data = this.modulosDataSource.data.map(m => m.id === actualizado.id ? actualizado : m);
          this.actualizarDataSource(data);
        },
        error: () => this.notification.notifyError('Error al actualizar módulo')
      });
    });
  }

  borrarModulo(id: number): void {
    this.moduloService.borrar(id).subscribe({
      next: () => {
        this.notification.notifySuccess('Módulo eliminado correctamente');
        const data = this.modulosDataSource.data.filter(m => m.id !== id);
        this.actualizarDataSource(data);
      },
      error: () => this.notification.notifyError('Error al eliminar módulo')
    });
  }

  /*onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.moduloService.importarExcel(formData).subscribe({
      next: () => {
        this.notification.notifySuccess('Módulos importados correctamente');
        this.cargarModulos();
      },
      error: err => this.notification.notifyError(err.error || 'Error al importar módulos')
    });
  }*/
}