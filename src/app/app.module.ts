import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GlobalErrorHandler } from './GlobalErrorHandler';



@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    // IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [Storage, { provide: ErrorHandler, useClass: GlobalErrorHandler }], // Add Storage as a provider
  bootstrap: [AppComponent],
})
export class AppModule {

  constructor(private storage: Storage) {
    this.storage['create']();
  }

}