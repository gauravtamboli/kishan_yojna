import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.error('Global error caught:', error);
    alert('Error: ' + (error?.message || error));
  }
}
