import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSplitPane, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonBadge, IonPopover, IonCardContent } from '@ionic/angular/standalone';
import { LanguageService } from '../../services/language.service';
import { NavController, MenuController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, downloadOutline, chevronBackOutline, chevronForwardOutline, chevronDownOutline, optionsOutline, reorderThreeOutline } from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { NetworkCheckService } from 'src/app/services/network-check.service';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { ModalController } from '@ionic/angular';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { PaginatorModule } from 'primeng/paginator';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { YearThreeAwedanListResponseModel, YearThreeAwedanResponse, PlantDataModel } from './YearThreeAwedanResponse.model';
import { YearThreeAwedanCountsResponse } from './YearThreeAwedanCountsResponse.model';
import { SubmitPlantRequestYearThreeModel, PlantRequestYearThreeItem } from './YearThreePlantResponse.model';


@Component({
  selector: 'app-year-three-dashboard',
  templateUrl: './year-three-dashboard.page.html',
  styleUrls: ['./year-three-dashboard.page.scss'],
  standalone: true,
  imports: [IonPopover, IonSplitPane, PaginatorModule, IonMenu, IonMenuButton, IonList, IonAvatar, IonCard,
    IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonContent, IonHeader,
    IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, TableModule, IonBadge]
})


export class YearThreeDashboardPage implements OnInit {

  popoverEvent: any;
  isUserMenuOpen = false;

  openUserMenu($event: Event) {

    this.popoverEvent = $event;
    this.isUserMenuOpen = true;
  }

