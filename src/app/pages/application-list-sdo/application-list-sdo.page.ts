import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonTitle, 
  IonContent, 
  IonLoading, 
  IonRow, 
  IonCol, 
  IonButton, 
  IonIcon, 
  IonLabel, 
  IonFab, 
  IonFabButton,
  IonInput
} from '@ionic/angular/standalone';
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
import { 
  downloadOutline, 
  searchOutline, 
  closeCircleOutline, 
  chevronBackOutline, 
  chevronForwardOutline, 
  eyeOutline, 
  createOutline, 
  receiptOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline as rejectIcon 
} from 'ionicons/icons';
import { ChangeDetectorRef } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';

@Component({
  selector: 'app-application-list-sdo',
  templateUrl: './application-list-sdo.page.html',
  styleUrls: ['./application-list-sdo.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonHeader, 
    IonToolbar, 
    IonButtons, 
    IonTitle, 
    IonContent, 
    IonLoading, 
    IonRow, 
    IonCol, 
    IonButton, 
    IonIcon, 
    IonLabel, 
    IonFab, 
    IonFabButton,
    IonInput,
    TableModule
  ]
})
export class ApplicationListSdoPage implements OnInit {
  isLoading = false;
  loadingMessage = 'कृपया प्रतीक्षा करें...';
  whichBoxClicked = 1;
  total_or_pending_or_accept_or_reject_label = 'कुल आवेदन';
  
  listOfAwedan: GetAwedanResponseModel[] = [];
  filteredAwedans: GetAwedanResponseModel[] = [];
  searchMobile = '';
  isSearched = false;

