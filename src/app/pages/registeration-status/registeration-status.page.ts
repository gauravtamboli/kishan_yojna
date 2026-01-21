import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';  // Import IonicModule
import { ApiService } from 'src/app/services/api.service';
import { NavController } from '@ionic/angular';
import { LanguageService } from 'src/app/services/language.service';
import { AlertController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { LoadingController } from '@ionic/angular';
import { GetAwedanResponseModel } from './AwedanResponseList.model';
import { Platform } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';

import { HttpClient } from '@angular/common/http';
import { OTPDialogComponent } from 'src/app/otpdialog/otpdialog.component';

import { TableModule } from 'primeng/table'; // Import TableModule
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { Router } from '@angular/router';
// import firebase from 'firebase/app';
// import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

@Component({
  selector: 'app-registeration-status',
  templateUrl: './registeration-status.page.html',
  styleUrls: ['./registeration-status.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TableModule]
})
export class RegisterationStatusPage implements OnInit {
  // , AfterViewInit  

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  languageData: any = {};
  isOTPVerified: boolean = false;
  inputMobileNumber: string = '';
  listOfAwedan: any[] = [];
  sendedOTP: string = ""; sendedRegId: string = "";
  isOtpCameFromServer: boolean = false;
  confirmationResult: any;
  errorMessage: any;

  constructor(
    private location: Location,
    private router: Router,
    private navController: NavController, private zone: NgZone, private platform: Platform, private langService: LanguageService, private apiService: ApiService, private alertController: AlertController, private loadingController: LoadingController, private cdRef: ChangeDetectorRef,
    private modalController: ModalController, private httpClient: HttpClient) { }

  //recaptchaVerifier: RecaptchaVerifier | null = null;

  async ngOnInit() {

    this.updateTranslation();
    //this.getListOfAwedan();

  }

  ngAfterViewInit() {
    //const auth = getAuth();

    // this.recaptchaVerifier = new RecaptchaVerifier(auth,'recaptcha-container', {
    //   size: 'invisible'
    // });

    // this.recaptchaVerifier.render();
  }


  dismiss() {
    this.modalController.dismiss();
  }

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  async showError(errorMsg: string) {

    try {
      const modal = await this.modalController.create({
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

  getOTP() {

    if (!this.inputMobileNumber || this.inputMobileNumber.toString().length !== 10) {
      this.longToast("आपने जिस मोबाइल नंबर से आवेदन किया था कृपया वो नंबर डालें |");
    } else {

      this.showDialog("ओटीपी प्राप्त हो रहा है कृपया प्रतीक्षा करें.....");

      this.apiService.getOTPToKnowAwedanStatus(this.inputMobileNumber).subscribe(
        (response) => {

          this.dismissDialog();

          if (response.response.code === 200) {
            this.sendedOTP = response.data.otp;
            this.sendedRegId = response.data.registeration_id;
            this.isOtpCameFromServer = true;


            this.presentOTPDialog();

          } else {
            this.showError(response.response.msg);
            this.longToast(response.response.msg)
          }

        },
        (error) => {
          this.dismissDialog()
          this.longToast(error);
        }
      );
    }
  }

  async getLoadingIndicator() {

    const loading = await this.loadingController.create({
      message: 'कृपया प्रतीक्षा करें...'
    });

    return await loading.present();  // case 1
    // or maybe
    //return loading.present();        // case 2
  }

  getListOfAwedan() {

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getListOfAwedan(this.inputMobileNumber.toString()).subscribe(
      (response) => {

        if (response.response.code === 200) {

          this.listOfAwedan = response.data

          this.cdRef.detectChanges();

        } else {
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


  otpDialog: any;

  async presentOTPDialog() {
    // this.otpDialog = await this.alertController.create({
    //   header: 'आपके मोबाइल पे OTP भेजा जा चूका है',
    //   inputs: [
    //     {
    //       name: 'otp',
    //       type: 'text',
    //       placeholder: 'OTP डालें',
    //       attributes: {
    //         maxlength: 6,
    //         inputmode: 'numeric'
    //       }
    //     }
    //   ],
    //   buttons: [
    //     {
    //       text: 'समाप्त',
    //       role: 'cancel',
    //     },
    //     {
    //       text: 'सत्यापित',
    //       handler: data => {
    //         this.verifyOTP(data.otp); // Your function to handle it
    //         return false;
    //       }
    //     }
    //   ],
    //   backdropDismiss: false
    // });

    // await this.otpDialog.present();


    const modal = await this.modalController.create({
      component: OTPDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        sendedRegId: this.sendedRegId,
        inputMobileNumber: this.inputMobileNumber
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.isOTPVerified = true;
        this.getListOfAwedan();
      } else {
        this.longToast("OTP सत्यापित नहीं किया गया")
      }
    });

    await modal.present();


  }

  enteredOTPOnModel: string = ''

  verifyOTP(enteredOTP: string) {

    if (!enteredOTP || enteredOTP.toString().length !== 6) {
      this.longToast("कृपया ओटीपी डालें");
    } else {

      this.showDialog("ओटीपी सत्यापित किया जा रहा है, कृपया प्रतीक्षा करें.....");

      this.apiService.verifyOTP(enteredOTP, this.sendedRegId, this.inputMobileNumber,).subscribe(
        (response) => {

          this.dismissDialog();

          if (response.response.code === 200) {
            this.otpDialog?.dismiss();
            this.isOTPVerified = true;

            this.getListOfAwedan();

          } else {
            this.longToast(response.response.msg)
          }

        },
        (error) => {

          this.dismissDialog();
          this.longToast(error)

        }
      );
    }

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

  getTextColorOfStatus(awedanStatus: string): string {
    if (awedanStatus === "0") {
      return '#ffc107';
    } else if (awedanStatus === "1") {
      return "green";
    } else {
      return "red";
    }
  }

  getTextColorOfOnlineOrOffline(onlineOrOffline: string): string {
    if (onlineOrOffline === "Offline") {
      return 'red';
    } else {
      return "green";
    }
  }


  async viewDocument(url: string) {
    await Browser.open({ url });
  }


  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  goBack() {
    if (window.history.length > 1) {
      this.router.navigateByUrl('/landingpage', { replaceUrl: true });
    } else {
      this.location.back();
    }
  }

  viewApplication(model: GetAwedanResponseModel) {

    this.router.navigate(['/view-awedan'], {
      state: { 
        passedAwedanObject: model, 
        mobile: this.inputMobileNumber }
    });

  }

}
