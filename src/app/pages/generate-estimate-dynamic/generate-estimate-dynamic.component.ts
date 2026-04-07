import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';

import { CommonModule, Location } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { tableData } from '../generate-estimate/estimate-table';
import { NgZone } from '@angular/core';
import { checkmarkCircleOutline, alertCircleOutline, helpCircleOutline, cloudUploadOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import * as pdfFontsBold from "../../../assets/fonts/vfs_fonts_bold_custom";
import * as pdfFontsNormal from "../../../assets/fonts/vfs_fonts_custom";
import pdfMake from 'pdfmake/build/pdfmake';
(pdfMake as any).vfs = {
  ...pdfFontsBold.vfs,
  ...pdfFontsNormal.vfs
};
/**
 * Simple Plant Category Structure
 * - label: Display name (e.g., "क्लोनल नीलगिरी")
 * - rateField: Which field to use from tableData (e.g., "klonalNeelgiri")
 * - plantCount: Total number of plants
 * - area: Total area
 */
type DisplayCategory = {
  label: string;
  rateField: string;
  plantCount: number;
  area: number;
  plantId: number;
  ropitCount: number;
};

import { EstimateService } from '../../services/estimate.service';

@Component({
  standalone: true,
  selector: 'app-generate-estimate-dynamic',
  templateUrl: './generate-estimate-dynamic.component.html',
  styleUrls: ['./generate-estimate-dynamic.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})
export class GenerateEstimateDynamicComponent implements OnInit {
  @ViewChild('uploadFile') uploadFileRef!: ElementRef<HTMLInputElement>;

  selectedRoFile: File | null = null;
  selectedSdoFile: File | null = null;
  selectedDfoFile: File | null = null;

  onRoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedRoFile = input.files?.[0] || null;
  }
  onSdoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedSdoFile = input.files?.[0] || null;
  }
  onDfoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedDfoFile = input.files?.[0] || null;
  }


  applicationNumber: string | null = null;
  singleData: any;
  estimateRows: any[] = [];

  // Officer dropdowns and selections (to mirror normal estimate page)
  vanMandalAdhikari: string = ''; // DFO
  upVanMandalAdhikari: string = ''; // SDO
  vanParikshanAdhikari: string = ''; // RO
  officer_name: string = '';
  designationId: number | null = null; // 2=DFO, 3=SDO, 4=RO
  isRO: boolean = false;
  isSDO: boolean = false;
  isDFO: boolean = false;

  // Description fields toggled when selection is made
  roDescription: string = '';
  sdoDescription: string = '';
  dfoDescription: string = '';

  // Existing approval data properties
  existingApprovalData: any[] = [];
  existingApplicationStatus: string = '';
  isReturnCase: boolean = false; // true when status is 3 or 5 (returned from SDO/DFO)
  isFinalStatus: boolean = false; // true when status is 6 (DFO accepted - final status)

  // For read-only display of other users' data
  existingRODescription: string = '';
  existingSDODescription: string = '';
  existingDFODescription: string = '';
  existingRODeclaration: boolean = false;
  existingSDODeclaration: boolean = false;
  existingDFODeclaration: boolean = false;

  // वनमंडलाधिकारी (DFO)
  vanMandalOptions = [
    { label: 'वन परिक्षेत्र अधिकारी,त्रुटि सुधार कर प्राक्कलन पुनः प्रस्तुत करें |', value: '5' },
    { label: 'प्राक्कलन स्वीकृत किया जाता है |', value: '6' },
  ];

  // उप-वनमंडलाधिकारी (SDO)
  upVanMandalOptions = [
    { label: 'वन परिक्षेत्र अधिकारी, त्रुटि सुधार कर प्राक्कलन पुनः प्रस्तुत करें |', value: '3' },
    { label: 'वन मंडलाधिकारी की ओर स्वीकृत हेतु प्रेषित है |', value: '4' },
  ];

  // वन परिक्षेत्र अधिकारी (RO)
  vanParikshanOptions = [
    { label: 'उप-वन मंडलाधिकारी की ओर स्वीकृत हेतु प्रेषित है |', value: '2' }
  ];

  // ============================================================================
  // STEP 2: TABLE DATA FROM estimate-table.ts (DIRECT USAGE)
  // ============================================================================

  // Get table data directly from estimate-table.ts - no complex processing
  year1Rows: any[] = [];
  year2Rows: any[] = [];
  year3Rows: any[] = [];

  // ============================================================================
  // STEP 3: SIMPLE MAPPING - Plant Name → Rate Field
  // ============================================================================

  /**
   * Simple lookup: Given a plant name, which field in tableData to use
   * Example: "क्लोनल नीलगिरी" → "klonalNeelgiri"
   * This replaces the complex classify() method
   */
  private plantNameToRateField: Record<string, string> = {
    'क्लोनल नीलगिरी': 'klonalNeelgiri',
    'नीलगिरी': 'klonalNeelgiri',
    'टिशू कल्चर बांस': 'tissuclturebans',
    'टिश्यू कल्चर बांस': 'tissuclturebans',
    'साधारण बांस': 'tissuclturebans',
    'चंदन': 'chandan_poudha',
    'मिलिया डूबिया': 'milidubiya',
    'साधारण सागौन': 'tissuclturesagon',
    'टिशू कल्चर सागौन': 'tissuclturesagon',
    'टिश्यू कल्चर सागौन': 'tissuclturesagon',
  };

  // ============================================================================
  // STEP 4: PLANT CATEGORIES TO DISPLAY
  // ============================================================================

  categoriesToShow: DisplayCategory[] = [];

  // Loading state
  isLoading: boolean = false;
  private loadingElement: any = null;

  // Page loading state (for initial page load)
  isPageLoading: boolean = false;
  private dataLoadTracker = { bundle: false, approval: false };
  storedData: any;
  uploadedFileName: any;
  estimate_data: any = null;
  firstRecord: any = null;
  sdo_declaration: any;
  dfo_declaration: any;

  // Modal State
  isStatusModalOpen = false;
  statusType: 'success' | 'error' | 'question' = 'success';
  statusMessage = '';
  pendingAction: (() => void) | null = null;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private api: ApiService,
    private estimateService: EstimateService, // Inject EstimateService
    private cdRef: ChangeDetectorRef,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private authService: AuthServiceService,
    private zone: NgZone
  ) {
    addIcons({
      cloudUploadOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      helpCircleOutline
    });
  }

  ngOnInit(): void {
    // ... existing code ...

    // Subscribe to workPlanData to populate year rows
    this.estimateService.loadWorkPlanData();
    this.estimateService.workPlanData$.subscribe(data => {
      console.log('Received work plan data:', data);
      // Handle array format (old)
      if (Array.isArray(data) && data.length > 0) {
        this.year1Rows = data.filter(x => x.year === 1);
        this.year2Rows = data.filter(x => x.year === 2);
        this.year3Rows = data.filter(x => x.year === 3);
        this.cdRef.detectChanges();
      }
      // Handle object format (new API)
      else if (data && typeof data === 'object') {
        const dataObj = data as Record<string, any>;
        this.year1Rows = dataObj['प्रथम_वर्ष'] || [];
        this.year2Rows = dataObj['द्वितीय_वर्ष'] || [];
        this.year3Rows = dataObj['तृतीय_वर्ष'] || [];
        this.cdRef.detectChanges();
      }
    });

    (pdfMake as any).fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      },
      NotoSansDevanagari: {
        normal: "NotoSansDevanagari-Regular.ttf",
        bold: "NotoSansDevanagari-Bold.ttf",
        italics: "NotoSansDevanagari-Regular.ttf",
        bolditalics: "NotoSansDevanagari-Bold.ttf"
      },
      Lohit: {
        normal: "Lohit-Devanagari.ttf",
      },
      KrutiDev: {
        normal: "KRDEV010.ttf",
      }
    };




    // Step 5.1: Get application number from URL query params
    // this.route.queryParams.subscribe(params => {
    //   this.applicationNumber = params['applicationNumber'] || null;

    const navigation = this.router.getCurrentNavigation();
    this.applicationNumber = navigation?.extras?.state?.['applicationNumber'] || null;

    if (this.applicationNumber) {
      // Step 5.2: Show loading spinner, reset data tracker
      this.isPageLoading = true;
      this.dataLoadTracker = { bundle: false, approval: false };

      // Step 5.3: Load data from API (two parallel calls)
      this.loadBundle(this.applicationNumber);
      this.loadExistingApprovalData(this.applicationNumber);
      this.GetEstimateFile(this.applicationNumber);
    } else {
      this.isPageLoading = false;
    }


    // // Step 5.4: Get logged-in officer info from service
    const officerData = this.authService.getOfficerData();
    let subdivName = '';
    let rangName = '';
    // console.log('Stored Data:', officerData);
    if (officerData) {
      try {
        subdivName = officerData?.devision_id || ''; // Sub-division name
        rangName = officerData?.rang_name || '';       // Range name 

        this.officer_name = officerData?.officer_name || '';
        const dId = Number(officerData?.designation);
        this.designationId = isNaN(dId) ? null : dId;

        // Step 5.5: Set officer type flags (2=DFO, 3=SDO, 4=RO)
        this.isRO = this.designationId === 4;
        this.isSDO = this.designationId === 3;
        this.isDFO = this.designationId === 2;
      } catch { }
    }
  }

  // ============================================================================
  // STEP 6: CHECK IF ALL DATA LOADED
  // ============================================================================

  /**
   * Check if both API calls (bundle + approval) are complete
   * Hide loading spinner when both are done
   */
  private checkAllDataLoaded() {
    if (this.dataLoadTracker.bundle && this.dataLoadTracker.approval) {
      this.isPageLoading = false;
      this.cdRef.detectChanges();
    }
  }

  // ============================================================================
  // STEP 7: LOAD ESTIMATE DATA FROM API
  // ============================================================================

  /**
   * Main data loading function
   * Flow: API call → Process rows → Group by plant name → Create categories
   */
  private loadBundle(applicationNumber: string) {
    this.api.getEstimateBundle(applicationNumber).subscribe({
      next: (res: any) => {
        // Step 7.1: Get applicant information
        this.singleData = res?.singleData || null;
        console.log('Estimate Bundle Data:', this.singleData);
        // Step 7.2: Get estimate rows (plant data from API)
        const rows: any[] = res?.data || [];
        this.estimateRows = rows;
        // console.log('Estimate Rows:', res?.data);
        // Step 7.3: Helper function to safely convert to number
        const parseNum = (v: any) => {
          const num = Number(v);
          return isNaN(num) ? 0 : num;
        };

        // Step 7.4: Group plants by name and sum counts/areas
        // Use Map: key = plant name, value = {plantCount, area, rateField, plantId, ropitCount}
        const categoryMap = new Map<string, { plantCount: number; area: number; rateField: string; plantId: number; ropitCount: number }>();

        rows.forEach(row => {
          // Step 7.4.1: Extract data from each row
          const plantId = Number(row?.plant_id) || 0;
          const plantName = (row?.plant_name || '').toString().trim();
          const count = parseNum(row?.total_tree || row?.estimated_required_trees);
          const area = parseNum(row?.total_area);
          const ropit = parseNum(row?.total_ropit);

          if (!plantName) return; // Skip if no name

          // Step 7.4.2: Determine which rate field to use from tableData
          let rateField = 'anyaPoudha'; // Default for "other" plants
          if (plantId < 8) {
            rateField = this.plantNameToRateField[plantName] || 'anyaPoudha';
          }

          // Step 7.4.3: Group by plant name (same name = same category)
          const existing = categoryMap.get(plantName) || { plantCount: 0, area: 0, rateField: rateField, plantId: plantId, ropitCount: 0 };
          categoryMap.set(plantName, {
            plantCount: existing.plantCount + count,
            area: existing.area + area,
            rateField: rateField,
            plantId: plantId,
            ropitCount: existing.ropitCount + ropit
          });
        });

        // Step 7.5: Convert Map to simple array for display
        this.categoriesToShow = Array.from(categoryMap.entries()).map(([name, data]) => ({
          label: name,
          plantCount: data.plantCount,
          area: data.area,
          rateField: data.rateField,
          plantId: data.plantId,
          ropitCount: data.ropitCount
        }));

        // Step 7.6: Mark bundle as loaded
        this.dataLoadTracker.bundle = true;
        this.checkAllDataLoaded();
        this.cdRef.detectChanges();
      },
      error: () => {
        // Step 7.7: Handle error
        this.singleData = null;
        this.categoriesToShow = [];
        this.dataLoadTracker.bundle = true;
        this.checkAllDataLoaded();
        this.cdRef.detectChanges();
      }
    });
  }

  // ============================================================================
  // STEP 8: LOAD EXISTING APPROVAL DATA
  // ============================================================================

  /**
   * Load previous approval decisions from database
   * Flow: API call → Parse status → Set dropdowns → Set descriptions
  
  
  */




  private loadExistingApprovalData(applicationNumber: string) {
    this.api.getEstimateApprovalByApplication(applicationNumber).subscribe({
      next: (res: any) => {

        // Step 8.1: Check if approval data exists
        if (res?.response?.code === 200 && res?.data && res.data.length > 0) {
          this.existingApprovalData = res.data;

          this.firstRecord = res.data[0]; // Use first record (all should be same)

          console.log('Existing Approval Data:', this.firstRecord);
          // Step 8.2: Get application status
          this.existingApplicationStatus = this.firstRecord.ApplicationNumber != null
            ? String(this.firstRecord.ApplicationStatus).trim()
            : '';

          // Step 8.3: Check if it's a return case (SDO/DFO sent back to RO)
          const sdoValue = this.firstRecord.SDODeclaration != null ? String(this.firstRecord.SDODeclaration).trim() : '';
          const dfoValue = this.firstRecord.DFODeclaration != null ? String(this.firstRecord.DFODeclaration).trim() : '';

          this.isReturnCase = (this.existingApplicationStatus === '3' && sdoValue === '2') ||
            (this.existingApplicationStatus === '5' && dfoValue === '2');

          // Step 8.4: Check if final status (DFO accepted)
          this.isFinalStatus = (this.existingApplicationStatus === '6');

          // Step 8.5: Get existing descriptions
          this.existingRODescription = this.getSafeString(this.firstRecord.RODescription);
          this.existingSDODescription = this.getSafeString(this.firstRecord.SDODescription);
          this.existingDFODescription = this.getSafeString(this.firstRecord.DFODescription);

          // Step 8.6: Set dropdowns based on existing declarations
          // RO: Declaration 1 → Dropdown '2'
          if (this.firstRecord.RODeclaration != null && this.firstRecord.RODeclaration !== '' &&
            this.firstRecord.RODeclaration !== false && this.firstRecord.RODeclaration !== 0) {
            const roValue = String(this.firstRecord.RODeclaration).trim();
            if (roValue === '1') this.vanParikshanAdhikari = '2';
          }

          // SDO: Declaration 1 → Dropdown '4', Declaration 2 → Dropdown '3'
          if (this.firstRecord.SDODeclaration != null && this.firstRecord.SDODeclaration !== '' &&
            this.firstRecord.SDODeclaration !== false && this.firstRecord.SDODeclaration !== 0) {
            const sdoValue = String(this.firstRecord.SDODeclaration).trim();
            if (sdoValue === '1') this.upVanMandalAdhikari = '4';
            else if (sdoValue === '2') this.upVanMandalAdhikari = '3';
          }

          // DFO: Declaration 1 → Dropdown '6', Declaration 2 → Dropdown '5'
          if (this.firstRecord.DFODeclaration != null && this.firstRecord.DFODeclaration !== '' &&
            this.firstRecord.DFODeclaration !== false && this.firstRecord.DFODeclaration !== 0) {
            const dfoValue = String(this.firstRecord.DFODeclaration).trim();
            if (dfoValue === '1') this.vanMandalAdhikari = '6';
            else if (dfoValue === '2') this.vanMandalAdhikari = '5';
          }

          // Step 8.7: Pre-fill descriptions for logged-in officer
          if (this.isRO && this.existingRODescription) this.roDescription = this.existingRODescription;
          if (this.isSDO && this.existingSDODescription) this.sdoDescription = this.existingSDODescription;
          if (this.isDFO && this.existingDFODescription) this.dfoDescription = this.existingDFODescription;

          this.dataLoadTracker.approval = true;
          this.checkAllDataLoaded();
          this.cdRef.detectChanges();
        } else {
          // Step 8.8: No existing data - fresh start
          this.existingApprovalData = [];
          this.isReturnCase = false;
          this.isFinalStatus = false;
          this.dataLoadTracker.approval = true;
          this.checkAllDataLoaded();
        }
      },
      error: (err) => {
        // Step 8.9: Handle error
        console.error('Error loading existing approval data:', err);
        this.existingApprovalData = [];
        this.isReturnCase = false;
        this.isFinalStatus = false;
        this.dataLoadTracker.approval = true;
        this.checkAllDataLoaded();
        this.cdRef.detectChanges();
      }
    });
  }


  /**
   * Calculate grand total for one category (all 3 years)
   */
  getGrandTotal(cat: DisplayCategory): number {
    return this.getYearTotal(cat, this.year1Rows) +
      this.getYearTotal(cat, this.year2Rows) +
      this.getYearTotal(cat, this.year3Rows);
  }


  getTotalYear1(): number {
    return this.categoriesToShow.reduce((sum, cat) =>
      sum + this.getYearTotal(cat, this.year1Rows), 0
    );
  }


  getTotalYear2(): number {
    return this.categoriesToShow.reduce((sum, cat) =>
      sum + this.getYearTotal(cat, this.year2Rows), 0
    );
  }


  getTotalYear3(): number {
    return this.categoriesToShow.reduce((sum, cat) =>
      sum + this.getYearTotal(cat, this.year3Rows), 0
    );
  }

  /**
   * Calculate grand total for all categories (all 3 years)
   */
  getTotalGrandTotal(): number {
    return this.categoriesToShow.reduce((sum, cat) =>
      sum + this.getGrandTotal(cat), 0
    );
  }

  // ============================================================================
  // STEP 10: HELPER METHODS
  // ============================================================================

  /**
   * Safely convert any value to string (avoid "[object Object]")
   */
  getSafeString(value: any): string {
    if (value == null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') return '';
    return String(value);
  }

  /**
   * Check if current user can update based on application status
   * Rules:
   * - Status 0/1: Only RO can update
   * - Status 2: Only SDO can update
   * - Status 3: Only RO can update (returned case)
   * - Status 4: Only DFO can update
   * - Status 5: Only RO can update (returned case)
   * - Status 6: No one can update (final)
   */

  // canUserUpdate(): boolean {
  //   const status = this.existingApplicationStatus;
  //   if (status === '0' || status === '' || status === '1') return this.isRO;
  //   if (status === '2') return this.isSDO;
  //   if (status === '3') return this.isRO;
  //   if (status === '4') return this.isDFO;
  //   if (status === '5') return this.isRO;
  //   if (status === '6') return false;
  //   return this.isRO; // Default: RO can update
  // }

  /**
   * Convert number to words (for display)
   */
  convertNumberToWords(num: number): string {
    if (num === 0) return 'Zero';
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
    };
    return inWords(num);
  }

  // ============================================================================
  // STEP 11: LOADING/TOAST HELPERS
  // ============================================================================

  async showLoading(message: string = 'कृपया प्रतीक्षा करें...') {
    this.isLoading = true;
    this.loadingElement = await this.loadingController.create({
      message: message,
      spinner: 'crescent',
      backdropDismiss: false
    });
    await this.loadingElement.present();
    this.cdRef.detectChanges();
  }

  async dismissLoading() {
    this.isLoading = false;
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
      this.loadingElement = null;
    }
    this.cdRef.detectChanges();
  }

  async showToast(message: string, color: 'success' | 'danger' = 'danger', duration: number = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color,
      position: 'top',
      buttons: [
        {
          text: 'ठीक है',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  async showError(error: any) {
    let errorMessage = 'एक त्रुटि हुई है';
    if (error?.error?.response?.msg) {
      errorMessage = error.error.response.msg;
    } else if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    await this.showToast(errorMessage, 'danger', 4000);
  }

  /**
   * Reload page after successful operation
   */
  reloadPage() {
    if (this.applicationNumber) {
      window.location.reload();
    }
  }

  // Modal Methods
  confirmAction() {
    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      this.isStatusModalOpen = false;
      action();
    }
  }

  closeStatusModal() {
    this.isStatusModalOpen = false;
    const wasSuccess = this.statusType === 'success';
    this.pendingAction = null;
    if (wasSuccess) {
      this.zone.run(() => {
        this.reloadPage();
      });
    }
  }

  showStatusModal(message: string, type: 'success' | 'error' | 'question' = 'success', action: (() => void) | null = null) {
    this.statusMessage = message;
    this.statusType = type;
    this.pendingAction = action;
    this.isStatusModalOpen = true;
    this.cdRef.detectChanges();
  }

  // ============================================================================
  // STEP 12: APPROVAL WORKFLOW - BUILD APPROVAL ITEMS
  // ============================================================================

  /**
   * Build approval items for API submission
   * Flow: For each plant → Calculate Work1-13 → Calculate KoolYog1-3 → Calculate GrandTotal
   */
  private buildApprovalItems(): any[] {
    return this.categoriesToShow.map(cat => {
      // Step 12.1: Use grouped category data
      const plantId = cat.plantId;
      const rateField = cat.rateField;
      const totalPlant = cat.plantCount;
      const totalArea = cat.area;

      const less5plant = this.less5TreeCount(cat);
      const more5plant = this.more5TreeCount(cat);

      // Step 12.3: Calculate Work1-7 (Year 1: 7 items)
      const work1_7: number[] = [];
      this.year1Rows.forEach((tableRow, idx) => {
        if (idx < 7) {
          const rate = Number(tableRow?.[rateField]) || 0;
          work1_7.push(rate * less5plant);
        }
      });
      while (work1_7.length < 7) work1_7.push(0);

      // Step 12.4: Calculate Work8-10 (Year 2: 3 items)
      const work8_10: number[] = [];
      this.year2Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = Number(tableRow?.[rateField]) || 0;
          work8_10.push(rate * less5plant);
        }
      });
      while (work8_10.length < 3) work8_10.push(0);

      // Step 12.5: Calculate Work11-13 (Year 3: 3 items)
      const work11_13: number[] = [];
      this.year3Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = Number(tableRow?.[rateField]) || 0;
          work11_13.push(rate * less5plant);
        }
      });
      while (work11_13.length < 3) work11_13.push(0);

      // Year 1 More than 5 acre portion (halfrate)
      const work1A_7A: number[] = [];
      this.year1Rows.forEach((tableRow, idx) => {
        if (idx < 7) {
          const rate = this.halfrate(Number(tableRow?.[rateField]));
          work1A_7A.push(rate * more5plant);
        }
      });
      while (work1A_7A.length < 7) work1A_7A.push(0);

      // Year 2 More than 5 acre portion (halfrate2 based on itemKramank)
      const work8A_10A: number[] = [];
      this.year2Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = this.halfrate2(Number(tableRow?.[rateField]) || 0, tableRow.itemKramank);
          work8A_10A.push(rate * more5plant);
        }
      });
      while (work8A_10A.length < 3) work8A_10A.push(0);

      // Year 3 More than 5 acre portion (halfrate2 based on itemKramank)
      const work11A_13A: number[] = [];
      this.year3Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = this.halfrate2(Number(tableRow?.[rateField]) || 0, tableRow.itemKramank);
          work11A_13A.push(rate * more5plant);
        }
      });
      while (work11A_13A.length < 3) work11A_13A.push(0);

      // Calculate year totals
      const koolYog1 = Math.round(work1_7.reduce((sum, amt) => sum + amt, 0));
      const koolYog2 = Math.round(work8_10.reduce((sum, amt) => sum + amt, 0));
      const koolYog3 = Math.round(work11_13.reduce((sum, amt) => sum + amt, 0));

      const koolYog1A = Math.round(work1A_7A.reduce((sum, amt) => sum + amt, 0));
      const koolYog2A = Math.round(work8A_10A.reduce((sum, amt) => sum + amt, 0));
      const koolYog3A = Math.round(work11A_13A.reduce((sum, amt) => sum + amt, 0));

      const grandTotal = Math.round(koolYog1 + koolYog2 + koolYog3 + koolYog1A + koolYog2A + koolYog3A);

      return {
        ApplicationNumber: this.applicationNumber as string,
        PlantId: plantId,
        KoolYog1: koolYog1, KoolYog2: koolYog2, KoolYog3: koolYog3,
        Work1: work1_7[0] || 0, Work2: work1_7[1] || 0, Work3: work1_7[2] || 0,
        Work4: work1_7[3] || 0, Work5: work1_7[4] || 0, Work6: work1_7[5] || 0, Work7: work1_7[6] || 0,
        Work8: work8_10[0] || 0, Work9: work8_10[1] || 0, Work10: work8_10[2] || 0,
        Work11: work11_13[0] || 0, Work12: work11_13[1] || 0, Work13: work11_13[2] || 0,

        KoolYog1A: koolYog1A, KoolYog2A: koolYog2A, KoolYog3A: koolYog3A,
        Work1A: work1A_7A[0] || 0, Work2A: work1A_7A[1] || 0, Work3A: work1A_7A[2] || 0,
        Work4A: work1A_7A[3] || 0, Work5A: work1A_7A[4] || 0, Work6A: work1A_7A[5] || 0, Work7A: work1A_7A[6] || 0,
        Work8A: work8A_10A[0] || 0, Work9A: work8A_10A[1] || 0, Work10A: work8A_10A[2] || 0,
        Work11A: work11A_13A[0] || 0, Work12A: work11A_13A[1] || 0, Work13A: work11A_13A[2] || 0,
        GrandTotal: grandTotal,
        TotalPlant: totalPlant,
        RopitCount: cat.ropitCount,
        Less5plant: less5plant,
        More5plant: more5plant
      };
    });
  }

  /**
   * Get logged-in officer ID from session
   */
  private getLoggedInOfficerId(): number | null {
    try {
      const officerData = this.authService.getOfficerData();
      if (!officerData) return null;
      const id = Number(officerData?.officerId);
      return isNaN(id) ? null : id;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // STEP 13: APPROVAL ACTIONS - RO METHODS
  // ============================================================================

  /**
   * RO: Soft delete (when updating after return)
   */
  async roSoftDelete() {
    if (!this.applicationNumber) return;

    await this.showLoading('डिलीट किया जा रहा है...');

    this.api.softDeleteEstimateApproval(this.applicationNumber as string).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          await this.showToast(response.response.msg || 'डिलीट सफलतापूर्वक हुआ', 'success');
          this.reloadPage();
        } else {
          await this.showError(response?.response?.msg || 'डिलीट असफल');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }


  //  * RO: Send to SDO (status 2)

  roSendToSDO() {
    this.showStatusModal('क्या आप सुनिश्चित हैं कि आप SDO को भेजना चाहते हैं?', 'question', () => {
      this.executeRoSendToSDO();
    });
  }

  async executeRoSendToSDO(description?: string) {
    await this.showLoading('SDO को भेजा जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'RO',
        Action: 'sendToSDO',
        RODeclaration: '1', // 1 = accepted
        RODescription: description || this.roDescription || null,
        ROId: officerId
      }
    };
    this.api.saveEstimateApproval(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          this.showStatusModal('सफलतापूर्वक SDO को भेजा गया', 'success');
        } else {
          this.showStatusModal('भेजना असफल', 'error');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }



  //  * SDO: Return to RO (status 3)
  sdoReturnToRO() {
    this.showStatusModal('क्या आप सुनिश्चित हैं कि आप RO को वापस भेजना चाहते हैं?', 'question', () => {
      this.executeSdoReturnToRO();
    });
  }

  async executeSdoReturnToRO(description?: string) {
    await this.showLoading('RO को वापस भेजा जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'SDO',
        Action: 'returnToRO',
        SDODeclaration: '2', // 2 = return to RO
        SDODescription: description || this.sdoDescription || null,
        SDOId: officerId,
      }
    };
    this.api.SdoSendBackToRo(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          this.showStatusModal('सफलतापूर्वक RO को वापस भेजा गया', 'success');
        } else {
          this.showStatusModal('वापस भेजना असफल', 'error');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }

  //  * SDO: Send to DFO (status 4)
  sdoSendToDFO() {
    this.showStatusModal('क्या आप सुनिश्चित हैं कि आप DFO को भेजना चाहते हैं?', 'question', () => {
      this.executeSdoSendToDFO();
    });
  }

  async executeSdoSendToDFO(description?: string, dfoId?: number) {
    await this.showLoading('DFO को भेजा जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'SDO',
        Action: 'sendToDFO',
        SDODeclaration: '1', // 1 = accepted
        SDODescription: description || this.sdoDescription || null,
        SDOId: officerId
      }
    };
    this.api.SdoSendToDfo(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          this.showStatusModal('सफलतापूर्वक DFO को भेजा गया', 'success');
        } else {
          this.showStatusModal('भेजना असफल', 'error');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }


  //  * DFO: Return to RO (status 5)

  dfoReturnToRO() {
    this.showStatusModal('क्या आप सुनिश्चित हैं कि आप RO को वापस भेजना चाहते हैं?', 'question', () => {
      this.executeDfoReturnToRO();
    });
  }

  async executeDfoReturnToRO(description?: string) {
    await this.showLoading('RO को वापस भेजा जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'DFO',
        Action: 'returnToRO',
        DFODeclaration: '2', // 2 = return to RO
        DFODescription: description || this.dfoDescription || null,
        DFOId: officerId
      }
    };
    this.api.dfoReturnToRO(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          this.showStatusModal('सफलतापूर्वक RO को वापस भेजा गया', 'success');
        } else {
          this.showStatusModal('वापस भेजना असफल', 'error');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }


  //  * DFO: Accept (status 6 - final)

  dfoAccept() {
    this.showStatusModal('क्या आप सुनिश्चित हैं कि आप प्राकलन स्वीकृत करना चाहते हैं?', 'question', () => {
      this.executeDfoAccept();
    });
  }

  async executeDfoAccept(description?: string) {
    await this.showLoading('प्राकलन स्वीकृत किया जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'DFO',
        Action: 'accept',
        DFODeclaration: '1', // 1 = accepted
        DFODescription: description || this.dfoDescription || null,
        DFOId: officerId
      }
    };
    this.api.dfoAccept(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          this.showStatusModal('प्राकलन सफलतापूर्वक स्वीकृत किया गया', 'success');
        } else {
          this.showStatusModal('स्वीकृति असफल', 'error');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }





  goBack() {
    this.location.back();
  }


  confirmDelete() {
    this.showStatusModal('क्या आप सुनिश्चित हैं? आप इस डेटा को हटाना चाहते हैं?', 'question', () => {
      this.roSoftDelete();
    });
  }







  uploadRoFile() {
    if (!this.selectedRoFile) {
      this.showStatusModal('कृपया एक फ़ाइल चुनें।', 'error');
      return;
    }

    const formData = new FormData();
    formData.append("applicationNumber", this.singleData.applicationNumber);
    formData.append("roFile", this.selectedRoFile);

    this.showLoading();

    this.api.uploadRo(formData).subscribe({
      next: async (response: any) => {
        const res = response?.response || response;
        const code = res?.code;
        const message = res?.msg;

        await this.dismissLoading();

        if (code === 200) {
          this.showStatusModal(message || "RO फ़ाइल सफलतापूर्वक अपलोड हुई", 'success');
          this.selectedRoFile = null;
          this.uploadFileRef.nativeElement.value = '';
        } else {
          this.showStatusModal(message || "फ़ाइल अपलोड असफल", 'error');
        }
      },
      error: async (err) => {
        console.error("UPLOAD ERROR", err);
        await this.dismissLoading();
        await this.showError("Server Error");
      }
    });
  }

  uploadSdo() {
    if (!this.selectedSdoFile) {
      this.showStatusModal('कृपया एक फ़ाइल चुनें।(SDO)', 'error');
      return;
    }

    const formData = new FormData();
    formData.append("applicationNumber", this.singleData.applicationNumber);
    formData.append("sdoFile", this.selectedSdoFile);

    this.showLoading();

    this.api.uploadSdo(formData).subscribe({
      next: async (response: any) => {
        const res = response?.response || response;
        const code = res?.code;
        const message = res?.msg;

        await this.dismissLoading();

        if (code === 200) {
          this.showStatusModal(message || "SDO फ़ाइल सफलतापूर्वक अपलोड हुई", 'success');
          this.selectedSdoFile = null;
          this.uploadFileRef.nativeElement.value = '';
        } else {
          this.showStatusModal(message || "फ़ाइल अपलोड असफल", 'error');
        }
      },
      error: async () => {
        await this.dismissLoading();
        await this.showError("Server Error");
      }
    });
  }

  uploadDfo() {
    if (!this.selectedDfoFile) {
      this.showStatusModal('कृपया एक फ़ाइल चुनें।', 'error');
      return;
    }

    const formData = new FormData();
    formData.append("applicationNumber", this.singleData.applicationNumber);
    formData.append("DfoFile", this.selectedDfoFile);

    this.showLoading();

    this.api.uploadDfo(formData).subscribe({
      next: async (response: any) => {
        const res = response?.response || response;
        const code = res?.code;
        const message = res?.msg;

        await this.dismissLoading();

        if (code === 200) {
          this.showStatusModal(message || "DFO फ़ाइल सफलतापूर्वक अपलोड हुई", 'success');
          this.selectedDfoFile = null;
          this.uploadFileRef.nativeElement.value = '';
        } else {
          this.showStatusModal(message || "फ़ाइल अपलोड असफल", 'error');
        }
      },
      error: async () => {
        await this.dismissLoading();
        await this.showError("Server Error");
      }
    });
  }



  private GetEstimateFile(applicationNumber: string) {

    this.api.GetEstimateFile(applicationNumber).subscribe({
      next: (res: any) => {
        if (res?.response?.code === 200 && res?.data) {
          this.estimate_data = res.data[0];
          // console.log('Estimate file data loaded:', this.estimate_data);
          this.uploadedFileName = res.data;
          // if (typeof this.estimate_data.sdo_file === 'object') {
          //   this.estimate_data.sdo_file = null;
          // }
          if (typeof this.estimate_data?.sdo_file === 'object') {
            this.estimate_data.sdo_file = null;
          }

          if (typeof this.estimate_data?.dfo_file === 'object') {
            this.estimate_data.dfo_file = null;
          }

          this.cdRef.detectChanges();
        } else {
          this.uploadedFileName = null;
          this.cdRef.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading estimate file data:', err);
        this.uploadedFileName = null;
        this.cdRef.detectChanges();
      }
    });
  }

  getFileUrl(fileName: string) {
    // return `http://localhost:5027/uploads/estimate_file_ro/${fileName}`;
    return ` https://nonaristocratically-frettiest-ben.ngrok-free.dev/uploads/estimate_file_ro/${fileName}`;
  }


  getFileUrl1(fileName: string) {
    // return `http://localhost:5027/uploads/estimate_file_sdo/${fileName}`;

    return `https://nonaristocratically-frettiest-ben.ngrok-free.dev/uploads/estimate_file_sdo/${fileName}`;
  }

  getFileUrl2(fileName: string) {
    // return `http://localhost:5027/uploads/estimate_file_dfo/${fileName}`;

    return `https://nonaristocratically-frettiest-ben.ngrok-free.dev/uploads/estimate_file_dfo/${fileName}`;
  }
  changesdodecl: string = '';
  changedfodecl: string = '';

  changesdoDeclaration(event: any) {
    this.changesdodecl = event.value;
    console.log(this.changesdodecl);
    console.log('firstRecord:', this.firstRecord);

  }

  changeDFODeclaration(event: any) {
    this.changedfodecl = event.value;
    console.log(this.changedfodecl);
  }







  generatePDF() {


    const ro_declaration = 'उप-वनमंडलाधिकारी की ओर स्वीकृत हेतु सादर प्रेषित है |';


    if (!this.firstRecord?.SDODeclaration || this.firstRecord.SDODeclaration.trim() === '') {

      // If empty → use dropdown values 3 or 4
      this.sdo_declaration =
        this.changesdodecl === '4'
          ? 'वन मंडलाधिकारी की ओर स्वीकृत हेतु प्रेषित है |'
          : this.changesdodecl === '3'
            ? 'वन परिक्षेत्र अधिकारी, त्रुटि सुधार कर प्राक्कलन पुनः प्रस्तुत करें |'
            : '';

    } else {

      // If existing → use 1 or 2 from DB
      this.sdo_declaration =
        this.firstRecord.SDODeclaration === '1'
          ? 'वन मंडलाधिकारी की ओर स्वीकृत हेतु प्रेषित है |'
          : this.firstRecord.SDODeclaration === '2'
            ? 'वन परिक्षेत्र अधिकारी, त्रुटि सुधार कर प्राक्कलन पुनः प्रस्तुत करें |'
            : '';
    }



    if (!this.firstRecord?.DFODeclaration || this.firstRecord.DFODeclaration.trim() === '') {

      // If empty → use dropdown values 3 or 4
      this.dfo_declaration =
        this.changedfodecl === '6'
          ? 'प्राक्कलन स्वीकृत किया जाता है |'
          : this.changedfodecl === '5'
            ? 'वन परिक्षेत्र अधिकारी, त्रुटि सुधार कर प्राक्कलन पुनः प्रस्तुत करें |'
            : '';

    } else {

      // If existing → use 1 or 2 from DB
      this.dfo_declaration =
        this.firstRecord.DFODeclaration === '1'
          ? 'प्राक्कलन स्वीकृत किया जाता है |'
          : this.firstRecord.DFODeclaration === '2'
            ? 'वन परिक्षेत्र अधिकारी, त्रुटि सुधार कर प्राक्कलन पुनः प्रस्तुत करें |'
            : '';
    }



    const signatureBlock = (divName: string, subdivName: string, rangName: string) => ([


      {
        columns: [
          { text: this.dfo_declaration, alignment: 'center' },
          { text: this.sdo_declaration, alignment: 'center' },
          { text: ro_declaration, alignment: 'center' }
        ],
        margin: [40, 60, 40, 2]
      },
      {
        columns: [
          { text: 'वनमंडलाधिकारी', alignment: 'center' },
          { text: 'उप-वनमंडलाधिकारी', alignment: 'center' },
          { text: 'वन परिक्षेत्र अधिकारी', alignment: 'center' }
        ],
        margin: [40, 0, 40, 2]
      },
      {
        columns: [
          { text: 'वन मंडल ' + divName, alignment: 'center' },
          { text: 'उप-वन मंडल ' + subdivName, alignment: 'center' },
          { text: 'वन परिक्षेत्र ' + rangName, alignment: 'center' }
        ],
        margin: [40, 0, 40, 10]
      }
    ]);

    // -----------------------------------------------------
    // OFFICER DETAILS
    // -----------------------------------------------------
    let divName = "";
    let subdivName = "";
    let rangName = "";

    try {
      const stored = sessionStorage.getItem("logined_officer_data");
      if (stored) {
        const parsed = JSON.parse(stored);
        divName = parsed?.div_name || "";
        subdivName = parsed?.subdiv_name || "";
        rangName = parsed?.rang_name || "";
      }
    } catch { }

    // -----------------------------------------------------
    // BUILD YEAR TABLE ROWS
    // -----------------------------------------------------
    const buildYearRows = (
      yearLabel: string,
      rows: any[],
      cat: any,
      year: 1 | 2 | 3
    ) => {

      const body: any[] = [];

      rows.forEach((item, idx) => {
        const rate = Number(item[cat.rateField]) || 0;

        let effectiveRate = 0;
        if (year === 1) {
          effectiveRate = this.halfrate(rate);
        } else if (year === 2) {
          // Following UI HTML for display column 4 if year 2, but total uses halfrate2
          // Actually, consistent mathematical representation is better.
          // In their HTML it says halfrate for year 2 display, but we'll use halfrate2 for consistency if kramank > 2
          effectiveRate = this.halfrate2(rate, item.itemKramank);
        } else {
          effectiveRate = this.halfrate2(rate, item.itemKramank);
        }

        const less5P = this.less5TreeCount(cat);
        const more5P = this.more5TreeCount(cat);
        const less5Amt = rate * less5P;
        const more5Amt = effectiveRate * more5P;
        const rowTotal = less5Amt + more5Amt;

        body.push([
          idx === 0 ? { text: yearLabel, rowSpan: rows.length, alignment: 'center', fontSize: 7, margin: [0, 5] } : {},
          { text: item.itemKramank, fontSize: 8, alignment: 'center' },
          {
            text: item.karyaVivran,
            fontSize: 8,
            alignment: item.tablealign || 'left',
            bold: item.fontweight === 'bold'
          },
          { text: rate.toLocaleString('en-IN'), alignment: 'center', fontSize: 8 },
          { text: effectiveRate.toLocaleString('en-IN'), alignment: 'center', fontSize: 8 },
          { text: (cat.plantCount || 0).toLocaleString('en-IN'), alignment: 'center', fontSize: 8 },
          { text: Math.round(less5P).toLocaleString('en-IN'), alignment: 'center', fontSize: 8 },
          { text: Math.round(more5P).toLocaleString('en-IN'), alignment: 'center', fontSize: 8 },
          { text: Math.round(less5Amt).toLocaleString('en-IN'), alignment: 'right', fontSize: 8 },
          { text: Math.round(more5Amt).toLocaleString('en-IN'), alignment: 'right', fontSize: 8 },
          { text: Math.round(rowTotal).toLocaleString('en-IN'), alignment: 'right', fontSize: 8 }
        ]);
      });

      body.push([
        { text: `${yearLabel} योग :-`, colSpan: 8, bold: true, alignment: 'right', fontSize: 7, fillColor: '#f9f9f9' },
        {}, {}, {}, {}, {}, {}, {},
        {
          text: Math.round(
            year === 1 ? this.getKoolYog1(cat) : (year === 2 ? this.getKoolYog2(cat) : this.getKoolYog3(cat))
          ).toLocaleString('en-IN'),
          alignment: 'right',
          bold: true,
          fontSize: 7,
          fillColor: '#f9f9f9'
        },
        {
          text: Math.round(
            year === 1 ? this.getKoolYog1A(cat) : (year === 2 ? this.getKoolYog2A(cat) : this.getKoolYog3A(cat))
          ).toLocaleString('en-IN'),
          alignment: 'right',
          bold: true,
          fontSize: 7,
          fillColor: '#f9f9f9'
        },
        {
          text: Math.round(this.getYearTotal(cat, rows)).toLocaleString('en-IN'),
          alignment: 'right',
          bold: true,
          fontSize: 7,
          fillColor: '#f9f9f9'
        }
      ]);

      return body;
    };

    // -----------------------------------------------------
    // SPECIES TABLES
    // -----------------------------------------------------
    const speciesTables: any[] = [];

    this.categoriesToShow.forEach(cat => {
      const table = {
        table: {
          headerRows: 3,
          widths: ['6%', '4%', '22%', '8%', '8%', '8%', '8%', '8%', '9%', '9%', '10%'],
          body: [
            [
              {
                text: `प्रजाति : ${cat.label} (कुल पौधे: ${(cat.plantCount || 0).toLocaleString('en-IN')}, कुल रकबा: ${cat.area})`,
                colSpan: 11,
                bold: true,
                fillColor: '#eeeeee',
                alignment: 'center',
                fontSize: 10
              },
              {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
            ],
            // Header Row 1
            [
              { text: 'वर्ष', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, rowSpan: 2 },
              { text: 'क्रमांक', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, rowSpan: 2 },
              { text: 'कार्य विवरण', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, rowSpan: 2 },
              { text: 'अनुदान दर (₹)', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, colSpan: 2 }, {},
              { text: 'कूल पौधों', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, rowSpan: 2 },
              { text: 'रोपित पौधों की संख्या', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, colSpan: 2 }, {},
              { text: 'अनुदान राशि (₹)', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, colSpan: 2 }, {},
              { text: 'राशि (₹)', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 7, rowSpan: 2 }
            ],
            // Header Row 2
            [
              {}, {}, {},
              { text: '5 एकड़ से कम (100%)', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 6 },
              { text: '5 एकड़ से अधिक (50%)', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 6 },
              {},
              { text: '5 एकड़ से कम', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 6 },
              { text: '5 एकड़ से अधिक', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 6 },
              { text: '5 एकड़ से कम', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 6 },
              { text: '5 एकड़ से अधिक', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 6 },
              {}
            ],

            ...buildYearRows('प्रथम वर्ष', this.year1Rows, cat, 1),
            ...buildYearRows('द्वितीय वर्ष', this.year2Rows, cat, 2),
            ...buildYearRows('तृतीय वर्ष', this.year3Rows, cat, 3),

            [
              {
                text: `राशि शब्दों में : ${this.convertNumberToWords(Math.round(this.getGrandTotal(cat)))}`,
                bold: true,
                colSpan: 9,
                fontSize: 9
              },
              {}, {}, {}, {}, {}, {}, {}, {},
              {
                text: `राशि कुल :`,
                bold: true,
                alignment: 'right',
                fontSize: 9
              },
              {
                text: `₹${Math.round(this.getGrandTotal(cat)).toLocaleString('en-IN')}`,
                bold: true,
                alignment: 'right',
                fontSize: 9
              }
            ]
          ]
        },
        margin: [0, 0, 0, 10]
      };

      speciesTables.push(table);
    });


    // -----------------------------------------------------
    // GOSWARA TABLE
    // -----------------------------------------------------
    const goswaraTable = [
      { text: "गोस्वारा प्राकलन सारणी", bold: true, fontSize: 12, margin: [0, 20, 0, 10], alignment: 'center', underline: true },
      {
        table: {
          headerRows: 1,
          widths: ['16%', '11%', '11%', '11%', '11%', '11%', '11%', '18%'],
          body: [
            [
              { text: 'प्रजाति नाम', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 },
              { text: 'वर्ष 1 (5 एकड़ से कम )', bold: true, alignment: 'right', fillColor: '#f5f5f5', fontSize: 7 },
              { text: 'वर्ष 1 (5 एकड़ से अधिक )', bold: true, alignment: 'right', fillColor: '#f5f5f5', fontSize: 7 },
              { text: 'वर्ष 2 (5 एकड़ से कम )', bold: true, alignment: 'right', fillColor: '#f5f5f5', fontSize: 7 },
              { text: 'वर्ष 2 (5 एकड़ से अधिक )', bold: true, alignment: 'right', fillColor: '#f5f5f5', fontSize: 7 },
              { text: 'वर्ष 3 (5 एकड़ से कम )', bold: true, alignment: 'right', fillColor: '#f5f5f5', fontSize: 7 },
              { text: 'वर्ष 3 (5 एकड़ से अधिक )', bold: true, alignment: 'right', fillColor: '#f5f5f5', fontSize: 7 },
              { text: 'कुल योग', bold: true, alignment: 'right', fillColor: '#f5f5f5', fontSize: 8 }
            ],

            ...this.categoriesToShow.map(c => ([
              { text: c.label, alignment: 'left', fontSize: 8 },
              { text: Math.round(this.getKoolYog1(c)).toLocaleString('en-IN'), alignment: 'right', fontSize: 7 },
              { text: Math.round(this.getKoolYog1A(c)).toLocaleString('en-IN'), alignment: 'right', fontSize: 7 },
              { text: Math.round(this.getKoolYog2(c)).toLocaleString('en-IN'), alignment: 'right', fontSize: 7 },
              { text: Math.round(this.getKoolYog2A(c)).toLocaleString('en-IN'), alignment: 'right', fontSize: 7 },
              { text: Math.round(this.getKoolYog3(c)).toLocaleString('en-IN'), alignment: 'right', fontSize: 7 },
              { text: Math.round(this.getKoolYog3A(c)).toLocaleString('en-IN'), alignment: 'right', fontSize: 7 },
              { text: Math.round(this.getGrandTotal(c)).toLocaleString('en-IN'), alignment: 'right', fontSize: 8 }
            ])),

            [
              { text: 'महायोग', bold: true, alignment: 'center', fillColor: '#eeeeee', fontSize: 8 },
              { text: Math.round(this.getTotalKoolYog1()).toLocaleString('en-IN'), alignment: 'right', bold: true, fillColor: '#eeeeee', fontSize: 7 },
              { text: Math.round(this.getTotalKoolYog1A()).toLocaleString('en-IN'), alignment: 'right', bold: true, fillColor: '#eeeeee', fontSize: 7 },
              { text: Math.round(this.getTotalKoolYog2()).toLocaleString('en-IN'), alignment: 'right', bold: true, fillColor: '#eeeeee', fontSize: 7 },
              { text: Math.round(this.getTotalKoolYog2A()).toLocaleString('en-IN'), alignment: 'right', bold: true, fillColor: '#eeeeee', fontSize: 7 },
              { text: Math.round(this.getTotalKoolYog3()).toLocaleString('en-IN'), alignment: 'right', bold: true, fillColor: '#eeeeee', fontSize: 7 },
              { text: Math.round(this.getTotalKoolYog3A()).toLocaleString('en-IN'), alignment: 'right', bold: true, fillColor: '#eeeeee', fontSize: 7 },
              { text: Math.round(this.getTotalGrandTotal()).toLocaleString('en-IN'), alignment: 'right', bold: true, fillColor: '#eeeeee', fontSize: 8 }
            ],

            [
              {
                text: 'राशि शब्दों में : ' + this.convertNumberToWords(Math.round(this.getTotalGrandTotal())),
                colSpan: 7,
                bold: true,
                fontSize: 8
              }, {}, {}, {}, {}, {}, {},
              {
                text: `₹${Math.round(this.getTotalGrandTotal()).toLocaleString('en-IN')}`,
                alignment: 'right',
                bold: true,
                fontSize: 8
              }
            ]
          ]
        },
        margin: [0, 0, 0, 20]
      }
    ];


    // -----------------------------------------------------
    // MERGE CONTENT
    // -----------------------------------------------------
    const finalContent: any[] = [];
    const lastIndex = speciesTables.length - 1;

    speciesTables.forEach((tbl, index) => {
      finalContent.push(tbl);

      if (index === lastIndex) {
        if (this.categoriesToShow.length > 1) {
          finalContent.push(...signatureBlock(divName, subdivName, rangName));
          finalContent.push({ text: '', pageBreak: 'after' });
          finalContent.push(...goswaraTable);
        } else {
          finalContent.push(...goswaraTable);
        }
        finalContent.push(...signatureBlock(divName, subdivName, rangName));
      } else {
        finalContent.push(...signatureBlock(divName, subdivName, rangName));
        finalContent.push({ text: '', pageBreak: 'after' });
      }
    });






    // -----------------------------------------------------
    // HEADER + FOOTER
    // -----------------------------------------------------
    const headerSection = () => ({
      margin: [40, 20, 40, 10],
      stack: [
        {
          columns: [
            { text: '' },
            {
              text: `दिनांक : ${new Date().toLocaleDateString('en-IN')}`,
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 0]
            }
          ]
        },
        { text: 'प्राक्कलन ', alignment: 'center', bold: true, fontSize: 14, underline: true, margin: [0, 0, 0, 5] },
        { text: 'किसान वृक्ष मित्र योजना (वृक्षारोपण वर्ष - 2026 )', alignment: 'center', bold: true, fontSize: 10, margin: [0, 0, 0, 5] },
        { text: 'आवेदन संख्या :- ' + (this.applicationNumber ?? "N/A"), alignment: 'center', bold: true, fontSize: 9, margin: [0, 0, 0, 5] },
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000' }],
          margin: [0, 5, 0, 10]
        },
        {
          table: {
            widths: ['33%', '33%', '34%'],
            body: [
              [
                { text: 'कृषक/हितग्राही का नाम : ' + (this.singleData?.hitgrahiName || "N/A"), fontSize: 8, border: [false, false, false, false] },
                { text: 'पिता का नाम : ' + (this.singleData?.fatherName || "N/A"), fontSize: 8, border: [false, false, false, false] },
                { text: 'पता : ' + (this.singleData?.address || "N/A") + (this.singleData?.gramPanchayatName ? ', ' + this.singleData.gramPanchayatName : ''), fontSize: 8, border: [false, false, false, false] }
              ],
              [
                { text: 'मोबाईल नंबर : ' + (this.singleData?.mobileNo || "N/A"), fontSize: 8, border: [false, false, false, false] },
                { text: 'भूमि का प्रकार : ' + (this.singleData?.landType == 1 ? 'FRA LAND' : 'REVENUE LAND'), fontSize: 8, border: [false, false, false, false] },
                { text: 'कुल रकबा (एकड़ मे) : ' + (this.singleData?.totalAcre || "N/A"), fontSize: 8, border: [false, false, false, false] }
              ]
            ]
          },
          margin: [0, 0, 0, 10]
        },
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000' }],
          margin: [0, 0, 0, 15]
        },
      ]
    });

    const footerSection = (currentPage: number, pageCount: number) => ({
      text: `पृष्ठ ${currentPage} / ${pageCount}`,
      alignment: "right",
      margin: [0, 0, 40, 10]
    });


    // -----------------------------------------------------
    // DOCUMENT DEFINITION
    // -----------------------------------------------------
    const docDefinition: any = {
      defaultStyle: { font: "NotoSansDevanagari", fontSize: 10 },
      header: headerSection,
      footer: footerSection,
      pageMargins: [40, 160, 40, 50],
      content: finalContent
    };

    const fonts: any = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      },
      NotoSansDevanagari: {
        normal: "NotoSansDevanagari-Regular.ttf",
        bold: "NotoSansDevanagari-Bold.ttf",
        italics: "NotoSansDevanagari-Regular.ttf",
        bolditalics: "NotoSansDevanagari-Bold.ttf"
      }
    };

    pdfMake.createPdf(docDefinition, undefined, fonts).download("Estimate_Print_" + this.applicationNumber + ".pdf");
  }






  halfrate(rate: number): number {
    return Number(rate) / 2;
  }

  halfrate2(rate: number, itemKramank: number): number {
    return [1, 2].includes(itemKramank)
      ? Number(rate) / 2
      : Number(rate);
  }


  less5TreeCount(cat: DisplayCategory): number {
    if (cat.area <= 5) {
      return (cat.plantCount || 0);
    }
    const peracrePlant = ((cat.plantCount || 0) / (cat.area || 1)) * 5;

    return peracrePlant;
  }


  more5TreeCount(cat: DisplayCategory) {
    if (cat.area <= 5) {
      return 0;
    }
    const peracrePlant = (cat.plantCount || 0) / (cat.area || 1);

    const more5Area = (cat.area || 0) - 5;
    return peracrePlant * more5Area;
  }



  total(cat: DisplayCategory, item: any, year: 1 | 2 | 3): number {

    const rate = Number(item?.[cat.rateField]) || 0;

    const less5Amount =
      this.less5TreeCount(cat) * rate;

    let more5Amount = 0;

    // 2nd & 3rd year → halfrate2
    if (year === 2 || year === 3) {
      more5Amount =
        this.more5TreeCount(cat) *
        this.halfrate2(rate, item.itemKramank);
    }
    // 1st year → halfrate
    else {
      more5Amount =
        this.more5TreeCount(cat) *
        this.halfrate(rate);
    }

    return Math.round(less5Amount + more5Amount);
  }



  getYearTotal(cat: DisplayCategory, yearRows: any[]): number {
    let total = 0;

    yearRows.forEach(item => {
      const rate = Number(item?.[cat.rateField]) || 0;

      const less5Amount =
        this.less5TreeCount(cat) * rate;

      let more5Amount = 0;

      // 2nd & 3rd year → halfrate2
      if (yearRows === this.year2Rows || yearRows === this.year3Rows) {
        more5Amount =
          this.more5TreeCount(cat) *
          this.halfrate2(rate, item.itemKramank);
      }
      // 1st year → halfrate
      else {
        more5Amount =
          this.more5TreeCount(cat) *
          this.halfrate(rate);
      }

      // ✅ ADD PER ROW
      total += less5Amount + more5Amount;
    });

    return Math.round(total);
  }







  getKoolYog1(cat: DisplayCategory): number {
    return Math.round(this.year1Rows.reduce((sum, item) => sum + (Number(item?.[cat.rateField]) || 0) * this.less5TreeCount(cat), 0));
  }
  getKoolYog1A(cat: DisplayCategory): number {
    return Math.round(this.year1Rows.reduce((sum, item) => sum + this.halfrate(Number(item?.[cat.rateField]) || 0) * this.more5TreeCount(cat), 0));
  }
  getKoolYog2(cat: DisplayCategory): number {
    return Math.round(this.year2Rows.reduce((sum, item) => sum + (Number(item?.[cat.rateField]) || 0) * this.less5TreeCount(cat), 0));
  }
  getKoolYog2A(cat: DisplayCategory): number {
    return Math.round(this.year2Rows.reduce((sum, item) => sum + this.halfrate2(Number(item?.[cat.rateField]) || 0, item.itemKramank) * this.more5TreeCount(cat), 0));
  }
  getKoolYog3(cat: DisplayCategory): number {
    return Math.round(this.year3Rows.reduce((sum, item) => sum + (Number(item?.[cat.rateField]) || 0) * this.less5TreeCount(cat), 0));
  }
  getKoolYog3A(cat: DisplayCategory): number {
    return Math.round(this.year3Rows.reduce((sum, item) => sum + this.halfrate2(Number(item?.[cat.rateField]) || 0, item.itemKramank) * this.more5TreeCount(cat), 0));
  }

  getTotalKoolYog1(): number {
    return this.categoriesToShow.reduce((sum, cat) => sum + this.getKoolYog1(cat), 0);
  }
  getTotalKoolYog1A(): number {
    return this.categoriesToShow.reduce((sum, cat) => sum + this.getKoolYog1A(cat), 0);
  }
  getTotalKoolYog2(): number {
    return this.categoriesToShow.reduce((sum, cat) => sum + this.getKoolYog2(cat), 0);
  }
  getTotalKoolYog2A(): number {
    return this.categoriesToShow.reduce((sum, cat) => sum + this.getKoolYog2A(cat), 0);
  }
  getTotalKoolYog3(): number {
    return this.categoriesToShow.reduce((sum, cat) => sum + this.getKoolYog3(cat), 0);
  }
  getTotalKoolYog3A(): number {
    return this.categoriesToShow.reduce((sum, cat) => sum + this.getKoolYog3A(cat), 0);
  }
}

