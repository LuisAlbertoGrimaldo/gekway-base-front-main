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

import { EmpresaService } from './empresa.service';
import { Empresa } from './empresa.types';
import { NotificationService } from 'app/core/services/notification.service';
import { EmpresaDialogComponent } from './empresa-dialog.component';
import { HasPermissionDirective } from 'app/core/auth/has-permission.directive';
import { PERMISSIONS } from 'app/core/auth/guards/permissions';

type FiltroKey = 'id' | 'nombre';

@Component({
  selector: 'empresa-consulta',
  standalone: true,
  templateUrl: './empresas.component.html',
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
export class EmpresasComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly titulo = 'Empresas';
  readonly PERMISSIONS = PERMISSIONS;

  readonly accionesHeader = [
    {
      label: 'Limpiar filtros',
      icon: 'clear',
      color: 'warn',
      hasPermission: PERMISSIONS.EMPRESA_VIEW_FILTRO,
      callback: () => this.limpiarTodosFiltros(),
      disabled: () => !this.totalFiltrosActivos
    },
    {
      label: 'Importar Excel',
      icon: 'upload',
      color: 'primary',
      hasPermission: PERMISSIONS.EMPRESA_IMPORTAR_EXCEL,
      callback: () => this.fileInput.nativeElement.click()
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

  readonly acciones = [
    {
      label: 'Editar',
      icon: 'edit',
      color: 'primary',
      hasPermission: PERMISSIONS.EMPRESA_EDIT,
      callback: (empresa: Empresa) => this.abrirEdicionDialog(empresa)
    },
    {
      label: 'Borrar',
      icon: 'delete',
      color: 'warn',
      hasPermission: PERMISSIONS.EMPRESA_DELETE,
      callback: (empresa: Empresa) => this.borrarEmpresa(empresa.id)
    }
  ];

  readonly columns: { key: FiltroKey; label: string; filterable: boolean }[] = [
    { key: 'id', label: 'ID', filterable: true },
    { key: 'nombre', label: 'Nombre', filterable: true }
  ];

  readonly displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  readonly empresasDataSource = new MatTableDataSource<Empresa>([]);

  filtros: Record<FiltroKey, string> = { id: '', nombre: '' };
  private filtrosCache: Record<FiltroKey, string> = this.filtros;
  private debounceTimer?: ReturnType<typeof setTimeout>;
  columnaFiltroActiva: FiltroKey = 'id';
  loading = false;

  private empresaService = inject(EmpresaService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  // ========================
  // 🔄 LIFECYCLE
  // ========================
  ngOnInit(): void {
    this.configurarFiltro();
    this.cargarEmpresas();
  }

  ngAfterViewInit(): void {
    this.empresasDataSource.sort = this.sort;
    this.empresasDataSource.paginator = this.paginator;
  }

  // ========================
  // 🔎 FILTROS
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
    this.empresasDataSource.filterPredicate = (data: Empresa) => {
      const f = this.filtrosCache;
      return (
        (!f.id || data.id?.toString().includes(f.id)) &&
        (!f.nombre || data.nombre?.toLowerCase().includes(f.nombre.toLowerCase()))
      );
    };
  }

  aplicarFiltros(): void {
    this.filtrosCache = { ...this.filtros };
    this.empresasDataSource.filter = Math.random().toString();
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

  // ========================
  // 📡 DATA
  // ========================
  private actualizarDataSource(data: Empresa[]): void {
    this.empresasDataSource.data = [...data];
  }

  cargarEmpresas(): void {
    this.loading = true;
    this.empresaService
      .consulta()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: data => this.actualizarDataSource(data),
        error: () => this.notification.notifyError('Error al cargar empresas')
      });
  }

  // ========================
  // 🪟 DIALOGOS
  // ========================
  private abrirDialogo(data: Empresa | null) {
    return this.dialog.open(EmpresaDialogComponent, { width: '400px', data }).afterClosed();
  }

  abrirAltaDialog(): void {
    this.abrirDialogo(null).subscribe(result => {
      if (!result) return;
      this.empresaService.alta(result).subscribe({
        next: nuevo => {
          this.notification.notifySuccess('Empresa creada correctamente');
          this.actualizarDataSource([...this.empresasDataSource.data, nuevo]);
        },
        error: () => this.notification.notifyError('Error al crear empresa')
      });
    });
  }

  abrirEdicionDialog(empresa: Empresa): void {
    this.abrirDialogo({ ...empresa }).subscribe(result => {
      if (!result) return;
      this.empresaService.actualizar(result).subscribe({
        next: actualizado => {
          this.notification.notifySuccess('Empresa actualizada correctamente');
          const data = this.empresasDataSource.data.map(e => e.id === actualizado.id ? actualizado : e);
          this.actualizarDataSource(data);
        },
        error: () => this.notification.notifyError('Error al actualizar empresa')
      });
    });
  }

  borrarEmpresa(id: number): void {
    this.empresaService.borrar(id).subscribe({
      next: () => {
        this.notification.notifySuccess('Empresa eliminada correctamente');
        const data = this.empresasDataSource.data.filter(e => e.id !== id);
        this.actualizarDataSource(data);
      },
      error: () => this.notification.notifyError('Error al eliminar empresa')
    });
  }

  // ========================
  // 📂 IMPORTAR
  // ========================
 /* onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    this.empresaService.importarExcel(formData).subscribe({
      next: () => {
        this.notification.notifySuccess('Empresas importadas correctamente');
        this.cargarEmpresas();
      },
      error: err => this.notification.notifyError(err.error || 'Error al importar empresas')
    });
  }*/
}