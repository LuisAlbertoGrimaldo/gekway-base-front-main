import {
  Directive,
  OnInit,
  AfterViewInit,
  ViewChild,
  inject
} from '@angular/core';

import { finalize } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { NotificationService } from 'app/core/services/notification.service';

@Directive()
export abstract class BaseCrudComponent<T>
  implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<T>([]);

  loading = false;

  filtros: Record<string, string> = {};

  private debounceTimer?: ReturnType<typeof setTimeout>;

  protected notification = inject(NotificationService);

  protected abstract consulta(): any;

  ngOnInit(): void {

    this.configurarFiltro();
    this.cargar();

  }

  ngAfterViewInit(): void {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  // ========================
  // DATA
  // ========================

  cargar(): void {

    this.loading = true;

    this.consulta()
      .pipe(finalize(() => this.loading = false))
      .subscribe({

        next: (data: T[]) => {

          this.dataSource.data = data;

        },

        error: () => {

          this.notification.notifyError('Error al cargar datos');

        }

      });

  }

  agregar(item: T): void {

    this.dataSource.data = [
      ...this.dataSource.data,
      item
    ];

  }

  actualizar(item: any, idKey = 'id'): void {

    const index =
      this.dataSource.data
        .findIndex((e: any) => e[idKey] === item[idKey]);

    if (index !== -1) {

      this.dataSource.data[index] = item;

      this.dataSource._updateChangeSubscription();

    }

  }

  eliminar(id: number, idKey = 'id'): void {

    this.dataSource.data =
      this.dataSource.data
        .filter((e: any) => e[idKey] !== id);

  }

  // ========================
  // FILTROS
  // ========================

  configurarFiltro(): void {

    this.dataSource.filterPredicate = (data: any, filter: string) => {

      const filtros = JSON.parse(filter);

      return Object.keys(filtros)
        .every(key => {

          if (!filtros[key]) return true;

          const value = data[key]
            ?.toString()
            .toLowerCase();

          return value?.includes(
            filtros[key].toLowerCase()
          );

        });

    };

  }

  aplicarFiltros(): void {

    this.dataSource.filter =
      JSON.stringify(this.filtros);

  }

  aplicarFiltrosDebounce(): void {

    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {

      this.aplicarFiltros();

    }, 250);

  }

  limpiarFiltro(columna: string): void {

    this.filtros[columna] = '';

    this.aplicarFiltros();

  }

  limpiarTodosFiltros(): void {

    Object.keys(this.filtros)
      .forEach(k => this.filtros[k] = '');

    this.aplicarFiltros();

  }

  tieneFiltro(columna: string): boolean {

    return !!this.filtros[columna]?.trim();

  }

  get totalFiltrosActivos(): number {

    return Object.values(this.filtros)
      .filter(v => v?.trim())
      .length;

  }

}