  currentPage = 1;
  pageSize = 20;
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
    private router: Router,
    private navController: NavController,
    private alertController: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({ 
      downloadOutline, 
      searchOutline, 
      closeCircleOutline, 
      chevronBackOutline, 
      chevronForwardOutline, 
      eyeOutline, 
      createOutline, 
      receiptOutline,
      checkmarkCircleOutline,
      rejectIcon
    });
  }

  async ngOnInit() {
    this.curent_session = await this.storageService.get('current_session');
    
    this.route.queryParams.subscribe(params => {
        this.whichBoxClicked = params['status'] ? Number(params['status']) : 1;
        this.updateLabel();
        this.getListOfAwedan();
    });
  }

  updateLabel() {
    switch (this.whichBoxClicked) {
      case 1: this.total_or_pending_or_accept_or_reject_label = "कुल आवेदन"; break;
      case 2: this.total_or_pending_or_accept_or_reject_label = "संपादन लंबित"; break;
      case 3: this.total_or_pending_or_accept_or_reject_label = "परिक्षेत्र अधिकारी स्तर पर लंबित"; break;
      case 4: this.total_or_pending_or_accept_or_reject_label = "उपवनमंडलाधिकारी स्तर पर लंबित"; break;
      case 5: this.total_or_pending_or_accept_or_reject_label = "वनमंडलाधिकारी स्तर पर लंबित"; break;
      case 6: this.total_or_pending_or_accept_or_reject_label = "स्वीकृत"; break;
      case 7: this.total_or_pending_or_accept_or_reject_label = "अस्वीकृत"; break;
      case 8: this.total_or_pending_or_accept_or_reject_label = "प्रकटन बैच"; break;
      default: this.total_or_pending_or_accept_or_reject_label = "आवेदन सूची";
    }
  }

  getListOfAwedan(page: number = 1) {
    this.currentPage = page;
    this.showDialog("कृपया प्रतीक्षा करें.....");

    const officerData = this.authService.getOfficerData() as OfficersLoginResponseModel;
    if (!officerData) {
      this.dismissDialog();
      this.router.navigateByUrl('officer-login', { replaceUrl: true });
      return;
    }

    let whichData = 1;
    switch (this.whichBoxClicked) {
      case 1: whichData = 1; break; // Total
      case 2: whichData = 2; break; // Edit Pending
      case 3: whichData = 3; break; // RO Pending
      case 4: whichData = 4; break; // SDO Pending
      case 5: whichData = 6; break; // DFO Pending
      case 6: whichData = 8; break; // Approved
      case 7: whichData = 9; break; // Rejected
      case 8: whichData = 10; break; // Batch
    }

    this.apiService.getListOfAwedanAccordingToAwedanStatus(
      whichData,
      officerData.designation,
      officerData.circle_id,
      officerData.devision_id,
      officerData.rang_id,
      officerData.officerId?.toString() || '',
      this.currentPage,
      this.pageSize,
      this.curent_session,
      this.searchMobile || ''
    ).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response.code === 200) {
          this.listOfAwedan = response.data || [];
          this.filteredAwedans = this.listOfAwedan;
          // In actual projects, total records should come from server
          // For now we calculate it to show total pages
          if (this.currentPage === 1 && this.listOfAwedan.length < this.pageSize) {
            this.totalRecords = this.listOfAwedan.length;
          } else {
             // Basic fallback
             this.totalRecords = 1000; // Mock total or handle via separate count API
          }
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
          this.isNoRecordFound = this.listOfAwedan.length === 0;
        } else {
          this.listOfAwedan = [];
          this.filteredAwedans = [];
          this.isNoRecordFound = true;
        }
        this.cdRef.detectChanges();
      },
      (error) => {
        this.dismissDialog();
        this.shortToast("सर्वर एरर");
      }
    );
  }

  onSearch() {
    this.isSearched = !!this.searchMobile;
    this.getListOfAwedan(1);
  }

  clearSearch() {
    this.searchMobile = "";
    this.isSearched = false;
    this.getListOfAwedan(1);
  }

  getStatusText(item: any): string {
    const status = item.awedan_status?.toString();
    switch (status) {
      case '0': return "संपादन लंबित";
      case '1': return "RO स्तर पर लंबित";
      case '2': return "SDO स्तर पर लंबित";
      case '3': return "त्रुटि सुधार (SDO द्वारा वापस)";
      case '4': return "DFO स्तर पर लंबित";
      case '5': return "त्रुटि सुधार (DFO द्वारा वापस)";
      case '6': return "स्वीकृत";
      case '7': return "भुगतान हेतु प्रेषित (Draft)";
      default: return item.awedan_status_text || 'अज्ञात';
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
         queryParams: { application_number: model.application_number, isRo: true }
      });
    }
  }

  generateEstimateDynamic(item: any) {
    this.router.navigate(['generate-estimate-dynamic'], {
      queryParams: { appNo: item.application_number }
    });
  }

  async acceptOrRejectAwedan(model: GetAwedanResponseModel) {
    const alert = await this.alertController.create({
      header: "अनुमोदन कार्रवाई",
      message: "क्या आप इस आवेदन को स्वीकृत कर DFO को भेजना चाहते हैं या वापस करना चाहते हैं?",
      buttons: [
        {
          text: 'स्वीकृत (DFO को भेजें)',
          cssClass: 'alert-accept',
          handler: () => {
            this.callApiToAcceptRejectAwedan("1", model.regTableId);
          },
        },
        {
          text: 'त्रुटि सुधार हेतु वापस',
          cssClass: 'alert-reject',
          handler: () => {
            this.callApiToAcceptRejectAwedan("2", model.regTableId);
          },
        },
        {
          text: 'रद्द करें',
          role: 'cancel'
        }
      ],
    });
    await alert.present();
  }

  callApiToAcceptRejectAwedan(approveReject: string, awedanId: number) {
    const officerData = this.authService.getOfficerData() as OfficersLoginResponseModel;
    this.showDialog("कार्रवाई की जा रही है...");

    this.apiService.awedanAcceptReject(
      awedanId,
      approveReject,
      officerData.officerId
    ).subscribe(
      async (response) => {
        await this.dismissDialog();
        if (response.response.code === 200) {
          this.shortToast(response.response.msg);
          this.getListOfAwedan(this.currentPage);
        } else {
          this.shortToast(response.response.msg);
        }
      },
      async (error) => {
        await this.dismissDialog();
        this.shortToast("कार्रवाई विफल रही");
      }
    );
  }

  isSDOPending(item: GetAwedanResponseModel): boolean {
    return item.awedan_status === "2";
  }

  canViewEstimate(item: any): boolean {
     const status = Number(item.awedan_status);
     return status >= 2;
  }

  export() {
    this.showDialog("निर्यात हेतु डेटा तैयार किया जा रहा है...");
    // Fetch all records for export if possible, or just export current filtered list
    const exportData = this.filteredAwedans.map((item, index) => ({
      'क्रमांक': index + 1,
      'आवेदन नंबर': item.application_number || '',
      'हितग्राही का नाम': item.hitgrahi_name || '',
      'पिता का नाम': item.father_name || '',
      'मोबाइल नंबर': item.mobile_no || '',
      'स्थिति': this.getStatusText(item)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { 'Applications': worksheet }, SheetNames: ['Applications'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, `SDO_Applications_${this.total_or_pending_or_accept_or_reject_label}.xlsx`);
    this.dismissDialog();
  }

  goBack() {
    this.navController.back();
  }

  private showDialog(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  private dismissDialog() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  private async shortToast(msg: string) {
    await Toast.show({ text: msg, duration: 'short', position: 'bottom' });
  }

  // Pagination Helpers
  goToPage(page: number) { this.getListOfAwedan(page); }
  goToPreviousPage() { if (this.currentPage > 1) this.getListOfAwedan(this.currentPage - 1); }
  goToNextPage() { if (this.currentPage < this.totalPages) this.getListOfAwedan(this.currentPage + 1); }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + 4);
      if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  }
}
