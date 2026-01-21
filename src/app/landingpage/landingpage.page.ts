import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonSplitPane, IonModal, IonItem, IonAvatar, IonText, IonMenu, IonRow, IonCol, IonGrid, IonButton, IonToolbar, IonTitle, IonButtons, IonApp, IonRouterOutlet, IonHeader, IonLabel, IonContent, IonList, IonIcon, IonMenuButton, IonMenuToggle
} from '@ionic/angular/standalone';
import { LanguageService } from '../services/language.service';
import { NetworkCheckService } from '../services/network-check.service';
import { MenuController } from '@ionic/angular';  // Import MenuController
import { Router, NavigationEnd } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ModalController } from '@ionic/angular';
import { SelectOnlineOrOfflineAwedanComponent } from '../select-online-or-offline-awedan/select-online-or-offline-awedan.component';

import { SharedserviceService } from '../services/sharedservice.service';
import AppSignatureHelper from '../plugin/app-signature-helper';
//import { AppVersion } from '@ionic-native/app-version/ngx';

import { Geolocation } from '@capacitor/geolocation';

declare const cordova: any;

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.page.html',
  styleUrls: ['./landingpage.page.scss'],
  standalone: true,
  imports: [IonSplitPane, IonList, IonMenuButton, IonMenuToggle, IonItem, IonAvatar, IonText, IonMenu, IonRow, IonCol, IonGrid, IonToolbar, IonTitle, IonHeader, IonLabel, IonContent,
    IonMenuButton, IonButton, CommonModule, FormsModule]
})
export class LandingpagePage implements OnInit {



  ionViewWillEnter() {
    if (sessionStorage.getItem('logined_officer_data') != null) {
      const officerData = JSON.parse(sessionStorage.getItem('logined_officer_data')!);
      if(officerData.designation == "4") { // RO designation
        this.router.navigateByUrl('/officers-dashboard-ro', { replaceUrl: true })
      } else {
        this.router.navigateByUrl('/officers-dashboard', { replaceUrl: true })
      }
    }
  }

  pages: { title: string, icon: string, active: boolean, url: string, is_sub_menu: boolean }[] = [];
  languageData: any = {};
  isConnected: boolean = false;

  constructor(private sharedService: SharedserviceService, private platform: Platform, private alertController: AlertController, private router: Router, private menuCtrl: MenuController, private langService: LanguageService, private networkCheckService: NetworkCheckService, private modalCtrl: ModalController) { }

  versionNumber: string = "";

  // async getAppVersion(): Promise<string> {
  //   if (cordova && cordova.getAppVersion) {
  //     return await cordova.getAppVersion.getVersionNumber();
  //   } else {
  //     throw new Error('cordova-plugin-app-version not available');
  //   }
  // }

