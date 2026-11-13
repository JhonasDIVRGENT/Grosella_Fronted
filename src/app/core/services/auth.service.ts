import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rol, Sesion } from '../models/models';

const CLAVE = 'grosella.sesion';

/** Login sencillo (V01): guarda el token que entrega el backend en sessionStorage. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly sesion = signal<Sesion | null>(this.leer());
  readonly autenticado = computed(() => this.sesion() !== null);

  login(usuario: string, contrasena: string): Observable<Sesion> {
    return this.http
      .post<Sesion>(`${environment.apiUrl}/auth/login`, { usuario, contrasena })
      .pipe(tap((s) => this.guardar(s)));
  }

  logout(): void {
    if (this.sesion()) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    }
    this.limpiar();
    this.router.navigate(['/login']);
  }

  /** Se usa cuando el backend responde 401 (token vencido o backend reiniciado). */
  limpiar(): void {
    sessionStorage.removeItem(CLAVE);
    this.sesion.set(null);
  }

  get token(): string | null {
    return this.sesion()?.token ?? null;
  }

  tieneRol(...roles: Rol[]): boolean {
    const s = this.sesion();
    return !!s && roles.includes(s.rol);
  }

  private guardar(s: Sesion): void {
    sessionStorage.setItem(CLAVE, JSON.stringify(s));
    this.sesion.set(s);
  }

  private leer(): Sesion | null {
    try {
      const txt = sessionStorage.getItem(CLAVE);
      return txt ? (JSON.parse(txt) as Sesion) : null;
    } catch {
      return null;
    }
  }
}
