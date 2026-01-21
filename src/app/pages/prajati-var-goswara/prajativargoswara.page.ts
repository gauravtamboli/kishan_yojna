import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonCard, IonCardContent, IonButton, IonIcon, IonSpinner, IonSelect, IonSelectOption, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { downloadOutline } from 'ionicons/icons';
import { ApiService } from '../../services/api.service';
import { Toast } from '@capacitor/toast';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PrajativargoswaraReportModel, PlantType, PrajatiPlantData } from './PrajativargoswaraResponseForReport.modal';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-prajativargoswara',
  templateUrl: './prajativargoswara.page.html',
  styleUrls: ['./prajativargoswara.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonButton, IonIcon, IonSpinner, IonSelect, IonSelectOption,
    CommonModule, FormsModule
]
})
export class PrajativargoswaraPage implements OnInit {
  reportData: PrajativargoswaraReportModel[] = [];
  plantTypes: PlantType[] = [];
  isLoading = false;
  loadingMessage = 'कृपया प्रतीक्षा करें.....';
  selectedPlantFilter: number | 'all' = 'all'; // Filter by plant species

  // Select options for better UI
  selectOptions = {
    header: 'प्रजाति चुनें',
    cssClass: 'custom-select-popover'
  };

  // Processed data grouped by Division-Range for UI display
  processedData: { [divisionRange: string]: any } = {};

  // Store mahaYog from API response
  mahaYog: any = null;

  // Store totalFarmers from backend for combined plants (981 -> 98, 991 -> 99)
  // Structure: { [divisionRangeKey]: { [combinedPlantId]: totalFarmers } }
  combinedPlantTotalFarmers: { [divisionRangeKey: string]: { [combinedPlantId: number]: number } } = {};

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

  // Get plant data for a specific row and plant
  getPlantDataForRow(row: PrajativargoswaraReportModel, plantId: number): PrajatiPlantData {
    if (!row.plants || !row.plants[plantId.toString()]) {
      return {
        lessFarmers: 0,
        lessArea: 0,
        lessPlants: 0,
        moreFarmers: 0,
        moreArea: 0,
        morePlants: 0
      };
    }
    return row.plants[plantId.toString()];
  }

  // Process report data into division/range grouped structure
  processReportData() {
    this.processedData = {};
    this.combinedPlantTotalFarmers = {}; // Reset combined plant totals
    
    // console.log('')
    // console.log('reportData', this.reportData);
    this.reportData.forEach(row => {
      const key = `${row.divisionName || ''}_${row.rangName || ''}`;
      
      if (!this.processedData[key]) {
        this.processedData[key] = {
          
          circleName: row.circleName || '-',
          // distName: row.distName || '-',
          distName: row['distName'] || '-', 
          divisionName: row.divisionName || '-',
          rangName: row.rangName || '-',
          plants: {}
        };
        
      }

      // Initialize combined plant totals for this division/range
      if (!this.combinedPlantTotalFarmers[key]) {
        this.combinedPlantTotalFarmers[key] = {};
      }
      
      // Merge plant data for this division/range
      if (row.plants) {
        Object.keys(row.plants).forEach(plantId => {
          const plantData: any = row.plants![plantId];
          
          // Extract totalFarmers from special plant IDs 981 and 991 per division
          // These have a different structure with only totalFarmers property
          if (plantId === '981' && plantData.totalFarmers !== undefined) {
            this.combinedPlantTotalFarmers[key][98] = this.toNumber(plantData.totalFarmers);
          } else if (plantId === '991' && plantData.totalFarmers !== undefined) {
            this.combinedPlantTotalFarmers[key][99] = this.toNumber(plantData.totalFarmers);
          }
          
          // Skip processing 981 and 991 as regular plants
          if (plantId === '981' || plantId === '991') {
            return;
          }
          
          if (!this.processedData[key].plants[plantId]) {
            this.processedData[key].plants[plantId] = {
              lessFarmers: 0,
              lessArea: 0,
              lessPlants: 0,
              moreFarmers: 0,
              moreArea: 0,
              morePlants: 0
            };
          }
          
          const existing = this.processedData[key].plants[plantId];
          existing.lessFarmers += this.toNumber(plantData.lessFarmers);
          existing.lessArea += this.toNumber(plantData.lessArea);
          existing.lessPlants += this.toNumber(plantData.lessPlants);
          existing.moreFarmers += this.toNumber(plantData.moreFarmers);
          existing.moreArea += this.toNumber(plantData.moreArea);
          existing.morePlants += this.toNumber(plantData.morePlants);
        });
      }
    });

    // Convert to array and add totals
    const processedArray = Object.values(this.processedData).map((item: any) => {
      const totals = {
        lessFarmers: 0,
        lessArea: 0,
        lessPlants: 0,
        moreFarmers: 0,
        moreArea: 0,
        morePlants: 0,
        totalFarmers: 0,
        totalArea: 0,
        totalPlants: 0
      };

      Object.values(item.plants).forEach((plant: any) => {
        totals.lessFarmers += this.toNumber(plant.lessFarmers);
        totals.lessArea += this.toNumber(plant.lessArea);
        totals.lessPlants += this.toNumber(plant.lessPlants);
        totals.moreFarmers += this.toNumber(plant.moreFarmers);
        totals.moreArea += this.toNumber(plant.moreArea);
        totals.morePlants += this.toNumber(plant.morePlants);
      });

      totals.totalFarmers = totals.lessFarmers + totals.moreFarmers;
      totals.totalArea = totals.lessArea + totals.moreArea;
      totals.totalPlants = totals.lessPlants + totals.morePlants;

      return { ...item, totals };
    });

    this.processedData = {};
    processedArray.forEach((item: any) => {
      const key = `${item.divisionName}_${item.rangName}`;
      this.processedData[key] = item;
    });
  }

