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

import { HttpInterceptorFn } from '@angular/common/http';

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

  const clonedRequest = req.clone({
    setHeaders: {
      'ngrok-skip-browser-warning': 'true',
      'X-Ngrok-Skip-Browser-Warning': 'true'
    }
  });

  return next(clonedRequest);
};
