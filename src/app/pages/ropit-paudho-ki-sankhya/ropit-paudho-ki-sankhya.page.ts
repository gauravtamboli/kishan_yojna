import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonInput, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonRow, IonCol, IonGrid, IonLoading, IonIcon, IonText
} from '@ionic/angular/standalone';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { Toast } from '@capacitor/toast';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, searchOutline, personOutline, locationOutline, leafOutline, documentTextOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { 
  GetRopitAwedanResponse, 
  RopitKisanAwedanListResponseModel,
  UpdateRopitCountRequestModel,
  UpdateRopitCountItem
} from './RopitAwedanModels';

@Component({
  selector: 'app-ropit-paudho-ki-sankhya',
  templateUrl: './ropit-paudho-ki-sankhya.page.html',
  styleUrls: ['./ropit-paudho-ki-sankhya.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonButton, IonInput, IonCard, IonCardContent,
    IonRow, IonCol, IonLoading, IonIcon, IonText
]
})
export class RopitPaudhoKiSankhyaPage implements OnInit {
addPlantRow(arg0: any,_t77: number) {
throw new Error('Method not implemented.');
}
  isLoading: boolean = false;
  loadingMessage: string = 'कृपया प्रतीक्षा करें.....';
  
  searchText: string = '';
  filteredData: RopitKisanAwedanListResponseModel[] = [];
  allData: RopitKisanAwedanListResponseModel[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  
  // Store input values for each plant: { applicationNumber: { plantIndex: value } }
  ropitSankhyaInputs: { [applicationNumber: string]: { [plantIndex: number]: number } } = {};

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    addIcons({ 
      chevronBackOutline, 
      chevronForwardOutline, 
      searchOutline, 
      personOutline, 
      locationOutline, 
      leafOutline, 
      documentTextOutline, 
      checkmarkCircleOutline 
    });
  }

  ngOnInit() {
    this.loadData();
  }

