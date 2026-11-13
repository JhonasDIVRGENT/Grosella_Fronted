import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, Sede } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);
  private sedes$?: Observable<Sede[]>;

  sedes(): Observable<Sede[]> {
    // Las sedes casi no cambian: se piden una sola vez
    this.sedes$ ??= this.http.get<Sede[]>(`${environment.apiUrl}/sedes`).pipe(shareReplay(1));
    return this.sedes$;
  }

  productos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/productos`);
  }
}
