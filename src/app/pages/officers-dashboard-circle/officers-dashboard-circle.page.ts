import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSplitPane, IonRouterOutlet, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonCardHeader, IonCardContent, IonCardTitle, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { LanguageService } from '../../services/language.service';
import { NavController, MenuController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, downloadOutline, eyeOutline, createOutline, calculatorOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Browser } from '@capacitor/browser';
import { Platform, AlertController } from '@ionic/angular';
import { NetworkCheckService } from 'src/app/services/network-check.service';
import { Router, NavigationEnd } from '@angular/router';

import { TableModule } from 'primeng/table';

import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import { ModalController } from '@ionic/angular';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';

import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-officers-dashboard-circle',
  templateUrl: './officers-dashboard-circle.page.html',
  styleUrls: ['./officers-dashboard-circle.page.scss'],
  standalone: true,
  imports: [IonSplitPane, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, TableModule]
})
export class OfficersDashboardCirclePage implements OnInit {

  pages: { title: string, url: string, is_submenu: boolean }[] = [];

  isConnected: boolean = false;

  isNoRecordFound: boolean = true;

  constructor(private modalCtrl: ModalController, private alertController: AlertController, private router: Router, private menuCtrl: MenuController, private networkCheckService: NetworkCheckService, private platform: Platform, private navController: NavController, private langService: LanguageService, private cdRef: ChangeDetectorRef,
    private apiService: ApiService, private sharedPreference: SharedserviceService) {
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

  totalAwedanTextColor = "#198edb";
  totalEditPendingTextColor = "#ff9800";
  totalROPendingTextColor = "#2196f3";
  totalSDOPendingTextColor = "#9c27b0";
  totalDFOPendingTextColor = "#673ab7";
  totalApprovedTextColor = "#4caf50";

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;

  listOfAwedan: any[] = [];

  goBack() {
    this.navController.back();
  }

  ionViewWillEnter() {
    if (this.sharedPreference.getRefresh()) {
      this.getDashboardDataFromServer();
      this.sharedPreference.setRefresh(false);
    } else {
      this.getDashboardDataFromServer();
    }
  }

  async ngOnInit() {
    this.updateTranslation();
    this.getDashboardDataFromServer();

    this.langService.language$.subscribe(() => {
      this.pages = [
        {
          title: 'गोस्वारा रिपोर्ट ',
          url: 'goswara-report',
          is_submenu: false
        },
        {
          title: 'प्रजातिवार गोस्वारा रिपोर्ट ',
          url: 'prajati-goswara-report-circle',
          is_submenu: false
        },
        // {
        //   title: 'किसान रिपोर्ट ',
        //   url: 'kissan-wise-report',
        //   is_submenu: false
        // },
      ];
    });
  }

  export() {
    const filteredData = this.filteredAwedans.filter(item => item.awedan_status_text === 'लंबित');

    const exportData = filteredData.map((item, index) => ({
      'क्रमांक': index + 1,
      'आवेदन नंबर': item.application_number || '',
      'हितग्राही का नाम': item.hitgrahi_name || '',
      'मोबाइल नंबर': item.mobile_no || '',
      'पिता का नाम': item.father_name || '',
      'वृत्त': item.circle_name || '',
      'वन मंडल': item.division_name || '',
      'आवेदन की स्थिति': item.awedan_status_text || ''
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Applications': worksheet },
      SheetNames: ['Applications']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'Applications_Report.xlsx');
  }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  searchMobile = "";

  getDashboardDataFromServer() {
    this.showDialog("कृपया प्रतीक्षा करें....");

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    if (officersLoginModel != null) {
      this.apiService.getAwedanStatusCounts(
        officersLoginModel.designation,
        officersLoginModel.circle_id,
        officersLoginModel.devision_id,
        officersLoginModel.rang_id,
        officersLoginModel.officerId.toString()
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

            await this.dismissDialog();
            this.cdRef.detectChanges();
            this.getListOfAwedanAfterClickOnBoxes(1);
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

  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short',
      position: 'bottom',
    });
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long',
      position: 'bottom',
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
      appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline,
      chevronBackOutline, chevronForwardOutline, downloadOutline
    });
  }

  getListOfAwedanAfterClickOnBoxes(whichBoxClickeddd: number, page: number = 1) {
    this.whichBoxClicked = whichBoxClickeddd;
    this.currentPage = page;

    switch (this.whichBoxClicked) {
      case 1:
        this.total_or_pending_or_accept_or_reject_label = "कुल आवेदन";
        break;
      case 2:
        this.total_or_pending_or_accept_or_reject_label = "संपादन लंबित";
        break;
      case 3:
        this.total_or_pending_or_accept_or_reject_label = "परिक्षेत्र अधिकारी स्तर पर लंबित";
        break;
      case 4:
        this.total_or_pending_or_accept_or_reject_label = "उपवनमंडलाधिकारी स्तर पर लंबित";
        break;
      case 5:
        this.total_or_pending_or_accept_or_reject_label = "वनमंडलाधिकारी स्तर पर लंबित";
        break;
      case 6:
        this.total_or_pending_or_accept_or_reject_label = "स्वीकृत";
        break;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    
    let whichData = 1;
    if (this.whichBoxClicked === 1) {
      whichData = 1;
    } else if (this.whichBoxClicked === 2) {
      whichData = 2;
    } else if (this.whichBoxClicked === 3) {
      whichData = 3;
    } else if (this.whichBoxClicked === 4) {
      whichData = 4;
    } else if (this.whichBoxClicked === 5) {
      whichData = 6;
    } else if (this.whichBoxClicked === 6) {
      whichData = 8;
    }
    
    if (this.whichBoxClicked === 1) {
      this.totalRecords = this.totalAwedan;
    } else if (this.whichBoxClicked === 2) {
      this.totalRecords = this.totalEditPending;
    } else if (this.whichBoxClicked === 3) {
      this.totalRecords = this.totalROPending;
    } else if (this.whichBoxClicked === 4) {
      this.totalRecords = this.totalSDOPending;
    } else if (this.whichBoxClicked === 5) {
      this.totalRecords = this.totalDFOPending;
    } else if (this.whichBoxClicked === 6) {
      this.totalRecords = this.totalApproved;
    }
    
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    
    this.apiService.getListOfAwedanAccordingToAwedanStatus(
      whichData,
      officersLoginModel.designation,
      officersLoginModel.circle_id,
      officersLoginModel.devision_id,
      officersLoginModel.rang_id,
      officersLoginModel.officerId.toString(),
      this.currentPage,
      this.pageSize
    ).subscribe(
      (response) => {
        if (response.response.code === 200) {
          this.listOfAwedan = response.data || [];
          this.filteredAwedans = this.listOfAwedan;
          
          if (this.listOfAwedan.length > 0) {
            this.isNoRecordFound = false;
          } else {
            this.isNoRecordFound = true;
          }
          
          this.cdRef.detectChanges();
        } else {
          this.filteredAwedans = [];
          this.isNoRecordFound = true;
          this.listOfAwedan = [];
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getListOfAwedanAfterClickOnBoxes(this.whichBoxClicked, page);
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
    } else {
      return item.awedan_status_text || '';
    }
  }

  async viewDocument(url: string) {
    await Browser.open({ url });
  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  getLoginedOfficerName(): string {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    return officersLoginModel.officer_name + " (" + officersLoginModel.designation_name + ")";
  }

  async onMenuItemClick(page: string) {
    this.isConnected = await this.networkCheckService.getCurrentStatus();

    if (this.isConnected) {
      if (page === 'prajati-goswara-report') {
        this.router.navigate(['prajati-goswara-report-circle']);
        return;
      } else {
        this.router.navigate([page]);
      }
    } else {
      this.longToast(this.getTranslation("no_internet"));
      return;
    }
  }

  viewApplication(model: GetAwedanResponseModel) {
    const statusValue = Number(model.awedan_status);
    if (!isNaN(statusValue) && statusValue >= 1) {
      this.router.navigate(['view-vivran-after-sampadit', model.application_number], {
        state: { returnUrl: this.router.url }
      });
    } else {
      this.router.navigate(['view-awedan-bykisanRO'], {
        queryParams: {
          applicationNumber: model.application_number
        }
      });
    }
  }

  canViewEstimate(item: GetAwedanResponseModel): boolean {
    return item.awedan_status === "4" || item.awedan_status === "5" || item.awedan_status === "6";
  }

  generateEstimateDynamic(item: GetAwedanResponseModel) {
    this.router.navigate(['generate-estimate-dynamic'], {
      queryParams: {
        applicationNumber: item.application_number,
      }
    });
  }

  async logoutFunction() {
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
        sessionStorage.clear();
        this.router.navigateByUrl('/splash', { replaceUrl: true });
      }
    });

    await modal.present();
  }

  filteredAwedans: GetAwedanResponseModel[] = [];

  onSearch(event: any) {
    const value = event.target.value.toLowerCase();
    this.currentPage = 1;
    this.filteredAwedans = this.listOfAwedan.filter(item =>
      item.hitgrahi_name.toLowerCase().includes(value) ||
      item.father_name.toLowerCase().includes(value) ||
      item.mobile_no.includes(value) ||
      item.application_number.toLowerCase().includes(value)
    );
  }

  onEnter() {
    this.currentPage = 1;
    this.filteredAwedans = this.listOfAwedan.filter(item =>
      item.hitgrahi_name.toLowerCase().includes(this.searchMobile.toLowerCase()) ||
      item.father_name.toLowerCase().includes(this.searchMobile.toLowerCase()) ||
      item.mobile_no.includes(this.searchMobile) ||
      item.application_number.toLowerCase().includes(this.searchMobile.toLowerCase())
    );
  }
}






















