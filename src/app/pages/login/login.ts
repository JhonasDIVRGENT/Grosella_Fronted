import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { mensajeError } from '../../core/utils/estados';

/** CU01 Iniciar sesión */
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = '';
  contrasena = '';
  readonly cargando = signal(false);
  readonly error = signal<string | null>(
    inject(ActivatedRoute).snapshot.queryParamMap.has('expirada') ? 'Su sesión expiró. Ingrese nuevamente.' : null,
  );

  constructor() {
    if (this.auth.autenticado()) {
      this.router.navigate(['/inicio']);
    }
  }

  ingresar(): void {
    if (!this.usuario.trim() || !this.contrasena) {
      this.error.set('Ingrese su usuario y contraseña.');
      return;
    }
    this.cargando.set(true);
    this.error.set(null);
    this.auth.login(this.usuario.trim(), this.contrasena).subscribe({
      next: () => this.router.navigate(['/inicio']),
      error: (e) => {
        this.error.set(mensajeError(e));
        this.cargando.set(false);
      },
    });
  }
}
