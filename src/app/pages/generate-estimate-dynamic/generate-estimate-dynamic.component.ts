import { Component, OnInit, ChangeDetectorRef,NgZone  } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { tableData } from '../generate-estimate/estimate-table';
import Swal from 'sweetalert2';
import { addIcons } from 'ionicons';
import { cloudUploadOutline } from 'ionicons/icons';
import { finalize } from 'rxjs/operators';
import * as pdfFontsBold from "../../../assets/fonts/vfs_fonts_bold_custom";
import * as pdfFontsNormal from "../../../assets/fonts/vfs_fonts_custom";
import pdfMake from 'pdfmake/build/pdfmake';
import { ViewChild, ElementRef } from '@angular/core';

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
};

@Component({
  standalone: true,
  selector: 'app-generate-estimate-dynamic',
  templateUrl: './generate-estimate-dynamic.component.html',
  styleUrls: ['./generate-estimate-dynamic.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})
export class GenerateEstimateDynamicComponent implements OnInit {

  
  // ✅ PUT IT HERE
  @ViewChild('uploadFile') uploadFileRef!: ElementRef<HTMLInputElement>;

  selectedRoFile: File | null = null;

  onRoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedRoFile = input.files?.[0] || null;
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
  year1Rows: any[] = tableData['प्रथम_वर्ष'] || []; // Year 1 rates
  year2Rows: any[] = tableData['द्वितीय_वर्ष'] || []; // Year 2 rates
  year3Rows: any[] = tableData['तृतीय_वर्ष'] || []; // Year 3 rates

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

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private api: ApiService,
    private cdRef: ChangeDetectorRef,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private zone: NgZone
  ) {
    addIcons({
      cloudUploadOutline    // ✅ correct syntax
    });
  }

  // ============================================================================
  // STEP 5: INITIALIZATION - When component loads
  // ============================================================================

  ngOnInit(): void {


    (pdfMake as any).fonts = {
      NotoSansDevanagari: {
        normal: "NotoSansDevanagari-Regular.ttf",
        bold: "NotoSansDevanagari-Bold.ttf",
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


    // // Step 5.4: Get logged-in officer info from session storage
    this.storedData = sessionStorage.getItem('logined_officer_data');
    let subdivName = '';
    let rangName = '';
    // console.log('Stored Data:', this.storedData);
    if (this.storedData) {
      try {
        const parsed = JSON.parse(this.storedData);
        subdivName = parsed?.devision_id || ''; // Sub-division name
        rangName = parsed?.rang_name || '';       // Range name 

        this.officer_name = parsed?.officer_name || '';
        const dId = Number(parsed?.designation_id || parsed?.designation || parsed?.DesignationId);
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
        // Use Map: key = plant name, value = {plantCount, area, rateField}
        const categoryMap = new Map<string, { plantCount: number; area: number; rateField: string }>();

        rows.forEach(row => {
          // Step 7.4.1: Extract data from each row
          const plantId = Number(row?.plant_id) || 0;
          const plantName = (row?.plant_name || '').toString().trim();
          const count = parseNum(row?.total_tree || row?.estimated_required_trees);
          const area = parseNum(row?.total_area);

          if (!plantName) return; // Skip if no name

          // Step 7.4.2: Determine which rate field to use from tableData
          // If plant_id >= 8, it's "other" category → use 'anyaPoudha'
          // Otherwise, lookup in our simple mapping
          let rateField = 'anyaPoudha'; // Default for "other" plants
          if (plantId < 8) {
            rateField = this.plantNameToRateField[plantName] || 'anyaPoudha';
          }

          // Step 7.4.3: Group by plant name (same name = same category)
          const existing = categoryMap.get(plantName) || { plantCount: 0, area: 0, rateField: rateField };
          categoryMap.set(plantName, {
            plantCount: existing.plantCount + count,
            area: existing.area + area,
            rateField: rateField
          });
        });

        // Step 7.5: Convert Map to simple array for display
        this.categoriesToShow = Array.from(categoryMap.entries()).map(([name, data]) => ({
          label: name,
          plantCount: data.plantCount,
          area: data.area,
          rateField: data.rateField
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

  // ============================================================================
  // STEP 12: APPROVAL WORKFLOW - BUILD APPROVAL ITEMS
  // ============================================================================

  /**
   * Build approval items for API submission
   * Flow: For each plant → Calculate Work1-13 → Calculate KoolYog1-3 → Calculate GrandTotal
   */
  private buildApprovalItems(): any[] {
    return this.estimateRows.map(row => {
      // Step 12.1: Extract plant data
      const plantId = Number(row?.plant_id) || 0;
      const plantName = (row?.plant_name || '').toString();
      const totalPlant = Number(row?.total_tree || row?.estimated_required_trees) || 0;
      const totalArea = Number(row?.total_area) || 0;
      const perareaplant = totalArea > 0 ? (totalPlant / totalArea) : 0;

      const more5plant = totalArea > 5 ? perareaplant * (totalArea - 5) : 0;

      const less5plant = totalArea <= 5 ? perareaplant * totalArea : perareaplant * 5;




      const ropit = Number(row?.total_ropit) || 0;

      // Step 12.2: Determine rate field
      let rateField = 'anyaPoudha';
      if (plantId < 8) {
        rateField = this.plantNameToRateField[plantName] || 'anyaPoudha';
      }

      // Step 12.3: Calculate Work1-7 (Year 1: 7 items)
      const work1_7: number[] = [];
      this.year1Rows.forEach((tableRow, idx) => {
        if (idx < 7) {
          const rate = Number(tableRow?.[rateField]) || 0;
          work1_7.push(rate * less5plant);
        }
      });
      while (work1_7.length < 7) work1_7.push(0); // Ensure 7 items

      // Step 12.4: Calculate Work8-10 (Year 2: 3 items)
      const work8_10: number[] = [];
      this.year2Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = Number(tableRow?.[rateField]) || 0;
          work8_10.push(rate * less5plant);
        }
      });
      while (work8_10.length < 3) work8_10.push(0); // Ensure 3 items

      // Step 12.5: Calculate Work11-13 (Year 3: 3 items)
      const work11_13: number[] = [];
      this.year3Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = Number(tableRow?.[rateField]) || 0;
          work11_13.push(rate * less5plant);
        }
      });
      while (work11_13.length < 3) work11_13.push(0); // Ensure 3 items

      // Step 12.3: Calculate Work1A-7A (Year 1: 7 items) 50% of anudan
      // debugger;
      const work1A_7A: number[] = [];
      this.year1Rows.forEach((tableRow, idx) => {
        if (idx < 7) {
          const rate = this.halfrate(Number(tableRow?.[rateField]) || 0, idx + 1);
          work1A_7A.push(rate * more5plant);
        }
      });
      while (work1A_7A.length < 7) work1A_7A.push(0); // Ensure 7 items

      const work8A_10A: number[] = [];
      this.year2Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = this.halfrate2(Number(tableRow?.[rateField]) || 0, idx + 1);
          work8A_10A.push(rate * more5plant);
        }
      });
      while (work8A_10A.length < 3) work8A_10A.push(0); // Ensure 3 items




      const work11A_13A: number[] = [];
      this.year3Rows.forEach((tableRow, idx) => {
        if (idx < 3) {
          const rate = this.halfrate2(Number(tableRow?.[rateField]) || 0, idx + 1);
          work11A_13A.push(rate * more5plant);
        }
      });
      while (work11A_13A.length < 3) work11A_13A.push(0); // Ensure 3 items


      // Step 12.6: Calculate year totals (KoolYog)
      const koolYog1 = work1_7.reduce((sum, amt) => sum + amt, 0);
      const koolYog2 = work8_10.reduce((sum, amt) => sum + amt, 0);
      const koolYog3 = work11_13.reduce((sum, amt) => sum + amt, 0);

      const koolYog1A = work1A_7A.reduce((sum, amt) => sum + amt, 0);
      const koolYog2A = work8A_10A.reduce((sum, amt) => sum + amt, 0);
      const koolYog3A = work11A_13A.reduce((sum, amt) => sum + amt, 0);

      // Step 12.7: Calculate grand total
      const grandTotal = koolYog1 + koolYog2 + koolYog3 + koolYog1A + koolYog2A + koolYog3A;

      // Step 12.8: Return formatted item for API
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
        RopitCount: ropit,
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
      const storedData = sessionStorage.getItem('logined_officer_data');
      if (!storedData) return null;
      const parsed = JSON.parse(storedData);
      const id = Number(parsed?.officerId || parsed?.id);
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

  /**
   * RO: Save (status 1)
   */
  async roSave(description?: string) {
    await this.showLoading('सेव किया जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'RO',
        Action: 'save',
        RODeclaration: '1', // 1 = accepted
        RODescription: description || this.roDescription || null,
        ROId: officerId,
        SDOId: this.singleData?.sdoId || null,
        DFOId: this.singleData?.divisionId || null
      }
    };
    this.api.saveEstimateApproval(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          await this.showToast(response.response.msg || 'सफलतापूर्वक सेव हुआ', 'success');
          this.reloadPage();
        } else {
          await this.showError(response?.response?.msg || 'सेव असफल');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }

  /**
   * RO: Send to SDO (status 2)
   */
  async roSendToSDO(description?: string) {
    await this.showLoading('SDO को भेजा जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'RO',
        Action: 'sendToSDO',
        RODeclaration: '1', // 1 = accepted
        RODescription: description || this.roDescription || null,
        ROId: officerId,
        SDOId: this.singleData?.sdoId || null,
        DFOId: this.singleData?.divisionId || null
      }
    };
    this.api.saveEstimateApproval(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          await this.showToast(response.response.msg || 'SDO को सफलतापूर्वक भेजा गया', 'success');
          this.reloadPage();
        } else {
          await this.showError(response?.response?.msg || 'भेजना असफल');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }

  // ============================================================================
  // STEP 14: APPROVAL ACTIONS - SDO METHODS
  // ============================================================================

  /**
   * SDO: Return to RO (status 3)
   */
  async sdoReturnToRO(description?: string) {
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
    this.api.updateEstimateApproval(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          await this.showToast(response.response.msg || 'RO को सफलतापूर्वक वापस भेजा गया', 'success');
          this.reloadPage();
        } else {
          await this.showError(response?.response?.msg || 'वापस भेजना असफल');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }

  /**
   * SDO: Send to DFO (status 4)
   */
  async sdoSendToDFO(description?: string, dfoId?: number) {
    await this.showLoading('DFO को भेजा जा रहा है...');

    const officerId = this.getLoggedInOfficerId();
    const payload = {
      Items: this.buildApprovalItems(),
      ActionMeta: {
        Role: 'SDO',
        Action: 'sendToDFO',
        SDODeclaration: '1', // 1 = accepted
        SDODescription: description || this.sdoDescription || null,
        SDOId: officerId,
        DFOId: dfoId || this.singleData?.divisionId || null
      }
    };
    this.api.updateEstimateApproval(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          await this.showToast(response.response.msg || 'DFO को सफलतापूर्वक भेजा गया', 'success');
          this.reloadPage();
        } else {
          await this.showError(response?.response?.msg || 'भेजना असफल');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }

  // ============================================================================
  // STEP 15: APPROVAL ACTIONS - DFO METHODS
  // ============================================================================

  /**
   * DFO: Return to RO (status 5)
   */
  async dfoReturnToRO(description?: string) {
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
    this.api.updateEstimateApproval(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          await this.showToast(response.response.msg || 'RO को सफलतापूर्वक वापस भेजा गया', 'success');
          this.reloadPage();
        } else {
          await this.showError(response?.response?.msg || 'वापस भेजना असफल');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }

  /**
   * DFO: Accept (status 6 - final)
   */
  async dfoAccept(description?: string) {
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
    this.api.updateEstimateApproval(payload).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        if (response?.response?.code === 200) {
          await this.showToast(response.response.msg || 'प्राकलन सफलतापूर्वक स्वीकृत हुआ', 'success');
          this.reloadPage();
        } else {
          await this.showError(response?.response?.msg || 'स्वीकृति असफल');
        }
      },
      error: async (err) => {
        await this.dismissLoading();
        await this.showError(err);
      }
    });
  }

  // ============================================================================
  // STEP 16: PRINT METHODS
  // ============================================================================

  print(): void {
    window.print();
  }

  printSection(elementId: string): void {
    const el = document.getElementById(elementId);
    if (!el) { return; }
    const containerId = '__print_container__';
    const styleId = '__print_style__';
    document.getElementById(containerId)?.remove();
    document.getElementById(styleId)?.remove();
    const style = document.createElement('style');
    style.id = styleId;
    style.media = 'print';
    style.textContent = `@media print { body * { visibility: hidden !important; } #${containerId}, #${containerId} * { visibility: visible !important; } #${containerId} { position: absolute; left: 0; top: 0; width: 100%; } table { width: 100%; border-collapse: collapse !important; } th, td, table { border: 1px solid #000 !important; } }`;
    document.head.appendChild(style);
    const container = document.createElement('div');
    container.id = containerId;
    container.appendChild(el.cloneNode(true));
    document.body.appendChild(container);
    setTimeout(() => {
      window.print();
      setTimeout(() => { container.remove(); style.remove(); }, 100);
    }, 50);
  }





  // printAll() {
  //   this.router.navigate(['/estimate-print', this.singleData.applicationNumber]);

  // }


  goBack() {
    this.location.back();
  }


  confirmDelete() {
    Swal.fire({
      title: 'क्या आप सुनिश्चित हैं?',
      text: 'आप इस डेटा को हटाना चाहते हैं?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'हाँ, Delete करें',
      cancelButtonText: 'नहीं',

      // 🔥 FIX for Ionic
      target: '#swal-portal',
      heightAuto: false
    }).then(result => {
      if (result.isConfirmed) {

        this.roSoftDelete();

        Swal.fire({
          icon: 'success',
          title: 'हटा दिया गया',
          timer: 1500,
          showConfirmButton: false,

          // 🔥 FIX for Ionic
          target: '#swal-portal',
          heightAuto: false
        });
      }
    });
  }


  confirmSendToSDO() {
    Swal.fire({
      title: 'क्या आप सुनिश्चित हैं?',
      text: "क्या आप इस आवेदन को SDO को भेजना चाहते हैं?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'हाँ, भेजें',
      cancelButtonText: 'रद्द करें',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      target: '#swal-portal',
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.roSendToSDO(); // original function

        Swal.fire({
          title: 'भेज दिया गया!',
          text: 'आवेदन सफलतापूर्वक SDO को भेजा गया।',
          icon: 'success',
          target: '#swal-portal',
          heightAuto: false
        });
      }
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('uploadFile') as HTMLInputElement;
    fileInput.click();
  }

  refreshPageData() {
    const appNo = this.singleData.applicationNumber;

    this.loadBundle(appNo);
    this.loadExistingApprovalData(appNo);
    this.GetEstimateFile(appNo);
  }




  // uploadRoFile() {
  //   const input = document.getElementById("uploadFile") as HTMLInputElement | null;

  //   if (!input?.files?.length) {
  //     this.showToast("कृपया एक फ़ाइल चुनें।", "danger");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("applicationNumber", this.singleData.applicationNumber);
  //   formData.append("roFile", input.files[0]);

  //   this.showLoading();

  //   this.api.uploadRo(formData).subscribe({
  //     next: async (response: any) => {
  //       await this.dismissLoading();

  //       const res = response?.response || response;
  //       const code = res?.code;
  //       const message = res?.msg;

  //       if (code === 200) {
  //         await this.showToast(message || "RO फ़ाइल सफलतापूर्वक अपलोड हुई", "success");
  //         input.value = '';

  //         this.zone.run(() => {
  //           this.refreshPageData();
  //           this.cdRef.detectChanges();
  //         });
  //       }
  //       else if (code === 101) {
  //         await this.showToast(message || "Application number is required.", "danger");
  //       }
  //       else if (code === 102) {
  //         await this.showToast(message || "RO file is required.", "danger");
  //       }
  //       else {
  //         await this.showError(message || "फ़ाइल अपलोड असफल");
  //       }
  //     },

  //     error: async (err) => {
  //       console.error("UPLOAD ERROR", err);
  //       await this.dismissLoading();
  //       await this.showError("Server Error");
  //     }
  //   });
  // }

uploadRoFile() {
  if (!this.selectedRoFile) {
    this.showToast("कृपया एक फ़ाइल चुनें।", "danger");
    return;
  }

  const formData = new FormData();
  formData.append("applicationNumber", this.singleData.applicationNumber);
  formData.append("roFile", this.selectedRoFile);

  this.showLoading();

  this.api.uploadRo(formData).subscribe({
    next: async (response: any) => {
      await this.dismissLoading();

      const res = response?.response || response;
      const code = res?.code;
      const message = res?.msg;

      if (code === 200) {
        await this.showToast(
          message || "RO फ़ाइल सफलतापूर्वक अपलोड हुई",
          "success"
        );

        // ✅ RESET FILE INPUT SAFELY
        this.selectedRoFile = null;
        this.uploadFileRef.nativeElement.value = '';

        // ✅ NOW PAGE WILL REFRESH IN PROD
        this.refreshPageData();
      } else {
        await this.showError(message || "फ़ाइल अपलोड असफल");
      }
    },
    error: async () => {
      await this.dismissLoading();
      await this.showError("Server Error");
    }
  });
}



  uploadSdo() {

    const input = document.getElementById("uploadFile1") as HTMLInputElement;

    if (!input || !input.files || input.files.length === 0) {
      this.showToast("कृपया एक फ़ाइल चुनें।", "danger");
      return;
    }

    const formData = new FormData();
    formData.append("applicationNumber", this.singleData.applicationNumber);

    // Correct field name
    if (input.files[0]) {
      formData.append("sdoFile", input.files[0]);  // ⬅️ FIXED
    }

    this.showLoading();

    this.api.uploadSdo(formData).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        const code = response?.response?.code;
        const message = response?.response?.msg;

        if (code === 200) {
          await this.showToast(message || "SDO फ़ाइल सफलतापूर्वक अपलोड हुई", "success");
          this.reloadPage();
        }
        else if (code === 101) {
          await this.showToast(message || "Application number is required.", "danger");
        }
        else if (code === 102) {
          await this.showToast(message || "SDO file is required.", "danger"); // updated
        }
        else {
          await this.showError(message || "फ़ाइल अपलोड असफल");
        }
      },

      error: async () => {
        await this.dismissLoading();
        await this.showError("Server Error");
      }
    });

  }


  uploadDfo() {
    const formData = new FormData();
    formData.append("applicationNumber", this.singleData.applicationNumber);

    const input = document.getElementById("uploadFile2") as HTMLInputElement;
    if (input?.files?.[0]) {
      formData.append("DfoFile", input.files[0]);
    }

    this.showLoading();  // your loading

    this.api.uploadDfo(formData).subscribe({
      next: async (response: any) => {
        await this.dismissLoading();

        const code = response?.response?.code;
        const message = response?.response?.msg;

        if (code === 200) {
          await this.showToast(message || "DFO फ़ाइल सफलतापूर्वक अपलोड हुई", "success");
          this.reloadPage();
        }
        else if (code === 101) {
          await this.showToast(message || "Application number is required.", "danger");
        }
        else if (code === 102) {
          await this.showToast(message || "DFO file is required.", "danger");
        }
        else {
          await this.showError(message || "फ़ाइल अपलोड असफल");
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
    return `http://localhost:5027/uploads/estimate_file_ro/${fileName}`;
  }


  getFileUrl1(fileName: string) {
    return `http://localhost:5027/uploads/estimate_file_sdo/${fileName}`;
  }

  getFileUrl2(fileName: string) {
    return `http://localhost:5027/uploads/estimate_file_dfo/${fileName}`;
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

      body.push([
        { text: 'क्र', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 },
        { text: 'कार्य विवरण', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 },
        { text: '5 एकड़ से कम', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 },
        { text: '5 एकड़ से अधिक', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 },
        { text: '5 एकड़ से कम दर (100%)', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 },
        { text: '5 एकड़ से कम दर (50%)', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 },
        { text: 'कुल', bold: true, fillColor: '#f5f5f5', alignment: 'center', fontSize: 8 }
      ]);

      rows.forEach(item => {

        const rate = Number(item[cat.rateField]) || 0;

        const effectiveRate =
          year === 1
            ? this.halfrate(rate, item.itemKramank)
            : this.halfrate2(rate, item.itemKramank);

        const rowTotal =
          this.less5TreeCount(cat) * rate +
          this.more5TreeCount(cat) * effectiveRate;

        body.push([
          { text: item.itemKramank, fontSize: 8 },
          { text: item.karyaVivran, fontSize: 8 },
          { text: this.less5TreeCount(cat), alignment: 'center', fontSize: 8 },
          { text: this.more5TreeCount(cat), alignment: 'center', fontSize: 8 },
          { text: rate, alignment: 'center', fontSize: 8 },
          { text: effectiveRate, alignment: 'center', fontSize: 8 },
          { text: rowTotal.toLocaleString('en-IN'), alignment: 'right', fontSize: 8 }
        ]);
      });

      body.push([
        { text: `${yearLabel} योग :-`, colSpan: 5, bold: true }, {}, {}, {}, {},
        {
          text: this.getYearTotal(cat, rows).toLocaleString('en-IN'),
          colSpan: 2,
          alignment: 'right',
          bold: true
        }, {}
      ]);

      return body;
    };

    // -----------------------------------------------------
    // SPECIES TABLES
    // -----------------------------------------------------
    const speciesTables: any[] = [];

    this.categoriesToShow.forEach(cat => {

      const table = {
        // margin: [0, 0, 0, 0],
        table: {
          widths: ['4%', '40%', '10%', '10%', '12%', '12%', '12%'],
          body: [

            [
              {
                text: `प्रजाति : ${cat.label} (कुल पौधे: ${(cat.plantCount || 0).toLocaleString('en-IN')})`,
                colSpan: 7,
                bold: true,
                fillColor: '#eeeeee',
                alignment: 'center',
                fontSize: 8
              },
              {}, {}, {}, {}, {}, {}
            ],

            ...buildYearRows('प्रथम वर्ष', this.year1Rows, cat, 1),
            ...buildYearRows('द्वितीय वर्ष', this.year2Rows, cat, 2),
            ...buildYearRows('तृतीय वर्ष', this.year3Rows, cat, 3),

            [
              {
                text: `राशि शब्दों में : ${this.convertNumberToWords(this.getGrandTotal(cat))}`,
                bold: true,
                colSpan: 5
              },
              {}, {}, {}, {},
              {
                text: `राशि कुल : ${this.getGrandTotal(cat).toLocaleString('en-IN')}`,
                bold: true,
                colSpan: 2,
                alignment: 'right'
              },
              {}
            ]
          ]
        }
      };


      speciesTables.push(table);
    });


    // -----------------------------------------------------
    // GOSWARA TABLE (with 1 blank line spacing)
    // -----------------------------------------------------
    const goswaraTable = [
      { text: "", margin: [0, 5] },   // ** One line spacing **

      {
        table: {
          headerRows: 1,
          widths: ['20%', '20%', '20%', '20%', '20%'],
          body: [
            [
              { text: 'गोस्वारा प्राकलन सारणी', colSpan: 5, bold: true, fillColor: '#eeeeee', fontSize: 10 },
              {}, {}, {}, {}
            ],
            [
              { text: 'प्रजाति नाम', bold: true, fillColor: '#f5f5f5' },
              { text: 'प्रथम वर्ष', bold: true, alignment: 'right', fillColor: '#f5f5f5' },
              { text: 'द्वितीय वर्ष', bold: true, alignment: 'right', fillColor: '#f5f5f5' },
              { text: 'तृतीय वर्ष', bold: true, alignment: 'right', fillColor: '#f5f5f5' },
              { text: 'कुल योग', bold: true, alignment: 'right', fillColor: '#f5f5f5' }
            ],

            ...this.categoriesToShow.map(c => ([
              { text: c.label },
              { text: this.getYearTotal(c, this.year1Rows).toLocaleString('en-IN'), alignment: 'right' },
              { text: this.getYearTotal(c, this.year2Rows).toLocaleString('en-IN'), alignment: 'right' },
              { text: this.getYearTotal(c, this.year3Rows).toLocaleString('en-IN'), alignment: 'right' },
              { text: this.getGrandTotal(c).toLocaleString('en-IN'), alignment: 'right' }
            ])),

            [
              { text: 'महायोग', bold: true },
              { text: this.getTotalYear1().toLocaleString('en-IN'), alignment: 'right', bold: true },
              { text: this.getTotalYear2().toLocaleString('en-IN'), alignment: 'right', bold: true },
              { text: this.getTotalYear3().toLocaleString('en-IN'), alignment: 'right', bold: true },
              { text: this.getTotalGrandTotal().toLocaleString('en-IN'), alignment: 'right', bold: true }
            ],

            [
              { text: 'राशि शब्दों में : ' + this.convertNumberToWords(this.getTotalGrandTotal()), colSpan: 4 }, {}, {}, {},
              { text: this.getTotalGrandTotal().toLocaleString('en-IN'), alignment: 'right' }
            ]
          ]
        }
      }
    ];


    // -----------------------------------------------------
    // MERGE CONTENT
    // -----------------------------------------------------
    const finalContent: any[] = [];
    const lastIndex = speciesTables.length - 1;
    const isGoswaraLarge = this.categoriesToShow.length > 1;

    speciesTables.forEach((tbl, index) => {

      // Add species table
      finalContent.push(tbl);

      // Add signature below species table if NOT last species
      if (index !== lastIndex) {
        finalContent.push(...signatureBlock(divName, subdivName, rangName));
        finalContent.push({ text: '', pageBreak: 'after' });
      }

      // Last species table → add goswara + signature
      if (index === lastIndex) {
        // For large goswara table, start on new page
        if (isGoswaraLarge) {
          finalContent.push(...signatureBlock(divName, subdivName, rangName));
          finalContent.push({ text: '', pageBreak: 'after' });
        }

        // Add goswara table
        finalContent.push(...goswaraTable);

        // Add signature after goswara table
        finalContent.push(...signatureBlock(divName, subdivName, rangName));
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
            { text: '' }, // left spacer
            {
              text: `दिनांक : ${new Date().toLocaleDateString('en-IN')}`,
              alignment: 'right',
              fontSize: 8,
              margin: [0, 10, 10, 0] // 👈 padding 10px (top & right)
            }
          ]
        },

        { text: 'प्राक्कलन ', alignment: 'center', bold: true, fontSize: 14, underline: true, margin: [0, 0, 0, 5] },
        { text: 'किसान वृक्ष मित्र योजना (वृक्षारोपण वर्ष - 2026 )', alignment: 'center', bold: true, fontSize: 10, margin: [0, 0, 0, 5] },
        { text: 'आवेदन संख्या :- ' + (this.applicationNumber ?? "N/A"), alignment: 'center', bold: true, fontSize: 8, margin: [0, 0, 0, 5] },


        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000' }
          ],
          margin: [0, 0, 0, 10] // space below the line
        },
        {
          columns: [
            { text: 'कृषक/हितग्राही का नाम : ' + (this.singleData.hitgrahiName ?? "N/A"), alignment: 'left', fontSize: 8 },
            { text: 'पिता का नाम : ' + (this.singleData.fatherName ?? "N/A"), alignment: 'left', fontSize: 8 },
            { text: 'पता : ' + (this.singleData.address ?? "N/A"), alignment: 'left', fontSize: 8 },

          ]
        },
        {
          columns: [
            { text: 'मोबाईल नंबर : ' + (this.singleData.mobileNo ?? "N/A"), alignment: 'left', fontSize: 8 },
            {
              text: 'भूमि का प्रकार : ' + (this.singleData?.landType !== undefined && this.singleData?.landType !== null
                ? (this.singleData.landType === 1 ? 'FRA Land' : 'Revenue Land')
                : 'N/A'), alignment: 'left', fontSize: 8
            },
            { text: 'कुल रकबा (एकड़ मे) : ' + (this.singleData.totalAcre ?? "N/A"), alignment: 'left', fontSize: 8 },

          ]
        },

        // {
        //   canvas: [
        //     { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000' }
        //   ],
        //   margin: [0, 15, 0, 25] // space below the line

        // },
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

    pdfMake.createPdf(docDefinition).download("Estimate_Print_" + this.applicationNumber + ".pdf");
  }






  halfrate(rate: number, itemKramank: number): number {
    return [3, 4, 5].includes(itemKramank)
      ? Number(rate) / 2
      : Number(rate);
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
        this.halfrate(rate, item.itemKramank);
    }

    return less5Amount + more5Amount;
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
          this.halfrate(rate, item.itemKramank);
      }

      // ✅ ADD PER ROW
      total += less5Amount + more5Amount;
    });

    return total;
  }






}
