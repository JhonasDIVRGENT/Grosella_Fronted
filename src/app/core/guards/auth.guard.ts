import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../models/models';
import { AuthService } from '../services/auth.service';

/** Solo deja pasar si hay sesión y, si la ruta define "roles", si el perfil está permitido. */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.autenticado()) {
    return router.createUrlTree(['/login']);
  }
  const roles = route.data?.['roles'] as Rol[] | undefined;
  if (roles && !auth.tieneRol(...roles)) {
    return router.createUrlTree(['/inicio']);
  }
  return true;
};