  // Get processed division data for a plant
  getPlantDivisions(plantId: number): any[] {
    // Skip combined plant IDs (98, 99) - they should only appear in combination tables
    if (this.isCombinedPlantId(plantId)) {
      return [];
    }

    const divisions: any[] = [];
    
    // Iterate through all divisions in processedData
    // This ensures all divisions appear even if this plant has no data
    Object.values(this.processedData).forEach((division: any) => {
      // Check if this plant has data for this division
      if (division.plants && division.plants[plantId.toString()]) {
        const plantData = division.plants[plantId.toString()];
        divisions.push({
          circleName: division.circleName,
          distName: division.distName,
          divisionName: division.divisionName,
          rangName: division.rangName,
          lessFarmers: plantData.lessFarmers || 0,
          lessArea: plantData.lessArea || 0,
          lessPlants: plantData.lessPlants || 0,
          moreFarmers: plantData.moreFarmers || 0,
          moreArea: plantData.moreArea || 0,
          morePlants: plantData.morePlants || 0,
          totalFarmers: (plantData.lessFarmers || 0) + (plantData.moreFarmers || 0),
          totalArea: (plantData.lessArea || 0) + (plantData.moreArea || 0),
          totalPlants: (plantData.lessPlants || 0) + (plantData.morePlants || 0)
        });
      } else {
        // Plant has no data for this division, create row with zeros
        divisions.push({
          circleName: division.circleName || '-',
          distName: division.distName || '-',
          divisionName: division.divisionName || '-',
          rangName: division.rangName || '-',
          lessFarmers: 0,
          lessArea: 0,
          lessPlants: 0,
          moreFarmers: 0,
          moreArea: 0,
          morePlants: 0,
          totalFarmers: 0,
          totalArea: 0,
          totalPlants: 0
        });
      }
    });

    // If no processed data exists at all, still return at least one row with zeros
    if (divisions.length === 0) {
      divisions.push({
        circleName: '-',
        distName: '-',
        divisionName: '-',
        rangName: '-',
        lessFarmers: 0,
        lessArea: 0,
        lessPlants: 0,
        moreFarmers: 0,
        moreArea: 0,
        morePlants: 0,
        totalFarmers: 0,
        totalArea: 0,
        totalPlants: 0
      });
    }

    // Add total row only if 'all' is selected (skip when specific species is selected)
    if (this.selectedPlantFilter === 'all') {
      const total = divisions.reduce((acc, div) => ({
        circleName: 'कुल योग',
        distName: '-',
        divisionName: 'कुल योग',
        rangName: '-',
        lessFarmers: acc.lessFarmers + div.lessFarmers,
        lessArea: acc.lessArea + div.lessArea,
        lessPlants: acc.lessPlants + div.lessPlants,
        moreFarmers: acc.moreFarmers + div.moreFarmers,
        moreArea: acc.moreArea + div.moreArea,
        morePlants: acc.morePlants + div.morePlants,
        totalFarmers: 0,
        totalArea: 0,
        totalPlants: 0
      }), {
        lessFarmers: 0, lessArea: 0, lessPlants: 0,
        moreFarmers: 0, moreArea: 0, morePlants: 0
      });

      total.totalFarmers = total.lessFarmers + total.moreFarmers;
      total.totalArea = total.lessArea + total.moreArea;
      total.totalPlants = total.lessPlants + total.morePlants;

      divisions.push(total);
    }

    return divisions;
  }

