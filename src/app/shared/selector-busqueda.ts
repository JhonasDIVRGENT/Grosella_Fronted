import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';

export interface OpcionSelector {
  id: number | string;
  titulo: string;
  detalle?: string;
  /** Texto adicional que también se usa al filtrar (no se muestra). */
  busqueda?: string;
  etiqueta?: string;
}

/**
 * Lista desplegable con filtro: el usuario no necesita recordar DNI ni número de pedido,
 * solo abre la lista, escribe (opcional) y selecciona.
 */
@Component({
  selector: 'app-selector-busqueda',
  template: `
    <div class="sel" [class.abierto]="abierto()">
      <div class="sel-caja" (click)="abrir()">
        <input
          class="sel-input"
          type="text"
          autocomplete="off"
          [placeholder]="seleccionado() ? '' : placeholder()"
          [value]="abierto() ? filtro() : (seleccionado()?.titulo ?? '')"
          (focus)="abrir()"
          (input)="filtrar($event)"
          (keydown)="teclas($event)"
        />
        @if (seleccionado() && !abierto()) {
          <button type="button" class="sel-x" title="Quitar selección" (click)="limpiar($event)">×</button>
        }
        <span class="sel-flecha">▾</span>
      </div>
      @if (abierto()) {
        <ul class="sel-lista" role="listbox">
          @for (o of filtradas(); track o.id; let i = $index) {
            <li
              role="option"
              [class.activa]="i === indice()"
              (mousedown)="elegir(o, $event)"
              (mouseenter)="indice.set(i)"
            >
              <span class="sel-titulo">{{ o.titulo }}</span>
              @if (o.etiqueta) {
                <span class="sel-etiqueta">{{ o.etiqueta }}</span>
              }
              @if (o.detalle) {
                <span class="sel-detalle">{{ o.detalle }}</span>
              }
            </li>
          } @empty {
            <li class="sel-vacio">{{ vacio() }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class SelectorBusqueda {
  private el = inject(ElementRef<HTMLElement>);

  readonly opciones = input.required<OpcionSelector[]>();
  readonly placeholder = input('Seleccione…');
  readonly vacio = input('No hay resultados.');
  /** Texto visible cuando hay una opción elegida (se controla desde fuera con el id). */
  readonly valor = input<number | string | null>(null);

  readonly seleccion = output<OpcionSelector | null>();

  readonly abierto = signal(false);
  readonly filtro = signal('');
  readonly indice = signal(0);

  readonly seleccionado = computed(() => this.opciones().find((o) => o.id === this.valor()) ?? null);

  readonly filtradas = computed(() => {
    const t = this.normalizar(this.filtro());
    const lista = this.opciones();
    if (!t) return lista.slice(0, 100);
    const palabras = t.split(/\s+/);
    return lista
      .filter((o) => {
        const texto = this.normalizar(`${o.titulo} ${o.detalle ?? ''} ${o.busqueda ?? ''} ${o.etiqueta ?? ''}`);
        return palabras.every((p) => texto.includes(p));
      })
      .slice(0, 100);
  });

  private normalizar(s: string): string {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  abrir(): void {
    if (this.abierto()) return;
    this.filtro.set('');
    this.indice.set(0);
    this.abierto.set(true);
  }

  filtrar(ev: Event): void {
    this.filtro.set((ev.target as HTMLInputElement).value);
    this.indice.set(0);
    this.abierto.set(true);
  }

  elegir(o: OpcionSelector, ev?: Event): void {
    ev?.preventDefault();
    this.seleccion.emit(o);
    this.cerrar();
  }

  limpiar(ev: Event): void {
    ev.stopPropagation();
    this.seleccion.emit(null);
  }

  teclas(ev: KeyboardEvent): void {
    const n = this.filtradas().length;
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      this.abrir();
      this.indice.set(Math.min(this.indice() + 1, n - 1));
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      this.indice.set(Math.max(this.indice() - 1, 0));
    } else if (ev.key === 'Enter' && this.abierto()) {
      ev.preventDefault();
      const o = this.filtradas()[this.indice()];
      if (o) this.elegir(o);
    } else if (ev.key === 'Escape' || ev.key === 'Tab') {
      this.cerrar();
    }
  }

  private cerrar(): void {
    this.abierto.set(false);
    this.filtro.set('');
    (this.el.nativeElement as HTMLElement).querySelector('input')?.blur();
  }

  @HostListener('document:click', ['$event'])
  fuera(ev: Event): void {
    if (this.abierto() && !(this.el.nativeElement as HTMLElement).contains(ev.target as Node)) {
      this.abierto.set(false);
      this.filtro.set('');
    }
  }
}
