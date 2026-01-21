import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import {
  IonLoading,
  IonContent,
  IonRadioGroup,
  IonRadio,
  IonTextarea,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonList,
  IonRow,
  IonCol,
  IonLabel,
  IonGrid,
  IonButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonIcon,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController } from '@ionic/angular';
import { MastersModelClass } from '../../services/response_classes/GetMastsersResponseModel';
import { Toast } from '@capacitor/toast';
import { LoadingController, Platform } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalController } from '@ionic/angular';
import { OTPDialogComponent } from '../../otpdialog/otpdialog.component';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { Geolocation } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import {
  buildSharp,
  homeOutline,
  informationOutline,
  informationCircle,
  buildOutline,
  addCircleOutline,
  callOutline,
  addCircle,
  refreshCircleOutline,
  refreshOutline,
  boat,
} from 'ionicons/icons';
import { AddPlantDialogComponent } from '../../add-plant-dialog/add-plant-dialog.component';
import { PlantationDetailNew, SingleAwedanDataResponse } from '../../pages/view-awedan/SingleAwedanDataResponse.model';
import { SharedserviceService } from '../../services/sharedservice.service';
import { OfficersLoginResponseModel } from '../../pages/officer-login/OfficersLoginResponse.model';
import { IonInputCustomEvent, InputInputEventDetail } from '@ionic/core';
import { BankModal, Bankresponse } from '../../pages/ra-dwara-vivran/Getbankdetail.modal';

@Component({
  standalone: true,
  selector: 'app-pragati-prativedan',
  templateUrl: './pragati-prativedan.component.html',
  styleUrls: ['./pragati-prativedan.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})

export class PragatiPrativedanComponent implements OnInit {
columnNumbers: any;


exportToExcel() {
throw new Error('Method not implemented.');

}

reportData: any;
 todayDate: string = '';


 goBack() {
    if (window.history.length > 1) {
      if (sessionStorage.getItem('logined_officer_data') != null) {
        this.router.navigateByUrl('/officers-dashboard', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/landingpage', { replaceUrl: true });
      }
    } else {
      this.location.back();
    }
  }




  constructor(
    private location: Location,
    private sharedService: SharedserviceService,
    private router: Router,
    private modalCtrl: ModalController,
    private platform: Platform,
    private navController: NavController,
    private langService: LanguageService,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    addIcons({
      buildSharp,
      homeOutline,
      informationOutline,
      informationCircle,
      buildOutline,
      addCircleOutline,
      callOutline,
      addCircle,
      refreshCircleOutline,
      refreshOutline,
      boat,
    });
  }
  
  
  ngOnInit() { 

 const today = new Date();
    this.todayDate = today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });


    const totalColumns = 41; 
    this.columnNumbers = Array.from({ length: totalColumns }, (_, i) => i + 1);


  } 
  


}

