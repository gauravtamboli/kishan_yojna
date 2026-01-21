import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonButton, IonIcon
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { downloadOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { Toast } from '@capacitor/toast';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { GoswaraReportModel, PlantType, PlantData } from './GoswaraResponseForReport.modal';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-goswara-report',
  templateUrl: './goswara-report.page.html',
  styleUrls: ['./goswara-report.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonButton, IonIcon, CommonModule, FormsModule
  ]
})
export class GoswaraReportPage implements OnInit {
  reportData: GoswaraReportModel[] = [];
  plantTypes: PlantType[] = [];
  isLoading = false;
  loadingMessage = 'कृपया प्रतीक्षा करें.....';
  isCircleLevel: boolean = false; // Flag to track if it's Circle level (no Range column)
  isAllCirclesLevel: boolean = false; // Flag to track if it's All Circles level (designation 7)
  
  // For All Circles report (designation 7)
  allCirclesData: any[] = []; // Array of circles, each containing divisions
  
  // Totals for each plant type (vertical sums)
  plantTotals: { [plantId: string]: PlantData } = {};
  
  // Overall total (Mahayog)
  overallTotals: PlantData = {
    farmersCount: 0,
    area: 0,
    plantsCount: 0,
    plantedCount: 0
  };

  constructor(
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private location: Location
  ) {
    addIcons({ downloadOutline });
  }