  // Get combined data for two plants (e.g., Sagon types)
  // Updated to use plant ID 98 (Sagon) or 99 (Bansh) directly from API
  getCombinedPlantData(plantId1: number, plantId2: number): any[] {
    // Check if we should use combined plant ID from API
    let combinedPlantId: number | null = null;
    
    // Map to combined IDs: 2+4 -> 98, 3+5 -> 99
    if ((plantId1 === 2 && plantId2 === 4) || (plantId1 === 4 && plantId2 === 2)) {
      combinedPlantId = 98; // Sagon combination
    } else if ((plantId1 === 3 && plantId2 === 5) || (plantId1 === 5 && plantId2 === 3)) {
      combinedPlantId = 99; // Bansh combination
    }

    // If we have a combined plant ID, use it directly from processedData
    if (combinedPlantId !== null) {
      const combinedMap = new Map<string, any>();
      
      Object.values(this.processedData).forEach((division: any) => {
        const key = `${division.divisionName || ''}_${division.rangName || ''}`;
        
        // Check if combined plant ID exists in this division
        if (division.plants && division.plants[combinedPlantId!.toString()]) {
          const plantData = division.plants[combinedPlantId!.toString()];
          
          if (!combinedMap.has(key)) {
            combinedMap.set(key, {
              circleName: division.circleName || '-',
              distName: division.distName || '-',
              divisionName: division.divisionName || '-',
              rangName: division.rangName || '-',
              lessFarmers: 0,
              lessArea: 0,
              lessPlants: 0,
              moreFarmers: 0,
              moreArea: 0,
              morePlants: 0
            });
          }

          const existing = combinedMap.get(key)!;
          existing.lessFarmers += this.toNumber(plantData.lessFarmers);
          existing.lessArea += this.toNumber(plantData.lessArea);
          existing.lessPlants += this.toNumber(plantData.lessPlants);
          existing.moreFarmers += this.toNumber(plantData.moreFarmers);
          existing.moreArea += this.toNumber(plantData.moreArea);
          existing.morePlants += this.toNumber(plantData.morePlants);
        }
      });

      // Use backend-provided totalFarmers for individual division rows
      const result = Array.from(combinedMap.entries()).map(([divisionKey, item]) => {
        // Check if we have backend totalFarmers for this division
        const divisionTotalFarmers = this.combinedPlantTotalFarmers[divisionKey]?.[combinedPlantId!];
        
        return {
          ...item,
          _divisionKey: divisionKey, // Store division key for total calculation
          totalFarmers: divisionTotalFarmers !== undefined 
            ? divisionTotalFarmers 
            : (item.lessFarmers + item.moreFarmers),
          totalArea: item.lessArea + item.moreArea,
          totalPlants: item.lessPlants + item.morePlants
        };
      });

      // Add total row
      if (result.length > 0) {
        const total = result.reduce((acc, item) => ({
          circleName: 'कुल योग',
          distName: '-',
          divisionName: 'कुल योग',
          rangName: '-',
          lessFarmers: acc.lessFarmers + item.lessFarmers,
          lessArea: acc.lessArea + item.lessArea,
          lessPlants: acc.lessPlants + item.lessPlants,
          moreFarmers: acc.moreFarmers + item.moreFarmers,
          moreArea: acc.moreArea + item.moreArea,
          morePlants: acc.morePlants + item.morePlants,
          totalFarmers: 0,
          totalArea: 0,
          totalPlants: 0
        }), {
          lessFarmers: 0, lessArea: 0, lessPlants: 0,
          moreFarmers: 0, moreArea: 0, morePlants: 0
        });

        // For total row, sum up the backend-provided totalFarmers from all divisions
        // This ensures we use the correct unique farmer count
        const totalBackendFarmers = result.reduce((sum, item: any) => {
          const divisionKey = item._divisionKey;
          const divisionTotalFarmers = this.combinedPlantTotalFarmers[divisionKey]?.[combinedPlantId!];
          return sum + (divisionTotalFarmers !== undefined ? divisionTotalFarmers : 0);
        }, 0);

        // Use backend total if available, otherwise calculate
        if (totalBackendFarmers > 0) {
          total.totalFarmers = totalBackendFarmers;
        } else {
          total.totalFarmers = total.lessFarmers + total.moreFarmers;
        }
        
        total.totalArea = total.lessArea + total.moreArea;
        total.totalPlants = total.lessPlants + total.morePlants;

        result.push(total);
      }

      return result;
    }

    // Fallback to old logic if not a recognized combination
    // (This should not happen with the new API, but kept for safety)
    const combinedMap = new Map<string, any>();

    Object.values(this.processedData).forEach((division: any) => {
      const key = `${division.divisionName || ''}_${division.rangName || ''}`;
      
      // Get plant data for both plants from this division
      const plant1Data = division.plants && division.plants[plantId1.toString()] 
        ? division.plants[plantId1.toString()] 
        : null;
      const plant2Data = division.plants && division.plants[plantId2.toString()] 
        ? division.plants[plantId2.toString()] 
        : null;

      // Only include division if at least one plant has data
      if (plant1Data || plant2Data) {
        if (!combinedMap.has(key)) {
          combinedMap.set(key, {
            circleName: division.circleName || '-',
            distName: division.distName || '-',
            divisionName: division.divisionName || '-',
            rangName: division.rangName || '-',
            lessFarmers: 0,
            lessArea: 0,
            lessPlants: 0,
            moreFarmers: 0,
            moreArea: 0,
            morePlants: 0
          });
        }

        const existing = combinedMap.get(key)!;
        
        // Add plant1 data if exists
        if (plant1Data) {
          existing.lessFarmers += this.toNumber(plant1Data.lessFarmers);
          existing.lessArea += this.toNumber(plant1Data.lessArea);
          existing.lessPlants += this.toNumber(plant1Data.lessPlants);
          existing.moreFarmers += this.toNumber(plant1Data.moreFarmers);
          existing.moreArea += this.toNumber(plant1Data.moreArea);
          existing.morePlants += this.toNumber(plant1Data.morePlants);
        }
        
        // Add plant2 data if exists
        if (plant2Data) {
          existing.lessFarmers += this.toNumber(plant2Data.lessFarmers);
          existing.lessArea += this.toNumber(plant2Data.lessArea);
          existing.lessPlants += this.toNumber(plant2Data.lessPlants);
          existing.moreFarmers += this.toNumber(plant2Data.moreFarmers);
          existing.moreArea += this.toNumber(plant2Data.moreArea);
          existing.morePlants += this.toNumber(plant2Data.morePlants);
        }
      }
    });

    const result = Array.from(combinedMap.values()).map(item => ({
      ...item,
      totalFarmers: item.lessFarmers + item.moreFarmers,
      totalArea: item.lessArea + item.moreArea,
      totalPlants: item.lessPlants + item.morePlants
    }));

    // Add total row
    if (result.length > 0) {
      const total = result.reduce((acc, item) => ({
        circleName: 'कुल योग',
        distName: '-',
        divisionName: 'कुल योग',
        rangName: '-',
        lessFarmers: acc.lessFarmers + item.lessFarmers,
        lessArea: acc.lessArea + item.lessArea,
        lessPlants: acc.lessPlants + item.lessPlants,
        moreFarmers: acc.moreFarmers + item.moreFarmers,
        moreArea: acc.moreArea + item.moreArea,
        morePlants: acc.morePlants + item.morePlants,
        totalFarmers: 0,
        totalArea: 0,
        totalPlants: 0
      }), {
        lessFarmers: 0, lessArea: 0, lessPlants: 0,
        moreFarmers: 0, moreArea: 0, morePlants: 0
      });

      total.totalFarmers = total.lessFarmers + total.moreFarmers;
      total.totalArea = total.lessArea + total.moreArea;
      total.totalPlants = total.lessPlants + total.morePlants;

      result.push(total);
    }

    return result;
  }

