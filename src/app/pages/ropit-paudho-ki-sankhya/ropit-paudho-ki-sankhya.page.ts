import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonInput, IonCard, IonCardContent,
  IonRow, IonCol, IonLoading, IonIcon, IonText
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
} from './RopitAwedanModels';
import Swal from 'sweetalert2';
// import { IonicModule } from "@ionic/angular";

@Component({
  selector: 'app-ropit-paudho-ki-sankhya',
  templateUrl: './ropit-paudho-ki-sankhya.page.html',
  styleUrls: ['./ropit-paudho-ki-sankhya.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule,
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonButton, IonInput, IonCard, IonCardContent,
    IonRow, IonCol, IonLoading, IonIcon,
    // IonicModule
  ]
})
export class RopitPaudhoKiSankhyaPage implements OnInit {

  showLoading(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissLoading() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }
  reloadPage() {
    this.loadData(this.currentPage);
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
        console.log('Ropit Kisan Awedan Response:', response);
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



  async addPlantRow(applicationNumber: string, plantId: number, qty: any, maxPit: any = 0) {

    const totalRopit = Number(qty);
    const pitLimit = Number(maxPit || 0);

    if (!totalRopit || totalRopit <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'अमान्य संख्या',
        text: 'कृपया सही पौध संख्या दर्ज करें',
        confirmButtonText: 'ठीक है'
      });
      return;
    }

    if (totalRopit > pitLimit) {
      Swal.fire({
        icon: 'error',
        title: 'सीमा पार',
        text: `रोपित पौधों की संख्या गड्ढों की संख्या (${pitLimit}) से अधिक नहीं हो सकती।`,
        confirmButtonText: 'ठीक है',
        heightAuto: false
      });
      return;
    }

    const result = await Swal.fire({
      title: 'क्या आप सुनिश्चित हैं?',
      text: `आवेदन ${applicationNumber} के लिए ${totalRopit} पौधों की संख्या दर्ज करें?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'हाँ, दर्ज करें',
      cancelButtonText: 'नहीं',
      heightAuto: false
    });

    if (!result.isConfirmed) {
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'दर्ज किया जा रहा है...';

    const payload = {
      applicationNumber,
      plantId,
      totalRopit
    };

    this.apiService.addRopitPlant(payload).subscribe({
      next: async (res: any) => {
        await this.dismissLoading();

        if (res?.response?.code === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success ',
            text: 'पौधे सफलतापूर्वक जोड़े गए',
            confirmButtonText: 'ठीक है'
          }).then(() => this.reloadPage());
        } else {
          Swal.fire({
            icon: 'error',
            title: 'असफल',
            text: res?.response?.msg || 'कुछ गलत हो गया',
            confirmButtonText: 'ठीक है'
          });
        }
      },
      error: async (err: any) => {
        await this.dismissLoading();
        Swal.fire({
          icon: 'error',
          title: 'त्रुटि',
          text: err?.error?.response?.msg || 'सर्वर त्रुटि हुई',
          confirmButtonText: 'ठीक है'
        });
      }
    });
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

