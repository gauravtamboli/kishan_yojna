import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonInput, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonRow, IonCol, IonGrid, IonLoading, IonText, IonItem, IonBadge
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { Toast } from '@capacitor/toast';
import { 
  YearTwoPlantResponse, 
  PlantDataWithYearTwoResponseModel,
  SubmitPlantRequestYearTwoModel,
  PlantRequestYearTwoItem
} from './YearTwoPlantResponse.model';

@Component({
  selector: 'app-year-two-plant-entry',
  templateUrl: './year-two-plant-entry.page.html',
  styleUrls: ['./year-two-plant-entry.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonButton, IonInput, IonLabel, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonRow, IonCol, IonGrid, IonLoading, IonText, IonItem, IonBadge
  ]
})
export class YearTwoPlantEntryPage implements OnInit {
  isLoading: boolean = false;
  loadingMessage: string = 'कृपया प्रतीक्षा करें.....';
  
  applicationNumber: string = '';
  plants: PlantDataWithYearTwoResponseModel[] = [];
  
  // Store input values: { plant_id: plants_remaining_two }
  plantInputs: { [plantId: number]: number | null } = {};
  
  // Track if current user is Range Officer (RO)
  isRangeOfficer: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Check if user is Range Officer
    this.isRangeOfficer = this.isRODesignation();
    
    this.route.params.subscribe(params => {
      if (params['applicationNumber']) {
        this.applicationNumber = params['applicationNumber'];
        this.loadPlantData();
      } else {
        // Try query params as fallback
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['applicationNumber']) {
            this.applicationNumber = queryParams['applicationNumber'];
            this.loadPlantData();
          }
        });
      }
    });
  }

  onPlantInputChange(plantId: number, event: any) {
    const value = event.target.value;
    if (value && value !== '') {
      const numValue = Number(value);
      this.plantInputs[plantId] = isNaN(numValue) ? null : numValue;
    } else {
      this.plantInputs[plantId] = null;
    }
    this.cdRef.detectChanges();
  }

  loadPlantData() {
    if (!this.applicationNumber) {
      this.showToast('आवेदन नंबर उपलब्ध नहीं है', 'long');
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'पौधों की जानकारी लोड हो रही है...';

    this.apiService.getPlantRequestsWithYearTwo(this.applicationNumber).subscribe(
      (response: YearTwoPlantResponse) => {
        this.isLoading = false;
        
        if (response.response.code === 200) {
          this.plants = response.data || [];
          
          // Initialize input values only for plants without year 2 data
          this.plants.forEach(plant => {
            if (!plant.has_year2_data) {
              this.plantInputs[plant.plant_id] = null;
            }
            // Don't populate input for plants that already have year 2 data
          });
          
          this.cdRef.detectChanges();
        } else {
          this.showToast(response.response.msg, 'long');
        }
      },
      (error) => {
        this.isLoading = false;
        this.showToast('डेटा लोड करने में त्रुटि: ' + error, 'long');
      }
    );
  }

  getMaxPlants(plant: PlantDataWithYearTwoResponseModel): number {
    return plant.total_ropit;
  }

  validateInput(plant: PlantDataWithYearTwoResponseModel): boolean {
    const value = this.plantInputs[plant.plant_id];
    if (value === null || value === undefined) {
      return false;
    }
    if (value < 0) {
      return false;
    }
    if (value > plant.total_ropit) {
      return false;
    }
    return true;
  }

  canSubmit(): boolean {
    // Only RO can submit
    if (!this.isRangeOfficer) {
      return false;
    }
    
    // Check if all plants without year 2 data have valid inputs
    const plantsNeedingData = this.plants.filter(p => !p.has_year2_data);
    
    if (plantsNeedingData.length === 0) {
      return false; // All plants already have data
    }

    return plantsNeedingData.every(plant => {
      const value = this.plantInputs[plant.plant_id];
      return value !== null && value !== undefined && value >= 0 && value <= plant.total_ropit;
    });
  }

  calculateSurvivalPercentage(plant: PlantDataWithYearTwoResponseModel): number | null {
    const remaining = this.plantInputs[plant.plant_id];
    if (remaining === null || remaining === undefined || plant.total_ropit === 0) {
      return null;
    }
    return Math.round((remaining / plant.total_ropit) * 100 * 100) / 100; // Round to 2 decimal places
  }

  async submitData() {
    // Check if user is Range Officer
    if (!this.isRangeOfficer) {
      this.showToast('केवल परिक्षेत्र अधिकारी (RO) ही डेटा सबमिट कर सकते हैं', 'long');
      return;
    }
    
    if (!this.canSubmit()) {
      this.showToast('कृपया सभी पौधों के लिए वैध डेटा दर्ज करें', 'long');
      return;
    }

    const officersLoginModel = this.getOfficersSessionData();
    if (!officersLoginModel) {
      this.showToast('अधिकारी जानकारी उपलब्ध नहीं है', 'long');
      return;
    }

    // Prepare plants that need to be submitted (only those without year 2 data)
    // Match backend structure: each item needs application_number and create_by
    const plantsToSubmit: PlantRequestYearTwoItem[] = this.plants
      .filter(plant => !plant.has_year2_data)
      .map(plant => ({
        plant_id: plant.plant_id,
        application_number: this.applicationNumber,
        plant_request_new_id: plant.id,
        plants_remaining_two: this.plantInputs[plant.plant_id]!,
        create_by: officersLoginModel.rang_id.toString()
      }));

    if (plantsToSubmit.length === 0) {
      this.showToast('कोई नया डेटा दर्ज नहीं किया गया', 'long');
      return;
    }

    const request: SubmitPlantRequestYearTwoModel = {
      plants: plantsToSubmit
    };

    this.isLoading = true;
    this.loadingMessage = 'डेटा सबमिट हो रहा है...';

    this.apiService.submitYearTwoPlants(request).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.response?.code === 200) {
          this.showToast(response.response.msg || 'डेटा सफलतापूर्वक सबमिट किया गया', 'long');
          // Reload data to show updated values
          this.loadPlantData();
        } else {
          this.showToast(response.response?.msg || 'त्रुटि', 'long');
        }
      },
      (error) => {
        this.isLoading = false;
        this.showToast('सबमिट करने में त्रुटि: ' + error, 'long');
      }
    );
  }

  getOfficersSessionData(): OfficersLoginResponseModel | null {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  isRODesignation(): boolean {
    const officersLoginModel = this.getOfficersSessionData();
    return officersLoginModel?.designation === "4";
  }

  async showToast(msg: string, duration: 'short' | 'long' = 'short') {
    await Toast.show({
      text: msg,
      duration: duration,
      position: 'bottom',
    });
  }

  goBack() {
    this.router.navigate(['/year-two-dashboard']);
  }
}