  // Get grand total of all plants combined - use mahaYog from API
  getAllPlantsGrandTotal(): any[] {
    // If mahaYog is available from API and 'all' is selected, use it directly
    if (this.mahaYog && this.selectedPlantFilter === 'all') {
      // Return a single row with mahaYog data
      return [{
        circleName: 'कुल योग',
        distName: '-',
        divisionName: 'कुल योग',
        rangName: '-',
        lessFarmers: this.toNumber(this.mahaYog.lessThan5Acres?.totalFarmers || 0),
        lessArea: this.toNumber(this.mahaYog.lessThan5Acres?.totalGoswara || 0),
        lessPlants: this.toNumber(this.mahaYog.lessThan5Acres?.totalPlants || 0),
        moreFarmers: this.toNumber(this.mahaYog.moreThan5Acres?.totalFarmers || 0),
        moreArea: this.toNumber(this.mahaYog.moreThan5Acres?.totalGoswara || 0),
        morePlants: this.toNumber(this.mahaYog.moreThan5Acres?.totalPlants || 0),
        totalFarmers: this.toNumber(this.mahaYog.overall?.totalFarmers || 0),
        totalArea: this.toNumber(this.mahaYog.overall?.totalGoswara || 0),
        totalPlants: this.toNumber(this.mahaYog.overall?.totalPlants || 0)
      }];
    }

    // Fallback: Calculate from processedData if mahaYog is not available or specific species is selected
    const combinedMap = new Map<string, any>();

    // Get filtered plant IDs based on selected filter
    let filteredPlantTypes = this.plantTypes;
    if (this.selectedPlantFilter !== 'all') {
      filteredPlantTypes = this.plantTypes.filter(pt => pt.id === this.selectedPlantFilter);
    }

    // Get all plant IDs and combine their data directly from processedData
    if (filteredPlantTypes && filteredPlantTypes.length > 0) {
      // Iterate through all divisions in processedData
      Object.values(this.processedData).forEach((division: any) => {
        const key = `${division.divisionName || ''}_${division.rangName || ''}`;
        
        if (!combinedMap.has(key)) {
          combinedMap.set(key, {
            circleName: division.circleName || '-',
            distName: division.distName || '-',
            divisionName: division.divisionName || '-',
            rangName: division.rangName || '-',
            lessFarmers: 0,
            lessArea: 0,
            lessPlants: 0,
            moreFarmers: 0,
            moreArea: 0,
            morePlants: 0
          });
        }

        const existing = combinedMap.get(key)!;
        
        // Sum up data from all filtered plants for this division
        // Exclude combined plant IDs (98, 99) to avoid double counting
        filteredPlantTypes.forEach(plant => {
          // Skip combined plant IDs - they're already included in individual plants
          if (this.isCombinedPlantId(plant.id)) {
            return;
          }
          
          if (division.plants && division.plants[plant.id.toString()]) {
            const plantData = division.plants[plant.id.toString()];
            existing.lessFarmers += this.toNumber(plantData.lessFarmers);
            existing.lessArea += this.toNumber(plantData.lessArea);
            existing.lessPlants += this.toNumber(plantData.lessPlants);
            existing.moreFarmers += this.toNumber(plantData.moreFarmers);
            existing.moreArea += this.toNumber(plantData.moreArea);
            existing.morePlants += this.toNumber(plantData.morePlants);
          }
        });
      });
    }

    const result = Array.from(combinedMap.values()).map(item => ({
      ...item,
      totalFarmers: item.lessFarmers + item.moreFarmers,
      totalArea: item.lessArea + item.moreArea,
      totalPlants: item.lessPlants + item.morePlants
    }));

    // Add total row
    if (result.length > 0) {
      const total = result.reduce((acc, item) => ({
        circleName: 'कुल योग',
        distName: '-',
        divisionName: 'कुल योग',
        rangName: '-',
        lessFarmers: acc.lessFarmers + item.lessFarmers,
        lessArea: acc.lessArea + item.lessArea,
        lessPlants: acc.lessPlants + item.lessPlants,
        moreFarmers: acc.moreFarmers + item.moreFarmers,
        moreArea: acc.moreArea + item.moreArea,
        morePlants: acc.morePlants + item.morePlants,
        totalFarmers: 0,
        totalArea: 0,
        totalPlants: 0
      }), {
        lessFarmers: 0, lessArea: 0, lessPlants: 0,
        moreFarmers: 0, moreArea: 0, morePlants: 0
      });

      total.totalFarmers = total.lessFarmers + total.moreFarmers;
      total.totalArea = total.lessArea + total.moreArea;
      total.totalPlants = total.lessPlants + total.morePlants;

      result.push(total);
    }

    return result;
  }

