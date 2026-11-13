import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidoResumen, ResumenEstado } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ETIQUETA_ESTADO, ETIQUETA_ROL, mensajeError } from '../../core/utils/estados';
import { EstadoBadge } from '../../shared/estado-badge';
import { FechaPipe, HoraPipe } from '../../shared/pipes';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, EstadoBadge, FechaPipe, HoraPipe],
  templateUrl: './inicio.html',
})
export class Inicio {
  private auth = inject(AuthService);
  private pedidoService = inject(PedidoService);

  readonly sesion = this.auth.sesion;
  readonly etiquetaEstado = ETIQUETA_ESTADO;
  readonly etiquetaRol = ETIQUETA_ROL;
  readonly resumen = signal<ResumenEstado[]>([]);
  readonly proximos = signal<PedidoResumen[]>([]);
  readonly error = signal<string | null>(null);
  readonly hoy = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /** El administrador ve todas las sedes; el resto, su propia sede. */
  readonly idSede = this.auth.tieneRol('ADMINISTRADOR') ? null : (this.auth.sesion()?.idSede ?? null);

  constructor() {
    this.pedidoService.resumenEstados(this.idSede).subscribe({
      next: (r) => this.resumen.set(r),
      error: (e) => this.error.set(mensajeError(e)),
    });
    this.pedidoService.proximos(this.idSede, 8).subscribe({ next: (p) => this.proximos.set(p) });
  }
}
