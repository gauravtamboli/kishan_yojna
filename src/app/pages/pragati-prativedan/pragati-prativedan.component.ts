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
import { StorageService } from '../../services/storage.service';
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
import { AuthServiceService } from '../../services/auth-service.service';
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
  fiencial_year: string = '';


  goBack() {
    const user = this.authService.getOfficerData();
    if (user && user.designation) {
      const designation = Number(user.designation);
      let route = '/landingpage';
      
      switch (designation) {
        case 1:
          route = '/officers-dashboard-circle'; // Circle/CFO
          break;
        case 2:
          route = '/officers-dashboard'; // DFO
          break;
        case 3:
          route = '/officers-dashboard-sdo'; // SDO
          break;
        case 4:
          route = '/officers-dashboard-ro'; // RO
          break;
        case 6:
        case 7:
          route = '/officers-dashboard-supreme'; // SUPER ADMIN
          break;
      }
      this.router.navigateByUrl(route, { replaceUrl: true });
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
    private httpClient: HttpClient,
    private authService: AuthServiceService,
    private storageService: StorageService
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
  
  
  async ngOnInit() { 
    const today = new Date();
    this.todayDate = today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const totalColumns = 41; 
    this.columnNumbers = Array.from({ length: totalColumns }, (_, i) => i + 1);

    this.fiencial_year = await this.storageService.get('current_session') || '';
    
    this.loadReportData();
  } 

  async loadReportData() {
    const user = this.authService.getOfficerData();
    if (user && user.rang_id) {
      const rangeId = Number(user.rang_id);
      const curentSession = this.fiencial_year;
      
      const loading = await this.loadingController.create({
        message: 'Loading report data...',
        spinner: 'circles'
      });
      await loading.present();

      this.apiService.getPragatiPrativedanReport(rangeId, curentSession).subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          if (res && res.success) {
            this.reportData = res.data;
            this.cdRef.detectChanges();
          } else {
            const toast = await this.toastController.create({
              message: res?.message || 'Failed to load report data',
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
          }
        },
        error: async (err: any) => {
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Error fetching report data',
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      });
    } else {
      const toast = await this.toastController.create({
        message: 'Range ID not found for the logged-in user',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
    }
  }
  


}

