import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// point 65/68: the backend already returns a stable {statusCode, code,
// message} error envelope — this interceptor only handles the one
// cross-cutting case (expired session) and otherwise lets the error
// propagate so each screen can show its own error state (point 82).
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        authService.clearSession();
        void router.navigateByUrl('/auth/login');
      }
      return throwError(() => error);
    }),
  );
};
