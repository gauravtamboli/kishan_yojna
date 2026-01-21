import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonButton, IonIcon, IonSpinner, IonSelect, IonSelectOption, IonItem, IonLabel,
  IonGrid, IonRow, IonCol, IonInput
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { searchOutline, downloadOutline, documentOutline, arrowUpOutline, arrowDownOutline, swapVerticalOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { Toast } from '@capacitor/toast';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { DivisionReportWithVillageModel, DivisionReportWithVillageResponse, PlantMasterModel } from './DivisionReportWithVillage.model';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-gaon-var-goswara',
  templateUrl: './gaon-var-goswara.page.html',
  styleUrls: ['./gaon-var-goswara.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonButton, IonIcon, IonSpinner, IonSelect, IonSelectOption, IonLabel,
    IonGrid, IonRow, IonCol, IonInput,
    CommonModule, FormsModule
]
})
export class GaonVarGoswaraPage implements OnInit {
  reportData: DivisionReportWithVillageModel[] = [];
  filteredReportData: DivisionReportWithVillageModel[] = [];
  originalReportData: DivisionReportWithVillageModel[] = [];
  plants: PlantMasterModel[] = [];
  selectedPlantId: number | null = null;
  isLoading = false;
  loadingMessage = 'कृपया प्रतीक्षा करें.....';
  divisionId: number | null = null;
  rangeId: number | null = null;
  subDivisionId: number | null = null;
  designation: number | null = null;
  searchText: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private location: Location
  ) {
    addIcons({ 
      searchOutline, 
      downloadOutline, 
      documentOutline,
      arrowUpOutline,
      arrowDownOutline,
      'swap-vertical-outline': swapVerticalOutline
    });
  }

  ngOnInit(): void {
    this.getOfficerData();
    this.loadPlants();
  }

  getOfficerData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      const officerData = JSON.parse(storedData);
      this.designation = Number(officerData.designation);
      this.divisionId = Number(officerData.devision_id || officerData.division_id);
      this.rangeId = Number(officerData.rang_id || officerData.range_id);
      this.subDivisionId = Number(officerData.sub_div_id || officerData.sdo_id);
    }
  }

  loadPlants() {
    this.showLoading('पौधों की सूची लोड हो रही है...');
    this.apiService.getPlantMaster().subscribe({
      next: (res: any) => {
        if (res?.response?.code === 200 && res?.data) {
          this.plants = res.data;
          this.dismissLoading();
        } else {
          this.dismissLoading();
          this.showToast(res?.response?.msg || 'पौधों की सूची उपलब्ध नहीं है।');
        }
      },
      error: (err: any) => {
        console.error('Error loading plants:', err);
        this.dismissLoading();
        this.showToast('पौधों की सूची लोड करने में त्रुटि हुई।');
      }
    });
  }

  searchReport() {
    if (!this.selectedPlantId) {
      this.showToast('कृपया एक पौधा चुनें।');
      return;
    }

    this.showLoading('रिपोर्ट लोड हो रही है...');

    // Check designation and call appropriate API
    if (this.designation === 2) {
      // DFO - use divisionId
      if (!this.divisionId || this.divisionId <= 0) {
        this.showToast('विभाजन ID उपलब्ध नहीं है।');
        this.dismissLoading();
        return;
      }
      
      this.apiService.getDivisionReportWithVillage(this.divisionId, this.selectedPlantId).subscribe({
        next: (res: DivisionReportWithVillageResponse) => {
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.originalReportData = res.data || [];
            this.filteredReportData = res.data || [];
            this.searchText = '';
            this.sortColumn = '';
            this.sortDirection = 'asc';
            this.dismissLoading();
            if (this.reportData.length === 0) {
              this.showToast('कोई डेटा उपलब्ध नहीं है।');
            }
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.msg || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('Error fetching report:', err);
          this.dismissLoading();
          this.showToast('रिपोर्ट लोड करने में त्रुटि हुई।');
        }
      });
    } else if (this.designation === 3) {
      // SDO - use subDivisionId
      if (!this.subDivisionId || this.subDivisionId <= 0) {
        this.showToast('उप-विभाजन ID उपलब्ध नहीं है।');
        this.dismissLoading();
        return;
      }
      
      this.apiService.getSubDivisionReportWithVillage(this.subDivisionId, this.selectedPlantId).subscribe({
        next: (res: DivisionReportWithVillageResponse) => {
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.originalReportData = res.data || [];
            this.filteredReportData = res.data || [];
            this.searchText = '';
            this.sortColumn = '';
            this.sortDirection = 'asc';
            this.dismissLoading();
            if (this.reportData.length === 0) {
              this.showToast('कोई डेटा उपलब्ध नहीं है।');
            }
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.msg || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('Error fetching report:', err);
          this.dismissLoading();
          this.showToast('रिपोर्ट लोड करने में त्रुटि हुई।');
        }
      });
    } else if (this.designation === 4) {
      // RO - use rangeId
      if (!this.rangeId || this.rangeId <= 0) {
        this.showToast('परिक्षेत्र ID उपलब्ध नहीं है।');
        this.dismissLoading();
        return;
      }
      
      this.apiService.getRangeReportWithVillage(this.rangeId, this.selectedPlantId).subscribe({
        next: (res: DivisionReportWithVillageResponse) => {
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.originalReportData = res.data || [];
            this.filteredReportData = res.data || [];
            this.searchText = '';
            this.sortColumn = '';
            this.sortDirection = 'asc';
            this.dismissLoading();
            if (this.reportData.length === 0) {
              this.showToast('कोई डेटा उपलब्ध नहीं है।');
            }
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.msg || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('Error fetching report:', err);
          this.dismissLoading();
          this.showToast('रिपोर्ट लोड करने में त्रुटि हुई।');
        }
      });
    } else {
      this.dismissLoading();
      this.showToast('अमान्य उपयोगकर्ता।');
    }
  }

  exportToExcel(): void {
    if (!this.reportData || this.reportData.length === 0) {
      this.showToast('निर्यात के लिए कोई डेटा उपलब्ध नहीं है।');
      return;
    }

    const exportData = this.reportData.map((item, index) => ({
      'क्र.': index + 1,
      'विभाजन': item.divName || '-',
      'उप-विभाजन': item.subDivisionName || '-',
      'परिक्षेत्र': item.rangeName || '-',
      'गाँव का नाम': item.villageName || '-',
      'पौधा': item.plantName || '-',
      'कुल किसान': item.totalFarmers || 0,
      'कुल रकबा': item.totalArea || 0,
      'कुल पौधे': item.totalPlants || 0,
      'रोपित पौधे': item.totalPlanted || 0
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'गाँव वार गोस्वारा रिपोर्ट': worksheet },
      SheetNames: ['गाँव वार गोस्वारा रिपोर्ट']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(blob, 'Gaon_Var_Goswara_Report.xlsx');
    this.showToast('एक्सेल फ़ाइल डाउनलोड की गई।');
  }

  showLoading(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissLoading() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  async showToast(msg: string) {
    await Toast.show({ text: msg, duration: 'short', position: 'bottom' });
  }

  goBack() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      const officerData = JSON.parse(storedData);
      const designation = Number(officerData.designation);
      if (designation === 2) {
        // DFO
        this.router.navigateByUrl('/officers-dashboard', { replaceUrl: true });
      } else if (designation === 3) {
        // SDO
        this.router.navigateByUrl('/officers-dashboard-sdo', { replaceUrl: true });
      } else if (designation === 4) {
        // RO
        this.router.navigateByUrl('/officers-dashboard-ro', { replaceUrl: true });
      } else {
        this.location.back();
      }
    } else {
      this.location.back();
    }
  }

  getSelectedPlantName(): string {
    if (!this.selectedPlantId || !this.plants || this.plants.length === 0) {
      return 'पौधा चुनें';
    }
    const selectedPlant = this.plants.find(p => p.id === this.selectedPlantId);
    return selectedPlant?.plantName || 'पौधा चुनें';
  }

  onSearchTextChanged() {
    const value = (this.searchText || '').toLowerCase().trim();
    
    if (!value) {
      this.filteredReportData = [...this.originalReportData];
      this.applySorting();
      return;
    }

    this.filteredReportData = this.originalReportData.filter(item =>
      (item.divName || '').toLowerCase().includes(value) ||
      (item.subDivisionName || '').toLowerCase().includes(value) ||
      (item.rangeName || '').toLowerCase().includes(value) ||
      (item.villageName || '').toLowerCase().includes(value) ||
      (item.plantName || '').toLowerCase().includes(value) ||
      (item.totalFarmers || 0).toString().includes(value) ||
      (item.totalArea || 0).toString().includes(value) ||
      (item.totalPlants || 0).toString().includes(value) ||
      (item.totalPlanted || 0).toString().includes(value)
    );
    this.applySorting();
  }

  sortTable(column: string) {
    // If clicking the same column, toggle direction
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting();
  }

  applySorting() {
    if (!this.sortColumn) {
      return;
    }

    this.filteredReportData = [...this.filteredReportData].sort((a, b) => {
      let aValue: number = 0;
      let bValue: number = 0;

      switch (this.sortColumn) {
        case 'totalFarmers':
          aValue = a.totalFarmers || 0;
          bValue = b.totalFarmers || 0;
          break;
        case 'totalArea':
          aValue = a.totalArea || 0;
          bValue = b.totalArea || 0;
          break;
        case 'totalPlants':
          aValue = a.totalPlants || 0;
          bValue = b.totalPlants || 0;
          break;
        default:
          return 0;
      }

      if (this.sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return 'swap-vertical-outline';
    }
    return this.sortDirection === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline';
  }

  isColumnSorted(column: string): boolean {
    return this.sortColumn === column;
  }

  getTotalFarmers(): number {
    return this.filteredReportData.reduce((sum, item) => sum + (item.totalFarmers || 0), 0);
  }

  getTotalArea(): number {
    return this.filteredReportData.reduce((sum, item) => sum + (item.totalArea || 0), 0);
  }

  getTotalPlants(): number {
    return this.filteredReportData.reduce((sum, item) => sum + (item.totalPlants || 0), 0);
  }

  getTotalPlanted(): number {
    return this.filteredReportData.reduce((sum, item) => sum + (item.totalPlanted || 0), 0);
  }
}