  getRowIndex(index: number): number {
    return index + 1;
  }

  // Helper method to get letter from index (A, B, C, etc.)
  getLetterFromIndex(index: number): string {
    return String.fromCharCode(65 + index);
  }

  // Check if plant is Tissue Culture Sagon
  private isTissueCultureSagon(plantName: string): boolean {
    // console.log('plantName isTissueCultureSagon', plantName);
    return (plantName.includes('टिश्यू कल्चर सागौन') || plantName.includes('तिशु') || plantName.includes('टिशु')) && 
           (plantName.includes('सागौन') || plantName.includes('सागौन'));
  }

  // Check if plant is Normal Sagon
  private isNormalSagon(plantName: string): boolean {
    // console.log('plantName isNormalSagon', plantName);
    return plantName.includes('साधारण सागौन') && (plantName.includes('सागौन') || plantName.includes('सागौन'));
  }

  // Check if plant is Tissue Culture Bansh
  private isTissueCultureBansh(plantName: string): boolean {
    // console.log('plantName isTissueCultureBansh', plantName);
    return (plantName.includes('टिश्यू कल्चर बांस') || plantName.includes('तिशु') || plantName.includes('टिशु')) && 
           (plantName.includes('बांस') || plantName.includes('बांश'));
  }

  // Check if plant is Normal Bansh
  private isNormalBansh(plantName: string): boolean {
    // console.log('plantName isNormalBansh', plantName);
    return plantName.includes('साधारण बांस') && (plantName.includes('बांस') || plantName.includes('बांश'));
  }