  async ngOnInit() {

    if (this.platform.is('mobile')) {
      this.versionNumber = "1.0";
    }

    this.openModal();
    this.updateTranslation()
    //this.showAlert();

    this.langService.language$.subscribe(() => {
      this.pages = [
        {
          title: this.getTranslation('about_yojna'),
          icon: 'information',
          active: true,
          url: 'about-yojna',
          is_sub_menu: false
        },
        {
          title: 'clonal_nilgiri',
          icon: 'build',
          active: true,
          url: 'clonal-nilgiri',
          is_sub_menu: true
        },
        {
          title: 'tissue_cluture_sagon',
          icon: 'build',
          active: true,
          url: 'tissu-culture-sagon',
          is_sub_menu: true
        },
        {
          title: 'tissu_cultuer_beema_bansh',
          icon: 'build',
          active: true,
          url: 'tissu-culture-bima-bans',
          is_sub_menu: true
        },
        {
          title: 'miliya_dubiya_malabar_neem',
          icon: 'build',
          active: true,
          url: 'milia-dubiya-malabar-neem',
          is_sub_menu: true
        },
        {
          title: 'safed_chandan',
          icon: 'build',
          active: true,
          url: 'safed-chanddan',
          is_sub_menu: true
        },
        {
          title: 'tree_techniques_and_expensed',
          icon: 'build',
          active: true,
          url: 'tree-techniques-and-expenses',
          is_sub_menu: true
        },





        {
          title: 'uplabdhiya',
          icon: 'build',
          active: true,
          url: 'uplabdhiya',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('kisan_registeratino'),
          icon: 'build',
          active: true,
          url: 'kisan-awedan',
          is_sub_menu: false
        },
        {
          title: this.getTranslation('kisan_registeratino_status'),
          icon: 'build',
          active: true,
          url: 'registeration-status',
          is_sub_menu: false
        },
        {
          title: this.getTranslation('important_contact'),
          icon: 'build',
          active: true,
          url: 'important-contact',
          is_sub_menu: false
        },
        {
          title: this.getTranslation('officer_login'),
          icon: 'build',
          active: true,
          url: 'officer-login',
          is_sub_menu: false
        }
      ];
    });

  }

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    const text = this.langService.getTranslation(key);
    return text ? text.replace(/\n/g, '<br>') : '';
  }

  async getCurrentLocation(): Promise<boolean> {
    try {
      const position = await Geolocation.getCurrentPosition();
      return true;
    } catch (error) {
      this.longToast(error!!.toString());
      return false;
    }
  }

  // async onMenuItemClick(page: string) {

  //   this.isConnected = await this.networkCheckService.getCurrentStatus();

  //   if (this.isConnected) {

  //     if (page === "registeration") {
  //       //this.openDialogForRegisterationOption();
  //       this.router.navigate(['registeration'], {
  //         queryParams: {
  //           isOnline: true
  //         }
  //       })
  //     } else {
  //       this.router.navigate([page]); // Navigate after closing the menu
  //     }

  //   } else {
  //     this.longToast(this.getTranslation("no_internet"));
  //     return;
  //   }

  // }

  //--
  async onMenuItemClick(page: string) {

    this.isConnected = await this.networkCheckService.getCurrentStatus();

    if (this.isConnected) {

      if (page === "kisan-awedan") {
        this.router.navigate(['kisan-awedan']);
      } else if (page === "registeration") {
        //this.openDialogForRegisterationOption();
        this.router.navigate(['registeration'], {
          queryParams: {
            isOnline: true
          }
        })
      } else {
        this.router.navigate([page]); // Navigate after closing the menu
      }

    } else {
      this.longToast(this.getTranslation("no_internet"));
      return;
    }

  }
  //--

  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  async showAlert() {
    const alert = await this.alertController.create({
      header: 'Test',
      message: 'Hello from device',
      buttons: ['OK']
    });
    await alert.present();
  }

  async openDialogForRegisterationOption() {

    if (!this.getCurrentLocation()) {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: SelectOnlineOrOfflineAwedanComponent,
      cssClass: 'custom-dialog-modal',
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        // this.router.navigateByUrl(page, { replaceUrl: true }); // Navigate after closing the menu
        this.router.navigate(['registeration'], {
          queryParams: {
            isOnline: this.sharedService.getOfflineOnline()
          }
        })
        // const isOnline = this.sharedService.getOfflineOnline();
        // const queryParams = `?isOnline=${isOnline}`;
        // this.router.navigateByUrl('/registeration' + queryParams);
      }
    });

    await modal.present();

  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  isWebPlatform(): boolean {
    // if (url === "officer-login" && this.platform.is('desktop')) {
    //   return true;
    // } else if (url === "officer-login" && this.platform.is('mobile')) {
    //   return false;
    // }

    if (this.platform.is('desktop')) {
      return true;
    }
    return false;

  }

  isMobilePlatForm(): boolean {
    return this.platform.is('mobile');
  }

  isDialogOpen = false;
  //   openDialog(){
  // this.isDialogOpen = true;
  //   }

  closeDialog() {
    this.isDialogOpen = false;
  }

  confirmDialog() {
    this.closeDialog();
  }

  async navigateToKisanAwedan() {
    this.isConnected = await this.networkCheckService.getCurrentStatus();
    
    if (this.isConnected) {
      this.router.navigate(['kisan-awedan']);
    } else {
      this.longToast(this.getTranslation("no_internet"));
    }
  }

}
