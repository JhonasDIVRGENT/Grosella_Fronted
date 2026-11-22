import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cliente, PedidoDetalle, Personalizacion, Producto, Sede } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { ClienteService } from '../../core/services/cliente.service';
import { PedidoService } from '../../core/services/pedido.service';
import { hoyISO, mensajeError } from '../../core/utils/estados';
import { SolesPipe } from '../../shared/pipes';
import { OpcionSelector, SelectorBusqueda } from '../../shared/selector-busqueda';

interface Item {
  producto: Producto;
  cantidad: number;
}

/** CU08 Registrar pedido (incluye CU16 Buscar cliente y extiende CU09 Personalización). */
@Component({
  selector: 'app-registrar-pedido',
  imports: [FormsModule, RouterLink, SolesPipe, SelectorBusqueda],
  templateUrl: './registrar-pedido.html',
})
export class RegistrarPedido implements OnInit {
  private auth = inject(AuthService);
  private clienteService = inject(ClienteService);
  private pedidoService = inject(PedidoService);

  /** ?dni=45872136 (desde Clientes o Nuevo cliente) */
  readonly dni = input<string | undefined>(undefined);

  readonly sedes = signal<Sede[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly opcionesCliente = computed<OpcionSelector[]>(() =>
    this.clientes().map((c) => ({
      id: c.idCliente,
      titulo: c.nombreCompleto,
      detalle: `DNI ${c.dni} · Tel. ${c.telefono}`,
      busqueda: c.dni + ' ' + c.telefono,
    })),
  );
  readonly cliente = signal<Cliente | null>(null);
  readonly categoriaSel = signal<string>('');
  readonly textoProducto = signal('');
  readonly categorias = computed(() => [...new Set(this.productos().map((p) => p.categoria))]);
  readonly productosFiltrados = computed(() => {
    const cat = this.categoriaSel();
    const t = this.textoProducto().trim().toLowerCase();
    return this.productos().filter(
      (p) => (!cat || p.categoria === cat) && (!t || p.nombre.toLowerCase().includes(t)),
    );
  });
  readonly clienteNoExiste = signal(false);
  readonly items = signal<Item[]>([]);
  readonly total = computed(() => this.items().reduce((s, i) => s + i.producto.precio * i.cantidad, 0));
  readonly adelanto = signal(0);
  readonly saldo = computed(() => Math.max(this.total() - (Number(this.adelanto()) || 0), 0));
  readonly error = signal<string | null>(null);
  readonly registrado = signal<PedidoDetalle | null>(null);
  readonly guardando = signal(false);

  dniBusqueda = '';
  idProducto: number | null = null;
  cantidad = 1;
  personalizado = false;
  personalizacion: Personalizacion = this.personalizacionVacia();
  idSede: number | null = this.auth.sesion()?.idSede ?? null;
  fechaRecojo = '';
  horaRecojo = '';
  observaciones = '';
  readonly minFecha = hoyISO();
  private adelantoEditado = false;

  constructor() {
    inject(CatalogoService).sedes().subscribe((s) => this.sedes.set(s));
    inject(CatalogoService).productos().subscribe((p) => this.productos.set(p));
    this.clienteService.todos().subscribe({ next: (c) => this.clientes.set(c), error: () => this.clientes.set([]) });
  }

  ngOnInit(): void {
    if (this.dni()) {
      this.dniBusqueda = this.dni()!;
      this.buscarCliente();
    }
  }

  // ---- CU16 Buscar cliente ----
  buscarCliente(): void {
    this.error.set(null);
    this.cliente.set(null);
    this.clienteNoExiste.set(false);
    const dni = this.dniBusqueda.trim();
    if (!/^\d{8}$/.test(dni)) {
      this.error.set('Ingrese un DNI válido de 8 dígitos.');
      return;
    }
    this.clienteService.buscarPorDni(dni).subscribe({
      next: (c) => this.cliente.set(c),
      error: (e) => (e.status === 404 ? this.clienteNoExiste.set(true) : this.error.set(mensajeError(e))),
    });
  }

  /** Cliente elegido desde la lista desplegable. */
  elegirCliente(o: OpcionSelector | null): void {
    this.error.set(null);
    this.clienteNoExiste.set(false);
    this.cliente.set(o ? (this.clientes().find((c) => c.idCliente === o.id) ?? null) : null);
  }

  // ---- Productos ----
  /** Agrega una unidad del producto (clic en la tarjeta). */
  agregarProducto(producto: Producto): void {
    this.idProducto = producto.idProducto;
    this.cantidad = 1;
    this.agregar();
  }

  cantidadEn(producto: Producto): number {
    return this.items().find((i) => i.producto.idProducto === producto.idProducto)?.cantidad ?? 0;
  }

  cambiarCantidad(item: Item, delta: number): void {
    const nueva = item.cantidad + delta;
    if (nueva < 1) {
      this.quitar(item);
      return;
    }
    this.items.set(this.items().map((i) => (i === item ? { ...i, cantidad: nueva } : i)));
    this.recalcularAdelanto();
  }

  agregar(): void {
    const producto = this.productos().find((p) => p.idProducto === this.idProducto);
    const cant = Math.floor(Number(this.cantidad));
    if (!producto) {
      this.error.set('Seleccione un producto.');
      return;
    }
    if (!cant || cant < 1) {
      this.error.set('La cantidad debe ser mayor a cero.');
      return;
    }
    this.error.set(null);
    const lista = [...this.items()];
    const existente = lista.find((i) => i.producto.idProducto === producto.idProducto);
    if (existente) {
      existente.cantidad += cant;
    } else {
      lista.push({ producto, cantidad: cant });
    }
    this.items.set(lista);
    this.cantidad = 1;
    this.recalcularAdelanto();
  }

  quitar(item: Item): void {
    this.items.set(this.items().filter((i) => i !== item));
    this.recalcularAdelanto();
  }

  /** El adelanto se propone como el 50 % del total mientras el usuario no lo cambie. */
  private recalcularAdelanto(): void {
    if (!this.adelantoEditado) {
      this.adelanto.set(Math.round(this.total() * 50) / 100);
    }
  }

  cambiarAdelanto(valor: number): void {
    this.adelantoEditado = true;
    this.adelanto.set(valor);
  }

  // ---- Registrar ----
  registrar(): void {
    this.registrado.set(null);
    const c = this.cliente();
    const faltantes: string[] = [];
    if (!c) faltantes.push('cliente');
    if (this.items().length === 0) faltantes.push('al menos un producto');
    if (!this.idSede) faltantes.push('sede');
    if (!this.fechaRecojo) faltantes.push('fecha de recojo');
    if (!this.horaRecojo) faltantes.push('hora');
    if (faltantes.length) {
      this.error.set('Complete los datos: ' + faltantes.join(', ') + '.'); // FA3
      return;
    }
    const adelanto = Number(this.adelanto()) || 0;
    if (adelanto < 0 || adelanto > this.total()) {
      this.error.set('El adelanto debe estar entre S/ 0.00 y el total del pedido.');
      return;
    }
    this.error.set(null);
    this.guardando.set(true);
    this.pedidoService
      .registrar({
        idCliente: c!.idCliente,
        idSede: this.idSede!,
        fechaRecojo: this.fechaRecojo,
        horaRecojo: this.horaRecojo,
        adelanto,
        observaciones: this.observaciones.trim() || null,
        detalles: this.items().map((i) => ({ idProducto: i.producto.idProducto, cantidad: i.cantidad })),
        personalizacion: this.personalizado ? this.personalizacion : null,
      })
      .subscribe({
        next: (p) => {
          this.registrado.set(p);
          this.guardando.set(false);
          this.limpiar(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (e) => {
          this.error.set(mensajeError(e));
          this.guardando.set(false);
        },
      });
  }

  limpiar(borrarMensaje = true): void {
    if (borrarMensaje) this.registrado.set(null);
    this.error.set(null);
    this.dniBusqueda = '';
    this.cliente.set(null);
    this.clienteNoExiste.set(false);
    this.items.set([]);
    this.idProducto = null;
    this.cantidad = 1;
    this.categoriaSel.set('');
    this.textoProducto.set('');
    this.personalizado = false;
    this.personalizacion = this.personalizacionVacia();
    this.idSede = this.auth.sesion()?.idSede ?? null;
    this.fechaRecojo = '';
    this.horaRecojo = '';
    this.observaciones = '';
    this.adelantoEditado = false;
    this.adelanto.set(0);
  }

  private personalizacionVacia(): Personalizacion {
    return { tamano: '', decoracion: '', nombres: '', toppers: '', velas: '', observaciones: '' };
  }
}