  ngOnInit(): void {
    this.loadReport();
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

  private toNumber(value: any): number {
    if (value == null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const s = String(value).replace(/,/g, '').trim();
    if (s === '') return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  calculateTotals() {
    // Initialize plant totals
    this.plantTotals = {};
    this.overallTotals = {
      farmersCount: 0,
      area: 0,
      plantsCount: 0,
      plantedCount: 0
    };

    // Initialize totals for each plant type
    this.plantTypes.forEach(plant => {
      this.plantTotals[plant.id.toString()] = {
        farmersCount: 0,
        area: 0,
        plantsCount: 0,
        plantedCount: 0
      };
    });

    // Calculate totals from report data
    this.reportData.forEach(row => {
      if (row.plants) {
        Object.keys(row.plants).forEach(plantId => {
          const plantData = row.plants![plantId];
          if (this.plantTotals[plantId]) {
            this.plantTotals[plantId].farmersCount += this.toNumber(plantData.farmersCount);
            this.plantTotals[plantId].area += this.toNumber(plantData.area);
            this.plantTotals[plantId].plantsCount += this.toNumber(plantData.plantsCount);
            this.plantTotals[plantId].plantedCount += this.toNumber(plantData.plantedCount);
          }
        });
      }

      // Add to overall totals (Mahayog)
      if (row.totalFarmers !== undefined) {
        this.overallTotals.farmersCount += this.toNumber(row.totalFarmers);
      }
      if (row.totalArea !== undefined) {
        this.overallTotals.area += this.toNumber(row.totalArea);
      }
      if (row.totalPlants !== undefined) {
        this.overallTotals.plantsCount += this.toNumber(row.totalPlants);
      }
      if (row.totalPlanted !== undefined) {
        this.overallTotals.plantedCount += this.toNumber(row.totalPlanted);
      }
    });
  }

  getPlantDataForRow(row: GoswaraReportModel, plantId: number): PlantData {
    if (!row.plants || !row.plants[plantId.toString()]) {
      return {
        farmersCount: 0,
        area: 0,
        plantsCount: 0,
        plantedCount: 0
      };
    }
    return row.plants[plantId.toString()];
  }

  getPlantTotal(plantId: number): PlantData {
    const id = plantId.toString();
    return this.plantTotals[id] || {
      farmersCount: 0,
      area: 0,
      plantsCount: 0,
      plantedCount: 0
    };
  }

  // Calculate totals for All Circles report
  calculateAllCirclesTotals() {
    // Initialize plant totals
    this.plantTotals = {};
    this.overallTotals = {
      farmersCount: 0,
      area: 0,
      plantsCount: 0,
      plantedCount: 0
    };

    // Initialize totals for each plant type
    this.plantTypes.forEach(plant => {
      this.plantTotals[plant.id.toString()] = {
        farmersCount: 0,
        area: 0,
        plantsCount: 0,
        plantedCount: 0
      };
    });

    // Calculate totals from all circles data
    this.allCirclesData.forEach(circle => {
      if (circle.divisions && Array.isArray(circle.divisions)) {
        circle.divisions.forEach((division: any) => {
          if (division.plants) {
            Object.keys(division.plants).forEach(plantId => {
              const plantData = division.plants[plantId];
              if (this.plantTotals[plantId]) {
                this.plantTotals[plantId].farmersCount += this.toNumber(plantData.farmersCount);
                this.plantTotals[plantId].area += this.toNumber(plantData.area);
                this.plantTotals[plantId].plantsCount += this.toNumber(plantData.plantsCount);
                this.plantTotals[plantId].plantedCount += this.toNumber(plantData.plantedCount);
              }
            });
          }
        });
      }

      // Add circle totals to overall totals
      this.overallTotals.farmersCount += this.toNumber(circle.totalFarmers);
      this.overallTotals.area += this.toNumber(circle.totalArea);
      this.overallTotals.plantsCount += this.toNumber(circle.totalPlants);
      this.overallTotals.plantedCount += this.toNumber(circle.totalPlanted);
    });
  }

  // Get plant data for division row
  getPlantDataForDivision(division: any, plantId: number): PlantData {
    if (!division.plants || !division.plants[plantId.toString()]) {
      return {
        farmersCount: 0,
        area: 0,
        plantsCount: 0,
        plantedCount: 0
      };
    }
    return division.plants[plantId.toString()];
  }

  // Calculate totals for a specific circle
  calculateCircleTotals(circle: any): { [plantId: string]: PlantData } {
    const circlePlantTotals: { [plantId: string]: PlantData } = {};
    
    // Initialize totals for each plant type
    this.plantTypes.forEach(plant => {
      circlePlantTotals[plant.id.toString()] = {
        farmersCount: 0,
        area: 0,
        plantsCount: 0,
        plantedCount: 0
      };
    });

    // Calculate totals from divisions
    if (circle.divisions && Array.isArray(circle.divisions)) {
      circle.divisions.forEach((division: any) => {
        if (division.plants) {
          Object.keys(division.plants).forEach(plantId => {
            const plantData = division.plants[plantId];
            if (circlePlantTotals[plantId]) {
              circlePlantTotals[plantId].farmersCount += this.toNumber(plantData.farmersCount);
              circlePlantTotals[plantId].area += this.toNumber(plantData.area);
              circlePlantTotals[plantId].plantsCount += this.toNumber(plantData.plantsCount);
              circlePlantTotals[plantId].plantedCount += this.toNumber(plantData.plantedCount);
            }
          });
        }
      });
    }

    return circlePlantTotals;
  }

  loadReport() {
    this.showLoading('डेटा लोड हो रहा है...');
    const storedData = sessionStorage.getItem('logined_officer_data');
    let designation = "";
    let devisionIdStr = "";
    let rangIdStr = "";
    let subDivIdStr = "";
    let circleIdStr = "";

    if (storedData) {
      const officerData = JSON.parse(storedData);
      designation = officerData.designation_name || officerData.designation;
      rangIdStr = officerData.rang_id;
      devisionIdStr = officerData.devision_id || officerData.division_id;
      subDivIdStr = officerData.sub_div_id;
      circleIdStr = officerData.circle_id;
    }

    let divisionId = Number(devisionIdStr);
    let rangId = Number(rangIdStr);
    let sdoId = Number(subDivIdStr);
    let circleId = Number(circleIdStr);
    let designationNum = Number(designation);

    // Check for designation 7 (All Circles - Head level)
    if (designationNum === 7 || designation === 'APCCF') {
      this.isAllCirclesLevel = true;
      this.isCircleLevel = false;
      this.apiService.getGoswaraReportAllCircles().subscribe({
        next: (res: any) => {
          if (res?.response?.code === 200) {
            this.allCirclesData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.calculateAllCirclesTotals();
            this.dismissLoading();
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.msg || res?.response?.message || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('API Error (All Circles):', err);
          this.dismissLoading();
          this.showToast('डेटा लोड करने में त्रुटि हुई।');
        }
      });
    }
    // Check for Circle designation (designation "1" or designation_name contains "Circle" or "CFO")
    // Also handle Supreme Hierarchy (designation "6")
    else if ((designation === "1" || designation === 'Circle' || designation === 'CFO' || designationNum === 6) && circleId > 0) {
      this.isAllCirclesLevel = false;
      this.isCircleLevel = true;
      this.apiService.getGoswaraReportCircle(circleId).subscribe({
        next: (res: any) => {
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.calculateTotals();
            this.dismissLoading();
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.message || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('API Error (Circle):', err);
          this.dismissLoading();
          this.showToast('डेटा लोड करने में त्रुटि हुई।');
        }
      });
    } else if (designation === 'DFO' && divisionId > 0) {
      this.isAllCirclesLevel = false;
      this.isCircleLevel = false;
      //debugger;
      this.apiService.getGoswaraReport(divisionId, undefined, undefined).subscribe({
        next: (res: any) => {
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.calculateTotals();
            this.dismissLoading();
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.message || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('API Error (Division):', err);
          this.dismissLoading();
          this.showToast('डेटा लोड करने में त्रुटि हुई।');
        }
      });
    } else if (designation === 'RO' && rangId > 0) {
      this.isAllCirclesLevel = false;
      this.isCircleLevel = false;
      // //debugger;
      //debugger;
      this.apiService.getGoswaraReport(undefined, rangId, undefined).subscribe({

        next: (res: any) => {
          if (res?.response?.code === 200) {
            console.log(res);
            this.reportData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.calculateTotals();
            this.dismissLoading();
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.message || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('API Error (Range):', err);
          this.dismissLoading();
          this.showToast('डेटा लोड करने में त्रुटि हुई।');
        }
      });
    } else if ((designation === 'SDO' || designation === '3') && sdoId > 0) {
      this.isAllCirclesLevel = false;
      this.isCircleLevel = false;
      //debugger;
      this.apiService.getGoswaraReport(undefined, undefined, sdoId).subscribe({
        next: (res: any) => {
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.calculateTotals();
            this.dismissLoading();
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.message || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          console.error('API Error (SDO):', err);
          this.dismissLoading();
          this.showToast('डेटा लोड करने में त्रुटि हुई।');
        }
      });
    } else {
      this.isAllCirclesLevel = false;
      this.isCircleLevel = false;
      console.error('Invalid designation or ID:', { designation, divisionId, rangId, circleId });
      this.dismissLoading();
      this.showToast('अमान्य उपयोगकर्ता या डेटा।');
    }
  }

  exportToExcel(): void {
    // For All Circles, export all tables
    if (this.isAllCirclesLevel) {
      // You can implement multi-sheet export here if needed
      const tableElements = document.querySelectorAll('.circle-report-table');
      if (tableElements.length === 0) {
        this.showToast('एक्सेल निर्यात में त्रुटि हुई।');
        return;
      }
      
      const workbook: XLSX.WorkBook = {
        Sheets: {},
        SheetNames: []
      };

      tableElements.forEach((tableElement, index) => {
        const circleName = this.allCirclesData[index]?.circleName || `Circle_${index + 1}`;
        const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });
        workbook.Sheets[circleName] = worksheet;
        workbook.SheetNames.push(circleName);
      });

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      FileSaver.saveAs(blob, 'Goswara_Report_All_Circles.xlsx');
      this.showToast('एक्सेल फ़ाइल डाउनलोड की गई।');
    } else {
      const tableElement = document.getElementById('report-table');
      if (!tableElement) {
        this.showToast('एक्सेल निर्यात में त्रुटि हुई।');
        return;
      }

      const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });
      const workbook: XLSX.WorkBook = {
        Sheets: { 'गोस्वारा रिपोर्ट': worksheet },
        SheetNames: ['गोस्वारा रिपोर्ट']
      };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob: Blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      FileSaver.saveAs(blob, 'Goswara_Report.xlsx');
      this.showToast('एक्सेल फ़ाइल डाउनलोड की गई।');
    }
  }
}