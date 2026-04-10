import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonLoading, IonRow, IonCol, IonButton, IonIcon, IonLabel, IonFab, IonFabButton, IonInput } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableModule } from 'primeng/table';
import { Toast } from '@capacitor/toast';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { addIcons } from 'ionicons';
import { downloadOutline, searchOutline, closeCircleOutline, chevronBackOutline, chevronForwardOutline, eyeOutline, createOutline, receiptOutline } from 'ionicons/icons';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-application-list-ro',
  templateUrl: './application-list-ro.page.html',
  styleUrls: ['./application-list-ro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonLoading, IonRow, IonCol, IonButton, IonIcon, IonLabel, IonFab, IonFabButton, IonInput, TableModule]
})
export class ApplicationListRoPage implements OnInit {
  isLoading = false;
  loadingMessage = 'Please wait...';
  whichBoxClicked = 1;
  total_or_pending_or_accept_or_reject_label = 'कुल आवेदन';
  
  listOfAwedan: any[] = [];
  filteredAwedans: any[] = [];
  searchMobile = '';
  isSearched = false;

  currentPage = 1;
  pageSize = 30;
  totalRecords = 0;
  totalPages = 0;
  isNoRecordFound = false;

  curent_session: any;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthServiceService,
    private storageService: StorageService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {
    addIcons({ downloadOutline, searchOutline, closeCircleOutline, chevronBackOutline, chevronForwardOutline, eyeOutline, createOutline, receiptOutline });

    // Try to get data from navigation state first (Ionic/Angular style)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.whichBoxClicked = navigation.extras.state['boxType'];
      this.totalRecords = navigation.extras.state['totalRecords'];
    }
  }

  async ngOnInit() {
    this.curent_session = await this.storageService.get('current_session');
    
    // Fallback to history.state if constructor didn't capture it (e.g. reload or different navigation flow)
    if (!this.whichBoxClicked || this.whichBoxClicked === 1) {
       const state = history.state;
       if (state && state.boxType) {
         this.whichBoxClicked = state.boxType;
         this.totalRecords = state.totalRecords || 0;
       }
    }

    this.updateLabel();
    this.getListOfAwedan();
  }

  updateLabel() {
    switch (this.whichBoxClicked) {
      case 99: this.total_or_pending_or_accept_or_reject_label = "कुल आवेदन"; break;
      case 0: this.total_or_pending_or_accept_or_reject_label = "संपादन लंबित"; break;
      case 1: this.total_or_pending_or_accept_or_reject_label = "परिक्षेत्र अधिकारी स्तर पर लंबित"; break;
      case 2: this.total_or_pending_or_accept_or_reject_label = "उपवनमंडलाधिकारी स्तर पर लंबित"; break;
      case 3: this.total_or_pending_or_accept_or_reject_label = "त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (SDO)"; break;
      case 4: this.total_or_pending_or_accept_or_reject_label = "वनमंडलाधिकारी स्तर पर लंबित"; break;
      case 5: this.total_or_pending_or_accept_or_reject_label = "त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (DFO)"; break;
      case 6: this.total_or_pending_or_accept_or_reject_label = "स्वीकृत"; break;
      case 13: this.total_or_pending_or_accept_or_reject_label = "अस्वीकृत"; break;
      case 7: this.total_or_pending_or_accept_or_reject_label = "ड्राफ्ट"; break;
      case 8: this.total_or_pending_or_accept_or_reject_label = "भुगतान लंबित "; break;
      case 9: this.total_or_pending_or_accept_or_reject_label = "भुगतान अस्वीकृत"; break;
      case 10: this.total_or_pending_or_accept_or_reject_label = "भुगतान अंकन विफल"; break;
      case 11: this.total_or_pending_or_accept_or_reject_label = "भुगतान स्वीकृत"; break;
      default: this.total_or_pending_or_accept_or_reject_label = "आवेदन सूची";
    }
  }

  getListOfAwedan(page: number = 1) {
    this.currentPage = page;
    this.showDialog("कृपया प्रतीक्षा करें.....");

    const officersLoginModel = this.authService.getOfficerData() as OfficersLoginResponseModel;
    if (!officersLoginModel) {
      this.dismissDialog();
      return;
    }

    let whichData = this.whichBoxClicked; // Simplified mapping: whichBoxClicked IS the Data ID (status) passed from dashboard

    this.apiService.getListOfAwedanAccordingToAwedanStatus(
      whichData,
      officersLoginModel.designation,
      officersLoginModel.circle_id,
      officersLoginModel.devision_id,
      officersLoginModel.rang_id,
      officersLoginModel.officerId?.toString() || '',
      this.currentPage,
      this.pageSize,
      this.curent_session,
      this.searchMobile || ''
    ).subscribe(
      (response) => {
        if (response.response.code === 200) {
          this.listOfAwedan = response.data || [];
          this.filteredAwedans = this.listOfAwedan;
          this.isNoRecordFound = this.listOfAwedan.length === 0;
          
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.cdRef.detectChanges();
        } else {

          this.filteredAwedans = [];
          this.isNoRecordFound = true;
          this.listOfAwedan = [];
        }
        this.dismissDialog();
      },
      (error) => {
        this.shortToast(error);
        this.dismissDialog();
      }
    );
  }

  onSearchInputChange() {
    if (this.searchMobile.length === 0) {
      this.clearSearch();
    }
  }

  onEnter() {
    this.isSearched = true;
    this.getListOfAwedan(1);
  }

  clearSearch() {
    this.searchMobile = "";
    this.isSearched = false;
    this.getListOfAwedan(1);
  }

  export() {
    this.showDialog("डेटा निर्यात के लिए तैयार किया जा रहा है, कृपया प्रतीक्षा करें...");

    const officersLoginModel = this.authService.getOfficerData() as OfficersLoginResponseModel;
    if (!officersLoginModel) {
      this.dismissDialog();
      return;
    }

    let whichData = this.whichBoxClicked; // Use the same consistent ID for export


    const fullPageSize = this.totalRecords > 0 ? this.totalRecords : 5000;

    this.apiService.getListOfAwedanAccordingToAwedanStatus(
      whichData,
      officersLoginModel.designation,
      officersLoginModel.circle_id,
      officersLoginModel.devision_id,
      officersLoginModel.rang_id,
      officersLoginModel.officerId?.toString() || '',
      1,
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
          const workbook: XLSX.WorkBook = { Sheets: { 'Applications': worksheet }, SheetNames: ['Applications'] };
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

  getStatusText(item: GetAwedanResponseModel): string {
    if (item.awedan_status === "0") return "संपादन लंबित";
    if (item.awedan_status === "1") return "परिक्षेत्र अधिकारी स्तर पर लंबित";
    if (item.awedan_status === "2") return "उपवनमंडलाधिकारी स्तर पर लंबित";
    if (item.awedan_status === "3") return "त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (SDO)";
    if (item.awedan_status === "4") return "वनमंडलाधिकारी स्तर पर लंबित";
    if (item.awedan_status === "5") return "त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (DFO)";
    if (item.awedan_status === "6") return "स्वीकृत";
    if (item.awedan_status === "7") return "ड्राफ्ट";
    if (item.awedan_status === "8") return "भुगतान लंबित";
    if (item.awedan_status === "9") return "भुगतान अस्वीकृत";
    if (item.awedan_status === "10") return "भुगतान अंकन विफल";
    if (item.awedan_status === "11") return "भुगतान स्वीकृत";
    return item.awedan_status_text || 'अज्ञात';
  }

  canViewEstimate(item: GetAwedanResponseModel): boolean {
    return item.awedan_status != "0";
  }

  viewApplication(model: GetAwedanResponseModel) {
    const statusValue = Number(model.awedan_status);
    if (!isNaN(statusValue) && statusValue >= 1) {
      this.router.navigate(['view-vivran-after-sampadit', model.application_number], {
        state: { returnUrl: this.router.url }
      });
    } else {
      this.router.navigate(['view-awedan-bykisanRO'], {
        state: { applicationNumber: model.application_number }
      });
    }
  }

  editAwedan(item: GetAwedanResponseModel) {
    if (!item || !item.application_number) {
      this.shortToast('आवेदन संख्या उपलब्ध नहीं है');
      return;
    }
    const navigationState = {
      applicationNumber: item.application_number,
      id: item.id,
      editMode: true
    };
    this.router.navigate(['submit-awedan-by-ro2'], {
      state: navigationState,
      replaceUrl: false
    });
  }

  generateEstimateDynamic(item: GetAwedanResponseModel) {
    this.router.navigate(['generate-estimate-dynamic'], {
      state: { applicationNumber: item.application_number }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getListOfAwedan(page);
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
      if (endPage - startPage < maxPagesToShow - 1) startPage = Math.max(1, endPage - maxPagesToShow + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
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

  goBack() {
    const dashboardRoute = this.authService.getDashboardRoute();
    this.router.navigate([dashboardRoute]);
  }

  async shortToast(msg: string) {
    await Toast.show({ text: msg, duration: 'short', position: 'bottom' });
  }
}
