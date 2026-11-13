// Interfaces que corresponden a los DTO del backend

export type EstadoPedido =
  | 'REGISTRADO'
  | 'CONFIRMADO'
  | 'EN_PREPARACION'
  | 'LISTO_PARA_RECOJO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type EstadoPago = 'CON_ADELANTO' | 'PENDIENTE' | 'PAGADO';

export type Rol = 'ADMINISTRADOR' | 'PERSONAL_ATENCION' | 'ENCARGADO_PEDIDOS' | 'PERSONAL_PREPARACION';

export interface Sesion {
  token: string;
  idUsuario: number;
  nombres: string;
  usuario: string;
  rol: Rol;
  idSede: number;
  sede: string;
}

export interface Sede {
  idSede: number;
  nombre: string;
  direccion: string;
}

export interface Producto {
  idProducto: number;
  nombre: string;
  categoria: string;
  precio: number;
}

export interface Cliente {
  idCliente: number;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  fechaRegistro: string;
  cantidadPedidos: number;
}

export interface ClienteRequest {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string;
}

export interface PedidoResumen {
  idPedido: number;
  numero: string;
  cliente: string;
  fechaRecojo: string;
  horaRecojo: string;
  sede: string;
  productos: string | null;
  personalizacion: string | null;
  total: number;
  saldo: number;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
}

export interface DetallePedido {
  idProducto: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Personalizacion {
  tamano: string | null;
  decoracion: string | null;
  nombres: string | null;
  toppers: string | null;
  velas: string | null;
  observaciones: string | null;
  resumen?: string | null;
}

export interface Pago {
  idPago: number;
  fechaPago: string;
  monto: number;
  tipoPago: 'ADELANTO' | 'SALDO';
}

export interface PedidoDetalle {
  idPedido: number;
  numero: string;
  cliente: Cliente;
  idSede: number;
  sede: string;
  registradoPor: string;
  fechaRegistro: string;
  fechaRecojo: string;
  horaRecojo: string;
  total: number;
  adelanto: number;
  saldo: number;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  siguienteEstado: EstadoPedido | null;
  observaciones: string | null;
  detalles: DetallePedido[];
  personalizacion: Personalizacion | null;
  pagos: Pago[];
}

export interface PedidoRequest {
  idCliente: number;
  idSede: number;
  fechaRecojo: string; // yyyy-MM-dd
  horaRecojo: string; // HH:mm
  adelanto: number;
  observaciones: string | null;
  detalles: { idProducto: number; cantidad: number }[];
  personalizacion: Personalizacion | null;
}

export interface HistorialCliente {
  cliente: Cliente;
  pedidos: PedidoResumen[];
}

export interface ResumenEstado {
  estado: EstadoPedido;
  cantidad: number;
}
