import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSplitPane, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonPopover, IonImg } from '@ionic/angular/standalone';
import { LanguageService } from '../../services/language.service';
import { NavController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';
import { MenuController } from '@ionic/angular';

import { ApiService } from 'src/app/services/api.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, chevronBackOutline, chevronForwardOutline, downloadOutline, chevronDownOutline, optionsOutline, reorderThreeOutline, documentTextOutline, statsChartOutline, mapOutline, peopleOutline, personOutline, addCircleOutline, trendingUpOutline, leafOutline, hammerOutline, clipboardOutline, businessOutline, receiptOutline, cashOutline, listOutline, walletOutline, moon, sunny, createOutline, checkmarkCircleOutline, closeCircleOutline, searchOutline, timeOutline, alertCircleOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { Platform, AlertController } from '@ionic/angular';
import { NetworkCheckService } from 'src/app/services/network-check.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

import { TableModule } from 'primeng/table'; // Import TableModule

import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import { ModalController } from '@ionic/angular';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { AuthServiceService } from 'src/app/services/auth-service.service';

import { PaginatorModule } from 'primeng/paginator';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


interface MenuPage {
  title: string;
  is_submenu: boolean;
  url?: string;
  route?: string;
  state?: any;
  children?: MenuPage[];
  open?: boolean;
  icon?: string;
}



@Component({
  selector: 'app-officers-dashboard-ro',
  templateUrl: './officers-dashboard-ro.page.html',
  styleUrls: ['./officers-dashboard-ro.page.scss'],
  standalone: true,
  imports: [IonSplitPane, PaginatorModule, IonPopover,
    IonMenu, IonList, IonAvatar, IonLoading, IonText, IonButton,
    IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonContent, IonHeader,
    IonToolbar, CommonModule, FormsModule, IonIcon, TableModule, IonMenuButton]
})
export class OfficersDashboardROPage implements OnInit {


  isDarkMode = false;
  current_year: any;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    // Save preference to localStorage
    localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
  }

  // Apply dark mode class to document
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

  // Restore saved theme preference on component load
  private restoreSavedTheme() {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
    } else {
      this.isDarkMode = false;
    }
    this.applyTheme();
  }

  toggleSubMenu(index: number, page: any) {
    if (!page.is_submenu) {
      this.onMenuItemClick(page);
      return;
    }

    // Close other submenus (optional)
    this.pages.forEach((p, i) => {
      if (i !== index) {
        p.open = false;
      }
    });

    page.open = !page.open;
  }



  openUserMenu($event: any) {

    this.popoverEvent = $event;
    this.isUserMenuOpen = true;
  }



  curent_session: any;
  pages: MenuPage[] = [];
  isConnected: boolean = false;

  isNoRecordFound: boolean = true;

  constructor(
    private menuCtrl: MenuController,
    private storageService: StorageService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private router: Router,
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


  languageData: any = {};

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  totalAwedan: number = 0;
  totalEditPending: number = 0;          // संपादन लंबित (0, 3, 5)
  totalROPending: number = 0;             // परिक्षेत्र अधिकारी स्तर पर लंबित (1)
  totalSDOPending: number = 0;            // उपवनमंडलाधिकारी स्तर पर लंबित (2)
  totalDFOPending: number = 0;            // वनमंडलाधिकारी स्तर पर लंबित (4)
  totalApproved: number = 0;               // स्वीकृत (6)
  total_or_pending_or_accept_or_reject_label: string = "कुल आवेदन";
  whichBoxClicked: number = 1;
  totalRejected: number = 0;               // अस्वीकृत (3,5)
  totalBatch: number = 0;                  // प्रकटन बैच (7)
  totalpaymentpending: number = 0;                  // payment pending (8)
  totalpaymentrjcted: number = 0;                  // payment rejected (9)
  totalpaymentackfaild: number = 0;                  // payment acknowledgement failed (10)
  totalpaymentdone: number = 0;                  // payment done (11)
  totalAwedanTextColor = "#198edb";
  totalEditPendingTextColor = "#caf102ff";    // Orange for Edit Pending
  totalROPendingTextColor = "#2196f3";      // Blue for RO Pending
  totalSDOPendingTextColor = "#9c27b0";     // Purple for SDO Pending
  totalDFOPendingTextColor = "#673ab7";     // Deep Purple for DFO Pending
  totalApprovedTextColor = "#4caf50";        // Green for Approved
  totalRejectedTextColor = "#f44336";        // Red for Rejected
  totalBatchTextColor = "#7581da";        // Red for Rejected
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;

  listOfAwedan: any[] = [];

  popoverEvent: any;
  isUserMenuOpen = false;

  goBack() {
    this.navController.back();
  }

  ionViewWillEnter() {

    if (this.sharedPreference.getRefresh()) {
      this.getDashboardDataFromServer();
      this.sharedPreference.setRefresh(false);
    } else {
      // Also refresh data when entering the page to ensure fresh data
      this.getDashboardDataFromServer();
    }
  }
  ionViewDidEnter() {
    setTimeout(() => {
      this.menuCtrl.enable(true, 'ro-menu');
      this.menuCtrl.close();
    }, 100);
  }

  async ngOnInit() {
    // Restore saved theme preference
    this.restoreSavedTheme();

    this.curent_session = await this.storageService.get('current_session');
    this.current_year = await this.storageService.get('current_year');
    // console.log('Current Year in RO Dashboard:', current_year);
    // console.log('Current Session in RO Dashboard:', this.curent_session);

    const officerData = this.authService.getOfficerData();
    const rangid = officerData ? officerData.rang_id : null;


    this.updateTranslation();
    this.getDashboardDataFromServer();

    this.langService.language$.subscribe(() => {
      this.pages = [

        {
          title: 'गोस्वारा रिपोर्ट ',
          url: 'goswara-report',
          is_submenu: false,
          icon: 'document-text-outline'
        },
        {
          title: 'प्रजातिवार गोस्वारा रिपोर्ट ',
          url: 'prajati-goswara-report',
          is_submenu: false,
          icon: 'stats-chart-outline'
        },
        {
          title: 'गाँव वार गोस्वारा',
          url: 'gaon-var-goswara',
          is_submenu: false,
          icon: 'map-outline'
        },
        {
          title: 'किसान रिपोर्ट ',
          url: 'kissan-wise-report',
          is_submenu: false,
          icon: 'people-outline'
        },
        {
          title: 'दर्ज करें',
          is_submenu: true,
          icon: 'add-circle-outline',
          children: [
            {
              title: 'गड्ढों की संख्या दर्ज करें',
              url: 'number-of-pit',
              is_submenu: false,
              icon: 'hammer-outline'
            },
            {
              title: 'पौधों की संख्या दर्ज करें',
              url: 'ropit-paudho-ki-sankhya',
              is_submenu: false,
              icon: 'leaf-outline'
            },

            {
              title: 'रेंज रिपोर्ट (रोपण/गड्ढे)',
              url: 'range-plant-report',
              is_submenu: false,
              icon: 'clipboard-outline'
            }
          ]
        },

        {
          title: 'भुगतान',
          is_submenu: true,
          icon: 'cash-outline',
          children: [
            {
              icon: 'business-outline',
              title: 'वेंडर भुगतान बनाए ',
              url: 'vendor-payment-list',
              state: {
                range_id: rangid,
                year: 1,
                fin_year: this.curent_session
              },
              is_submenu: false
            },
            {
              title: 'हितग्राही भुगतान बनाएं',
              icon: 'person-outline',
              url: 'payment',
              state: {
                range_id: rangid,
                year: 1,
                fin_year: this.curent_session
              },
              is_submenu: false

            },
            {
              title: 'भुगतान करे ',
              icon: 'receipt-outline',
              url: 'create-bill',
              state: {
                range_id: rangid,
                year: 1
              },
              is_submenu: false

            },
            {
              title: 'भुगतान रिपोर्ट',
              icon: 'wallet-outline',
              url: 'payment-report',
               state: {
                range_id: rangid,
                year: 1
              },
              is_submenu: false

            }
          ]
        },


        {
          title: 'प्रगति प्रतिवेदन',
          url: 'pragati-prativedan',
          is_submenu: false,
          icon: 'trending-up-outline'
        },
        // {
        //   title: this.getTranslation('circle_wise_hitgrahi_report'),
        //   url: 'make-offline-awedan-to-online',
        //   is_submenu: true
        // },
        // {
        //   title: 'LOGOUT',
        //   url: 'logout',
        //   is_submenu: false
        // }
      ];
    });


  }

  export() {
    this.showDialog("डेटा निर्यात के लिए तैयार किया जा रहा है, कृपया प्रतीक्षा करें...");

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    if (!officersLoginModel) {
      this.dismissDialog();
      return;
    }

    // Map whichBoxClicked to which_data for API
    let whichData = this.whichBoxClicked; // default
    if (this.whichBoxClicked === 1) {
      whichData = 99; // Total
    } else if (this.whichBoxClicked === 2) {
      whichData = 0; // Edit Pending (Sampadan Lambit)
    } else if (this.whichBoxClicked === 3) {
      whichData = 1; // RO Pending
    } else if (this.whichBoxClicked === 4) {
      whichData = 2; // SDO Pending
    } else if (this.whichBoxClicked === 5) {
      whichData = 4; // DFO Pending
    } else if (this.whichBoxClicked === 6) {
      whichData = 6; // Approved
    } else if (this.whichBoxClicked === 7) {
      whichData = 13; // Rejected (3, 5)
    } else if (this.whichBoxClicked === 8) {
      whichData = 7; // Draft
    } else if (this.whichBoxClicked === 9) {
      whichData = 8; // Payment Pending
    } else if (this.whichBoxClicked === 10) {
      whichData = 9; // Payment Rejected
    } else if (this.whichBoxClicked === 11) {
      whichData = 10; // Ack Fail
    } else if (this.whichBoxClicked === 12) {
      whichData = 11; // Payment Done
    }

    // Set a high pageSize to fetch everything for this category
    const fullPageSize = this.totalRecords > 0 ? this.totalRecords : 5000;

    this.apiService.getListOfAwedanAccordingToAwedanStatus(
      whichData,
      officersLoginModel.designation,
      officersLoginModel.circle_id,
      officersLoginModel.devision_id,
      officersLoginModel.rang_id,
      officersLoginModel.officerId?.toString() || '',
      1, // page 1
      fullPageSize,
      this.curent_session,
      this.searchMobile || ''
    ).subscribe(
      (response) => {
        if (response.response.code === 200 && response.data && response.data.length > 0) {
          const exportData = response.data.map((item: GetAwedanResponseModel, index: number) => ({
            'क्रमांक': index + 1,
            'आवेदन नंबर': item.application_number || '',
            'हितग्राही का नाम': item.hitgrahi_name || '',
            'मोबाइल नंबर': item.mobile_no || '',
            'पिता का नाम': item.father_name || '',
            'जाति': item.cast || '',
            'जिला': item.dist_name || '',
            'वृत्त': item.circle_name || '',
            'वन मंडल': item.division_name || '',
            'परिक्षेत्र (रेंज)': item.rang_name || '',
            'आवेदन प्रकार': item.online_or_offline || '',
            'आवेदन की स्थिति': this.getStatusText(item) || ''
          }));

          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
          const workbook: XLSX.WorkBook = {
            Sheets: { 'Applications': worksheet },
            SheetNames: ['Applications']
          };

          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          
          const timestamp = new Date().toISOString().slice(0, 10);
          const fileName = `KVMY_Full_Report_${this.total_or_pending_or_accept_or_reject_label}_${timestamp}.xlsx`;
          
          FileSaver.saveAs(blob, fileName);
          this.dismissDialog();
          this.shortToast("निर्यात सफल रहा");
        } else {
          this.dismissDialog();
          this.shortToast("निर्यात करने के लिए कोई डेटा नहीं मिला");
        }
      },
      (error) => {
        this.dismissDialog();
        this.shortToast("डेटा प्राप्त करने में त्रुटि हुई: " + error);
      }
    );
  }

  getOfficersSessionData() {
    return this.authService.getOfficerData();
  }

  searchMobile = "";




  getDashboardDataFromServer() {
    this.showDialog("कृपया प्रतीक्षा करें....");

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    if (officersLoginModel != null) {
      // Use getAwedanStatusCounts API to get counts
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

            // Find counts from the array
            const findCount = (status: number) => {
              const item = counts.find((c: any) => c.status === status);
              return item ? item.count : 0;
            };

            // Map counts from API response to component properties
            this.totalAwedan = findCount(99); // status 99 = कुल आवेदन
            // संपादन लंबित (0, 3, 5)
            this.totalEditPending = findCount(0) + findCount(3) + findCount(5);
            // परिक्षेत्र अधिकारी स्तर पर लंबित (1)
            this.totalROPending = findCount(1);
            // उपवनमंडलाधिकारी स्तर पर लंबित (2)
            this.totalSDOPending = findCount(2);
            // वनमंडलाधिकारी स्तर पर लंबित (4)
            this.totalDFOPending = findCount(4);
            // स्वीकृत (6)
            this.totalApproved = findCount(6);
            // अस्वीकृत (3,5)
            this.totalRejected = findCount(3) + findCount(5);

            // प्रकटन बैच (7)
            this.totalBatch = findCount(7);

            // payment pending (8)
            this.totalpaymentpending = findCount(8);
            // payment rejected (9)
            this.totalpaymentrjcted = findCount(9);
            // payment acknowledgement failed (10)
            this.totalpaymentackfaild = findCount(10);
            // payment done (11)
            this.totalpaymentdone = findCount(11);
            

            await this.dismissDialog();
            this.cdRef.detectChanges();
            // Removed auto-loading list of first box
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
      this.router.navigateByUrl('officer-login', { replaceUrl: true })
    }
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

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }


  addAllIcon() {
    addIcons({
      appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, reorderThreeOutline,
      chevronBackOutline, chevronForwardOutline, chevronDownOutline, optionsOutline, downloadOutline, walletOutline,
      'document-text-outline': documentTextOutline,
      'stats-chart-outline': statsChartOutline,
      'map-outline': mapOutline,
      'people-outline': peopleOutline,
      'person-outline': personOutline,
      'add-circle-outline': addCircleOutline,
      'trending-up-outline': trendingUpOutline,
      'leaf-outline': leafOutline,
      'hammer-outline': hammerOutline,
      'clipboard-outline': clipboardOutline,
      'business-outline': businessOutline,
      'receipt-outline': receiptOutline,
      'cash-outline': cashOutline,
      'list-outline': listOutline,
      'create-outline': createOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline,
      moon, sunny, searchOutline,
      timeOutline, alertCircleOutline, checkmarkDoneCircleOutline
    });
  }

  getColor(): string {
    if (this.whichBoxClicked == 1) {
      return this.totalAwedanTextColor;
    } else if (this.whichBoxClicked == 2) {
      return this.totalEditPendingTextColor;
    } else if (this.whichBoxClicked == 3) {
      return this.totalROPendingTextColor;
    } else if (this.whichBoxClicked == 4) {
      return this.totalSDOPendingTextColor;
    } else if (this.whichBoxClicked == 5) {
      return this.totalDFOPendingTextColor;
    } else if (this.whichBoxClicked == 7) {
      return this.totalRejectedTextColor;
    } else if (this.whichBoxClicked == 8) {
      return this.totalBatchTextColor;
    } else if (this.whichBoxClicked == 9) {
      return "#ff9800"; // Orange for Payment Pending
    } else if (this.whichBoxClicked == 10) {
      return "#f44336"; // Red for Payment Rejected
    } else if (this.whichBoxClicked == 11) {
      return "#4caf50"; // Green for Payment Done
    }
    
    
    else {
      return this.totalApprovedTextColor;
    }
  }


  getListOfAwedanAfterClickOnBoxes(whichBoxClickeddd: number) {
    this.whichBoxClicked = whichBoxClickeddd;

    // Map box numbers to status IDs for the list page
    let statusId = 99; // Default Total
    let recordsCount = 0;

    if (this.whichBoxClicked === 1) {
        statusId = 99;
        recordsCount = this.totalAwedan;
    } else if (this.whichBoxClicked === 2) {
        statusId = 0;
        recordsCount = this.totalEditPending;
    } else if (this.whichBoxClicked === 3) {
        statusId = 1;
        recordsCount = this.totalROPending;
    } else if (this.whichBoxClicked === 4) {
        statusId = 2;
        recordsCount = this.totalSDOPending;
    } else if (this.whichBoxClicked === 5) {
        statusId = 4;
        recordsCount = this.totalDFOPending;
    } else if (this.whichBoxClicked === 6) {
        statusId = 6;
        recordsCount = this.totalApproved;
    } else if (this.whichBoxClicked === 7) {
        statusId = 13; // Rejected (3, 5)
        recordsCount = this.totalRejected;
    } else if (this.whichBoxClicked === 8) {
        statusId = 7; // Draft
        recordsCount = this.totalBatch;
    } else if (this.whichBoxClicked === 9) {
        statusId = 8;
        recordsCount = this.totalpaymentpending;
    } else if (this.whichBoxClicked === 10) {
        statusId = 9;
        recordsCount = this.totalpaymentrjcted;
    } else if (this.whichBoxClicked === 11) {
        statusId = 10;
        recordsCount = this.totalpaymentackfaild;
    } else if (this.whichBoxClicked === 12) {
        statusId = 11;
        recordsCount = this.totalpaymentdone;
    }

    // Navigate to separate page with parameters using state
    this.router.navigate(['/application-list-ro'], {
      state: {
        boxType: statusId, // Pass the STATUS ID as boxType
        totalRecords: recordsCount
      }
    });
  }

  getLoginedOfficerName(): string {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    if (officersLoginModel) {
      return officersLoginModel.officer_name + " (" + officersLoginModel.designation_name + ")";
    }
    return '';
  }

  async onMenuItemClick(page: MenuPage) {
    this.isConnected = await this.networkCheckService.getCurrentStatus();
    if (!this.isConnected) {
      this.longToast(this.getTranslation("no_internet"));
      return;
    }

    if (page.url === "add-awedan-by-officer") {
      const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
      if (officersLoginModel.designation === "4" || officersLoginModel.designation === "2") {
        this.router.navigate(['submit-awedan-by-ro-dfo'], {
          queryParams: { isOnline: true }
        });
      } else {
        this.router.navigate(['registeration'], {
          queryParams: { isOnline: true }
        });
      }
      return;
    }

    if (page.route) {
      this.router.navigateByUrl(page.route, {
        state: page.state
      });
      return;
    }

    if (page.url) {
      if (page.state) {
        this.router.navigate([page.url], {
          state: page.state
        });
      } else {
        this.router.navigate([page.url]);
      }
      return;
    }
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

  getStatusText(item: GetAwedanResponseModel): string {
    if (item.awedan_status === "0") {
      return "संपादन लंबित";
    } else if (item.awedan_status === "1") {
      return "परिक्षेत्र अधिकारी स्तर पर लंबित";
    } else if (item.awedan_status === "2") {
      return "उपवनमंडलाधिकारी स्तर पर लंबित";
    } else if (item.awedan_status === "3") {
      return "त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (SDO)";
    } else if (item.awedan_status === "4") {
      return "वनमंडलाधिकारी स्तर पर लंबित";
    } else if (item.awedan_status === "5") {
      return "त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (DFO)";
    } else if (item.awedan_status === "6") {
      return "स्वीकृत";
    } else if (item.awedan_status === "7") {
      return "ड्राफ्ट";
    } else if (item.awedan_status === "8") {
      return "भुगतान लंबित";
    } else if (item.awedan_status === "9") {
      return "भुगतान अस्वीकृत";
    } else if (item.awedan_status === "10") {
      return "भुगतान की स्वीकृति असफल";
    } else if (item.awedan_status === "11") {
      return "भुगतान हो चुका है";
    } 
    
    
    
    else {
      return item.awedan_status_text || '';
    }
  }

  onYearSelect(year: number) {


    if (year == 2) {
      this.router.navigateByUrl('/year-two-dashboard', {
        state: { year }
      });
    } else if (year == 3) {
      this.router.navigateByUrl('/year-three-dashboard', {
        state: { year }
      });
    } else {
      this.router.navigateByUrl('/officers-dashboard-ro');
    }
  }

  goToProfile() {
    this.router.navigate(['profile']);
  }

  changePassword() {
    this.router.navigate(['change-password']);
  }



}