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
import { appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline, downloadOutline, chevronBackOutline, chevronForwardOutline, reorderThreeOutline, optionsOutline, documentTextOutline, statsChartOutline, peopleOutline, addCircleOutline, hammerOutline, leafOutline, mapOutline, clipboardOutline, cashOutline, businessOutline, personOutline, receiptOutline, walletOutline, trendingUpOutline, moon, sunny } from 'ionicons/icons';
import { Platform, AlertController } from '@ionic/angular';
import { NetworkCheckService } from 'src/app/services/network-check.service';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { TableModule } from 'primeng/table';
import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { ModalController } from '@ionic/angular';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { PaginatorModule } from 'primeng/paginator';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { YearTwoAwedanListResponseModel, YearTwoAwedanResponse, PlantDataModel } from './YearTwoAwedanResponse.model';
import { YearTwoAwedanCountsResponse } from './YearTwoAwedanCountsResponse.model';
import { SubmitPlantRequestYearTwoModel, PlantRequestYearTwoItem } from '../year-two-plant-entry/YearTwoPlantResponse.model';

interface MenuPage {
  title: string;
  is_submenu: boolean;
  url?: string;
  state?: any;
  children?: MenuPage[];
  open?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-year-two-dashboard',
  templateUrl: './year-two-dashboard.page.html',
  styleUrls: ['./year-two-dashboard.page.scss'],
  standalone: true,
  imports: [IonPopover, IonSplitPane, PaginatorModule, IonMenu, IonMenuButton, IonList, IonAvatar, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonContent, IonHeader, IonToolbar, IonIcon, IonBadge, CommonModule, FormsModule, TableModule]
})
export class YearTwoDashboardPage implements OnInit {

  popoverEvent: any;
  isUserMenuOpen = false;

  openUserMenu($event: Event) {
    this.popoverEvent = $event;
    this.isUserMenuOpen = true;
  }

