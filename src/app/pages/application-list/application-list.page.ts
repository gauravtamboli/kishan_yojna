import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  NavController, 
  Platform 
} from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { StorageService } from 'src/app/services/storage.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import { TableModule } from 'primeng/table';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, 
  chevronForwardOutline, 
  downloadOutline, 
  eyeOutline, 
  receiptOutline 
} from 'ionicons/icons';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Toast } from '@capacitor/toast';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.page.html',
  styleUrls: ['./application-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TableModule]
})
export class ApplicationListPage implements OnInit {
  isLoading = false;
  loadingMessage = 'कृपया प्रतीक्षा करें.....';
  
  whichBoxClicked = 1;
  searchMobile = "";
  curent_session: any;
  
  listOfAwedan: any[] = [];
  filteredAwedans: any[] = [];
  isNoRecordFound = true;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthServiceService,
    private storageService: StorageService,
    private cdRef: ChangeDetectorRef,
    private navController: NavController,
    private platform: Platform
  ) {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      downloadOutline,
      eyeOutline,
      receiptOutline
    });
  }

  async ngOnInit() {
    this.curent_session = await this.storageService.get('current_session');
    
    // Get filter from route params
    this.route.queryParams.subscribe(params => {
      this.whichBoxClicked = params['status'] ? Number(params['status']) : 1;
      this.getDataFromServer();
    });
  }

  getDataFromServer(page: number = 1) {
    this.currentPage = page;
    this.isLoading = true;
    
    const officerData = this.authService.getOfficerData() as OfficersLoginResponseModel;
    if (!officerData) {
      this.router.navigateByUrl('officer-login', { replaceUrl: true });
      return;
    }

    // Map whichBoxClicked to which_data for API
    let whichData = this.whichBoxClicked; // Status ID passed from dashboard query params

    this.apiService.getListOfAwedanAccordingToAwedanStatus(
      whichData,
      officerData.designation,
      officerData.circle_id,
      officerData.devision_id,
      officerData.rang_id,
      officerData.officerId?.toString() || '',
      this.currentPage,
      this.pageSize,
      this.curent_session
    ).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.response.code === 200) {
          this.listOfAwedan = response.data || [];
          this.filteredAwedans = this.listOfAwedan;
          // In a real scenario, the API should return total count. 
          // For now we calculate it or rely on the dashboard counts previously seen.
          // But here we just set it based on current list length if pagination is not backend-driven for total.
          // Note: The dashboard logic had totalRecords = this.totalAwedan etc.
          // We don't have those counts here unless we fetch them or pass them.
          // I'll assume for now we might need to fetch counts if we want full pagination.
          this.isNoRecordFound = this.listOfAwedan.length === 0;
          this.cdRef.detectChanges();
        } else {
          this.listOfAwedan = [];
          this.filteredAwedans = [];
          this.isNoRecordFound = true;
        }
      },
      (error) => {
        this.isLoading = false;
        this.shortToast("सर्वर एरर");
      }
    );
  }

  onSearch(event: any) {
    const value = event.target.value.toLowerCase();
    if (!value) {
      this.filteredAwedans = this.listOfAwedan;
    } else {
      this.filteredAwedans = this.listOfAwedan.filter(item => 
        item.application_number?.toLowerCase().includes(value) ||
        item.hitgrahi_name?.toLowerCase().includes(value) ||
        item.father_name?.toLowerCase().includes(value) ||
        item.mobile_no?.includes(value)
      );
    }
    this.isNoRecordFound = this.filteredAwedans.length === 0;
  }

  getStatusText(item: any): string {
    const status = item.awedan_status?.toString();
    switch (status) {
      case '0': return "संपादन लंबित (Draft)";
      case '1': return "RO स्तर पर लंबित";
      case '2': return "SDO स्तर पर लंबित";
      case '3': return "त्रुटि सुधार (SDO द्वारा वापस)";
      case '4': return "DFO स्तर पर लंबित";
      case '5': return "त्रुटि सुधार (DFO द्वारा वापस)";
      case '6': return "स्वीकृत";
      case '7': return "ड्राफ्ट";
      case '8': return "भुगतान लंबित";
      case '9': return "भुगतान अस्वीकृत";
      case '10': return "भुगतान अंकन विफल";
      case '11': return "भुगतान स्वीकृत";
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

  canViewEstimate(item: any): boolean {
    const status = Number(item.awedan_status);
    return status >= 4; // DFO pending or later
  }

  export() {
    const exportData = this.filteredAwedans.map((item, index) => ({
      'क्रमांक': index + 1,
      'आवेदन नंबर': item.application_number || '',
      'हितग्राही का नाम': item.hitgrahi_name || '',
      'पिता का नाम': item.father_name || '',
      'मोबाइल नंबर': item.mobile_no || '',
      'वृत्त': item.circle_name || '',
      'वन मंडल': item.division_name || '',
      'स्थिति': this.getStatusText(item)
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = { Sheets: { 'Applications': worksheet }, SheetNames: ['Applications'] };
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'Applications_List.xlsx');
  }

  goBack() {
    const dashboardRoute = this.authService.getDashboardRoute();
    this.router.navigate([dashboardRoute]);
  }

  private async shortToast(msg: string) {
    await Toast.show({ text: msg, duration: 'short' });
  }

  getTitle(): string {
    switch (this.whichBoxClicked) {
      case 99: return "कुल आवेदन सूची";
      case 0: return "संपादन लंबित सूची";
      case 1: return "RO स्तर पर लंबित सूची";
      case 2: return "SDO स्तर पर लंबित सूची";
      case 4: return "DFO स्तर पर लंबित सूची";
      case 6: return "स्वीकृत आवेदन सूची";
      case 13: return "अस्वीकृत आवेदन सूची";
      case 7: return "ड्राफ्ट सूची";
      case 8: return "भुगतान लंबित सूची";
      case 9: return "भुगतान अस्वीकृत सूची";
      case 10: return "भुगतान अंकन विफल सूची";
      case 11: return "भुगतान स्वीकृत सूची";
      default: return "आवेदन सूची";
    }
  }
}
