import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PermissionService {

  private _permissions = new Set<string>();
  private _modules = new Set<string>();
  private _isSuperAdmin = false;
  private _empresaId?: number;

  // =============================
  // CARGA DESDE BACKEND
  // =============================
  loadSession(data: {
    permisos: string[];
    modulos: string[];
    esSuperAdmin: boolean;
    empresaId: number;
  }): void {
    this._permissions = new Set(data.permisos);
    this._modules = new Set(data.modulos);
    this._isSuperAdmin = data.esSuperAdmin;
    this._empresaId = data.empresaId;

    console.log('🔐 sesión cargada', {
      permisos: this.getAllPermissions(),
      modulos: this.getAllModules(),
      superAdmin: this._isSuperAdmin
    });
  }

  // =============================
  // SUPER ADMIN
  // =============================
  isSuperAdmin(): boolean {
    return this._isSuperAdmin;
  }

  // =============================
  // PERMISOS
  // =============================
  has(permission: string): boolean {
    if (this._isSuperAdmin) return true;
    return this._permissions.has(permission);
  }

  hasAny(perms: string[]): boolean {
    if (this._isSuperAdmin) return true;
    return perms.some(p => this._permissions.has(p));
  }

  hasAll(perms: string[]): boolean {
    if (this._isSuperAdmin) return true;
    return perms.every(p => this._permissions.has(p));
  }

  getAllPermissions(): string[] {
    return Array.from(this._permissions);
  }

  // =============================
  // MÓDULOS (MUY IMPORTANTE)
  // =============================
  hasModule(moduleCode: string): boolean {
    if (this._isSuperAdmin) return true;
    return this._modules.has(moduleCode);
  }

  getAllModules(): string[] {
    return Array.from(this._modules);
  }

  // =============================
  // LIMPIEZA
  // =============================
  clear(): void {
    this._permissions.clear();
    this._modules.clear();
    this._isSuperAdmin = false;
    this._empresaId = undefined;

    console.log('🧹 sesión limpiada');
  }
}