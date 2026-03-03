import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { Permiso } from './permiso.types';
import { Modulo } from '../modulos/modulo.types';
import { ModuloService } from '../modulos/modulo.service';

import { noWhitespaceNoSymbolsNoNumValidator } from 'app/shared/validators/no-whitespace-no-symbols-no-num.validator';


@Component({
  selector: 'permiso-dialog',
  standalone: true,
  templateUrl: './permiso-dialog.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule
  ]
})
export class PermisoDialogComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  modulos: Modulo[] = [];

  constructor(
    private fb: NonNullableFormBuilder,
    private dialogRef: MatDialogRef<PermisoDialogComponent>,
    private moduloService: ModuloService,
    @Inject(MAT_DIALOG_DATA) public data: Permiso | null
  ) {
    this.isEditMode = !!data;

    this.form = this.fb.group({
      id: [data?.id],
      nombre: [data?.nombre || '', [Validators.required, noWhitespaceNoSymbolsNoNumValidator]],
      codigo: [data?.codigo || '', [Validators.required, noWhitespaceNoSymbolsNoNumValidator]],
      modulo: [data?.moduloId || null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.moduloService.consulta().subscribe({
      next: data => this.modulos = data
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue() as Permiso);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}