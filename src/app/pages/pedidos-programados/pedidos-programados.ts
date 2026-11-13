import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoResumen, Sede } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ACCION_SIGUIENTE, ETIQUETA_ESTADO, hoyISO, mensajeError } from '../../core/utils/estados';
import { EstadoBadge } from '../../shared/estado-badge';
import { HoraPipe } from '../../shared/pipes';

/** CU15 Consultar pedidos programados (+ CU14 Actualizar estado de preparación). */
@Component({
  selector: 'app-pedidos-programados',
  imports: [FormsModule, EstadoBadge, HoraPipe],
  templateUrl: './pedidos-programados.html',
})
export class PedidosProgramados {
  private pedidoService = inject(PedidoService);
  private auth = inject(AuthService);

  readonly sedes = signal<Sede[]>([]);
  readonly pedidos = signal<PedidoResumen[]>([]);
  readonly buscado = signal(false);
  readonly mensaje = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  fecha = hoyISO();
  desde = '08:00';
  hasta = '20:00';
  idSede: number | null = this.auth.tieneRol('ADMINISTRADOR') ? null : (this.auth.sesion()?.idSede ?? null);

  constructor() {
    inject(CatalogoService).sedes().subscribe((s) => this.sedes.set(s));
    this.buscar();
  }

  buscar(): void {
    this.pedidoService.programados(this.fecha, this.desde, this.hasta, this.idSede).subscribe({
      next: (p) => {
        this.pedidos.set(p);
        this.buscado.set(true);
      },
      error: (e) => this.mensaje.set({ tipo: 'error', texto: mensajeError(e) }),
    });
  }

  accion(p: PedidoResumen) {
    const a = ACCION_SIGUIENTE[p.estado];
    return a && a.destino !== 'CONFIRMADO' && this.auth.tieneRol(...a.roles) ? a : null;
  }

  avanzar(p: PedidoResumen): void {
    const a = ACCION_SIGUIENTE[p.estado];
    if (!a) return;
    this.pedidoService.cambiarEstado(p.idPedido, a.destino).subscribe({
      next: (r) => {
        this.mensaje.set({ tipo: 'exito', texto: `El pedido ${r.numero} pasó al estado "${ETIQUETA_ESTADO[r.estado]}".` });
        this.buscar();
      },
      error: (e) => this.mensaje.set({ tipo: 'error', texto: mensajeError(e) }),
    });
  }
}