  // Check if plant ID is a combined plant ID from API
  private isCombinedPlantId(plantId: number): boolean {
    return plantId === 98 || plantId === 99;
  }

  // Get the combination type for a plant ID
  private getCombinationType(plantId: number): 'sagon' | 'bansh' | null {
    if (plantId === 98) return 'sagon';
    if (plantId === 99) return 'bansh';
    return null;
  }

  // Organize plant types into groups for display
  getOrganizedPlantGroups(): any[] {
    const groups: any[] = [];
    const usedIndices = new Set<number>();
    const usedLetters = new Set<string>();
    let currentLetterIndex = 0;

    // Filter plantTypes based on selected filter
    let filteredPlantTypes = this.plantTypes;
    if (this.selectedPlantFilter !== 'all') {
      filteredPlantTypes = this.plantTypes.filter(pt => pt.id === this.selectedPlantFilter);
      
      // When a specific plant is selected, return only that plant as a single group
      if (filteredPlantTypes.length > 0) {
        const selectedPlant = filteredPlantTypes[0];
        // Find the original index in plantTypes to determine the letter
        const originalIndex = this.plantTypes.findIndex(pt => pt.id === selectedPlant.id);
        
        // Determine if it's part of B or C group
        const isTissueCultureSagon = this.isTissueCultureSagon(selectedPlant.plant_name);
        const isNormalSagon = this.isNormalSagon(selectedPlant.plant_name);
        const isTissueCultureBansh = this.isTissueCultureBansh(selectedPlant.plant_name);
        const isNormalBansh = this.isNormalBansh(selectedPlant.plant_name);
        
        let letter = 'A';
        let subIndex: number | null = null;
        let letterIndex = 0;
        
        if (isTissueCultureSagon) {
          letter = 'B';
          subIndex = 1;
          letterIndex = 1;
        } else if (isNormalSagon) {
          letter = 'B';
          subIndex = 2;
          letterIndex = 1;
        } else if (isTissueCultureBansh) {
          letter = 'C';
          subIndex = 1;
          letterIndex = 2;
        } else if (isNormalBansh) {
          letter = 'C';
          subIndex = 2;
          letterIndex = 2;
        } else {
          // For other plants, assign sequential letters (A, D, E, etc.)
          // Count how many non-B/C plants come before this one
          for (let i = 0; i < originalIndex; i++) {
            const plant = this.plantTypes[i];
            const isSagon = this.isTissueCultureSagon(plant.plant_name) || this.isNormalSagon(plant.plant_name);
            const isBansh = this.isTissueCultureBansh(plant.plant_name) || this.isNormalBansh(plant.plant_name);
            if (!isSagon && !isBansh) {
              letterIndex++;
            }
          }
          letter = String.fromCharCode(65 + letterIndex);
        }
        
        return [{
          letter: letter,
          letterIndex: letterIndex,
          plants: [{ ...selectedPlant, subIndex: subIndex }],
          combination: null,
          tissueCultureCombination: null
        }];
      }
      
      return [];
    }

    // If filter is applied and no plants match, return empty array
    if (filteredPlantTypes.length === 0) {
      return [];
    }

    // Find Sagon group indices (to reserve B) - use original indices for lookup
    const tissueCultureSagonIndex = filteredPlantTypes.findIndex((p) => 
      this.isTissueCultureSagon(p.plant_name));
    const normalSagonIndex = filteredPlantTypes.findIndex((p) => 
      this.isNormalSagon(p.plant_name));

    // Find Bansh group indices (to reserve C)
    const tissueCultureBanshIndex = filteredPlantTypes.findIndex((p) => 
      this.isTissueCultureBansh(p.plant_name));
    const normalBanshIndex = filteredPlantTypes.findIndex((p) => 
      this.isNormalBansh(p.plant_name));

    // Mark Sagon and Bansh indices as reserved (in filtered array)
    if (tissueCultureSagonIndex !== -1) usedIndices.add(tissueCultureSagonIndex);
    if (normalSagonIndex !== -1) usedIndices.add(normalSagonIndex);
    if (tissueCultureBanshIndex !== -1) usedIndices.add(tissueCultureBanshIndex);
    if (normalBanshIndex !== -1) usedIndices.add(normalBanshIndex);

    // First, add all remaining plants starting from A (skip B and C)
    filteredPlantTypes.forEach((plant, index) => {
      if (!usedIndices.has(index)) {
        // Skip B (index 1) and C (index 2) if they will be used
        while (currentLetterIndex === 1 || currentLetterIndex === 2) {
          currentLetterIndex++;
        }
        const letter = String.fromCharCode(65 + currentLetterIndex);
        groups.push({
          letter: letter,
          letterIndex: currentLetterIndex,
          plants: [{ ...plant, subIndex: null }],
          combination: null,
          tissueCultureCombination: null
        });
        usedLetters.add(letter);
        currentLetterIndex++;
      }
    });

    // Now add Sagon group for Letter B
    if (tissueCultureSagonIndex !== -1 && normalSagonIndex !== -1) {
      groups.push({
        letter: 'B',
        letterIndex: 1,
        plants: [
          { ...filteredPlantTypes[tissueCultureSagonIndex], subIndex: 1 },
          { ...filteredPlantTypes[normalSagonIndex], subIndex: 2 }
        ],
        combination: {
          type: 'sagon',
          plant1Index: filteredPlantTypes[tissueCultureSagonIndex].id,
          plant2Index: filteredPlantTypes[normalSagonIndex].id
        },
        tissueCultureCombination: null // Explicitly set to null for B group
      });
      usedLetters.add('B');
    }

    // Now add Bansh group for Letter C
    if (tissueCultureBanshIndex !== -1 && normalBanshIndex !== -1) {
      groups.push({
        letter: 'C',
        letterIndex: 2,
        plants: [
          { ...filteredPlantTypes[tissueCultureBanshIndex], subIndex: 1 },
          { ...filteredPlantTypes[normalBanshIndex], subIndex: 2 }
        ],
        combination: {
          type: 'bansh',
          plant1Index: filteredPlantTypes[tissueCultureBanshIndex].id,
          plant2Index: filteredPlantTypes[normalBanshIndex].id
        },
        tissueCultureCombination: {
          // Tissue Culture Sagon + Tissue Culture Bansh
          plant1Index: tissueCultureSagonIndex !== -1 ? filteredPlantTypes[tissueCultureSagonIndex].id : null,
          plant2Index: filteredPlantTypes[tissueCultureBanshIndex].id
        },
        showTissueCultureCombination: tissueCultureSagonIndex !== -1 // Flag to show only once
      });
      usedLetters.add('C');
    }

    // Sort groups by letterIndex to maintain proper order (A, B, C, D, ...)
    return groups.sort((a, b) => {
      return a.letterIndex - b.letterIndex;
    });
  }

