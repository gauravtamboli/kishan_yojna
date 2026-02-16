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
import { PlantType } from '../prajati-var-goswara/PrajativargoswaraResponseForReport.modal';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

interface CircleData {
  circleId: number;
  circleName: string;
  divisions: DivisionReportData[];
}

interface DivisionReportData {
  divisionId: number;
  divisionName: string;
  circleName: string;
  ranges: any[];
  plants: { [plantId: string]: any };
  mahaYog: {
    lessThan5Acres: { totalFarmers: number; totalGoswara: number; totalPlants: number };
    moreThan5Acres: { totalFarmers: number; totalGoswara: number; totalPlants: number };
    overall: { totalFarmers: number; totalGoswara: number; totalPlants: number };
  };
}

@Component({
  selector: 'app-prajati-goswara-report-head',
  templateUrl: './prajati-goswara-report-head.page.html',
  styleUrls: ['./prajati-goswara-report-head.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonCard, IonCardContent, IonButton, IonIcon, IonSpinner, IonSelect, IonSelectOption,
    CommonModule, FormsModule
]
})
export class PrajatiGoswaraReportHeadPage implements OnInit {
  circlesData: CircleData[] = [];
  plantTypes: PlantType[] = [];
  isLoading = false;
  loadingMessage = 'कृपया प्रतीक्षा करें.....';
  selectedPlantFilter: number | 'all' = 'all';

  selectOptions = {
    header: 'प्रजाति चुनें',
    cssClass: 'custom-select-popover'
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
    this.restoreSavedTheme();
    this.loadReport();
  }

  private restoreSavedTheme(): void {
    const savedTheme = localStorage.getItem('theme-mode');
    const isDarkMode = savedTheme === 'dark';
    const isDarkClass = 'ion-palette-dark';
    
    if (isDarkMode) {
      document.documentElement.classList.add(isDarkClass);
      document.body.classList.add(isDarkClass);
    } else {
      document.documentElement.classList.remove(isDarkClass);
      document.body.classList.remove(isDarkClass);
    }
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
    if (window.history.length > 1) {
      this.router.navigateByUrl('/officers-dashboard-supreme', { replaceUrl: true });
    } else {
      this.location.back();
    }
  }

