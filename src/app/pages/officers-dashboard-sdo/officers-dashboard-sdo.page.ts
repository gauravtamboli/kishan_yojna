import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSplitPane, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonContent, IonHeader, IonToolbar, IonIcon, IonPopover } from '@ionic/angular/standalone';
import { LanguageService } from '../../services/language.service';
import { NavController, MenuController, Platform, AlertController, ModalController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, chevronBackOutline, chevronForwardOutline, optionsOutline, reorderThreeOutline, downloadOutline, chevronDownOutline, moon, sunny, listOutline, createOutline, checkmarkCircleOutline, closeCircleOutline, personOutline, peopleOutline, businessOutline, documentTextOutline } from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { NetworkCheckService } from 'src/app/services/network-check.service';
import { TableModule } from 'primeng/table';
import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { StorageService } from 'src/app/services/storage.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';

@Component({
  selector: 'app-officers-dashboard-sdo',
  templateUrl: './officers-dashboard-sdo.page.html',
  styleUrls: ['./officers-dashboard-sdo.page.scss'],
  standalone: true,
  imports: [IonPopover, IonSplitPane, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid,
    IonRow, IonCol, IonButtons, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, IonIcon, TableModule]
})
export class OfficersDashboardSDOPage implements OnInit {

  isUserMenuOpen = false;
  popoverEvent: any;
  isDarkMode = false;
  languageData: any = {};
  pages: { title: string, url: string, is_submenu: boolean }[] = [];
  isConnected: boolean = false;
  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  
  totalAwedan: number = 0;
  totalEditPending: number = 0;
  totalROPending: number = 0;
  totalSDOPending: number = 0;
  totalDFOPending: number = 0;
  totalApproved: number = 0;
  totalRejected: number = 0;
  totalBatch: number = 0;
  
  curent_session: any;
  whichBoxClicked: number = 1;

  constructor(
    private storageService: StorageService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private router: Router,
    private menuCtrl: MenuController,
    private networkCheckService: NetworkCheckService,
    private platform: Platform,
    private navController: NavController,
    private langService: LanguageService,
    private cdRef: ChangeDetectorRef,
    private apiService: ApiService,
    private sharedPreference: SharedserviceService,
    private authService: AuthServiceService
  ) {
    this.addAllIcon();
  }

  async ngOnInit() {
    this.restoreSavedTheme();
    this.curent_session = await this.storageService.get('current_session');
    this.updateTranslation();
    this.getDashboardDataFromServer();

    this.langService.language$.subscribe(() => {
      this.pages = [
        { title: 'गोस्वारा रिपोर्ट ', url: 'goswara-report', is_submenu: false },
        { title: 'प्रजातिवार गोस्वारा रिपोर्ट ', url: 'prajati-goswara-report', is_submenu: false }
      ];
    });
  }

  ionViewWillEnter() {
    this.getDashboardDataFromServer();
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.menuCtrl.enable(true, 'sdo-menu');
      this.menuCtrl.close();
    }, 100);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    const isDarkClass = 'ion-palette-dark';
    if (this.isDarkMode) {
      document.documentElement.classList.add(isDarkClass);
      document.body.classList.add(isDarkClass);
    } else {
      document.documentElement.classList.remove(isDarkClass);
      document.body.classList.remove(isDarkClass);
    }
  }

  private restoreSavedTheme() {
    const savedTheme = localStorage.getItem('theme-mode');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  getDashboardDataFromServer() {
    this.showDialog("कृपया प्रतीक्षा करें....");
    const officersLoginModel = this.authService.getOfficerData() as OfficersLoginResponseModel;

    if (officersLoginModel) {
      this.apiService.getAwedanStatusCounts(
        officersLoginModel.designation,
        officersLoginModel.circle_id,
        officersLoginModel.devision_id,
        officersLoginModel.rang_id,
        officersLoginModel.officerId?.toString() || '',
        this.curent_session
      ).subscribe(
        async (countsResponse) => {
          if (countsResponse.response.code === 200) {
            const counts = countsResponse.counts;
            const findCount = (status: number) => {
              const item = counts.find((c: any) => c.status === status);
              return item ? item.count : 0;
            };

            this.totalAwedan = findCount(99);
            this.totalEditPending = findCount(0) + findCount(3) + findCount(5);
            this.totalROPending = findCount(1);
            this.totalSDOPending = findCount(2);
            this.totalDFOPending = findCount(4);
            this.totalApproved = findCount(6);
            this.totalRejected = findCount(3) + findCount(5);
            this.totalBatch = findCount(7);

            await this.dismissDialog();
          } else {
            await this.dismissDialog();
            this.longToast(countsResponse.response.msg);
          }
        },
        async (error) => {
          await this.dismissDialog();
          this.shortToast(error);
        }
      );
    } else {
      this.router.navigateByUrl('officer-login', { replaceUrl: true });
    }
  }

  getListOfAwedanAfterClickOnBoxes(id: any) {
    this.router.navigate(['/application-list-sdo'], { queryParams: { status: id } });
  }

  async onMenuItemClick(page: string) {
    this.isConnected = await this.networkCheckService.getCurrentStatus();
    if (this.isConnected) {
      this.router.navigate([page]);
    } else {
      this.longToast(this.getTranslation("no_internet"));
    }
  }

  getLoginedOfficerName(): string {
    const officersLoginModel = this.authService.getOfficerData() as OfficersLoginResponseModel;
    if (officersLoginModel) {
      return officersLoginModel.officer_name + " (" + officersLoginModel.designation_name + ")";
    }
    return '';
  }

  async logoutFunction() {
    this.menuCtrl.close();
    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप लॉगआउट करना चाहते हैं ?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.authService.logout();
      }
    });
    await modal.present();
  }

  onYearSelect(year: number) {
    if (year == 2) {
      this.router.navigateByUrl('/year-two-dashboard', { state: { year } });
    } else if (year == 3) {
      this.router.navigateByUrl('/year-three-dashboard', { state: { year } });
    }
  }

  goToProfile() { this.router.navigate(['profile']); }
  changePassword() { this.router.navigate(['change-password']); }
  openUserMenu($event: any) { this.popoverEvent = $event; this.isUserMenuOpen = true; }
  
  showDialog(msg: string) { this.loadingMessage = msg; this.isLoading = true; this.cdRef.detectChanges(); }
  dismissDialog() { this.isLoading = false; this.cdRef.detectChanges(); }
  
  async shortToast(msg: string) { await Toast.show({ text: msg, duration: 'short', position: 'bottom' }); }
  async longToast(msg: string) { await Toast.show({ text: msg, duration: 'long', position: 'bottom' }); }
  
  updateTranslation() { this.langService.language$.subscribe((data) => { this.languageData = data; }); }
  getTranslation(key: string) { return this.langService.getTranslation(key); }
  
  addAllIcon() {
    addIcons({
      appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, reorderThreeOutline,
      chevronBackOutline, chevronForwardOutline, chevronDownOutline, optionsOutline, downloadOutline, moon, sunny,
      listOutline, createOutline, checkmarkCircleOutline, closeCircleOutline, personOutline, peopleOutline, businessOutline, documentTextOutline
    });
  }
}