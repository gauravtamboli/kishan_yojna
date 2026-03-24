// import { HttpInterceptorFn } from '@angular/common/http';

// export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
//   console.log('NgrokInterceptor: Processing request', req.url);
//   const clonedRequest = req.clone({
//     setHeaders: {
//       'ngrok-skip-browser-warning': 'true',
//       'X-Ngrok-Skip-Browser-Warning': 'true'
//     }
//   });
//   return next(clonedRequest);
// };

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthServiceService } from '../../services/auth-service.service';

export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {

  // 🔥 Skip interceptor side-effects for upload
  if (req.url.includes('UploadRoFile')) {
    return next(
      req.clone({
        setHeaders: {
          'ngrok-skip-browser-warning': 'true',
          'X-Ngrok-Skip-Browser-Warning': 'true'
        }
      })
    );
  }

  console.log('NgrokInterceptor: Processing request', req.url);

  const authService = inject(AuthServiceService);

  // Retrieve JWT from session storage
  const token = sessionStorage.getItem('token');

  const headers: any = {
    'ngrok-skip-browser-warning': 'true',
    'X-Ngrok-Skip-Browser-Warning': 'true'
  };

  if (token) {
    // If the token is already expired locally, auto logout immediately
    if (authService.isTokenExpired()) {
      authService.logout();
      return throwError(() => new Error('Token Expired'));
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  const clonedRequest = req.clone({
    setHeaders: headers
  });


  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Auto logout if 401 Unauthorized response returned from API
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
