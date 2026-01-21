
declare global {
  interface Window {
    onSMSArrive: any;
  }
}

import { OnInit, OnDestroy, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import {
  IonLoading, IonInput, IonModal, IonItem, IonAvatar, IonText, IonMenu, IonRow, IonCol, IonGrid, IonButton, IonToolbar, IonTitle, IonButtons, IonApp, IonRouterOutlet, IonHeader, IonLabel, IonContent, IonList, IonIcon, IonMenuButton, IonMenuToggle
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Toast } from '@capacitor/toast';
import { SharedserviceService } from '../services/sharedservice.service';
import { ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { SmsRetriever } from 'capacitor-sms-retriever';

@Component({
  standalone: true,
  selector: 'app-otpdialog',
  templateUrl: './otpdialog.component.html',
  styleUrls: ['./otpdialog.component.scss'],
  imports: [IonLoading, IonInput, IonText, IonRow, IonCol, IonGrid, IonButton, FormsModule, CommonModule]
})
export class OTPDialogComponent implements OnInit, OnDestroy {
  enteredOTP: string = "";
  constructor(private modalCtrl: ModalController, private cdRef: ChangeDetectorRef, private apiService: ApiService) { }

  counter: number = 60;
  isResendEnabled: boolean = false;
  private timer: any;

  ionViewDidEnter() {
    this.startSmsListener();
  }

  ngOnInit() {
    this.startCountdown();
  }

  async startSmsListener() {
    try {
      // Get the app hash once (optional)

      // Start listening for SMS

      // Subscribe to incoming SMS
      SmsRetriever.addListener('onSmsReceive', (data) => {
        const msg = data.message as string;
        const otp = msg.match(/\d{6}/)?.[0] || '';
        this.enteredOTP = otp;
        this.autoFillOtp(otp);
      });

    } catch (error) {
    }
  }

  startCountdown() {
    this.counter = 60;
    this.isResendEnabled = false;

    this.timer = setInterval(() => {
      this.counter--;
      if (this.counter <= 0) {
        clearInterval(this.timer);
        this.isResendEnabled = true;
      }
    }, 1000);
  }

  resendOtp() {
    if (this.isResendEnabled) {
      // Call OTP API again
      this.startCountdown(); // Restart timer

      this.getOTP();

    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  @Input() sendedRegId!: string;
  @Input() inputMobileNumber!: string;

  otp: string[] = ['', '', '', '', '', ''];
  otpArray = new Array(6); // For *ngFor loop
  @ViewChildren('otpInput', { read: IonInput }) otpInputs!: QueryList<IonInput>;

  areAllOtpFieldsFilled(): boolean {
    return this.otp.every(digit => digit && digit.trim() !== '');
  }

  onOtpInput(event: any, index: number) {
    const inputValue = event.detail.value;

    if (inputValue && inputValue.length === 1 && index < this.otpInputs.length - 1) {
      const nextInput = this.otpInputs.toArray()[index + 1];
      nextInput?.setFocus();
    }

    if (!inputValue && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1];
      prevInput?.setFocus();
    }
  }

  autoFillOtp(otpString: string) {
    
    const digits = otpString.split('');
    digits.forEach((digit, i) => {
      const input = this.otpInputs.toArray()[i];
      if (input) {
        input.value = digit;             // update the IonInput field
      }
      this.otp[i] = digit;               // update the otp array
    });

  }

  cancelOtpDialog() {
    this.modalCtrl.dismiss();
  }

  onSubmitOTP() {

    if (!this.areAllOtpFieldsFilled()) {
      //this.longToast("कृपया सभी OTP के अंकों को भरें"); // "Please fill all OTP digits"
      this.showError("कृपया सभी OTP के अंकों को भरें");
      return;
    }

    // Join digits to form the full OTP string
    this.enteredOTP = this.otp.join('');

    if (this.enteredOTP.length !== 6) {
      this.showError("कृपया सही 6 अंकों का OTP दर्ज करें")
      //this.longToast("कृपया सही 6 अंकों का OTP दर्ज करें");
      return;
    }

    this.verifyOTP()

    // this.sharedService.setOTP(this.enteredOTP);
    // this.modalCtrl.dismiss({ confirmed: true });
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  verifyOTP() {

    if (!this.enteredOTP) {
      this.longToast("Plesae enter otp");
    } else if (this.enteredOTP.toString().length !== 6) {
      this.longToast("Plesae enter corrent otp");
    } else {

      this.showLoading("ओटीपी सत्यापित किया जा रहा है, कृपया प्रतीक्षा करें.....");

      this.apiService.verifyOTP(this.enteredOTP, this.sendedRegId, this.inputMobileNumber,).subscribe(
        (response) => {

          this.dismissLoading();


          if (response.response.code === 200) {
            this.modalCtrl.dismiss({ confirmed: true });
          } else {
            this.showError(response.response.msg);
            //this.longToast(response.response.msg)
          }

        },
        (error) => {
          this.dismissLoading();
          this.longToast(error)
        }
      );
    }

  }

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  showLoading(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissLoading() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }


  getOTP() {

    if (!this.inputMobileNumber || this.inputMobileNumber.toString().length !== 10) {
      this.longToast("Plesae enter correct mobile number");
    } else {

      this.showLoading("ओटीपी प्राप्त हो रहा है कृपया प्रतीक्षा करें.....");

      this.apiService.getOTP(this.inputMobileNumber).subscribe(
        (response) => {

          this.dismissLoading();

          if (response.response.code === 200) {
            this.sendedRegId = response.data.registeration_id;
          } else {
            this.longToast(response.response.msg)
          }

        },
        (error) => {
          this.longToast(error);
          this.dismissLoading();
        }
      );
    }

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

}