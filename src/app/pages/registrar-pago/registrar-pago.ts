import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PedidoDetalle, PedidoResumen } from '../../core/models/models';
import { PedidoService } from '../../core/services/pedido.service';
import { ETIQUETA_ESTADO } from '../../core/utils/estados';
import { mensajeError } from '../../core/utils/estados';
import { OpcionSelector, SelectorBusqueda } from '../../shared/selector-busqueda';
import { EstadoBadge } from '../../shared/estado-badge';
import { EstadoPagoPipe, FechaPipe, HoraPipe, SolesPipe } from '../../shared/pipes';

/** CU10 Registrar pago del pedido (incluye CU17 Buscar pedido). */
@Component({
  selector: 'app-registrar-pago',
  imports: [FormsModule, SelectorBusqueda, SolesPipe, FechaPipe, HoraPipe, EstadoPagoPipe, EstadoBadge],
  templateUrl: './registrar-pago.html',
})
export class RegistrarPago implements OnInit {
  private pedidoService = inject(PedidoService);

  readonly numeroInicial = input<string | undefined>(undefined, { alias: 'numero' });

  numero = '';
  monto: number | null = null;
  readonly hoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  readonly pedido = signal<PedidoDetalle | null>(null);
  readonly pedidos = signal<PedidoResumen[]>([]);
  readonly opcionesPedido = computed<OpcionSelector[]>(() =>
    this.pedidos()
      .filter((p) => p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO' && p.saldo > 0)
      .map((p) => ({
        id: p.numero,
        titulo: `${p.numero} · ${p.cliente}`,
        detalle: `Recojo ${p.fechaRecojo} ${p.horaRecojo.slice(0, 5)} · Saldo S/ ${p.saldo.toFixed(2)}`,
        etiqueta: ETIQUETA_ESTADO[p.estado],
      })),
  );

  constructor() {
    this.pedidoService.todos().subscribe({ next: (l) => this.pedidos.set(l), error: () => this.pedidos.set([]) });
  }

  elegirPedido(o: OpcionSelector | null): void {
    this.numero = o ? String(o.id) : '';
    if (o) {
      this.buscar();
    } else {
      this.pedido.set(null);
      this.error.set(null);
    }
  }
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly admitePagos = computed(() => {
    const p = this.pedido();
    return !!p && p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO' && p.saldo > 0;
  });

  ngOnInit(): void {
    if (this.numeroInicial()) {
      this.numero = this.numeroInicial()!;
      this.buscar();
    }
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
      next: (p) => this.mostrar(p),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  private mostrar(p: PedidoDetalle): void {
    this.pedido.set(p);
    this.numero = p.numero;
    this.monto = p.saldo > 0 ? p.saldo : null;
    if (p.estado === 'CANCELADO' || p.estado === 'ENTREGADO') {
      this.error.set(`El pedido está ${p.estado === 'CANCELADO' ? 'cancelado' : 'entregado'}: no admite pagos.`); // FA2
    }
  }

  guardar(): void {
    const p = this.pedido();
    if (!p) return;
    const m = Number(this.monto);
    if (!m || m <= 0 || m > p.saldo) {
      this.error.set(`El monto debe ser mayor a cero y no exceder el saldo (S/ ${p.saldo.toFixed(2)}).`); // FA1
      return;
    }
    this.error.set(null);
    this.guardando.set(true);
    this.pedidoService.registrarPago(p.idPedido, m).subscribe({
      next: (r) => {
        this.mostrar(r);
        this.exito.set(`Pago registrado. Saldo pendiente: S/ ${r.saldo.toFixed(2)}.`);
        this.guardando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.guardando.set(false);
      },
    });
  }
}
