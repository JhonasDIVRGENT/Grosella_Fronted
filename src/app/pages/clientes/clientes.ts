import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cliente, HistorialCliente } from '../../core/models/models';
import { ClienteService } from '../../core/services/cliente.service';
import { mensajeError } from '../../core/utils/estados';
import { OpcionSelector, SelectorBusqueda } from '../../shared/selector-busqueda';
import { EstadoBadge } from '../../shared/estado-badge';
import { EstadoPagoPipe, FechaPipe } from '../../shared/pipes';

/** CU07 Consultar historial de pedidos del cliente (incluye CU16 Buscar cliente). */
@Component({
  selector: 'app-clientes',
  imports: [FormsModule, SelectorBusqueda, RouterLink, EstadoBadge, FechaPipe, EstadoPagoPipe],
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {
  private clienteService = inject(ClienteService);

  readonly dni = input<string | undefined>(undefined);

  texto = '';
  readonly todos = signal<Cliente[]>([]);
  readonly opciones = computed<OpcionSelector[]>(() =>
    this.todos().map((c) => ({
      id: c.idCliente,
      titulo: c.nombreCompleto,
      detalle: `DNI ${c.dni} · ${c.cantidadPedidos} pedido(s)`,
      busqueda: c.dni + ' ' + c.telefono,
    })),
  );

  constructor() {
    this.clienteService.todos().subscribe({ next: (l) => this.todos.set(l), error: () => this.todos.set([]) });
  }

  elegir(o: OpcionSelector | null): void {
    this.aviso.set(null);
    this.error.set(null);
    this.historial.set(null);
    this.resultados.set([]);
    const c = o ? this.todos().find((x) => x.idCliente === o.id) : null;
    if (c) this.seleccionar(c);
  }
  readonly resultados = signal<Cliente[]>([]);
  readonly historial = signal<HistorialCliente | null>(null);
  readonly aviso = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.dni()) {
      this.texto = this.dni()!;
      this.buscar();
    }
  }

  buscar(): void {
    this.aviso.set(null);
    this.error.set(null);
    this.historial.set(null);
    this.resultados.set([]);
    const t = this.texto.trim();
    if (t.length < 2) {
      this.aviso.set('Ingrese el DNI o al menos 2 letras del nombre.');
      return;
    }
    this.clienteService.buscar(t).subscribe({
      next: (lista) => {
        if (lista.length === 0) {
          this.aviso.set('No se encontraron resultados.'); // FA1
        } else if (lista.length === 1) {
          this.seleccionar(lista[0]);
        } else {
          this.resultados.set(lista);
        }
      },
      error: (e) => this.error.set(mensajeError(e)),
    });
  }

  seleccionar(c: Cliente): void {
    this.resultados.set([]);
    this.clienteService.historial(c.idCliente).subscribe({
      next: (h) => this.historial.set(h),
      error: (e) => this.error.set(mensajeError(e)),
    });
  }
}
