import {
  Component,
  Inject,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';

import {
  NonNullableFormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { Usuario } from './usuario.types';
import { Empresa } from 'app/modules/graims/empresas/empresa.types';
import { EmpresaService } from 'app/modules/graims/empresas/empresa.service';
import { UserService } from 'app/core/user/user.service';

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

  form!: FormGroup;

  isEditMode = false;

  empresas: Empresa[] = [];

  esSuperAdmin = false;

  empresaUsuario!: number;

  constructor(
    private fb: NonNullableFormBuilder,
    private dialogRef: MatDialogRef<UsuarioDialogComponent>,
    private empresaService: EmpresaService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: Usuario | null
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit(): void {

    this.userService.user$.subscribe((user: any) => {

      this.esSuperAdmin = user?.esSuperAdmin ?? false;

      this.empresaUsuario = user?.empresaId;

      this.crearFormulario();

      this.cargarEmpresas();

    });

  }

  private crearFormulario(): void {

    this.form = this.fb.group({

      id: [this.data?.id ?? null],

      empresaId: [
        this.data?.empresaId ?? this.empresaUsuario,
        Validators.required
      ],

      nombre: [
        this.data?.nombre ?? '',
        Validators.required
      ],

      correo: [
        this.data?.correo ?? '',
        [Validators.required, Validators.email]
      ],

      telefonoMovil: [
        this.data?.telefonoMovil ?? ''
      ],

      telefonoFijo: [
        this.data?.telefonoFijo ?? ''
      ],

      estado: [
        this.data?.estado ?? true
      ],

      verificado: [
        this.data?.verificado ?? false
      ],

      esSuperAdmin: [
        this.data?.esSuperAdmin ?? false
      ]

    });

    if (!this.esSuperAdmin) {
      this.form.get('empresaId')?.disable();
    }

  }

  private cargarEmpresas(): void {

    if (!this.esSuperAdmin) return;

    this.empresaService.consulta().subscribe({

      next: (empresas) => {

        this.empresas = empresas;

        this.cdr.detectChanges();

      },

      error: (err) => {
        console.error('Error cargando empresas', err);
      }

    });

  }

  guardar(): void {

    if (this.form.invalid) return;

    const usuario = this.form.getRawValue();

    this.dialogRef.close(usuario);

  }

  cancelar(): void {
    this.dialogRef.close();
  }

}