  isDarkMode = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    const isDarkClass = 'ion-palette-dark';
    if (this.isDarkMode) {
      document.documentElement.classList.add(isDarkClass);
      document.body.classList.add(isDarkClass);
    } else {
      document.documentElement.classList.remove(isDarkClass);
      document.body.classList.remove(isDarkClass);
    }
  }

  private restoreSavedTheme() {
    const savedTheme = localStorage.getItem('theme-mode');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  curent_session: any;
  pages: MenuPage[] = [];
  isConnected: boolean = false;
  isNoRecordFound: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private router: Router,
    private menuCtrl: MenuController,
    private networkCheckService: NetworkCheckService,
    private platform: Platform,
    private storageService: StorageService,
    private navController: NavController,
    private langService: LanguageService,
    private cdRef: ChangeDetectorRef,
    private apiService: ApiService,
    private sharedPreference: SharedserviceService,
    private authService: AuthServiceService
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

  listOfAwedan: YearTwoAwedanListResponseModel[] = [];
  filteredAwedans: YearTwoAwedanListResponseModel[] = [];
  searchMobile: string = "";

  // Count properties
  totalCount: number = 0;
  countYes: number = 0;  // Applications with year 2 data
  countNo: number = 0;    // Applications without year 2 data
  totalPlants: number = 0; // Total plants to be implanted (eligible)
  whichBoxClicked: number = 1; // 1 = All, 2 = Yes, 3 = No
  currentFilter: string | null = null; // "Yes", "No", or null

  // Plant entry properties
  plantInputs: { [key: string]: number | null } = {}; // key: "appNumber_plantId"
  isRangeOfficer: boolean = false;

  async ngOnInit() {
    this.restoreSavedTheme();
    this.curent_session = await this.storageService.get('current_session');

    this.updateTranslation();
    this.isRangeOfficer = this.isRODesignation(); // Check if RO
    this.getYearTwoAwedanCounts(); // Load counts first
    this.getYearTwoAwedanList();

    this.langService.language$.subscribe(() => {
      this.populateMenu();
    });
  }

  private populateMenu() {
    const officerData = this.authService.getOfficerData();
    const rangid = officerData ? officerData.rang_id : null;
    const designation = officerData ? officerData.designation : null;

    const isRO = designation === '4';
    const isSDO = designation === '3';
    const isDFO = designation === '2';

    // Base menu visible to everyone (RO, SDO, DFO)
    let dynamicPages: any[] = [
      {
        title: 'गोस्वारा रिपोर्ट ',
        url: 'goswara-report',
        is_submenu: false,
        icon: 'document-text-outline'
      },
      {
        title: 'प्रजातिवार गोस्वारा रिपोर्ट ',
        url: 'prajati-goswara-report',
        is_submenu: false,
        icon: 'stats-chart-outline'
      },
      {
        title: 'गाँव वार गोस्वारा',
        url: 'gaon-var-goswara',
        is_submenu: false,
        icon: 'map-outline'
      },
      {
        title: 'किसान रिपोर्ट ',
        url: 'kissan-wise-report',
        is_submenu: false,
        icon: 'people-outline'
      }
    ];

    // Only RO can enter details
    if (isRO) {
      dynamicPages.push({
        title: 'दर्ज करें',
        is_submenu: true,
        icon: 'add-circle-outline',
        children: [
          {
            title: 'गड्ढों की संख्या दर्ज करें',
            url: 'number-of-pit',
            is_submenu: false,
            icon: 'hammer-outline'
          },
          {
            title: 'पौधों की संख्या दर्ज करें',
            url: 'ropit-paudho-ki-sankhya',
            is_submenu: false,
            icon: 'leaf-outline'
          },
          {
            title: 'रेंज रिपोर्ट (रोपण/गड्ढे)',
            url: 'range-plant-report',
            is_submenu: false,
            icon: 'clipboard-outline'
          }
        ]
      });
    }

    // Payment menu
    let paymentChildren: any[] = [];

    // DFO can make vendor payments
    if (isDFO) {
      paymentChildren.push({
        icon: 'business-outline',
        title: 'वेंडर भुगतान बनाए ',
        url: 'vendor-payment-list',
        state: {
          range_id: rangid,
          year: 2,
          fin_year: this.curent_session
        },
        is_submenu: false
      });
    }

    // RO can make hitgrahi payments
    if (isRO) {
      paymentChildren.push({
        title: 'हितग्राही भुगतान बनाएं',
        icon: 'person-outline',
        url: 'payment',
        state: {
          range_id: rangid,
          year: 2,
          fin_year: this.curent_session
        },
        is_submenu: false
      });
    }

    // Both DFO and RO need to create bills for their respective payments
    if (isDFO || isRO) {
      paymentChildren.push({
        title: 'भुगतान करे ',
        icon: 'receipt-outline',
        url: 'create-bill',
        state: {
          range_id: rangid,
          year: 2
        },
        is_submenu: false
      });
    }

    // Everyone (RO, SDO, DFO) can view payment reports
    paymentChildren.push({
      title: 'भुगतान रिपोर्ट',
      icon: 'wallet-outline',
      url: 'ropit-paudho-ki-sankhya/report',
      is_submenu: false
    });

    // If there are payment children, add the payment menu
    if (paymentChildren.length > 0) {
      dynamicPages.push({
        title: 'भुगतान',
        is_submenu: true,
        icon: 'cash-outline',
        children: paymentChildren
      });
    }

    // Everyone sees Pragati Prativedan
    dynamicPages.push({
      title: 'प्रगति प्रतिवेदन',
      url: 'pragati-prativedan',
      is_submenu: false,
      icon: 'trending-up-outline'
    });

    this.pages = dynamicPages;
  }

  toggleSubMenu(index: number, page: any) {
    if (!page.is_submenu) {
      this.onMenuItemClick(page);
      return;
    }

    this.pages.forEach((p, i) => {
      if (i !== index) {
        p.open = false;
      }
    });

    page.open = !page.open;
  }

  ionViewWillEnter() {
    if (this.sharedPreference.getRefresh()) {
      this.getYearTwoAwedanCounts();
      this.getYearTwoAwedanList();
      this.sharedPreference.setRefresh(false);
    } else {
      this.getYearTwoAwedanCounts();
      this.getYearTwoAwedanList();
    }
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.menuCtrl.enable(true, 'year-two-menu');
      this.menuCtrl.close();
    }, 100);
  }

  getOfficersSessionData() {
    return this.authService.getOfficerData();
  }

  getYearTwoAwedanCounts() {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    if (officersLoginModel != null) {
      this.apiService.getYearTwoAwedanCounts(
        officersLoginModel.designation,
        officersLoginModel.circle_id,
        officersLoginModel.devision_id,
        officersLoginModel.rang_id,
        officersLoginModel.officerId.toString(),
        this.curent_session
      ).subscribe(
        (response: YearTwoAwedanCountsResponse) => {
          if (response.response.code === 200) {
            this.totalCount = response.data.total_count || 0;
            this.countYes = response.data.count_yes || 0;
            this.countNo = response.data.count_no || 0;
            this.totalPlants = response.data.total_plants || 0;
            this.cdRef.detectChanges();
          }
        },
        (error) => {
          console.error('Error getting counts:', error);
        }
      );
    }
  }

  getYearTwoAwedanList(page: number = 1, filterYear2: string | null = null) {
    this.currentPage = page;
    this.currentFilter = filterYear2;
    this.showDialog("कृपया प्रतीक्षा करें.....");
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    console.log('filterYear2 value:', filterYear2);

    if (officersLoginModel != null) {
      // Use which_data = 3 (or any value, API will filter by status 6 anyway)
      this.apiService.getYearTwoAwedanList(
        3, // which_data - API filters by status 6 regardless
        officersLoginModel.designation,
        officersLoginModel.circle_id,
        officersLoginModel.devision_id,
        officersLoginModel.rang_id,
        officersLoginModel.officerId?.toString() || '',
        this.currentPage,
        this.pageSize,
        filterYear2, // Pass filter parameter
        this.curent_session
      ).subscribe(
        (response: YearTwoAwedanResponse) => {
          if (response.response.code === 200) {
            this.listOfAwedan = response.data || [];
            this.filteredAwedans = this.listOfAwedan;
            this.totalRecords = response.totalCount || 0;
            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

            // Initialize plant inputs for plants without year 2 data
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
      appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, logOutOutline,
      chevronBackOutline, chevronForwardOutline, downloadOutline, reorderThreeOutline, optionsOutline,
      documentTextOutline, statsChartOutline, peopleOutline, addCircleOutline, hammerOutline, leafOutline,
      mapOutline, clipboardOutline, cashOutline, businessOutline, personOutline, receiptOutline, walletOutline, trendingUpOutline,
      moon, sunny
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

    this.getYearTwoAwedanList(1, filter);
  }

  getCurrentFilterLabel(): string {
    if (this.whichBoxClicked === 1) {
      return "कुल आवेदन";
    } else if (this.whichBoxClicked === 2) {
      return "द्वितीय वर्ष में डेटा दर्ज है";
    } else if (this.whichBoxClicked === 3) {
      return "द्वितीय वर्ष में डेटा दर्ज नहीं है";
    }
    return "कुल आवेदन";
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.getYearTwoAwedanList(page, this.currentFilter);
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
    const exportData = this.filteredAwedans.map((item, index) => ({
      'क्रमांक': index + 1,
      'आवेदन नंबर': item.application_number || '',
      'हितग्राही का नाम': item.hitgrahi_name || '',
      'पिता का नाम': item.father_name || '',
      'वन मंडल': item.van_mandal_name || '',
      'रेंज': item.rang_name || '',
      'वृत्त': item.circle_name || '',
      'वर्ष 2 में रिकॉर्ड': item.has_record_in_year2 || 'No'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Year Two Applications': worksheet },
      SheetNames: ['Year Two Applications']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'Year_Two_Applications_Report.xlsx');
  }

  getLoginedOfficerName(): string {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    if (officersLoginModel) {
      return officersLoginModel.officer_name + " (" + officersLoginModel.designation_name + ")";
    }
    return '';
  }

  async logoutFunction() {
    this.menuCtrl.close();
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
        this.authService.logout();
      }
    });

    await modal.present();
  }

  async onMenuItemClick(page: any) {
    this.isConnected = await this.networkCheckService.getCurrentStatus();

    if (this.isConnected) {
      this.router.navigate([page.url], { state: page.state });
    } else {
      this.longToast(this.getTranslation("no_internet"));
      return;
    }
  }

  viewApplication(item: YearTwoAwedanListResponseModel) {
    // Navigate to view vivran after sampadit component
    this.router.navigate(['view-vivran-after-sampadit', item.application_number], {
      state: { returnUrl: this.router.url }
    });
  }

  enterYearTwoLivePlants(item: YearTwoAwedanListResponseModel) {
    // Plants are now always visible in the table, no action needed
  }

  // Initialize plant inputs for plants without year 2 data
  initializePlantInputs() {
    this.plantInputs = {};
    this.listOfAwedan.forEach(app => {
      if (app.plants) {
        app.plants.forEach(plant => {
          if (!plant.has_year2_data) {
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

  // Validate plant input
  validatePlantInput(plant: PlantDataModel): boolean {
    const appNumber = plant.application_number;
    const value = this.getPlantInput(appNumber, plant.plant_id);
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

  // Check if application has plants needing year 2 data
  hasPlantsNeedingData(appNumber: string): boolean {
    const app = this.listOfAwedan.find(a => a.application_number === appNumber);
    if (!app || !app.plants) {
      return false;
    }
    return app.plants.some(p => !p.has_year2_data);
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

    const plantsNeedingData = app.plants.filter(p => !p.has_year2_data);
    if (plantsNeedingData.length === 0) {
      return false; // All plants already have data
    }

    return plantsNeedingData.every(plant => {
      const value = this.getPlantInput(appNumber, plant.plant_id);
      return value !== null && value !== undefined && value >= 0 && value <= plant.total_ropit;
    });
  }

  // Calculate survival percentage
  calculateSurvivalPercentage(plant: PlantDataModel): number | null {
    const appNumber = plant.application_number;
    const remaining = this.getPlantInput(appNumber, plant.plant_id);
    if (remaining === null || remaining === undefined || plant.total_ropit === 0) {
      return null;
    }
    return Math.round((remaining / plant.total_ropit) * 100 * 100) / 100;
  }

  // Submit year 2 data for an application
  async submitYearTwoData(appNumber: string) {
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

    // Prepare plants that need to be submitted
    const plantsToSubmit: PlantRequestYearTwoItem[] = app.plants
      .filter(plant => !plant.has_year2_data)
      .map(plant => ({
        plant_id: plant.plant_id,
        application_number: appNumber,
        plant_request_new_id: plant.id,
        plants_remaining_two: this.getPlantInput(appNumber, plant.plant_id)!,
        create_by: officersLoginModel.rang_id.toString()
      }));

    if (plantsToSubmit.length === 0) {
      this.longToast('कोई नया डेटा दर्ज नहीं किया गया');
      return;
    }

    const request: SubmitPlantRequestYearTwoModel = {
      plants: plantsToSubmit
    };

    this.showDialog('डेटा सबमिट हो रहा है...');

    this.apiService.submitYearTwoPlants(request).subscribe(
      (response) => {
        this.dismissDialog();
        if (response.response?.code === 200) {
          this.longToast(response.response.msg || 'डेटा सफलतापूर्वक सबमिट किया गया');
          // Reload data
          this.getYearTwoAwedanList(this.currentPage, this.currentFilter);
          this.getYearTwoAwedanCounts();
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

  // Check if user is Range Officer
  isRODesignation(): boolean {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
    return officersLoginModel?.designation === "4";
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
      let route = '/officers-dashboard';
      const officerData = this.getOfficersSessionData() as any;
      if (officerData && officerData.designation) {
        switch (officerData.designation) {
          case '1':
          case 'Circle':
          case 'CFO':
            route = '/officers-dashboard-circle';
            break;
          case '2':
            route = '/officers-dashboard'; // DFO
            break;
          case '3':
            route = '/officers-dashboard-sdo'; // SDO
            break;
          case '4':
            route = '/officers-dashboard-ro'; // RO
            break;
          case '6':
          case '7':
          case 'SUPREME':
            route = '/officers-dashboard-supreme'; // ADMIN
            break;
        }
      }
      this.router.navigateByUrl(route);
    }
  }


  goToProfile() {
    this.router.navigate(['profile']);
  }

  changePassword() {
    this.router.navigate(['change-password']);
  }

}

