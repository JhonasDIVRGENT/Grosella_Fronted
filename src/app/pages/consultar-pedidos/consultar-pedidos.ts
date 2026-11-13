import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoPedido, PedidoResumen, ResumenEstado, Sede } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ACCION_SIGUIENTE, ESTADOS, ETIQUETA_ESTADO, mensajeError } from '../../core/utils/estados';
import { EstadoBadge } from '../../shared/estado-badge';
import { FechaPipe, HoraPipe } from '../../shared/pipes';

/** CU02 Consultar pedidos por estado (+ CU12/CU14 para avanzar el estado). */
@Component({
  selector: 'app-consultar-pedidos',
  imports: [FormsModule, RouterLink, EstadoBadge, FechaPipe, HoraPipe],
  templateUrl: './consultar-pedidos.html',
})
export class ConsultarPedidos implements OnInit {
  private pedidoService = inject(PedidoService);
  private auth = inject(AuthService);

  /** Permite abrir la vista con ?estado=CONFIRMADO desde la pantalla de inicio */
  readonly estadoInicial = input<EstadoPedido | undefined>(undefined, { alias: 'estado' });

  readonly estados = ESTADOS;
  readonly etiqueta = ETIQUETA_ESTADO;
  readonly sedes = signal<Sede[]>([]);
  readonly resumen = signal<ResumenEstado[]>([]);
  readonly pedidos = signal<PedidoResumen[]>([]);
  readonly cargando = signal(false);
  readonly mensaje = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  estado: EstadoPedido = 'REGISTRADO';
  idSede: number | null = null; // null = Todas

  constructor() {
    inject(CatalogoService).sedes().subscribe((s) => this.sedes.set(s));
  }

  ngOnInit(): void {
    if (this.estadoInicial() && ESTADOS.includes(this.estadoInicial()!)) {
      this.estado = this.estadoInicial()!;
    }
    this.filtrar();
  }

  filtrar(): void {
    this.cargando.set(true);
    this.pedidoService.resumenEstados(this.idSede).subscribe((r) => this.resumen.set(r));
    this.pedidoService.porEstado(this.estado, this.idSede).subscribe({
      next: (p) => {
        this.pedidos.set(p);
        this.cargando.set(false);
      },
      error: (e) => {
        this.mensaje.set({ tipo: 'error', texto: mensajeError(e) });
        this.cargando.set(false);
      },
    });
  }

  seleccionarChip(e: EstadoPedido): void {
    this.estado = e;
    this.mensaje.set(null);
    this.filtrar();
  }

  accion(p: PedidoResumen) {
    const a = ACCION_SIGUIENTE[p.estado];
    return a && this.auth.tieneRol(...a.roles) ? a : null;
  }

  puedeEntregar(p: PedidoResumen): boolean {
    return p.estado === 'LISTO_PARA_RECOJO' && this.auth.tieneRol('ADMINISTRADOR', 'PERSONAL_ATENCION', 'ENCARGADO_PEDIDOS');
  }

  avanzar(p: PedidoResumen): void {
    const a = ACCION_SIGUIENTE[p.estado];
    if (!a) return;
    this.pedidoService.cambiarEstado(p.idPedido, a.destino).subscribe({
      next: (r) => {
        this.mensaje.set({ tipo: 'exito', texto: `El pedido ${r.numero} pasó al estado "${ETIQUETA_ESTADO[r.estado]}".` });
        this.filtrar();
      },
      error: (e) => this.mensaje.set({ tipo: 'error', texto: mensajeError(e) }),
    });
  }
}