  private toNumber(value: any): number {
    if (value == null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const s = String(value).replace(/,/g, '').trim();
    if (s === '') return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  getPlantDivisions(plantId: number): any[] {
    const divisions: any[] = [];
    
    this.circlesData.forEach(circle => {
      circle.divisions.forEach(division => {
        if (division.plants && division.plants[plantId.toString()]) {
          const plantData = division.plants[plantId.toString()];
          divisions.push({
            circleName: circle.circleName || '-',
            divisionName: division.divisionName || '-',
            lessFarmers: this.toNumber(plantData.lessFarmers || 0),
            lessArea: this.toNumber(plantData.lessArea || 0),
            lessPlants: this.toNumber(plantData.lessPlants || 0),
            moreFarmers: this.toNumber(plantData.moreFarmers || 0),
            moreArea: this.toNumber(plantData.moreArea || 0),
            morePlants: this.toNumber(plantData.morePlants || 0),
            totalFarmers: this.toNumber(plantData.lessFarmers || 0) + this.toNumber(plantData.moreFarmers || 0),
            totalArea: this.toNumber(plantData.lessArea || 0) + this.toNumber(plantData.moreArea || 0),
            totalPlants: this.toNumber(plantData.lessPlants || 0) + this.toNumber(plantData.morePlants || 0)
          });
        }
      });
    });

    if (divisions.length > 0) {
      const total = divisions.reduce((acc, div) => ({
        circleName: 'कुल योग',
        divisionName: 'कुल योग',
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

  getCombinedPlantData(plantId1: number, plantId2: number): any[] {
    let combinedPlantId: number | null = null;
    
    if ((plantId1 === 2 && plantId2 === 4) || (plantId1 === 4 && plantId2 === 2)) {
      combinedPlantId = 98;
    } else if ((plantId1 === 3 && plantId2 === 5) || (plantId1 === 5 && plantId2 === 3)) {
      combinedPlantId = 99;
    }

    if (combinedPlantId !== null) {
      const combinedMap = new Map<string, any>();
      
      this.circlesData.forEach(circle => {
        circle.divisions.forEach(division => {
          if (division.plants && division.plants[combinedPlantId!.toString()]) {
            const plantData = division.plants[combinedPlantId!.toString()];
            const key = `${circle.circleName}|${division.divisionName}`;
            
            if (!combinedMap.has(key)) {
              combinedMap.set(key, {
                circleName: circle.circleName || '-',
                divisionName: division.divisionName || '-',
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
      });

      const result = Array.from(combinedMap.values()).map(item => ({
        ...item,
        totalFarmers: item.lessFarmers + item.moreFarmers,
        totalArea: item.lessArea + item.moreArea,
        totalPlants: item.lessPlants + item.morePlants
      }));

      if (result.length > 0) {
        const total = result.reduce((acc, item) => ({
          circleName: 'कुल योग',
          divisionName: 'कुल योग',
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

    return [];
  }

  getAllPlantsGrandTotal(): any[] {
    const divisions: any[] = [];
    
    this.circlesData.forEach(circle => {
      circle.divisions.forEach(division => {
        if (division.mahaYog) {
          divisions.push({
            circleName: circle.circleName || '-',
            divisionName: division.divisionName || '-',
            lessFarmers: this.toNumber(division.mahaYog.lessThan5Acres?.totalFarmers || 0),
            lessArea: this.toNumber(division.mahaYog.lessThan5Acres?.totalGoswara || 0),
            lessPlants: this.toNumber(division.mahaYog.lessThan5Acres?.totalPlants || 0),
            moreFarmers: this.toNumber(division.mahaYog.moreThan5Acres?.totalFarmers || 0),
            moreArea: this.toNumber(division.mahaYog.moreThan5Acres?.totalGoswara || 0),
            morePlants: this.toNumber(division.mahaYog.moreThan5Acres?.totalPlants || 0),
            totalFarmers: this.toNumber(division.mahaYog.overall?.totalFarmers || 0),
            totalArea: this.toNumber(division.mahaYog.overall?.totalGoswara || 0),
            totalPlants: this.toNumber(division.mahaYog.overall?.totalPlants || 0)
          });
        }
      });
    });

    if (this.selectedPlantFilter === 'all' && divisions.length > 0) {
      const total = divisions.reduce((acc, div) => ({
        circleName: 'कुल योग',
        divisionName: 'कुल योग',
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

  getRowIndex(index: number): number {
    return index + 1;
  }

  private isTissueCultureSagon(plantName: string): boolean {
    return (plantName.includes('टिश्यू कल्चर सागौन') || plantName.includes('तिशु') || plantName.includes('टिशु')) && 
           (plantName.includes('सागौन') || plantName.includes('सागौन'));
  }

  private isNormalSagon(plantName: string): boolean {
    return plantName.includes('साधारण सागौन') && (plantName.includes('सागौन') || plantName.includes('सागौन'));
  }

  private isTissueCultureBansh(plantName: string): boolean {
    return (plantName.includes('टिश्यू कल्चर बांस') || plantName.includes('तिशु') || plantName.includes('टिशु')) && 
           (plantName.includes('बांस') || plantName.includes('बांश'));
  }

  private isNormalBansh(plantName: string): boolean {
    return plantName.includes('साधारण बांस') && (plantName.includes('बांस') || plantName.includes('बांश'));
  }

  getOrganizedPlantGroups(): any[] {
    const groups: any[] = [];
    let currentLetterIndex = 0;

    let filteredPlantTypes = this.plantTypes;
    if (this.selectedPlantFilter !== 'all') {
      filteredPlantTypes = this.plantTypes.filter(pt => pt.id === this.selectedPlantFilter);
      
      if (filteredPlantTypes.length > 0) {
        const selectedPlant = filteredPlantTypes[0];
        const originalIndex = this.plantTypes.findIndex(pt => pt.id === selectedPlant.id);
        
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

    const tissueCultureSagonIndex = filteredPlantTypes.findIndex((p) => 
      this.isTissueCultureSagon(p.plant_name));
    const normalSagonIndex = filteredPlantTypes.findIndex((p) => 
      this.isNormalSagon(p.plant_name));
    const tissueCultureBanshIndex = filteredPlantTypes.findIndex((p) => 
      this.isTissueCultureBansh(p.plant_name));
    const normalBanshIndex = filteredPlantTypes.findIndex((p) => 
      this.isNormalBansh(p.plant_name));

    const usedIndices = new Set<number>();
    if (tissueCultureSagonIndex !== -1) usedIndices.add(tissueCultureSagonIndex);
    if (normalSagonIndex !== -1) usedIndices.add(normalSagonIndex);
    if (tissueCultureBanshIndex !== -1) usedIndices.add(tissueCultureBanshIndex);
    if (normalBanshIndex !== -1) usedIndices.add(normalBanshIndex);

    filteredPlantTypes.forEach((plant, index) => {
      if (!usedIndices.has(index)) {
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
        currentLetterIndex++;
      }
    });

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
        tissueCultureCombination: null
      });
    }

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
          plant1Index: tissueCultureSagonIndex !== -1 ? filteredPlantTypes[tissueCultureSagonIndex].id : null,
          plant2Index: filteredPlantTypes[tissueCultureBanshIndex].id
        },
        showTissueCultureCombination: tissueCultureSagonIndex !== -1
      });
    }

    return groups.sort((a, b) => a.letterIndex - b.letterIndex);
  }

  getSagonCombinationTitle(): string {
    return 'टिश्यू कल्चर सागौन (टिश्यू कल्चर सागौन + साधारण सागौन) का कुल योग';
  }

  getTissueCultureCombinationTitle(): string {
    return 'टिश्यू कल्चर बांस (टिश्यू कल्चर बांस + साधारण बांस) का कुल योग';
  }

  getTissueCultureCombinationData(group: any): any[] {
    if (!group || group.letter !== 'C' || !group.combination || group.combination.type !== 'bansh') {
      return [];
    }

    const plant1Id = group.combination.plant1Index;
    const plant2Id = group.combination.plant2Index;

    if (plant1Id === null || plant1Id === undefined || plant1Id === -1 ||
        plant2Id === null || plant2Id === undefined || plant2Id === -1) {
      return [];
    }

    return this.getCombinedPlantData(plant1Id, plant2Id);
  }

  loadReport() {
    this.showLoading('डेटा लोड हो रहा है...');
    
    this.apiService.getPrajatiGoswaraReportAllCircles().subscribe({
      next: (res: any) => {
        if (res?.response?.code === 200) {
          console.log('res (All Circles)', res);
          this.circlesData = res.data || [];
          this.plantTypes = res.plantTypes || [];
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

  exportToExcel(): void {
    const tableElements = document.querySelectorAll('.report-table');
    if (tableElements.length === 0) {
      this.showToast('एक्सेल निर्यात में त्रुटि हुई।');
      return;
    }
    
    const workbook: XLSX.WorkBook = {
      Sheets: {},
      SheetNames: []
    };

    tableElements.forEach((tableElement, index) => {
      const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });
      workbook.Sheets[`Sheet${index + 1}`] = worksheet;
      workbook.SheetNames.push(`Sheet${index + 1}`);
    });

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    FileSaver.saveAs(blob, 'Prajati_Goswara_Report_Head.xlsx');
    this.showToast('एक्सेल फ़ाइल डाउनलोड की गई।');
  }

  onPlantFilterChange(event: any) {
    this.selectedPlantFilter = event.detail.value;
    this.cdRef.detectChanges();
  }

  getSelectedPlantName(): string {
    if (this.selectedPlantFilter === 'all' || !this.plantTypes || this.plantTypes.length === 0) {
      return 'चयनित प्रजाति';
    }
    const selectedPlant = this.plantTypes.find(p => p.id === this.selectedPlantFilter);
    return selectedPlant ? selectedPlant.plant_name : 'चयनित प्रजाति';
  }
}






















