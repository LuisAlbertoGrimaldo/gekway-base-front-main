import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  permisos: string[] = [];
  modulos: string[] = [];
  superAdmin = false;
  empresaId: number | null = null;

  constructor() {
    this.cargarSesion();
  }

  // 🔹 usado cuando inicia la app
  cargarSesion(): void {

    const token = localStorage.getItem('accessToken');

    if (!token) return;

    const helper = new JwtHelperService();
    const decoded: any = helper.decodeToken(token);

    this.permisos = decoded.permissions || [];
    this.modulos = decoded.modules || [];
    this.superAdmin = decoded.superAdmin === true;

    console.log('🔐 sesión cargada', {
      permisos: this.permisos,
      modulos: this.modulos,
      superAdmin: this.superAdmin
    });
  }

  // 🔹 usado por AuthService después de login
  loadSession(data: any): void {

    this.permisos = data.permissions || [];
    this.modulos = data.modules || [];
    this.superAdmin = data.superAdmin === true;
    this.empresaId = data.empresaId || null;

    console.log('🔐 sesión actualizada', {
      permisos: this.permisos,
      modulos: this.modulos,
      superAdmin: this.superAdmin
    });
  }

  // 🔹 usado en logout
  clear(): void {
    this.permisos = [];
    this.modulos = [];
    this.superAdmin = false;
  }

  isSuperAdmin(): boolean {
    return this.superAdmin;
  }
  getEmpresaId(): number | null {
    return this.empresaId;
  }

  has(permission: string): boolean {

    // 🔥 si es super admin siempre tiene acceso
    if (this.superAdmin) return true;

    // 🔥 si el backend manda SUPER_ADMIN como permiso
    if (this.permisos.includes('SUPER_ADMIN')) return true;

    return this.permisos.includes(permission);
  }

  hasModule(module: string): boolean {

    if (this.superAdmin) return true;

    if (this.permisos.includes('SUPER_ADMIN')) return true;

    return this.modulos.includes(module);
  }

}