import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cliente, ClienteRequest } from '../../core/models/models';
import { ClienteService } from '../../core/services/cliente.service';
import { mensajeError } from '../../core/utils/estados';

/** CU06 Registrar cliente */
@Component({
  selector: 'app-nuevo-cliente',
  imports: [FormsModule, RouterLink],
  templateUrl: './nuevo-cliente.html',
})
export class NuevoCliente implements OnInit {
  private clienteService = inject(ClienteService);

  /** Si viene desde "Registrar pedido" con un DNI no registrado */
  readonly dni = input<string | undefined>(undefined);

  cliente: ClienteRequest = { nombres: '', apellidos: '', dni: '', telefono: '' };
  readonly enviado = signal(false);
  readonly guardando = signal(false);
  readonly registrado = signal<Cliente | null>(null);
  readonly error = signal<string | null>(null);
  readonly dniDuplicado = signal(false);

  ngOnInit(): void {
    if (this.dni()) this.cliente.dni = this.dni()!;
  }

  guardar(form: NgForm): void {
    this.enviado.set(true);
    this.error.set(null);
    this.registrado.set(null);
    this.dniDuplicado.set(false);
    if (form.invalid) {
      this.error.set('Complete los campos obligatorios marcados con *.'); // FA1
      return;
    }
    this.guardando.set(true);
    this.clienteService.registrar({ ...this.cliente, telefono: this.cliente.telefono.trim() }).subscribe({
      next: (c) => {
        this.registrado.set(c);
        this.guardando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
        this.dniDuplicado.set(e.status === 409); // FA2
        this.guardando.set(false);
      },
    });
  }

  limpiar(form: NgForm): void {
    form.resetForm();
    this.cliente = { nombres: '', apellidos: '', dni: '', telefono: '' };
    this.enviado.set(false);
    this.error.set(null);
    this.registrado.set(null);
  }
}
