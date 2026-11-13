import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EstadoPedido, PedidoDetalle, PedidoRequest, PedidoResumen, ResumenEstado } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pedidos`;

  /** CU08 Registrar pedido */
  registrar(pedido: PedidoRequest): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(this.url, pedido);
  }

  /** CU17 Buscar pedido por número (P-000128 o 128) */
  buscar(numero: string): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${this.url}/${encodeURIComponent(numero.trim())}`);
  }

  /** CU02 Consultar pedidos por estado */
  porEstado(estado: EstadoPedido, idSede?: number | null): Observable<PedidoResumen[]> {
    let params = new HttpParams().set('estado', estado);
    if (idSede) params = params.set('idSede', idSede);
    return this.http.get<PedidoResumen[]>(this.url, { params });
  }

  resumenEstados(idSede?: number | null): Observable<ResumenEstado[]> {
    let params = new HttpParams();
    if (idSede) params = params.set('idSede', idSede);
    return this.http.get<ResumenEstado[]>(`${this.url}/resumen-estados`, { params });
  }

  /** CU15 Consultar pedidos programados */
  programados(fecha: string, desde: string, hasta: string, idSede?: number | null): Observable<PedidoResumen[]> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    if (idSede) params = params.set('idSede', idSede);
    return this.http.get<PedidoResumen[]>(`${this.url}/programados`, { params });
  }

  proximos(idSede?: number | null, limite = 8): Observable<PedidoResumen[]> {
    let params = new HttpParams().set('limite', limite);
    if (idSede) params = params.set('idSede', idSede);
    return this.http.get<PedidoResumen[]>(`${this.url}/proximos`, { params });
  }

  /** CU12 Confirmar / CU14 Actualizar estado de preparación */
  cambiarEstado(idPedido: number, estado: EstadoPedido): Observable<PedidoDetalle> {
    return this.http.patch<PedidoDetalle>(`${this.url}/${idPedido}/estado`, { estado });
  }

  /** CU10 Registrar pago */
  registrarPago(idPedido: number, monto: number): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(`${this.url}/${idPedido}/pagos`, { monto });
  }

  /** CU11 Registrar entrega */
  registrarEntrega(idPedido: number): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(`${this.url}/${idPedido}/entrega`, {});
  }

  /** CU13 Cancelar pedido */
  cancelar(idPedido: number, motivo: string): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(`${this.url}/${idPedido}/cancelacion`, { motivo });
  }
}
