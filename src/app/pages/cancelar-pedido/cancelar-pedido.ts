import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoDetalle } from '../../core/models/models';
import { PedidoService } from '../../core/services/pedido.service';
import { mensajeError } from '../../core/utils/estados';
import { EstadoBadge } from '../../shared/estado-badge';
import { FechaPipe, HoraPipe, SolesPipe } from '../../shared/pipes';

/** CU13 Cancelar pedido (incluye CU17 Buscar pedido). Solo Encargado de pedidos / Administrador. */
@Component({
  selector: 'app-cancelar-pedido',
  imports: [FormsModule, SolesPipe, FechaPipe, HoraPipe, EstadoBadge],
  templateUrl: './cancelar-pedido.html',
})
export class CancelarPedido {
  private pedidoService = inject(PedidoService);

  numero = '';
  motivo = '';
  readonly pedido = signal<PedidoDetalle | null>(null);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly cancelable = computed(() => {
    const p = this.pedido();
    return !!p && p.estado !== 'ENTREGADO' && p.estado !== 'CANCELADO';
  });

  productos(p: PedidoDetalle): string {
    return p.detalles.map((d) => d.producto + (d.cantidad > 1 ? ' x' + d.cantidad : '')).join(', ');
  }

  buscar(): void {
    this.error.set(null);
    this.exito.set(null);
    this.pedido.set(null);
    this.motivo = '';
    if (!this.numero.trim()) {
      this.error.set('Ingrese el número del pedido.');
      return;
    }
    this.pedidoService.buscar(this.numero).subscribe({
      next: (p) => {
        this.pedido.set(p);
        this.numero = p.numero;
        if (!this.cancelable()) {
          // FA1 Estado no permitido
          this.error.set(`El pedido ya está ${p.estado === 'ENTREGADO' ? 'entregado' : 'cancelado'} y no se puede cancelar.`);
        }
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  confirmar(): void {
    const p = this.pedido();
    if (!p) return;
    if (!this.motivo.trim()) {
      this.error.set('Ingrese el motivo de la cancelación.'); // FA2
      return;
    }
    this.error.set(null);
    this.pedidoService.cancelar(p.idPedido, this.motivo.trim()).subscribe({
      next: (r) => {
        this.pedido.set(r);
        this.motivo = '';
        this.exito.set(`El pedido ${r.numero} fue cancelado. Motivo registrado en las observaciones.`);
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  volver(): void {
    this.pedido.set(null);
    this.numero = '';
    this.motivo = '';
    this.error.set(null);
    this.exito.set(null);
  }
}
