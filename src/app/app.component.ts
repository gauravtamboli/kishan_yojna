import { Component, OnInit } from '@angular/core';
import { LanguageService } from './services/language.service';
import { addIcons } from 'ionicons';
import { buildSharp, homeOutline, informationOutline, informationCircle, buildOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Platform, AlertController, IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';  // Import MenuController

import { App } from '@capacitor/app';
import { ToastController, LoadingController } from '@ionic/angular';
import { } from '@ionic/angular';
import { Location } from '@angular/common';
import { NetworkCheckService } from './services/network-check.service';
import { Toast } from '@capacitor/toast';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [CommonModule, IonicModule],
})

export class AppComponent implements OnInit {
  pages: { title: string, icon: string, active: boolean, url: string, is_sub_menu: boolean }[] = [];
  languageData: any = {};
  isMenuClosed = true;

  private lastBackPress: number = 0; // To store the timestamp of the last back button press
  private exitDuration: number = 2000; // Time duration (in ms) for double press detection

  constructor(private languageService: LanguageService, private platform: Platform,
    private router: Router, private menuCtrl: MenuController, private toastController: ToastController, private location: Location, private alertController: AlertController,
    private loadingController: LoadingController, private networkCheckService: NetworkCheckService
  ) {
    this.addAllIcon();
    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, () => {
        this.handleBackButton();
      });
    });
  }

  handleBackButton() {
    if (this.router.url === '/landingpage') {
      this.showExitConfirmation();
      App.exitApp(); // Close the app if on landing page
    } else {
      this.location.back();
    }
  }

  async showExitConfirmation() {
    const toast = await this.toastController.create({
      message: 'Press back button again to exit.',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();

  }

  addAllIcon() {
    addIcons({
      buildSharp, homeOutline, informationOutline, informationCircle, buildOutline
    });
  }

  ngOnInit(): void {
    this.restoreSavedTheme();
    Preferences.set({ key: 'ngrok_url', value: environment.apiUrl });

    this.updateTranslation();

    this.languageService.language$.subscribe(() => {
      this.pages = [
        {
          title: this.getTranslation('about_yojna'),
          icon: 'information',
          active: true,
          url: 'about-yojna',
          is_sub_menu: false
        },
        {
          title: this.getTranslation('tree_techniques_and_expensed'),
          icon: 'build',
          active: true,
          url: 'tree-techniques-and-expenses',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('tissu_cultuer_beema_bansh'),
          icon: 'build',
          active: true,
          url: 'tissu-culture-bima-bans',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('clonal_nilgiri'),
          icon: 'build',
          active: true,
          url: 'clonal-nilgiri',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('miliya_dubiya_malabar_neem'),
          icon: 'build',
          active: true,
          url: 'milia-dubiya-malabar-neem',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('tissue_cluture_sagon'),
          icon: 'build',
          active: true,
          url: 'tissu-culture-sagon',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('safed_chandan'),
          icon: 'build',
          active: true,
          url: 'safed-chanddan',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('uplabdhiya'),
          icon: 'build',
          active: true,
          url: 'uplabdhiya',
          is_sub_menu: true
        },
        {
          title: this.getTranslation('kisan_registeratino'),
          icon: 'build',
          active: true,
          url: 'registeration',
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

  private restoreSavedTheme(): void {
    const savedTheme = localStorage.getItem('theme-mode');
    const isDarkMode = savedTheme === 'dark';
    const isDarkClass = 'ion-palette-dark';
    
    if (isDarkMode) {
      document.documentElement.classList.add(isDarkClass);
      document.body.classList.add(isDarkClass);
    } else {
      document.documentElement.classList.remove(isDarkClass);
      document.body.classList.remove(isDarkClass);
    }
  }


  updateTranslation() {
    this.languageService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string): string {
    if (this.languageData && this.languageData[key]) {
      return this.languageData[key];
    } else {
      return key; // Return the key if translation is not available
    }
  }

  loadingDialog!: HTMLIonLoadingElement;
  async showLoadingController() {
    this.loadingDialog = await this.loadingController.create({
      message: 'Loading, please wait...',
      spinner: 'crescent', // You can choose other spinners like 'dots', 'lines', etc.
      backdropDismiss: false,
    });


    // await this.loadingController.present(); // Show the loading spinner
  }

  isConnected: boolean = false;

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  async onMenuItemClick(page: string) {

    this.isConnected = await this.networkCheckService.getCurrentStatus();

    if (this.isConnected) {
      this.menuCtrl.close();
      setTimeout(() => {
        if (page === "registeration") {
          this.openDialogForRegisterationOption();
        } else {
          this.router.navigate([page]); // Navigate after closing the menu
        }
      }, 200); // 200ms delay (adjust as needed)      
    } else {
      this.longToast(this.getTranslation("no_internet"));
      return;
    }

  }

  getIconName(index: number): string {
    if (index === 0) {
      return 'information-circle'; // Icon for the first page
    } else {
      return 'build-sharp'; // Icon for the second page
    }
  }



  async openDialogForRegisterationOption() {
    const alert = await this.alertController.create({
      message: "आप निचे दिए गए दो विकल्पों से पंजीयन कर सकते हैं ",
      buttons: [
        {
          text: 'ऑनलाइन आवेदन',
          handler: () => {
            this.router.navigate(['registeration'], {
              queryParams: {
                isOnline: 'true'
              }
            });
          },
        },
        {
          text: 'ऑफलाइन आवेदन',
          handler: () => {
            this.router.navigate(['registeration'], {
              queryParams: {
                isOnline: 'false'
              }
            })
          },
        },
      ],
    });

    await alert.present();
  }

  isWebPlatform(url: string): boolean {
    if (url === "officer-login" && this.platform.is('desktop')) {
      return true;
    } else if (url === "officer-login" && this.platform.is('mobile')) {
      return false;
    }

    return true;

  }


}