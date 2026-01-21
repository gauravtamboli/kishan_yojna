import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonLabel, 
  IonCardHeader, 
  IonCardContent, 
  IonCardTitle, 
  IonCard, 
  IonLoading, 
  IonText, 
  IonButton, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonButtons, 
  IonBackButton, 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonList,
  IonBadge
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { 
  VivranRegistrationDetailsResponseModel, 
  VivranRegistrationDetails, 
  VivranPlantDetails 
} from './VivranRegistrationDetailsResponseModel';
import { Toast } from '@capacitor/toast';

@Component({
  selector: 'app-view-vivran-after-sampadit',
  templateUrl: './view-vivran-after-sampadit.page.html',
  styleUrls: ['./view-vivran-after-sampadit.page.scss'],
  standalone: true,
  imports: [
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCard,
    IonLoading,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBadge,
    CommonModule,
    FormsModule
]
})
export class ViewVivranAfterSampaditPage implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = 'कृपया प्रतीक्षा करें.....';
  
  applicationNumber: string = '';
  registrationDetails: VivranRegistrationDetails | null = null;
  plants: VivranPlantDetails[] = [];
  returnUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const stateReturnUrl = navigation?.extras?.state?.['returnUrl'];
    const historyReturnUrl = window.history?.state?.returnUrl;
    this.returnUrl = stateReturnUrl || historyReturnUrl || null;

    this.route.params.subscribe(params => {
      if (params['application_number']) {
        this.applicationNumber = params['application_number'];
        this.fetchRegistrationDetails();
      }
    });
  }

  fetchRegistrationDetails() {
    this.showDialog("आवेदन का विवरण प्राप्त कर रहे हैं...");
    
    this.apiService.getAllRegistrationDetailsForVivran(this.applicationNumber).subscribe(
      (response) => {
        this.dismissDialog();
        
        if (response.response.code === 200 && response.response.dynamicdata) {
          this.registrationDetails = response.response.dynamicdata.registrationDetails;
          this.plants = response.response.dynamicdata.plants || [];
          this.cdRef.detectChanges();
        } else {
          this.registrationDetails = null;
          this.plants = [];
        }
      },
      (error) => {
        this.dismissDialog();
        console.error('Error fetching registration details:', error);
        this.registrationDetails = null;
        this.plants = [];
      }
    );
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
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      const dashboardUrl = this.getDashboardUrlByDesignation();
      this.router.navigateByUrl(dashboardUrl);
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

  getStatusText(status: number | null): string {
    if (status === null) return 'अज्ञात';
    switch(status) {
      case 0: return 'संपादन लंबित';
      case 1: return 'परिक्षेत्र अधिकारी स्तर पर लंबित';
      case 2: return 'उपवनमंडलाधिकारी स्तर पर लंबित';
      case 3: return 'त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (SDO)';
      case 4: return 'वनमंडलाधिकारी स्तर पर लंबित';
      case 5: return 'त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (DFO)';
      case 6: return 'स्वीकृत';
      default: return 'अज्ञात';
    }
  }

  getStatusColor(status: number | null): string {
    if (status === null) return 'medium';
    switch(status) {
      case 0: return 'warning';  // संपादन लंबित - Orange
      case 1: return 'primary';  // परिक्षेत्र अधिकारी स्तर पर लंबित - Blue
      case 2: return 'tertiary'; // उपवनमंडलाधिकारी स्तर पर लंबित - Purple
      case 3: return 'warning';  // त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (SDO) - Orange
      case 4: return 'secondary'; // वनमंडलाधिकारी स्तर पर लंबित - Teal
      case 5: return 'warning';  // त्रुटि सुधार कर प्राकलन पुनः प्रस्तुत करें (DFO) - Orange
      case 6: return 'success';  // स्वीकृत - Green
      default: return 'medium';
    }
  }

  getPlantsLessThan5Acre(): VivranPlantDetails[] {
    return this.plants.filter(plant => plant.totalArea !== null && plant.totalArea < 5);
  }

  getPlantsMoreThanOrEqual5Acre(): VivranPlantDetails[] {
    return this.plants.filter(plant => plant.totalArea !== null && plant.totalArea >= 5);
  }

  getLandTypeText(landType: number | null): string {
    if (landType === null) return 'N/A';
    switch(landType) {
      case 1: return 'FRA Land';
      case 2: return 'Revenue Land';
      default: return 'N/A';
    }
  }

  async downloadFile(filename: string | null, fileType: string) {
    if (!filename) {
      await this.longToast('फ़ाइल उपलब्ध नहीं है');
      return;
    }

    this.showDialog('फ़ाइल डाउनलोड हो रही है...');
    
    this.apiService.getSecurePDF(filename).subscribe({
      next: (blob: Blob) => {
        this.dismissDialog();
        this.openBlobInNewTab(blob, filename);
      },
      error: (err) => {
        this.dismissDialog();
        this.longToast('फ़ाइल डाउनलोड करने में त्रुटि');
        console.error('Error downloading file:', err);
      }
    });
  }

  openBlobInNewTab(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long',
      position: 'bottom',
    });
  }
}