  // Get Sagon combination title
  getSagonCombinationTitle(): string {
    return 'टिश्यू कल्चर सागौन (टिश्यू कल्चर सागौन + साधारण सागौन) का कुल योग';
  }

  // Get Bansh combination title
  getBanshCombinationTitle(): string {
    return 'टिश्यू कल्चर बांस (टिश्यू कल्चर बांस + साधारण बांस) का कुल योग';
  }

  // Get Tissue Culture combination title (Bansh combination)
  getTissueCultureCombinationTitle(): string {
    return 'टिश्यू कल्चर बांस (टिश्यू कल्चर बांस + साधारण बांस) का कुल योग';
  }

  // Get Tissue Culture combination data safely
  // For group C, this should combine Tissue Culture Bansh + Normal Bansh
  getTissueCultureCombinationData(group: any): any[] {
    // For group C, use the combination property (Tissue Culture Bansh + Normal Bansh)
    if (!group || group.letter !== 'C' || !group.combination || group.combination.type !== 'bansh') {
      return [];
    }

    // Use the group's combination which has Tissue Culture Bansh + Normal Bansh
    // Now using plant IDs instead of indices
    const plant1Id = group.combination.plant1Index; // Tissue Culture Bansh ID
    const plant2Id = group.combination.plant2Index; // Normal Bansh ID

    // Validate IDs
    if (plant1Id === null || 
        plant1Id === undefined || 
        plant1Id === -1 ||
        plant2Id === null ||
        plant2Id === undefined ||
        plant2Id === -1) {
      return [];
    }

    return this.getCombinedPlantData(plant1Id, plant2Id);
  }