  pages: { title: string, url: string, is_submenu: boolean }[] = [];
  isConnected: boolean = false;
  isNoRecordFound: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private networkCheckService: NetworkCheckService,
    private platform: Platform,
    private langService: LanguageService,
    private cdRef: ChangeDetectorRef,
    private menuCtrl: MenuController,
    private apiService: ApiService,
    private sharedPreference: SharedserviceService
  ) {
    this.addAllIcon();
  }

  languageData: any = {};
  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;

  listOfAwedan: YearThreeAwedanListResponseModel[] = [];
  filteredAwedans: YearThreeAwedanListResponseModel[] = [];
  searchMobile: string = "";

  // Count properties
  totalCount: number = 0;
  countYes: number = 0;  // Applications with year 3 data
  countNo: number = 0;    // Applications without year 3 data
  whichBoxClicked: number = 1; // 1 = All, 2 = Yes, 3 = No
  currentFilter: string | null = null; // "Yes", "No", or null

  // Plant entry properties (for future submit functionality)
  plantInputs: { [key: string]: number | null } = {}; // key: "appNumber_plantId"
  isRangeOfficer: boolean = false;

  ngOnInit() {
    this.updateTranslation();
    this.isRangeOfficer = this.isRODesignation(); // Check if RO
    this.getYearThreeAwedanCounts(); // Load counts first
    this.getYearThreeAwedanList();

    this.langService.language$.subscribe(() => {
      this.pages = [];
    });
  }

  ionViewWillEnter() {
    if (this.sharedPreference.getRefresh()) {
      this.getYearThreeAwedanCounts();
      this.getYearThreeAwedanList();
      this.sharedPreference.setRefresh(false);
    } else {
      this.getYearThreeAwedanCounts();
      this.getYearThreeAwedanList();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.menuCtrl.enable(true, 'year-three-menu');
      this.menuCtrl.close();
    }, 100);
  }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  getYearThreeAwedanCounts() {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    if (officersLoginModel != null) {
      this.apiService.getYearThreeAwedanCounts(
        officersLoginModel.designation,
        officersLoginModel.circle_id,
        officersLoginModel.devision_id,
        officersLoginModel.rang_id,
        officersLoginModel.officerId.toString()
      ).subscribe(
        (response: YearThreeAwedanCountsResponse) => {
          if (response.response.code === 200) {
            this.totalCount = response.data.total_count || 0;
            this.countYes = response.data.count_yes || 0;
            this.countNo = response.data.count_no || 0;
            this.cdRef.detectChanges();
          }
        },
        (error) => {
          console.error('Error getting counts:', error);
        }
      );
    }
  }

  getYearThreeAwedanList(page: number = 1, filterYear3: string | null = null) {
    this.currentPage = page;
    this.currentFilter = filterYear3;
    this.showDialog("कृपया प्रतीक्षा करें.....");

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    if (officersLoginModel != null) {
      // Use which_data = 3 (or any value, API will filter by status 6 anyway)
      this.apiService.getYearThreeAwedanList(
        3, // which_data - API filters by status 6 regardless
        officersLoginModel.designation,
        officersLoginModel.circle_id,
        officersLoginModel.devision_id,
        officersLoginModel.rang_id,
        officersLoginModel.officerId.toString(),
        this.currentPage,
        this.pageSize,
        filterYear3 // Pass filter parameter
      ).subscribe(
        (response: YearThreeAwedanResponse) => {
          if (response.response.code === 200) {
            this.listOfAwedan = response.data || [];
            this.filteredAwedans = this.listOfAwedan;
            this.totalRecords = response.totalCount || 0;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

            // Initialize plant inputs for plants without year 3 data
            this.initializePlantInputs();

            if (this.listOfAwedan.length > 0) {
              this.isNoRecordFound = false;
            } else {
              this.isNoRecordFound = true;
            }

            this.cdRef.detectChanges();
          } else {
            this.filteredAwedans = [];
            this.isNoRecordFound = true;
            this.listOfAwedan = [];
            this.longToast(response.response.msg);
          }

          this.dismissDialog();
        },
        (error) => {
          this.shortToast(error);
          this.dismissDialog();
        }
      );
    } else {
      this.router.navigateByUrl('officer-login', { replaceUrl: true });
      this.dismissDialog();
    }
  }

  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short',
      position: 'bottom',
    });
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long',
      position: 'bottom',
    });
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

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  addAllIcon() {
    addIcons({
      appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, reorderThreeOutline,
      chevronBackOutline, chevronForwardOutline, chevronDownOutline, optionsOutline, downloadOutline,
    });
  }

  onBoxClick(boxNumber: number) {
    this.whichBoxClicked = boxNumber;
    this.currentPage = 1;

    let filter: string | null = null;
    if (boxNumber === 2) {
      filter = "Yes";
    } else if (boxNumber === 3) {
      filter = "No";
    }

    this.getYearThreeAwedanList(1, filter);
  }

  getCurrentFilterLabel(): string {
    if (this.whichBoxClicked === 1) {
      return "कुल आवेदन";
    } else if (this.whichBoxClicked === 2) {
      return "तृतीय वर्ष में डेटा दर्ज है";
    } else if (this.whichBoxClicked === 3) {
      return "तृतीय वर्ष में डेटा दर्ज नहीं है";
    }
    return "कुल आवेदन";
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getYearThreeAwedanList(page, this.currentFilter);
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

  onSearch(event: any) {
    const value = event.target.value.toLowerCase();
    this.currentPage = 1;
    this.filteredAwedans = this.listOfAwedan.filter(item =>
      item.hitgrahi_name.toLowerCase().includes(value) ||
      item.father_name.toLowerCase().includes(value) ||
      item.application_number.toLowerCase().includes(value) ||
      item.van_mandal_name.toLowerCase().includes(value)
    );
  }

  onEnter() {
    this.currentPage = 1;
    this.filteredAwedans = this.listOfAwedan.filter(item =>
      item.hitgrahi_name.toLowerCase().includes(this.searchMobile.toLowerCase()) ||
      item.father_name.toLowerCase().includes(this.searchMobile.toLowerCase()) ||
      item.application_number.toLowerCase().includes(this.searchMobile.toLowerCase()) ||
      item.van_mandal_name.toLowerCase().includes(this.searchMobile.toLowerCase())
    );
  }

  export() {
    const exportData: any[] = [];

    this.filteredAwedans.forEach((item, index) => {
      if (item.plants && item.plants.length > 0) {
        item.plants.forEach((plant) => {
          exportData.push({
            'क्रमांक': index + 1,
            'आवेदन नंबर': item.application_number || '',
            'हितग्राही का नाम': item.hitgrahi_name || '',
            'पिता का नाम': item.father_name || '',
            'वन मंडल': item.van_mandal_name || '',
            'रेंज': item.rang_name || '',
            'वृत्त': item.circle_name || '',
            'पौधा': plant.plant_name || '',
            'क्षेत्रफल (एकड़)': plant.total_area || 0,
            'रोपित': plant.total_ropit || 0,
            'द्वितीय वर्ष जीवित': plant.plants_remaining_two || 0,
            'द्वितीय वर्ष जीवित %': plant.year2_survival_percentage || 0,
            'तृतीय वर्ष जीवित': plant.plants_remaining_three || 0,
            'तृतीय वर्ष जीवित %': plant.year3_survival_percentage || 0,
            'वर्ष 3 में रिकॉर्ड': item.has_record_in_year3 || 'No'
          });
        });
      } else {
        exportData.push({
          'क्रमांक': index + 1,
          'आवेदन नंबर': item.application_number || '',
          'हितग्राही का नाम': item.hitgrahi_name || '',
          'पिता का नाम': item.father_name || '',
          'वन मंडल': item.van_mandal_name || '',
          'रेंज': item.rang_name || '',
          'वृत्त': item.circle_name || '',
          'पौधा': '',
          'क्षेत्रफल (एकड़)': '',
          'रोपित': '',
          'द्वितीय वर्ष जीवित': '',
          'द्वितीय वर्ष जीवित %': '',
          'तृतीय वर्ष जीवित': '',
          'तृतीय वर्ष जीवित %': '',
          'वर्ष 3 में रिकॉर्ड': item.has_record_in_year3 || 'No'
        });
      }
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Year Three Applications': worksheet },
      SheetNames: ['Year Three Applications']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'Year_Three_Applications_Report.xlsx');
  }

  getLoginedOfficerName(): string {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    return officersLoginModel.officer_name + " (" + officersLoginModel.designation_name + ")";
  }

  async logoutFunction() {
    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप लॉगआउट करना चाहते हैं ?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        sessionStorage.clear();
        this.router.navigateByUrl('/splash', { replaceUrl: true });
      }
    });

    await modal.present();
  }

  async onMenuItemClick(page: string) {
    this.isConnected = await this.networkCheckService.getCurrentStatus();

    if (this.isConnected) {
      this.router.navigate([page]);
    } else {
      this.longToast(this.getTranslation("no_internet"));
      return;
    }
  }

  viewApplication(item: YearThreeAwedanListResponseModel) {
    // Navigate to view vivran after sampadit component
    this.router.navigate(['view-vivran-after-sampadit', item.application_number], {
      state: { returnUrl: this.router.url }
    });
  }

  enterYearThreeLivePlants() {
    // Plants are now always visible in the table, no action needed
  }

  // Check if user is Range Officer
  isRODesignation(): boolean {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    return officersLoginModel?.designation === "4";
  }

  // Initialize plant inputs for plants without year 3 data
  initializePlantInputs() {
    this.plantInputs = {};
    this.listOfAwedan.forEach(app => {
      if (app.plants) {
        app.plants.forEach(plant => {
          if (!plant.has_year3_data && plant.has_year2_data) {
            const key = `${app.application_number}_${plant.plant_id}`;
            this.plantInputs[key] = null;
          }
        });
      }
    });
  }

  // Handle plant input change
  onPlantInputChange(appNumber: string, plantId: number, event: any) {
    const key = `${appNumber}_${plantId}`;
    const value = event.target.value;
    if (value && value !== '') {
      const numValue = Number(value);
      this.plantInputs[key] = isNaN(numValue) ? null : numValue;
    } else {
      this.plantInputs[key] = null;
    }
    this.cdRef.detectChanges();
  }

  // Get plant input value
  getPlantInput(appNumber: string, plantId: number): number | null {
    const key = `${appNumber}_${plantId}`;
    return this.plantInputs[key] || null;
  }

  // Validate plant input (for year 3, validate against year 2 remaining plants)
  validatePlantInput(plant: PlantDataModel): boolean {
    const appNumber = plant.application_number;
    const value = this.getPlantInput(appNumber, plant.plant_id);
    if (value === null || value === undefined) {
      return false;
    }
    if (value < 0) {
      return false;
    }
    // For year 3, max should be year 2 remaining plants (if available)
    const maxValue = plant.plants_remaining_two || plant.total_ropit;
    if (value > maxValue) {
      return false;
    }
    return true;
  }

  // Check if application has plants needing year 3 data
  hasPlantsNeedingData(appNumber: string): boolean {
    const app = this.listOfAwedan.find(a => a.application_number === appNumber);
    if (!app || !app.plants) {
      return false;
    }
    return app.plants.some(p => !p.has_year3_data && p.has_year2_data);
  }

  // Check if can submit for an application
  canSubmitForApplication(appNumber: string): boolean {
    if (!this.isRangeOfficer) {
      return false;
    }

    const app = this.listOfAwedan.find(a => a.application_number === appNumber);
    if (!app || !app.plants) {
      return false;
    }

    const plantsNeedingData = app.plants.filter(p => !p.has_year3_data && p.has_year2_data);
    if (plantsNeedingData.length === 0) {
      return false; // All plants already have data or don't have year 2 data
    }

    return plantsNeedingData.every(plant => {
      const value = this.getPlantInput(appNumber, plant.plant_id);
      const maxValue = plant.plants_remaining_two || plant.total_ropit;
      return value !== null && value !== undefined && value >= 0 && value <= maxValue;
    });
  }

  // Calculate survival percentage (year 3 from year 2)
  calculateSurvivalPercentage(plant: PlantDataModel): number | null {
    const appNumber = plant.application_number;
    const remaining = this.getPlantInput(appNumber, plant.plant_id);
    if (remaining === null || remaining === undefined || !plant.plants_remaining_two || plant.plants_remaining_two === 0) {
      return null;
    }
    return Math.round((remaining / plant.plants_remaining_two) * 100 * 100) / 100;
  }

  // Submit year 3 data for an application
  async submitYearThreeData(appNumber: string) {
    if (!this.isRangeOfficer) {
      this.longToast('केवल परिक्षेत्र अधिकारी (RO) ही डेटा सबमिट कर सकते हैं');
      return;
    }

    if (!this.canSubmitForApplication(appNumber)) {
      this.longToast('कृपया सभी पौधों के लिए वैध डेटा दर्ज करें');
      return;
    }

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    if (!officersLoginModel) {
      this.longToast('अधिकारी जानकारी उपलब्ध नहीं है');
      return;
    }

    const app = this.listOfAwedan.find(a => a.application_number === appNumber);
    if (!app || !app.plants) {
      return;
    }

    // Prepare plants that need to be submitted (only those with year 2 data but no year 3 data)
    const plantsToSubmit: PlantRequestYearThreeItem[] = app.plants
      .filter(plant => !plant.has_year3_data && plant.has_year2_data)
      .map(plant => ({
        plant_id: plant.plant_id,
        application_number: appNumber,
        plant_request_new_id: plant.id,
        plants_remaining_three: this.getPlantInput(appNumber, plant.plant_id)!,
        create_by: officersLoginModel.rang_id.toString()
      }));

    if (plantsToSubmit.length === 0) {
      this.longToast('कोई नया डेटा दर्ज नहीं किया गया');
      return;
    }

    const request: SubmitPlantRequestYearThreeModel = {
      plants: plantsToSubmit
    };

    this.showDialog('डेटा सबमिट हो रहा है...');

    this.apiService.submitYearThreePlants(request).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response?.code === 200) {
          this.longToast(response.response.msg || 'डेटा सफलतापूर्वक सबमिट किया गया');
          // Reload data
          this.getYearThreeAwedanList(this.currentPage, this.currentFilter);
          this.getYearThreeAwedanCounts();
        } else {
          this.longToast(response.response?.msg || 'त्रुटि');
        }
      },
      (error) => {
        this.dismissDialog();
        this.longToast('सबमिट करने में त्रुटि: ' + error);
      }
    );
  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }


  onYearSelect(year: number) {
    if (year == 2) {
      this.router.navigateByUrl('/year-two-dashboard', {
        state: { year }
      });
    } else if (year == 3) {
      this.router.navigateByUrl('/year-three-dashboard', {
        state: { year }
      });
    } else {

      this.router.navigateByUrl('/');


    }
  }

  goToProfile() {
    this.router.navigate(['profile']);
  }

  changePassword() {
    this.router.navigate(['change-password']);
  }






}





