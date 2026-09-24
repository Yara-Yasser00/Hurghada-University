import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

function doorFromRole(role: unknown): 'student' | 'staff' {
  return role === 'student' ? 'student' : 'staff';
}

function loginPath(door: 'student' | 'staff'): string {
  const base = (environment.appBaseHref || '').replace(/\/$/, '');
  return `${base}/login?door=${door}`;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const raw = localStorage.getItem('hu_session');
  let request = req;
  let sessionRole: string | undefined;

  if (raw) {
    try {
      const session = JSON.parse(raw) as { token?: string; role?: string };
      sessionRole = session.role;
      if (session.token) {
        request = req.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } });
      }
    } catch {
      /* ignore */
    }
  }

  return next(request).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        !req.url.includes('/api/auth/login')
      ) {
        const door = doorFromRole(
          sessionRole ?? sessionStorage.getItem('hu_last_door')
        );
        localStorage.removeItem('hu_session');
        const path = loginPath(door);
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login')
        ) {
          window.location.assign(path);
        }
      }
      return throwError(() => err);
    })
  );
};
