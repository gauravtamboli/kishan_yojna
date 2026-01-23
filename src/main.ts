import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ngrokInterceptor } from './app/core/interceptors/ngrok.interceptor';
import { IonicStorageModule } from '@ionic/storage-angular';
import { importProvidersFrom } from '@angular/core';
import { ModalController } from '@ionic/angular';
//import { initializeApp } from 'firebase/app';
import { environment } from './environments/environment';
//import { AppVersion } from '@ionic-native/app-version/ngx';

//initializeApp(environment.firebase);

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: RouteReuseStrategy, useClass: IonicRouteStrategy
    },
    provideIonicAngular(),

    importProvidersFrom(IonicStorageModule.forRoot()),


    provideRouter(routes, withPreloading(PreloadAllModules)),

    // HttpClientModule, // Removed to avoid conflict with provideHttpClient

    provideHttpClient(withInterceptors([ngrokInterceptor])),

    ModalController

  ],
});
