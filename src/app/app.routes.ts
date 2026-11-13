import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Rol } from './core/models/models';
import { Layout } from './layout/layout';
import { CancelarPedido } from './pages/cancelar-pedido/cancelar-pedido';
import { Clientes } from './pages/clientes/clientes';
import { ConsultarPedidos } from './pages/consultar-pedidos/consultar-pedidos';
import { Entregas } from './pages/entregas/entregas';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { NuevoCliente } from './pages/nuevo-cliente/nuevo-cliente';
import { PedidosProgramados } from './pages/pedidos-programados/pedidos-programados';
import { RegistrarPago } from './pages/registrar-pago/registrar-pago';
import { RegistrarPedido } from './pages/registrar-pedido/registrar-pedido';

const ATENCION: Rol[] = ['ADMINISTRADOR', 'PERSONAL_ATENCION', 'ENCARGADO_PEDIDOS'];

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión · Grosella' },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'inicio', component: Inicio, title: 'Inicio · Grosella' },
      { path: 'pedidos/nuevo', component: RegistrarPedido, data: { roles: ATENCION }, title: 'Registrar pedido' },
      { path: 'pedidos/programados', component: PedidosProgramados, title: 'Pedidos programados' },
      { path: 'pedidos', component: ConsultarPedidos, title: 'Consultar pedidos' },
      { path: 'clientes/nuevo', component: NuevoCliente, data: { roles: ATENCION }, title: 'Nuevo cliente' },
      { path: 'clientes', component: Clientes, data: { roles: ATENCION }, title: 'Clientes' },
      { path: 'pagos', component: RegistrarPago, data: { roles: ATENCION }, title: 'Registrar pago' },
      { path: 'entregas', component: Entregas, data: { roles: ATENCION }, title: 'Entregas' },
      {
        path: 'cancelar',
        component: CancelarPedido,
        data: { roles: ['ADMINISTRADOR', 'ENCARGADO_PEDIDOS'] },
        title: 'Cancelar pedido',
      },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    ],
  },
  { path: '**', redirectTo: '' },
];
