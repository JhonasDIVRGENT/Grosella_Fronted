import { Pipe, PipeTransform } from '@angular/core';
import { EstadoPago, EstadoPedido } from '../core/models/models';
import { ETIQUETA_ESTADO, ETIQUETA_PAGO } from '../core/utils/estados';

/** 156 -> "S/ 156.00" */
@Pipe({ name: 'soles' })
export class SolesPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    const n = Number(valor ?? 0);
    return 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

/** "2026-11-14" -> "14/11/2026" */
@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) return '';
    const [a, m, d] = valor.substring(0, 10).split('-');
    return `${d}/${m}/${a}`;
  }
}

/** "16:00:00" -> "16:00" */
@Pipe({ name: 'hora' })
export class HoraPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return valor ? valor.substring(0, 5) : '';
  }
}

@Pipe({ name: 'estadoPago' })
export class EstadoPagoPipe implements PipeTransform {
  transform(valor: EstadoPago | null | undefined): string {
    return valor ? ETIQUETA_PAGO[valor] : '';
  }
}

@Pipe({ name: 'estadoPedido' })
export class EstadoPedidoPipe implements PipeTransform {
  transform(valor: EstadoPedido | null | undefined): string {
    return valor ? ETIQUETA_ESTADO[valor] : '';
  }
}
