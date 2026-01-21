import { AfterViewInit, Component, OnInit, QueryList, ViewChildren  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonButtons, IonButton, IonCol, } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { Toast } from '@capacitor/toast';

@Component({
  selector: 'app-otp-page',
  templateUrl: './otp-page.page.html',
  styleUrls: ['./otp-page.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonButtons, IonButton, IonCol]
})
export class OtpPagePage implements OnInit, AfterViewInit  {

  otp: string[] = new Array(6).fill('');
  @ViewChildren('otpInput') otpInputs!: QueryList<any>;

  constructor(private modalController: ModalController, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    // Ensure the focus is on the first input field when the view is initialized
    setTimeout(() => {
      if (this.otpInputs && this.otpInputs.first) {
        this.otpInputs.first.setFocus();
      }
    }, 100);  // Delay to make sure all input fields are initialized

  }

  ngAfterViewChecked() {}

  moveFocus(event: any, index: number) {
    
    const input = event.target as HTMLInputElement;

    if (input.value && index < this.otp.length - 1) {
      setTimeout(() => {
        const nextInput = this.otpInputs.toArray()[index + 1];
        if (nextInput) nextInput.setFocus();
      }, 100);  // Delay to ensure the next input is available for focus
      this.cdRef.detectChanges();
    } else if (!input.value && index > 0) {
      setTimeout(() => {
        const prevInput = this.otpInputs.toArray()[index - 1];
        if (prevInput) prevInput.setFocus();
      }, 100);  // Delay to ensure the previous input is available for focus
      this.cdRef.detectChanges();
    }
  }

  submitOtp() {


    const otpEnteredLength = this.otp.filter(digit => digit !== '').length;
  
    // Check if all 6 digits are entered
    if (otpEnteredLength === 6) {
      const otpString = this.otp.join(''); // Join the array into a single OTP string
      this.dismiss(otpString);  // Dismiss the modal and pass the OTP back to the parent
    } else {
      // Optionally show a message to the user if OTP is incomplete
    }




    //const otpEnteredLength = this.otp.join('');
    if(this.otp.toString().length != 6){
      this.longToast("Please enter correct OTP");
      return;
    }
    // Close the modal after submitting OTP
    this.dismiss(this.otp.join(''));
  }

  dismiss(otpString:string) {
    this.modalController.dismiss({
      otp : otpString
    });
  }

  async shortToast(msg:string) {
    await Toast.show({
      text: msg,
      duration: 'short', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  async longToast(msg:string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

}
