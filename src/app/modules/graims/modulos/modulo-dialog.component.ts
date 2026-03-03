import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Modulo } from './modulo.types';
import { noWhitespaceNoSymbolsNoNumValidator } from 'app/shared/validators/no-whitespace-no-symbols-no-num.validator';
import { noWhitespaceValidator } from 'app/shared/validators/no-whitespace.validator';

@Component({
  selector: 'modulo-dialog',
  standalone: true,
  templateUrl: './modulo-dialog.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class ModuloDialogComponent {
  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: NonNullableFormBuilder,
    private dialogRef: MatDialogRef<ModuloDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Modulo | null
  ) {
    this.isEditMode = !!data;

    this.form = this.fb.group({
      id: [data?.id],
      nombre: [data?.nombre || '', [Validators.required, noWhitespaceNoSymbolsNoNumValidator]],
      codigo: [data?.codigo || '', [Validators.required, noWhitespaceNoSymbolsNoNumValidator]],
      orden: [data?.orden || 0]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue() as Modulo);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}