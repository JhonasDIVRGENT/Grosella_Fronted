import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidoDetalle } from '../../core/models/models';
import { PedidoService } from '../../core/services/pedido.service';
import { mensajeError } from '../../core/utils/estados';
import { EstadoBadge } from '../../shared/estado-badge';
import { SolesPipe } from '../../shared/pipes';

/** CU11 Registrar entrega del pedido (incluye CU17 Buscar pedido). */
@Component({
  selector: 'app-entregas',
  imports: [FormsModule, RouterLink, SolesPipe, EstadoBadge],
  templateUrl: './entregas.html',
})
export class Entregas implements OnInit {
  private pedidoService = inject(PedidoService);

  readonly numeroInicial = input<string | undefined>(undefined, { alias: 'numero' });

  numero = '';
  readonly pedido = signal<PedidoDetalle | null>(null);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);

  ngOnInit(): void {
    if (this.numeroInicial()) {
      this.numero = this.numeroInicial()!;
      this.buscar();
    }
  }

  productos(p: PedidoDetalle): string {
    return p.detalles.map((d) => d.producto + (d.cantidad > 1 ? ' x' + d.cantidad : '')).join(', ');
  }

  buscar(): void {
    this.error.set(null);
    this.exito.set(null);
    this.pedido.set(null);
    if (!this.numero.trim()) {
      this.error.set('Ingrese el número del pedido.');
      return;
    }
    this.pedidoService.buscar(this.numero).subscribe({
      next: (p) => {
        this.pedido.set(p);
        this.numero = p.numero;
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  registrarEntrega(): void {
    const p = this.pedido();
    if (!p) return;
    this.pedidoService.registrarEntrega(p.idPedido).subscribe({
      next: (r) => {
        this.pedido.set(r);
        this.exito.set(`Entrega registrada. El pedido ${r.numero} pasó al estado “Entregado”.`);
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
