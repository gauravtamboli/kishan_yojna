import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonCard, IonCardContent, IonSpinner, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { Toast } from '@capacitor/toast';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { KisanWiseReportResponseModel, KisanWiseReportResponse } from './KisanWiseReportResponse.model';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { addIcons } from 'ionicons';
import { downloadOutline } from 'ionicons/icons';

@Component({
  selector: 'app-kissan-wise-report',
  templateUrl: './kissan-wise-report.component.html',
  styleUrls: ['./kissan-wise-report.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonButton,
    IonIcon,
  ],
})
export class KissanWiseReportComponent implements OnInit {
  farmers: KisanWiseReportResponseModel[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private location: Location,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({ downloadOutline });
  }

  ngOnInit() {
    this.loadFarmersData();
  }

  getOfficersSessionData(): OfficersLoginResponseModel | null {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      try {
        return JSON.parse(storedData) as OfficersLoginResponseModel;
      } catch (error) {
        console.error('Error parsing officer session data:', error);
        return null;
      }
    }
    return null;
  }

  loadFarmersData(circleId?: number, divisionId?: number, distId?: number, rangId?: number) {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdRef.detectChanges();

    // Get logged-in officer data
    const officerData = this.getOfficersSessionData();
    
    // Extract IDs from officer data if not provided as parameters
    let finalCircleId = circleId;
    let finalDivisionId = divisionId;
    let finalDistId = distId;
    let finalRangId = rangId;
    let officerId: number | undefined;

    if (officerData) {
      // Extract officer ID
      officerId = officerData.officerId;
      
      // Use officer's IDs if parameters are not provided
      if (!finalCircleId && officerData.circle_id) {
        finalCircleId = Number(officerData.circle_id);
      }
      if (!finalDivisionId && officerData.devision_id) {
        finalDivisionId = Number(officerData.devision_id);
      }
      if (!finalRangId && officerData.rang_id) {
        finalRangId = Number(officerData.rang_id);
      }
      
      console.log('Officer Data:', {
        officerId: officerData.officerId,
        designation: officerData.designation_name,
        circleId: finalCircleId,
        divisionId: finalDivisionId,
        rangId: finalRangId
      });
    } else {
      console.warn('No officer session data found');
    }

    this.apiService.getKissanWiseReport(finalCircleId, finalDivisionId, finalDistId, finalRangId, officerId).subscribe({
      next: (response: KisanWiseReportResponse) => {
        this.isLoading = false;
        
        if (response?.response?.code === 200) {
          console.log('response one :', response);
          this.farmers = response.data || [];
          this.totalCount = response.totalCount || 0;
          console.log('Farmers loaded:', this.farmers.length);
          
          if (this.farmers.length === 0) {
            this.showToast(response.response.msg || 'कोई रिकॉर्ड नहीं मिला');
          } else {
            this.showToast(response.response.msg || `कुल ${this.totalCount} रिकॉर्ड मिले`);
          }
        } else {
          this.errorMessage = response?.response?.msg || 'डेटा लोड करने में त्रुटि हुई';
          this.showToast(this.errorMessage);
        }
        this.cdRef.detectChanges();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'डेटा लोड करने में त्रुटि हुई';
        console.error('Error loading farmers data:', error);
        this.showToast(this.errorMessage);
        this.cdRef.detectChanges();
      }
    });
  }

  async showToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short',
      position: 'bottom',
    });
  }

  goBack() {
    const dashboardUrl = this.getDashboardUrlByDesignation();
    if (window.history.length > 1) {
      this.router.navigateByUrl(dashboardUrl, { replaceUrl: true });
    } else {
      this.location.back();
    }
  }

  private getDashboardUrlByDesignation(): string {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      const officerData = JSON.parse(storedData);
      const designation = Number(officerData.designation);
      
      switch (designation) {
        case 1:
          return '/officers-dashboard-circle'; // Circle/CFO designation
        case 2:
          return '/officers-dashboard'; // DFO designation
        case 3:
          return '/officers-dashboard-sdo'; // SDO designation
        case 4:
          return '/officers-dashboard-ro'; // RO designation
        case 6:
        case 7:
          return '/officers-dashboard-supreme'; // SUPER ADMIN / Supreme Hierarchy designation
        default:
          return '/officers-dashboard';
      }
    }
    return '/officers-dashboard';
  }

  exportToExcel(): void {
    if (this.farmers.length === 0) {
      this.showToast('निर्यात के लिए कोई डेटा उपलब्ध नहीं है');
      return;
    }

    // Prepare data for export with Hindi column headers
    const exportData = this.farmers.map((farmer, index) => ({
      'क्रमांक': index + 1,
      'हितग्राही का नाम': farmer.hitgrahi_name || 'N/A',
      'पिता का नाम': farmer.father_name || 'N/A',
      'जाति श्रेणी': farmer.cast_category || 'N/A',
      'आधार नंबर': farmer.aadhar_no || 'N/A',
      'मोबाइल नंबर': farmer.mobile_no || 'N/A',
      'पता': farmer.address || 'N/A',
      'बैंक का नाम': farmer.bank_name || 'N/A',
      'IFSC कोड': farmer.ifsc_code || 'N/A',
      'खाता नंबर': farmer.account_no || 'N/A',
      'कक्षा क्रमांक': farmer.kaksha_kramank || 'N/A',
      'हल्का नंबर / नाम': farmer.halka_no || 'N/A',
      'गाँव का नाम': farmer.village_name || 'N/A',
      'ग्राम पंचायत': farmer.gram_panchayat_name || 'N/A',
      'रेत का प्रकार': farmer.sand_type || 'N/A',
      'सिंचित/असिंचित': farmer.sinchit_asinchit || 'N/A',
      'आवेदन स्थिति': farmer.awedan_status_text || farmer.awedan_status || 'N/A',
      'आवेदन नंबर': farmer.application_number || 'N/A',
      'वृक्षारोपण प्रकार': farmer.plantation_type || 'N/A',
      'क्षेत्र': farmer.area || 'N/A',
      'पौधा प्रकार': farmer.plant_type || 'N/A',
      'भूमि प्रकार': farmer.land_type === '1' ? 'FRA Land' : farmer.land_type === '2' ? 'REVENUE Land' : 'N/A',
      'कुल एकड़': farmer.total_acre || 'N/A',
      'FRA Land पट्टा नंबर': farmer.patta_no || 'N/A',
      'FRA Land कक्षा क्रमांक': farmer.compartment_no || 'N/A',
      'Revenue Land खसरा नंबर': farmer.khasra_no || 'N/A',
      'उपलब्ध क्षेत्र': farmer.available_area || 'N/A'
    }));

    // Create worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { 'किसान रिपोर्ट': worksheet },
      SheetNames: ['किसान रिपोर्ट']
    };

    // Generate Excel file
    const excelBuffer: any = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });
    
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    
    // Save file
    const fileName = `किसान_रिपोर्ट_${new Date().toISOString().split('T')[0]}.xlsx`;
    FileSaver.saveAs(blob, fileName);
    this.showToast('एक्सेल फ़ाइल डाउनलोड की गई');
  }
}