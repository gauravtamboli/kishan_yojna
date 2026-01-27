import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLoading, IonText, IonButton, IonInput, IonLabel, IonGrid, IonRow } from '@ionic/angular/standalone';
import { LanguageService } from '../../services/language.service';
import { NavController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { StorageService } from '../../services/storage.service';


@Component({
  selector: 'app-officer-login',
  templateUrl: './officer-login.page.html',
  styleUrls: ['./officer-login.page.scss'],
  standalone: true,
  imports: [IonLoading, IonText, IonButton, IonInput, IonLabel, IonGrid, IonRow, CommonModule, FormsModule]
})
export class OfficerLoginPage implements OnInit {

  constructor(private modalCtrl: ModalController, private router: Router, private navController: NavController, private langService: LanguageService, private cdRef: ChangeDetectorRef,
    private apiService: ApiService, private storageService: StorageService) { }
  languageData: any = {};

  mobile: string = '';
  password: string = "";
  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  goBack() {
    this.navController.back();
  }

  async ngOnInit() {
    this.updateTranslation()
  }

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  isNotValidMobile: boolean = false;
  isNotValidPassword: boolean = false;
  error_mobile_no_msg: string = "";
  error_password_no_msg: string = "";
  isNotValidLogin: boolean = false;
  error_msg_from_server_if_not_login: string = "";

  clickToLogin() {

    if (this.mobile == "") {
      this.isNotValidMobile = true;
      this.error_mobile_no_msg = "कृपया यूजर नाम डालें";
      this.shortToast("कृपया यूजर नाम डालें");
      return;
    }

    // if (this.mobile.toString().length != 10) {
    //   this.isNotValidMobile = true;
    //   this.error_mobile_no_msg = "कृपया सही मोबाइल नंबर डालें";
    //   this.shortToast("कृपया सही मोबाइल नंबर डालें");
    //   return;
    // }

    if (this.password == "") {
      this.isNotValidPassword = true;
      this.isNotValidMobile = false;
      this.error_password_no_msg = "कृपया पासवर्ड डालें";
      this.shortToast("कृपया पासवर्ड डालें");
      return;
    }

    this.isNotValidMobile = false;
    this.isNotValidPassword = false;

    this.goToLoginIntoServer();

  }

  goToLoginIntoServer() {

    this.isNotValidLogin = false;
    this.error_msg_from_server_if_not_login = "";

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.officerLogin(this.mobile, this.password).subscribe(
      async (response) => {

        await this.dismissDialog();
        this.cdRef.detectChanges;

        if (response.response.code === 200) {

          sessionStorage.setItem('logined_officer_data', JSON.stringify(response.data[0]));
          const officer = response.data[0];
          await this.storageService.set('user_data', officer);
          await this.storageService.set('selected_year', null);
          await this.storageService.set('selected_stage', null);
          this.router.navigateByUrl('/year-select', { replaceUrl: true });


        } else {
          //this.longToast(response.response.msg)

          this.isNotValidLogin = true;
          //this.error_msg_from_server_if_not_login = response.response.msg;

          this.showError(response.response.msg)

        }


      },
      async (error) => {
        //await this.dismissLoading();
        this.shortToast(error);
        //this.apiService.showServerMessages(error)
      }
    );

  }

  async showError(errorMsg: string) {

    try {
      const modal = await this.modalCtrl.create({
        component: MessageDialogComponent,
        componentProps: {
          server_message: errorMsg,
          isYesNo: false,
        },
        cssClass: 'custom-dialog-modal',
        backdropDismiss: false,
      });

      await modal.present();
    } catch (err) {
    }

  }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
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

  showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

}
