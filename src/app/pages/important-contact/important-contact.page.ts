import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon, IonLabel, IonLoading, IonList, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { LanguageService } from 'src/app/services/language.service';
import { ChangeDetectorRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Toast } from '@capacitor/toast';
import { addIcons } from 'ionicons';
import { call, homeOutline, informationOutline, informationCircle, buildOutline } from 'ionicons/icons';
import { TableModule } from 'primeng/table'; // Import TableModule
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-important-contact',
  templateUrl: './important-contact.page.html',
  styleUrls: ['./important-contact.page.scss'],
  standalone: true,
  imports: [IonLabel, IonLoading, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonBackButton, IonButtons, TableModule]
})
export class ImportantContactPage implements OnInit {

  languageData: any = {};
  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  listOfContacts: any[] = [];

  constructor(private router: Router, private location: Location, private plateForm: Platform, private langService: LanguageService, private cdRef: ChangeDetectorRef,
    private apiService: ApiService
  ) {
    this.addAllIcon();
  }

  addAllIcon() {
    addIcons({
      call, homeOutline, informationOutline, informationCircle, buildOutline
    });
  }

  goBack() {
    if (window.history.length > 1) {
      this.router.navigateByUrl('/landingpage', { replaceUrl: true });
    } else {
      this.location.back();
    }
  }

  async ngOnInit() {
    this.updateTranslation();
    this.getListOfImpContacts();
  }

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
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

  getListOfImpContacts() {

    this.showDialog("कृपया प्रतीक्षा करें.....");


    this.apiService.getImportantContact().subscribe(
      async (response) => {

        await this.dismissDialog();

        if (response.response.code === 200) {

          this.listOfContacts = response.data
          this.cdRef.detectChanges();

        } else {
          this.longToast(response.response.message)
        }


      },
      async (error) => {
        await this.dismissDialog();
        this.shortToast(error);
        //this.apiService.showServerMessages(error)
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

  checkMobileNumberOfOffice(mobile: string): string {
    if (mobile === "0") {
      return "";
    }
    return mobile;
  }

  showHideCallIcon(mobile: string): boolean {
    if (mobile === "0") {
      return false;
    }
    return true;
  }

  isWebPlatform(): boolean {
    return this.plateForm.is('desktop');
  }

}