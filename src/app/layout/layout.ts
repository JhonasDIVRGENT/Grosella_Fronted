import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Rol } from '../core/models/models';
import { AuthService } from '../core/services/auth.service';
import { ETIQUETA_ROL } from '../core/utils/estados';

interface OpcionMenu {
  texto: string;
  ruta: string;
  roles?: Rol[];
}

const ATENCION: Rol[] = ['ADMINISTRADOR', 'PERSONAL_ATENCION', 'ENCARGADO_PEDIDOS'];

/** Barra superior granate + menú lateral (igual a los prototipos de las vistas GUI). */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
})
export class Layout {
  private auth = inject(AuthService);

  private readonly opciones: OpcionMenu[] = [
    { texto: 'Inicio', ruta: '/inicio' },
    { texto: 'Registrar pedido', ruta: '/pedidos/nuevo', roles: ATENCION },
    { texto: 'Consultar pedidos', ruta: '/pedidos' },
    { texto: 'Pedidos programados', ruta: '/pedidos/programados' },
    { texto: 'Clientes', ruta: '/clientes', roles: ATENCION },
    { texto: 'Nuevo cliente', ruta: '/clientes/nuevo', roles: ATENCION },
    { texto: 'Registrar pago', ruta: '/pagos', roles: ATENCION },
    { texto: 'Entregas', ruta: '/entregas', roles: ATENCION },
    { texto: 'Cancelar pedido', ruta: '/cancelar', roles: ['ADMINISTRADOR', 'ENCARGADO_PEDIDOS'] },
  ];

  readonly menu = computed(() => {
    this.auth.sesion(); // se recalcula si cambia la sesión
    return this.opciones.filter((o) => !o.roles || this.auth.tieneRol(...o.roles));
  });

  /** "Personal de atención · Sede Centro" o "Administrador" */
  readonly usuarioActual = computed(() => {
    const s = this.auth.sesion();
    if (!s) return '';
    const rol = ETIQUETA_ROL[s.rol];
    return s.rol === 'ADMINISTRADOR' ? rol : `${rol} · Sede ${s.sede}`;
  });

  readonly nombre = computed(() => this.auth.sesion()?.nombres ?? '');

  cerrarSesion(): void {
    this.auth.logout();
  }
}
