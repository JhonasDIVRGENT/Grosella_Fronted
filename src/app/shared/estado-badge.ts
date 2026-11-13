import { Component, computed, input } from '@angular/core';
import { EstadoPedido } from '../core/models/models';
import { ETIQUETA_ESTADO } from '../core/utils/estados';

/** Etiqueta de color según el estado del pedido. */
@Component({
  selector: 'app-estado-badge',
  template: `<span class="badge" [class]="'badge badge-' + estado()">{{ etiqueta() }}</span>`,
})
export class EstadoBadge {
  readonly estado = input.required<EstadoPedido>();
  readonly etiqueta = computed(() => ETIQUETA_ESTADO[this.estado()]);
}
