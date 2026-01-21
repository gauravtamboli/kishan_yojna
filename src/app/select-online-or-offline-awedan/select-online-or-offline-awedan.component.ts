import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonRow, IonCol, IonGrid, IonButton } from '@ionic/angular/standalone';
import { LanguageService } from '../services/language.service';
import { SharedserviceService } from '../services/sharedservice.service';


@Component({
  standalone: true,
  selector: 'app-select-online-or-offline-awedan',
  templateUrl: './select-online-or-offline-awedan.component.html',
  styleUrls: ['./select-online-or-offline-awedan.component.scss'],
  imports: [IonRow, IonCol, IonGrid, IonButton]
})
export class SelectOnlineOrOfflineAwedanComponent {

  constructor(private sharedService: SharedserviceService, private modalCtrl: ModalController, private langService: LanguageService) { 
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  offLineOrOnline(offlineOrOnline: string) {
    this.sharedService.setOfflineOnline(offlineOrOnline);
    this.modalCtrl.dismiss({ confirmed: true });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  closeModel() {
    this.modalCtrl.dismiss();
  }

}
