import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-kisan-awedan-otp',
  templateUrl: './kisan-awedan-otp.page.html',
  styleUrls: ['./kisan-awedan-otp.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class KisanAwedanOtpPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
