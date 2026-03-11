import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NonNullableFormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Role } from './role.types';
import { noWhitespaceValidator } from 'app/shared/validators/no-whitespace.validator';

@Component({
  selector: 'role-dialog',
  standalone: true,
  templateUrl: './role-dialog.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class RolDialogComponent {

  form: FormGroup;

  isEditMode: boolean;

  constructor(
    private fb: NonNullableFormBuilder,
    private dialogRef: MatDialogRef<RolDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Role | null
  ) {

    this.isEditMode = !!data;

    this.form = this.fb.group({

      id: [data?.id],

      nombre: [
        data?.nombre || '',
        [Validators.required, noWhitespaceValidator]
      ],

      descripcion: [
        data?.descripcion || ''
      ]

    });

  }

  guardar(): void {

    if (this.form.invalid) return;

    this.dialogRef.close(
      this.form.getRawValue() as Role
    );

  }

  cancelar(): void {

    this.dialogRef.close();

  }

}