  loadReport() {
    this.showLoading('डेटा लोड हो रहा है...');
    const storedData = sessionStorage.getItem('logined_officer_data');
    let designation = "";
    let devisionIdStr = "";
    let rangIdStr = "";
    let subDivIdStr = "";

    if (storedData) {
      const officerData = JSON.parse(storedData);
      designation = officerData.designation_name || officerData.designation;
      rangIdStr = officerData.rang_id;
      devisionIdStr = officerData.devision_id || officerData.division_id;
      subDivIdStr = officerData.sub_div_id; 
    }
    let sdoId = Number(subDivIdStr);

    let divisionId = Number(devisionIdStr);
    let rangId = Number(rangIdStr);

    if (designation === 'DFO' && divisionId > 0) {
      this.apiService.getPrajatiGoswaraReport(divisionId, undefined).subscribe({
        next: (res: any) => {
          if (res?.response?.code === 200) {
            console.log('res (Division)', res);
            this.reportData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.mahaYog = res.mahaYog || null; // Store mahaYog from API
            // console.log('res', res);
            // console.log('reportData', this.reportData);
            // console.log('plantTypes', this.plantTypes);
            this.processReportData();
            this.dismissLoading();
          } else {
            this.dismissLoading();
            this.showToast(res?.response?.message || 'डेटा उपलब्ध नहीं है।');
          }
        },
        error: (err: any) => {
          // console.error('API Error (Division):', err);
          this.dismissLoading();
          this.showToast('डेटा लोड करने में त्रुटि हुई।');
        }
      });
    } else if (designation === 'RO' && rangId > 0) {
      this.apiService.getPrajatiGoswaraReport(undefined, rangId).subscribe({
        next: (res: any) => {
          console.log('res (Range)', res);
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.mahaYog = res.mahaYog || null; // Store mahaYog from API

            this.processReportData();
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
    }  else if (designation === 'SDO' && sdoId > 0) {
      // Add SDO handling - this will fetch data for all subordinate ranges
      debugger
      console.log('sdoId', sdoId);
      this.apiService.getPrajatiGoswaraReport(undefined, undefined, sdoId).subscribe({
        next: (res: any) => {
          console.log('res (SDO)', res);
          if (res?.response?.code === 200) {
            this.reportData = res.data || [];
            this.plantTypes = res.plantTypes || [];
            this.mahaYog = res.mahaYog || null; // Store mahaYog from API
            // console.log('res (SDO)', res);
            // console.log('reportData (SDO)', this.reportData);
            this.processReportData();
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
      console.error('Invalid designation or ID:', { designation, divisionId, rangId });
      this.dismissLoading();
      this.showToast('अमान्य उपयोगकर्ता या डेटा।');
    }
  }

  exportToExcel(): void {
    const tableElement = document.getElementById('report-table');
    if (!tableElement) {
      this.showToast('एक्सेल निर्यात में त्रुटि हुई।');
      return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });
    const workbook: XLSX.WorkBook = {
      Sheets: { 'प्रजाति वार्ग गोस्वारा रिपोर्ट': worksheet },
      SheetNames: ['प्रजाति वार्ग गोस्वारा रिपोर्ट']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(blob, 'Prajati_Goswara_Report.xlsx');
    this.showToast('एक्सेल फ़ाइल डाउनलोड की गई।');
  }

  // Handle plant filter change
  onPlantFilterChange(event: any) {
    this.selectedPlantFilter = event.detail.value;
    this.cdRef.detectChanges();
  }

  // Get selected plant name
  getSelectedPlantName(): string {
    if (this.selectedPlantFilter === 'all' || !this.plantTypes || this.plantTypes.length === 0) {
      return 'चयनित प्रजाति';
    }
    const selectedPlant = this.plantTypes.find(p => p.id === this.selectedPlantFilter);
    return selectedPlant?.plant_name || 'चयनित प्रजाति';
  }
}