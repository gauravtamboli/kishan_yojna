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
import { finalize, timeout } from 'rxjs/operators';

export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('NgrokInterceptor: Processing request', req.url);

  const clonedRequest = req.clone({
    setHeaders: {
      'ngrok-skip-browser-warning': 'true',
      'X-Ngrok-Skip-Browser-Warning': 'true'
    }
  });

  // ✅ Skip loader logic for file upload (BEST PRACTICE)
  if (req.url.includes('UploadRoFile')) {
    return next(clonedRequest);
  }

  return next(clonedRequest).pipe(
    timeout(60000), // ⏱️ prevent infinite hang (60s)
    finalize(() => {
      console.log('NgrokInterceptor: Request completed', req.url);
      // 🔥 dismiss loader / clear processing state here
    })
  );
};
