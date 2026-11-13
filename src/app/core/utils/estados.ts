import { EstadoPago, EstadoPedido, Rol } from '../models/models';

export const ESTADOS: EstadoPedido[] = [
  'REGISTRADO',
  'CONFIRMADO',
  'EN_PREPARACION',
  'LISTO_PARA_RECOJO',
  'ENTREGADO',
  'CANCELADO',
];

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  REGISTRADO: 'Registrado',
  CONFIRMADO: 'Confirmado',
  EN_PREPARACION: 'En preparación',
  LISTO_PARA_RECOJO: 'Listo para recojo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export const ETIQUETA_PAGO: Record<EstadoPago, string> = {
  CON_ADELANTO: 'Con adelanto',
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  ADMINISTRADOR: 'Administrador',
  PERSONAL_ATENCION: 'Personal de atención',
  ENCARGADO_PEDIDOS: 'Encargado de pedidos',
  PERSONAL_PREPARACION: 'Personal de preparación',
};

/** Texto del botón para avanzar al siguiente estado y perfiles que pueden hacerlo. */
export const ACCION_SIGUIENTE: Partial<Record<EstadoPedido, { texto: string; destino: EstadoPedido; roles: Rol[] }>> = {
  REGISTRADO: { texto: 'Confirmar', destino: 'CONFIRMADO', roles: ['ADMINISTRADOR', 'ENCARGADO_PEDIDOS'] },
  CONFIRMADO: {
    texto: 'Iniciar preparación',
    destino: 'EN_PREPARACION',
    roles: ['ADMINISTRADOR', 'ENCARGADO_PEDIDOS', 'PERSONAL_PREPARACION'],
  },
  EN_PREPARACION: {
    texto: 'Marcar listo',
    destino: 'LISTO_PARA_RECOJO',
    roles: ['ADMINISTRADOR', 'ENCARGADO_PEDIDOS', 'PERSONAL_PREPARACION'],
  },
};

/** Fecha local en formato yyyy-MM-dd (para inputs type="date"). */
export function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Mensaje de error legible a partir de la respuesta del backend. */
export function mensajeError(err: any): string {
  if (err?.status === 0) {
    return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución (puerto 8080).';
  }
  const e = err?.error;
  if (e?.errores) {
    const detalle = Object.values(e.errores).join(' · ');
    return `${e.mensaje} ${detalle}`;
  }
  return e?.mensaje ?? 'Ocurrió un error inesperado.';
}