  getOfficersSessionData(): OfficersLoginResponseModel | null {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  loadData(page: number = 1) {
    const officersLoginModel = this.getOfficersSessionData();
    
    if (!officersLoginModel || !officersLoginModel.rang_id) {
      this.showToast('रेंज ID उपलब्ध नहीं है', 'long');
      return;
    }

    this.isLoading = true;
    this.currentPage = page;

    this.apiService.getRopitKisanAwedanListByRange(
      parseInt(officersLoginModel.rang_id),
      this.currentPage,
      this.pageSize
    ).subscribe(
      (response: GetRopitAwedanResponse) => {
        this.isLoading = false;
        
        if (response.response.Code === 200) {
          this.allData = response.data || [];
          this.filteredData = this.allData;
          this.totalRecords = response.totalCount || 0;
          this.totalPages = response.totalPages || 0;
          
          // Initialize input values for each plant
          this.allData.forEach(item => {
            if (!this.ropitSankhyaInputs[item.ApplicationNumber]) {
              this.ropitSankhyaInputs[item.ApplicationNumber] = {};
            }
            // Initialize for each plant
            if (item.Plants && item.Plants.length > 0) {
              item.Plants.forEach((plant, index) => {
                if (!this.ropitSankhyaInputs[item.ApplicationNumber][index]) {
                  this.ropitSankhyaInputs[item.ApplicationNumber][index] = 0;
                }
              });
            }
          });
          
          this.cdRef.detectChanges();
        } else {
          this.showToast(response.response.Message || 'डेटा लोड करने में त्रुटि', 'long');
          this.allData = [];
          this.filteredData = [];
        }
      },
      (error) => {
        this.isLoading = false;
        this.showToast('सर्वर त्रुटि: ' + (error?.message || 'अज्ञात त्रुटि'), 'long');
        this.allData = [];
        this.filteredData = [];
      }
    );
  }

  onSearch() {
    const value = (this.searchText || '').toLowerCase().trim();
    
    if (!value) {
      this.filteredData = this.allData;
      return;
    }

    this.filteredData = this.allData.filter(item =>
      item.ApplicationNumber.toLowerCase().includes(value) ||
      item.HitgrahiName.toLowerCase().includes(value) ||
      item.FatherName.toLowerCase().includes(value) ||
      item.VillageCityName.toLowerCase().includes(value) ||
      item.GramPanchayatNagar.toLowerCase().includes(value)
    );
  }

  onSearchEnter() {
    this.onSearch();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadData(page);
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

  submitRopitSankhya(applicationNumber: string) {
    const plantInputs = this.ropitSankhyaInputs[applicationNumber];
    
    if (!plantInputs) {
      this.showToast('कृपया कम से कम एक पौधे के लिए संख्या दर्ज करें', 'short');
      return;
    }

    // Find the application data to get PlantId from backend
    const applicationData = this.allData.find(item => item.ApplicationNumber === applicationNumber);
    
    if (!applicationData || !applicationData.Plants || applicationData.Plants.length === 0) {
      this.showToast('पौधों की जानकारी उपलब्ध नहीं है', 'short');
      return;
    }

    // Check if all plants are readonly
    const allReadonly = applicationData.Plants.every((plant, index) => 
      this.isPlantRopitReadonly(applicationNumber, index)
    );
    
    if (allReadonly) {
      this.showToast('इस आवेदन के सभी पौधों की रोपित संख्या पहले से दर्ज है', 'short');
      return;
    }

    // Prepare data using PlantId from backend (NOT array index)
    const items: UpdateRopitCountItem[] = [];
    const validationErrors: string[] = [];
    
    Object.keys(plantInputs).forEach(plantIndexStr => {
      const plantIndex = parseInt(plantIndexStr);
      
      // Skip if this plant is readonly (TotalRopit already exists)
      if (this.isPlantRopitReadonly(applicationNumber, plantIndex)) {
        return; // Skip this plant
      }
      
      const ropitSankhya = plantInputs[plantIndex];
      
      if (ropitSankhya && ropitSankhya > 0) {
        const plant = applicationData.Plants[plantIndex];
        const totalTree = plant.TotalTree || 0;
        
        // Validation: ropit count must be <= TotalTree
        if (ropitSankhya > totalTree) {
          const plantName = plant.PlantName || 'पौधा';
          validationErrors.push(
            `${plantName}: रोपित संख्या (${ropitSankhya}) कुल पौधों (${totalTree}) से अधिक नहीं हो सकती`
          );
          return; // Skip this plant - don't add to items
        }
        
        // Use PlantId from backend response
        if (plant && plant.PlantId) {
          items.push({
            application_number: applicationNumber,
            plant_id: plant.PlantId,
            total_ropit: ropitSankhya
          });
        }
      }
    });

    // Show validation errors if any
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join('\n');
      this.showToast(errorMessage, 'long');
      return; // Don't proceed with API call
    }

    if (items.length === 0) {
      this.showToast('कृपया कम से कम एक पौधे के लिए वैध संख्या दर्ज करें', 'short');
      return;
    }

    // Prepare request model
    const requestModel: UpdateRopitCountRequestModel = {
      items: items
    };

    // Show loading
    this.isLoading = true;
    this.loadingMessage = 'रोपित पौधों की संख्या जमा की जा रही है...';

    // Call API
    this.apiService.updateRopitCount(requestModel).subscribe(
      (response: any) => {
        this.isLoading = false;
        
        if (response.response && response.response.code === 200) {
          const totalSankhya = items.reduce((sum, item) => sum + item.total_ropit, 0);
          this.showToast(
            `आवेदन ${applicationNumber} के लिए ${items.length} पौधों में कुल ${totalSankhya} रोपित पौधों की संख्या सफलतापूर्वक दर्ज की गई`, 
            'long'
          );
          
          // Reset inputs after successful submission
          Object.keys(plantInputs).forEach(plantIndexStr => {
            plantInputs[parseInt(plantIndexStr)] = 0;
          });
          
          // Reload data to reflect updated TotalRopit values
          this.loadData(this.currentPage);
        } else {
          const errorMsg = response.response?.msg || 'रोपित पौधों की संख्या जमा करने में त्रुटि';
          this.showToast(errorMsg, 'long');
        }
      },
      (error) => {
        this.isLoading = false;
        const errorMsg = error?.error?.response?.msg || error?.message || 'सर्वर त्रुटि';
        this.showToast(`त्रुटि: ${errorMsg}`, 'long');
      }
    );
  }

  getRopitSankhyaInput(applicationNumber: string, plantIndex: number): number {
    // First check if TotalRopit exists in backend data
    const applicationData = this.allData.find(item => item.ApplicationNumber === applicationNumber);
    if (applicationData && applicationData.Plants && applicationData.Plants[plantIndex]) {
      const plant = applicationData.Plants[plantIndex];
      if (plant.TotalRopit && plant.TotalRopit > 0) {
        return plant.TotalRopit;
      }
    }
    
    // Otherwise return from user input
    if (!this.ropitSankhyaInputs[applicationNumber]) {
      return 0;
    }
    return this.ropitSankhyaInputs[applicationNumber][plantIndex] || 0;
  }

  isPlantRopitReadonly(applicationNumber: string, plantIndex: number): boolean {
    const applicationData = this.allData.find(item => item.ApplicationNumber === applicationNumber);
    if (!applicationData || !applicationData.Plants || !applicationData.Plants[plantIndex]) {
      return false;
    }
    const plant = applicationData.Plants[plantIndex];
    // Return true if TotalRopit exists and is greater than 0
    return !!(plant.TotalRopit && plant.TotalRopit > 0);
  }

  areAllPlantsReadonly(applicationNumber: string): boolean {
    const applicationData = this.allData.find(item => item.ApplicationNumber === applicationNumber);
    if (!applicationData || !applicationData.Plants || applicationData.Plants.length === 0) {
      return false;
    }
    // Check if all plants have TotalRopit > 0
    return applicationData.Plants.every((plant, index) => 
      this.isPlantRopitReadonly(applicationNumber, index)
    );
  }

  getPlantTotalTree(applicationNumber: string, plantIndex: number): number {
    const applicationData = this.allData.find(item => item.ApplicationNumber === applicationNumber);
    if (!applicationData || !applicationData.Plants || !applicationData.Plants[plantIndex]) {
      return 0;
    }
    const plant = applicationData.Plants[plantIndex];
    return plant.TotalTree || 0;
  }

  getPlantName(applicationNumber: string, plantIndex: number): string {
    const applicationData = this.allData.find(item => item.ApplicationNumber === applicationNumber);
    if (!applicationData || !applicationData.Plants || !applicationData.Plants[plantIndex]) {
      return 'पौधा';
    }
    return applicationData.Plants[plantIndex].PlantName || 'पौधा';
  }

  setRopitSankhyaInput(applicationNumber: string, plantIndex: number, value: number) {
    if (!this.ropitSankhyaInputs[applicationNumber]) {
      this.ropitSankhyaInputs[applicationNumber] = {};
    }
    this.ropitSankhyaInputs[applicationNumber][plantIndex] = value;
  }

  onPlantInputChange(event: any, applicationNumber: string, plantIndex: number) {
    const value = event.target?.value || event.detail?.value || '';
    let numValue = value ? parseInt(value.toString()) : 0;
    
    // Get TotalTree for validation
    const totalTree = this.getPlantTotalTree(applicationNumber, plantIndex);
    
    // If value exceeds TotalTree, cap it to TotalTree
    if (numValue > totalTree && totalTree > 0) {
      numValue = totalTree;
      // Update the input field to show the capped value
      if (event.target) {
        event.target.value = totalTree;
      }
      const plantName = this.getPlantName(applicationNumber, plantIndex);
      this.showToast(
        `${plantName}: रोपित संख्या कुल पौधों (${totalTree}) से अधिक नहीं हो सकती`,
        'short'
      );
    }
    
    this.setRopitSankhyaInput(applicationNumber, plantIndex, numValue);
    this.cdRef.detectChanges();
  }

  async showToast(message: string, duration: 'short' | 'long' = 'short') {
    await Toast.show({
      text: message,
      duration: duration,
      position: 'bottom',
    });
  }

  goBack() {
    this.router.navigate(['officers-dashboard-ro']);
  }
}

