// import { Injectable, inject } from '@angular/core';
// import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
// import { Observable, throwError, from } from 'rxjs';
// import { catchError, switchMap } from 'rxjs/operators';
// import { AuthService } from './auth.service';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../environments/environment';

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   private auth = inject(AuthService);
//   private http = inject(HttpClient);

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     let authReq = req;
//     const token = this.auth.token;
//     if (token) {
//       authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
//     }

//     return next.handle(authReq).pipe(
//       catchError((err: HttpErrorResponse) => {
//         if (err.status === 401 && !req.url.includes('/auth/refresh')) {
//           // attempt refresh
//           return this.http.post<{ accessToken: string }>(`${environment.apiBaseUrl}/auth/refresh`, {})
//             .pipe(
//               switchMap(res => {
//                 this.auth.setAccessToken(res.accessToken);
//                 const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
//                 return next.handle(retryReq);
//               }),
//               catchError(e => {
//                 this.auth.logout();
//                 return throwError(() => e);
//               })
//             );
//         }
//         return throwError(() => err);
//       })
//     );
//   }
// }

// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const http = inject(HttpClient);

  let authReq = req;
  const token = auth.token;

  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/api/auth/refresh')) {
        return http.post<{ accessToken: string }>(`${environment.apiBaseUrl}/api/auth/refresh`, {},
          { withCredentials: true }   // ✅ send cookie!
          )
          .pipe(
            switchMap(res => {
              auth.setAccessToken(res.accessToken);
              const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
              return next(retryReq);
            }),
            catchError(e => {
              auth.logout();
              return throwError(() => e);
            })
          );
      }
      return throwError(() => err);
    })
  );
};

