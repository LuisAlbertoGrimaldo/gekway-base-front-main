import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { Usuario } from './usuario.types';
import { Empresa } from 'app/modules/graims/empresas/empresa.types';
import { EmpresaService } from 'app/modules/graims/empresas/empresa.service';
import { noWhitespaceValidator } from 'app/shared/validators/no-whitespace.validator';

@Component({
  selector: 'usuario-dialog',
  standalone: true,
  templateUrl: './usuario-dialog.component.html',
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
export class UsuarioDialogComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  empresas: Empresa[] = [];

  constructor(
    private fb: NonNullableFormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    private empresaService: EmpresaService,
    @Inject(MAT_DIALOG_DATA) public data: Usuario | null
  ) {
    this.isEditMode = !!data;

    this.form = this.fb.group({
      id: [data?.id],
      nombre: [data?.nombre || '', [Validators.required, noWhitespaceValidator]],
      correo: [data?.correo || '', [Validators.required, Validators.email]]
      //password: [data?.password || '', this.isEditMode ? [] : [Validators.required]],
      //empresa: [data?.empresa || null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.empresaService.consulta().subscribe({
      next: data => this.empresas = data
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue() as Usuario);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}