import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRouterOutlet, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonCardHeader, IonCardContent, IonCardTitle, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { LanguageService } from '../../services/language.service';
import { NavController, MenuController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { appsOutline, homeOutline, informationOutline, informationCircle, buildOutline } from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { Platform, AlertController } from '@ionic/angular';
import { NetworkCheckService } from 'src/app/services/network-check.service';
import { Router, NavigationEnd } from '@angular/router';
import { TableModule } from 'primeng/table'; // Import TableModule
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';

import { SharedserviceService } from 'src/app/services/sharedservice.service';

@Component({
  selector: 'offline-awedan-awedan-list',
  templateUrl: './make-offline-awedan-to-online.page.html',
  styleUrls: ['./make-offline-awedan-to-online.page.scss'],
  standalone: true,
  imports: [IonLabel, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, TableModule]
})
export class MakeOfflineAwedanToOnlinePage implements OnInit {

  isConnected: boolean = false;

  languageData: any = {};

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  listOfAwedan: any[] = [];

  goBack() {
    this.navController.back();
  }

  constructor(private router: Router, private menuCtrl: MenuController, private networkCheckService: NetworkCheckService, private platform: Platform, private navController: NavController, private langService: LanguageService, private cdRef: ChangeDetectorRef,
    private apiService: ApiService, private sharedService: SharedserviceService) { }

  // Refresh list if data submited to online //
  ionViewWillEnter() {
    if (this.sharedService.getRefresh()) {
      this.getListOfOfflineAwedanList();
    }
  }

  async ngOnInit() {
    this.updateTranslation();
    this.getListOfOfflineAwedanList();
  }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  getListOfOfflineAwedanList() {

    this.showDialog("कृपया प्रतीक्षा करें.....");

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    this.apiService.getListOfOfflineAwedanList(
      officersLoginModel.designation,
      officersLoginModel.circle_id,
      officersLoginModel.devision_id
    ).subscribe(
      (response) => {

        if (response.response.code === 200) {

          this.isNoRecordFound = false;
          this.listOfAwedan = response.data

          this.cdRef.detectChanges();

        } else {
          this.isNoRecordFound = true;
          this.listOfAwedan = [];
          this.cdRef.detectChanges();
          this.longToast(response.response.message)
        }

        this.dismissDialog();

      },
      (error) => {
        this.shortToast(error);
        this.dismissDialog();
      }
    );


  }


  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  goToMakeOnline(offlineAwedanObject: GetAwedanResponseModel) {
    // this.router.navigate(['reg-page-to-make-offline-to-online'], {
    //   queryParams: {
    //     offlineAwedanJson: JSON.stringify(offlineAwedanObject)
    //   }
    // }); 

    const jsonData = JSON.stringify(offlineAwedanObject);
    const queryParams = `?offlineAwedanJson=${jsonData}`;
    this.router.navigateByUrl('/reg-page-to-make-offline-to-online' + queryParams);

  }

  isNoRecordFound: boolean = true;

  // isNoRecordFound() : boolean{
  //   if(this.listOfAwedan.length === 0){
  //     return true;
  //   }
  //   return false;
  // }

}
