import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteRequest, HistorialCliente } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/clientes`;

  /** CU16 Buscar cliente por DNI o nombre */
  buscar(texto: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url, { params: new HttpParams().set('q', texto) });
  }

  /** Lista completa de clientes (para el selector desplegable). */
  todos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url);
  }

  buscarPorDni(dni: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/dni/${dni}`);
  }

  /** CU06 Registrar cliente */
  registrar(cliente: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, cliente);
  }

  /** CU07 Historial de pedidos del cliente */
  historial(idCliente: number): Observable<HistorialCliente> {
    return this.http.get<HistorialCliente>(`${this.url}/${idCliente}/pedidos`);
  }
}
