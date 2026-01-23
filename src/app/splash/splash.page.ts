import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { IonicModule } from '@ionic/angular';  // Import IonicModule
import { NetworkCheckService } from '../services/network-check.service';
import { Toast } from '@capacitor/toast';
import { environment } from 'src/environments/environment';
// import { Geolocation } from '@capacitor/geolocation';
import { ApiService } from '../services/api.service';
import { AlertController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import AppSignatureHelper from '../plugin/app-signature-helper';

import { ModalController } from '@ionic/angular';
import { UpdateAppDialogComponent } from '../update-app-dialog/update-app-dialog.component';
import { Browser } from '@capacitor/browser';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

//import { SmsRetriever } from 'capacitor-plugin-sms-retriever-api';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SplashPage implements OnInit {

  lat: number | null = null;
  lon: number | null = null;

  splashText: string = ''
  languageData: any = {};
  isConnected: boolean = false;

  constructor(private modalCtrl: ModalController, private plateForm: Platform, private alertController: AlertController, private apiService: ApiService, private router: Router, private languageService: LanguageService, private networkCheckService: NetworkCheckService
  ) { }

  cordova: any;
  // async getAppVersion(): Promise<string> {
  //   //debugger;
  //   if (this.cordova && this.cordova.getAppVersion) {
  //     return await this.cordova.getAppVersion.getVersionNumber();
  //   } else {
  //     throw new Error('cordova-plugin-app-version not available');
  //   }
  // }

  setMainURL() {

    //Preferences.set({ key: 'ngrok_url', value: "https://fb066515d8d1.ngrok-free.app" });

    //Preferences.set({ key: 'ngrok_url', value: "https://forest.cg.gov.in/KVMY" });
    // Preferences.set({ key: 'ngrok_url', value: "https://forest.cg.gov.in/KVMY" });
    Preferences.set({ key: 'ngrok_url', value: "https://nonaristocratically-frettiest-ben.ngrok-free.dev" });
    // Preferences.set({ key: 'ngrok_url', value: "https://fedda7b16e66.ngrok-free.app" });
    //Preferences.set({ key: 'ngrok_url', value: "https://3d64be92788d.ngrok-free.app" });
    //Preferences.set({ key: 'ngrok_url', value: "https://b2d751eb02c5.ngrok-free.app" });

    setTimeout(() => {
      if (sessionStorage.getItem('logined_officer_data') != null) {
        const officerData = JSON.parse(sessionStorage.getItem('logined_officer_data')!);
        if(officerData.designation == "4") { // RO designation
          this.router.navigateByUrl('/officers-dashboard-ro', { replaceUrl: true })
        } else {
          this.router.navigateByUrl('/officers-dashboard', { replaceUrl: true })
        }
      } else if (this.plateForm.is('mobile')) {
        this.getAppDetail();
      } else {
        this.router.navigateByUrl('landingpage', { replaceUrl: true })
      }
    }, 3000); // 2 seconds delay

  }

  getAppDetail() {
    this.apiService.getAppDetails().subscribe(
      async (response) => {

        if (response.response.code === 200) {

          if (response.data.is_app_under_maintanance === "1") {

            try {
              const modal = await this.modalCtrl.create({
                component: MessageDialogComponent,
                componentProps: {
                  server_message: "एप्लीकेशन पे कार्य हो रहा है कृपया थोड़ी देर बाद प्रयास करें | धन्यवाद्",
                  isYesNo: false,
                },
                cssClass: 'custom-dialog-modal',
                backdropDismiss: false,
              });

              modal.onDidDismiss().then((result) => {
                if (result.data?.confirmed) {
                  App.exitApp();
                }
              });

              await modal.present();
            } catch (err) {
            }

          } else {

            let appversion = "1.0";

            //this.appVersion.getVersionNumber().then(async version => {

            if (await appversion != response.data.app_version) {

              try {
                let isForcelyUpdateValue = false
                if (response.data.is_forcely_update === "1") {
                  isForcelyUpdateValue = true;
                }
                const modal = await this.modalCtrl.create({
                  component: UpdateAppDialogComponent,
                  componentProps: {
                    isForcelyUpdate: isForcelyUpdateValue,
                  },
                  cssClass: 'custom-dialog-modal',
                  backdropDismiss: false,
                });

                modal.onDidDismiss().then((result) => {
                  if (result.data?.confirmed) {
                    Browser.open({
                      url: 'https://play.google.com/store/apps/details?id=com.kisan_vriksh_mitra_yojna'
                    });
                    App.exitApp();
                  } else {
                    //this.getCurrentLocation();
                    this.router.navigateByUrl('landingpage', { replaceUrl: true })
                  }
                });

                await modal.present();
              } catch (err) {
              }

            } else {
              //this.getCurrentLocation();
              this.router.navigateByUrl('landingpage', { replaceUrl: true })
            }

            //});


          }

        } else {

        }

      },
      (error) => {
      }
    );
  }

  async ngOnInit() {

    this.updateTranslation();

    this.isConnected = await this.networkCheckService.getCurrentStatus();

    if (this.isConnected) {

      this.setMainURL();

    } else {
      this.longToast(this.getTranslation("no_internet"));
    }

  }

  async getCurrentLocation() {
    try {

      this.router.navigateByUrl('landingpage', { replaceUrl: true })

    } catch (error) {
      this.longToast(error!!.toString());
    }
  }

  getStateName(lat: number, lon: number) {

    this.apiService.getStateNameProgramatically(lat, lon).subscribe(
      (response) => {

        if (response != null) {

          if (response.address.state === "Chhattisgarh") {
            this.router.navigateByUrl('landingpage', { replaceUrl: true })
          } else {
            this.afterGettingWrongState()
          }

        } else {
          this.longToast("Problem to initialize application")
        }

      },
      (error) => {
        this.longToast(error);
      }
    );

  }

  async afterGettingWrongState() {
    const afterSubmitAwedanDialog = await this.alertController.create({
      message: "यह एप्लीकेशन केवल छत्तीगढ़ राज्य के लिए ही मान्य है धन्यवाद् | ",
      buttons: [
        {
          text: 'OK',
          handler: () => {
            afterSubmitAwedanDialog.dismiss();
            App.exitApp();
            return false;
          },
        }
      ],
      backdropDismiss: false
    });

    await afterSubmitAwedanDialog.present();

  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  updateTranslation() {
    this.languageService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.languageService.getTranslation(key);
  }

  isWebPlatform(): boolean {
    return this.plateForm.is('desktop');
  }

  hashString: string = "";

  async getAppHash() {
    try {
      const result = await AppSignatureHelper.getAppSignatures();
      this.hashString = result.hashes[0];
      // Use result.hashes[0] or all hashes if multiple
    } catch (error) {
      // Try to stringify error for debugging and display
      if (typeof error === 'string') {
        this.hashString = error;
      } else if (error instanceof Error) {
        this.hashString = error.message;
      } else {
        this.hashString = JSON.stringify(error);
      }
    }
  }



}
