import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonLoading,
  IonContent,
  IonRadioGroup,
  IonRadio,
  IonTextarea,
  IonInput,
  IonItem,
  IonRow,
  IonCol,
  IonLabel,
  IonGrid,
  IonButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonText, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { LanguageService } from '../services/language.service';
import { AlertController } from '@ionic/angular';
import { MastersModelClass } from '../services/response_classes/GetMastsersResponseModel';
import { Toast } from '@capacitor/toast';
import { LoadingController, Platform } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalController } from '@ionic/angular';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';
import { ProgressLoaderComponent } from '../progress-loader/progress-loader.component';
import { addIcons } from 'ionicons';
import {
  buildSharp,
  homeOutline,
  informationOutline,
  informationCircle,
  buildOutline,
  addCircleOutline,
  callOutline,
  addCircle,
  refreshCircleOutline,
  refreshOutline,
  boat,
  trashOutline, addOutline } from 'ionicons/icons';
import { AddPlantDialogComponent } from '../add-plant-dialog/add-plant-dialog.component';
import { PlantationDetailNew } from '../pages/view-awedan/SingleAwedanDataResponse.model';
import { SharedserviceService } from '../services/sharedservice.service';
import { OfficersLoginResponseModel } from '../pages/officer-login/OfficersLoginResponse.model';
import { IonInputCustomEvent, InputInputEventDetail } from '@ionic/core';
// import { SpeciesMaster, AnyaPlantRequest } from '../models/AnyaPlant.model';  // ADD THIS LINE
import { SpeciesMaster, AnyaPlantRequest, AddSpeciesMasterRequest } from '../models/AnyaPlant.model';  // ADD THIS

@Component({
  standalone: true,
  selector: 'app-submit-awedan-by-rang2',
  templateUrl: './submit-awedan-by-rang2.component.html',
  styleUrls: ['./submit-awedan-by-rang2.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    IonCard,
    IonText,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonRow,
    IonCol,
    IonGrid,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonLoading,
    IonTextarea,
    IonRadioGroup,
    IonRadio],
})
export class SubmitAwedanByRang2Component implements OnInit {
  onAreaChange($event: IonInputCustomEvent<InputInputEventDetail>) {
    const newAreaValue = parseFloat($event.detail.value || '0');

    // Validate: area must be >= available_area
    if (this.available_area != null && newAreaValue > 0) {
      if (newAreaValue < Number(this.available_area)) {
        alert("⚠️ हितग्राही का कुल रकबा उपलब्ध रोपण योग्य भूमि से कम नहीं हो सकता।");
        // Reset area to available_area to maintain valid state
        this.area = Number(this.available_area);
        this.cdRef.detectChanges();
        return;
      }
    }

    this.cdRef.detectChanges();
  }

  onselect_no() {
    // alert(this.kaksha_kramank);
    this.kaksha_kramank = '';
  }

  // Open old-style modal with current plant master and return new-format plant
  async openPlantModal() {
    const modal = await this.modalCtrl.create({
      component: AddPlantDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        plantMaster: this.listOfPlants,
      },
      backdropDismiss: false,
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.confirmed && data?.plant) {
      const p = data.plant as { plant_id: number; plant_name: string; total_area: number; total_tree: number };
      const newPlantArea = Number(p.total_area || 0);

      // Check if plant already exists
      const exists = this.selectedPlants?.some(x => x.plant_id === p.plant_id);
      if (exists) {
        this.longToast(`${p.plant_name} की जानकारी पहले ही डाली जा चुकी है`);
        return;
      }

      // Validate: Check if adding this plant would exceed available_area
      const currentTotalArea = this.getTotalAreaUsed();
      const availableArea = this.getAvailableAreaAsNumber();
      const newTotalArea = currentTotalArea + newPlantArea;

      if (availableArea <= 0) {
        alert("⚠️ कृपया पहले उपलब्ध रोपण योग्य भूमि का रकबा दर्ज करें।");
        return;
      }

      if (newTotalArea > availableArea) {
        const remaining = availableArea - currentTotalArea;
        alert(`⚠️ इस पौधे को जोड़ने से कुल रकबा (${newTotalArea.toFixed(2)} एकड़) उपलब्ध रकबा (${availableArea} एकड़) से अधिक हो जाएगा।\n\nशेष उपलब्ध रकबा: ${remaining.toFixed(2)} एकड़`);
        return;
      }

      // Add plant if validation passes
      this.selectedPlants.push({
        plant_id: p.plant_id,
        plant_name: p.plant_name,
        total_area: newPlantArea,
        total_tree: Number(p.total_tree || 0),
        total_ropit: 0,
        is_other: false,
      });

      // Keep legacy view (old grid) in sync
      this.rebuildLegacyFromSelectedPlants?.();
      this.cdRef.detectChanges();
    }
  }

  listOfPlantTypes = [
    { id: '1', name: 'क्लोनल नीलगिरी' },
    { id: '2', name: 'टिश्यू कल्चर सागौन' },
    { id: '3', name: 'टिश्यू कल्चर बांस' },
    { id: '4', name: 'साधारण बांस' },
    { id: '5', name: 'साधारण सागौन' },
    { id: '6', name: 'मिलिया डुबिया' },
    { id: '7', name: 'चंदन पौधा' },
    { id: '8', name: 'अन्य लाभकारी' },
  ];
  plantTypeFinal: any;
  plantTypeFinalNames: string | undefined;

  check_value($event: IonInputCustomEvent<InputInputEventDetail>) {
    if (!this.area || this.area.toString().trim() === '') {
      alert("⚠️ कृपया हितग्राही का कुल रकबा दर्ज करें।");
      this.available_area = null;
      this.total_rakba = null;
      return;
    } else {
      if (this.available_area != null && this.area != null && this.available_area > this.area) {
        this.available_area = null;
        this.total_rakba = null;
        alert("⚠️ रोपण योग्य भूमि हितग्राही के कुल रकबे से अधिक नहीं हो सकती।");
      }
    }
  }

  onAvailableAreaChange($event: IonInputCustomEvent<InputInputEventDetail>) {
    const newValue = parseFloat($event.detail.value || '0');

    // Validate: available_area must be <= area
    if (this.area != null && newValue > Number(this.area)) {
      this.available_area = null;
      this.total_rakba = null;
      alert("⚠️ रोपण योग्य भूमि हितग्राही के कुल रकबे से अधिक नहीं हो सकती।");
      this.cdRef.detectChanges();
      return;
    }

    // Sync total_rakba with available_area
    this.total_rakba = newValue;

    // Check if existing plants exceed new available_area
    const totalAreaUsed = this.getTotalAreaUsed();
    if (totalAreaUsed > newValue && totalAreaUsed > 0) {
      alert(`⚠️ चयनित पौधों का कुल रकबा (${totalAreaUsed.toFixed(2)} एकड़) नए उपलब्ध रकबा (${newValue} एकड़) से अधिक है।`);
      // Reset to previous valid value or keep the warning
    }

    this.cdRef.detectChanges();
  }


  check_value_1($event: IonInputCustomEvent<FocusEvent>) {
    debugger
    if (!this.available_area || this.available_area.toString().trim() === '') {
      alert("⚠️ कृपया हितग्राही का कुल उपलब्ध रोपण योग्य भूमि रकबा दर्ज करें।");
      this.total_rakba = null;
      return;
    } else {
      if (this.available_area != null && this.total_rakba != null && Number(this.total_rakba) > Number(this.available_area)) {
        alert("⚠️ कुल रकबा हितग्राही के उपलब्ध रोपण योग्य भूमि से अधिक नहीं हो सकती");
        this.total_rakba = null;
      }
    }
  }



  area: number | null = null;
  available_area: number | null = null;
  total_rakba: number | null = null;
  errorMessage: string = '';

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';
  languageData: any = {};

  // Progress loader properties
  progressModal: any = null;
  progressData = {
    dataUploaded: false,
    plantUploaded: false,
    fileUploaded: false,
    dataUploadError: false,
    plantUploadError: false,
    fileUploadError: false,
    dataUploadErrorMessage: '',
    plantUploadErrorMessage: '',
    fileUploadErrorMessage: ''
  };
  inputMobileNumber: string = '';
  vriksharopan_year: string = '';
  circleName: string = '';
  distName: string = '';
  circleId: string = '';
  div_name: string = '';
  divId: string = '';
  rang_name: string = '';
  rangId: string = '';
  selectedDistId: string = '';
  applicationNumber: string = '';
  isDFO: boolean = false;
  isRoDes: boolean = false;
  gram_panchayat_name: string = '';
  village_name: string = '';
  halka_no: string = '';
  kaksha_kramank: string = '';
  khasra_no: string = '';
  bank_account_no: string = '';
  ifsc_code: string = '';
  patta_no: string = '';
  selectedYesNoForKakshaKramank: string = '';
  selectfrarevenue: string = '';
  compartment_no: string = '';

  // sinchitOrA_sinchit: string = 'sinchit';
  sinchitOrA_sinchit: string = '';
  selectedBankName: string = '';
  selected_sand_type: string = '';
  hitgrahiName: string = '';
  fatherName: string = '';
  adhaar: string = '';
  vriksharopan_gap: string = '';
  address: string = '';
  vriksharopan_akshansh: string = '0.0';
  vriksharopan_dikshansh: string = '0.0';
  selectedCastCatId: string = '';
  isPvtg: string | null = null; // PVTG selection for cast category 4
  selectedPlantationType: string = '';





  listOfBank: MastersModelClass[] = [];
  listOfSandType: MastersModelClass[] = [];
  listOfCastCategory = [
    { id: '1', name: 'सामान्य' },
    { id: '2', name: 'अन्य पिछड़ा वर्ग' },
    { id: '3', name: 'अनुसूचित जाति' },
    { id: '4', name: 'अनुसूचित जन जाति' },
  ];
  listOfPlantationModel = [
    { id: '1', name: 'ब्लॉक' },
    { id: '2', name: 'खेत का मेड़' },
    { id: '3', name: 'अंतरफसल (Intercropping)' },
    { id: '4', name: 'ब्लॉक / खेत का मेड़' },
    { id: '5', name: 'ब्लॉक / अंतरफसल (Intercropping)' },
    { id: '6', name: 'खेत का मेड़ / अंतरफसल (Intercropping)' },
  ];
  listOfDist: MastersModelClass[] = [];
  listOfRang: MastersModelClass[] = [];
  listOfCircle: MastersModelClass[] = [];
  listOfDivision: MastersModelClass[] = [];
  listOfPlantationDetailsNew: PlantationDetailNew[] = [];
  listOfPlantationDetailsNewTotal: PlantationDetailNew[] = [];

  listOfSpeciesMaster: SpeciesMaster[] = [];
  listOfAnyaPlants: AnyaPlantRequest[] = [];
  showAnyaPlantSection = false;
  plantValidationMessage: string = '';

  // New Dynamic Plant System - from plant_master table
  listOfPlants: any[] = []; // Stores data from plant_master table
  isPlantMasterLoading: boolean = false; // Track if plant master is being loaded
  selectedPlants: Array<{
    plant_id: number,
    plant_name: string,
    total_area: number,
    total_tree: number,
    total_ropit: number,
    is_other: boolean
  }> = [];
  showAddSpeciesModal = false;
  newSpeciesName: string = '';
  adharPdfFile: File | null = null;
  bankPassbookPdfFile: File | null = null;
  b1P1PdfFile: File | null = null;
  kmlFile: File | null = null;

  total_ropit_area_less_than_5_acre: number = 0;
  total_ropit_number_of_plant_less_than_5_acre: number = 0;
  total_ropit_area_more_than_5_acre: number = 0;
  total_ropit_number_of_plant_more_than_5_acre: number = 0;

  klonal_neelgiri_area_less_than_5_acre: string = '0';
  klonal_neelgiri_plant_no_less_than_5_acre: string = '0';
  klonal_neelgiri_area_more_than_5_acre: string = '0';
  klonal_neelgiri_plant_no_more_than_5_acre: string = '0';
  tishu_culture_sagon_area_less_than_5_acre: string = '0';
  tishu_culture_sagon_plan_no_less_than_5_acre: string = '0';
  tishu_culture_sagon_area_more_than_5_acre: string = '0';
  tishu_culture_sagon_plan_no_more_than_5_acre: string = '0';
  tishu_culture_bans_area_less_than_5_acre: string = '0';
  tishu_culture_bans_plan_no_less_than_5_acre: string = '0';
  tishu_culture_bans_area_more_than_5_acre: string = '0';
  tishu_culture_bans_plan_no_more_than_5_acre: string = '0';
  normal_sagon_area_less_than_5_acre: string = '0';
  normal_sagon_plan_no_less_than_5_acre: string = '0';
  normal_sagon_area_more_than_5_acre: string = '0';
  normal_sagon_plan_no_more_than_5_acre: string = '0';
  normal_bansh_area_less_than_5_acre: string = '0';
  normal_bansh_plan_no_less_than_5_acre: string = '0';
  normal_bansh_area_more_than_5_acre: string = '0';
  normal_bansh_plan_no_more_than_5_acre: string = '0';
  milia_dubiya_area_less_than_5_acre: string = '0';
  milia_dubiya_plan_no_less_than_5_acre: string = '0';
  milia_dubiya_area_more_than_5_acre: string = '0';
  milia_dubiya_plan_no_more_than_5_acre: string = '0';
  chandan_area_less_than_5_acre: string = '0';
  chandan_plan_no_less_than_5_acre: string = '0';
  chandan_area_more_than_5_acre: string = '0';
  chandan_plan_no_more_than_5_acre: string = '0';
  other_labhkari_plant_area_less_than_5_acre: string = '0';
  other_labhkari_plan_no_less_than_5_acre: string = '0';
  other_labhkari_plant_area_more_than_5_acre: string = '0';
  other_labhkari_plan_no_more_than_5_acre: string = '0';

  // total_rakba: string = '';
  // area: any = 0;
  // available_area: any = 0;
  formData: any;
  selectedCircleId: any;
  selectedDivId: any;
  selectedRangId: any;
  awedan_number: any;
  vrikharopan_akshansh: string | undefined;
  vrikharopan_dikshansh: string | undefined;
  awedan_status: string | undefined;
  klonal_neelgiri_plan_no_less_than_5_acre: string | undefined;
  klonal_neelgiri_plan_no_more_than_5_acre: string | undefined;
  adharFilename: string | null = null;
  bankPassbookFilename: string | null = null;
  b1P1Filename: string | null = null;
  kmlFilename: string | null = null;

  constructor(
    private location: Location,
    private sharedService: SharedserviceService,
    private router: Router,
    private modalCtrl: ModalController,
    private platform: Platform,
    private navController: NavController,
    private langService: LanguageService,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    addIcons({addOutline,buildSharp,homeOutline,informationOutline,informationCircle,buildOutline,addCircleOutline,callOutline,addCircle,refreshCircleOutline,refreshOutline,boat,trashOutline,});
  }

  ngOnInit() {






    // console.log('Component ngOnInit started');

    // Get router navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;

    if (state) {
      // console.log('Router state received:', state);

      if (state['editMode'] === true && state['applicationNumber']) {
        console.log('✅ Edit mode detected from state, application number:', state['applicationNumber']);
        this.applicationNumber = state['applicationNumber'];
        this.loadApplicationData(this.applicationNumber);
      }
    } else {
      // console.log('⚠️ No router state found.');
    }



    // Get officer session data - with error handling to prevent crashes
    let officersLoginModel: OfficersLoginResponseModel | null = null;
    try {
      officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

      if (!officersLoginModel) {
        console.warn('⚠️ No officer session data found - component may still work for edit mode');
        // Still try to load plant master even without session
        this.getSpeciesMaster();
        this.loadPlantMaster();
        return;
      }

      if (officersLoginModel.designation === '2') {
        this.isDFO = true;
      }
      if (officersLoginModel.designation === '4') {
        this.isRoDes = true;
      }

      this.circleId = officersLoginModel.circle_id || '';
      this.circleName = officersLoginModel.circle_name || '';
      this.div_name = officersLoginModel.div_name || '';
      this.divId = officersLoginModel.devision_id || '';
      this.rangId = officersLoginModel.rang_id || '';
      this.rang_name = officersLoginModel.rang_name || '';
      // this.selectedDistId = officersLoginModel.dist_id;





      // console.log('Officer data loaded - rangId:', this.rangId);

      this.getCircleList();
      this.getDistList(); // This will use the circleId from session
      if (!this.rangId || this.rangId === '') {
        this.getRangList();
      }

      this.getSpeciesMaster();
      this.loadPlantMaster(); // Load plant master for dynamic dropdown

      if (this.applicationNumber) {
        this.loadAnyaPlants();
      }
    } catch (error) {
      console.error('❌ Error in ngOnInit:', error);
      // Don't block the component from loading - still load essential data
      this.getSpeciesMaster();
      this.loadPlantMaster();
      if (this.applicationNumber) {
        this.longToast('सेशन डेटा लोड करने में त्रुटि - लेकिन संपादन जारी रह सकता है');
      }
    }
  }

  onRangeChange(rangeId: string) {
    this.rangId = rangeId;
  }

  // Check if cast category 4 (अनुसूचित जन जाति) is selected
  get isPvtgDropdownVisible(): boolean {
    return this.selectedCastCatId === '4';
  }

  // Handle cast category change - reset PVTG if not category 4
  onCastCategoryChange() {
    if (this.selectedCastCatId !== '4') {
      this.isPvtg = null;
    }
    this.cdRef.detectChanges();
  }


  loadApplicationData(applicationNumber: string) {
    // console.log('Loading application data for:', applicationNumber);
    this.showLoading('आवेदन की जानकारी लोड हो रही है...');
    this.apiService.getSingleAwedanData(applicationNumber).subscribe({
      next: (response: any) => {
        try {
          // console.log('response one :', response);
          // console.log('Application data response:', response);
          this.dismissLoading();

          if (!response || !response.response) {
            console.error('Invalid response structure:', response);
            this.longToast('आवेदन डेटा लोड करने में त्रुटि');
            return;
          }

          if (response.response.code !== 200) {
            console.error('API Error:', response.response.msg);
            this.longToast(response.response.msg || 'आवेदन डेटा लोड करने में त्रुटि');
            return;
          }

          const data = response?.response?.data?.[0];
          // console.log('data op :', data);
          if (!data) {
            console.error('No data found for application number:', applicationNumber);
            this.longToast('आवेदन डेटा नहीं मिला।');
            return;
          }


          // Assign location details from backend
          this.circleName = data.circleName || this.circleName || '';
          this.distName = data.distName || this.distName || '';
          this.div_name = data.divisionName || this.div_name || '';
          this.rang_name = data.rangName || this.rang_name || '';

          // Assign basic applicant info
          this.hitgrahiName = data.hitgrahiName || '';
          this.fatherName = data.fatherName || '';
          this.adhaar = data.aadharNo || '';
          this.address = data.address || '';
          this.bank_account_no = data.accountNo || '';
          this.ifsc_code = data.ifscCode || '';
          this.area = data.area || '';
          this.available_area = data.available_area || '0';
          // Sync total_rakba with available_area
          this.total_rakba = this.available_area ? Number(this.available_area) : (data.totalAcre || '0');
          this.inputMobileNumber = data.mobileNo || '';




          this.khasra_no = data.khasraNo || '';
          this.halka_no = data.halkaNo || '';
          this.village_name = data.villageName || '';
          this.gram_panchayat_name = data.gramPanchayatName || '';
          // this.sinchitOrA_sinchit = data.sinchit_asinchit || null || '';
          this.sinchitOrA_sinchit = data.sinchitAsinchit || '';

          this.awedan_number = applicationNumber; // or data.applicationNumber if available
          this.vrikharopan_akshansh = data.vrikharopan_akshansh || '0.0';
          this.vrikharopan_dikshansh = data.vrikharopan_dikshansh || '0.0';
          this.awedan_status = data.awedan_status || '1';

          this.selectfrarevenue = data.land_type?.toString() || '';
          this.compartment_no = data.compartmentNo || '';
          this.patta_no = data.pattaNo || '';
          this.adharFilename = data.adharPdfFile || null;
          this.bankPassbookFilename = data.bankpassbookPdfFile || null;
          this.b1P1Filename = data.b1P1PdfFile || null;
          this.kmlFilename = data.kmlFile || null;
          this.kmlFile = data.kmlFile || null;
          // console.log('adharFilename :', this.adharFilename);
          // console.log('bankPassbookFilename :', this.bankPassbookFilename);
          // console.log('b1P1Filename :', this.b1P1Filename);
          // console.log('kmlFilename :', this.kmlFilename);
          // console.log('kmlFile :', this.kmlFile);
          // this.kmlFilename = data.kmlFilePath || null; // Adjust field name based on your backend


          this.selectedYesNoForKakshaKramank = data.kakshaKramank !== 0 && data.kakshaKramank != null ? 'yes' : 'no';
          this.kaksha_kramank = data.kakshaKramank || '';
          // Assign dropdown selections



          this.selectfrarevenue = data.landType === 1 ? '1' : '2';

          this.selectedCastCatId = data.castCategory.toString();

          // Load PVTG value if available
          if (data.is_pvtg !== null && data.is_pvtg !== undefined) {
            this.isPvtg = data.is_pvtg === true || data.is_pvtg === 1 ? 'true' : 'false';
          } else {
            this.isPvtg = null;
          }

          // if(data.plantationType !==null){
          // this.selectedPlantationType = data.plantationType.toString();
          // }
          this.selectedPlantationType = data?.plantationType != null ? data.plantationType.toString() : '';


          // this.plantTypeFinal = data.plantTypeFinal.toString();
          let selectedNamesPlantType: string[] = [];
          let selectedIdsPlantType: string[] = [];

          if (data.plantTypeFinal != null) {
            this.plantTypeFinal = data.plantTypeFinal.toString();
            // console.log('plantTypeFinal :', this.plantTypeFinal);

            selectedIdsPlantType = this.plantTypeFinal.split(', ');
            debugger
            selectedNamesPlantType = this.listOfPlantTypes
              .filter(pt => selectedIdsPlantType.includes(pt.id.toString())) // ensure same type
              .map(pt => pt.name);
            // console.log('selectedNamesPlantType :', selectedNamesPlantType);
            this.plantTypeFinalNames = selectedNamesPlantType.join(',');
          }






          this.get_bank_details(data.bankid);
          this.get_sand_type(data.sandid);



          this.selectedCircleId = data.circleId;

          this.getDivisionList(this.selectedCircleId);

          this.selectedDivId = data.divisionId;
          this.selectedDistId = data.distId;


          this.getRangList(this.selectedDivId);

          this.rangId = data.rangId;



          setTimeout(() => {
            if (this.selectedCircleId) {
              this.getDivisionList(this.selectedCircleId);
            }
          }, 500);

          setTimeout(() => {
            if (this.selectedDivId) {
              this.getRangList(this.selectedDivId);
            }
          }, 1000);

          this.cdRef.detectChanges();

          // Load existing plant data from plant_request_new table (after plant master is loaded)
          setTimeout(() => {
            this.loadExistingPlants(applicationNumber);
          }, 1500);
          // //debugger;
          // Build plantation table data (keep for backward compatibility)
          this.listOfPlantationDetailsNew = [
            {
              prajatiName: 'क्लोनल नीलगिरी',
              plant_count_less_5: data.klonalNeelgiriNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.klonalNeelgiriPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.klonalNeelgiriNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.klonalNeelgiriPlantAreaMore5Acre?.toString() || '0'
            },
            {
              prajatiName: 'टिश्यू कल्चर सागौन',
              plant_count_less_5: data.tishuCultureSagonNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.tishuCultureSagonPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.tishuCultureSagonNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.tishuCultureSagonPlantAreaMore5Acre?.toString() || '0'
            },
            {
              prajatiName: 'टिश्यू कल्चर बांस',
              plant_count_less_5: data.tishuCultureBanshNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.tishuCultureBanshPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.tishuCultureBanshNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.tishuCultureBanshPlantAreaMore5Acre?.toString() || '0'
            },
            {
              prajatiName: 'सामान्य सागौन',
              plant_count_less_5: data.normalSagonNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.normalSagonPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.normalSagonNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.normalSagonPlantAreaMore5Acre?.toString() || '0'
            },
            {
              prajatiName: 'मिलिया डुबिया',
              plant_count_less_5: data.miliyaDubiyaNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.miliyaDubiyaPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.miliyaDubiyaNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.miliyaDubiyaPlantAreaMore5Acre?.toString() || '0'
            },
            {
              prajatiName: 'चंदन',
              plant_count_less_5: data.chandanNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.chandanPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.chandanNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.chandanPlantAreaMore5Acre?.toString() || '0'
            },
            {
              prajatiName: 'अन्य लाभकारी',
              plant_count_less_5: data.otherLabhkariNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.otherLabhkariPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.otherLabhkariNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.otherLabhkariPlantAreaMore5Acre?.toString() || '0'
            },
            {
              prajatiName: 'सामान्य बांस',
              plant_count_less_5: data.normalBanshNoOfPlantLess5Acre?.toString() || '0',
              area_size_less_5: data.normalBanshPlantAreaLess5Acre?.toString() || '0',
              plant_count_more_5: data.normalBanshNoOfPlantMore5Acre?.toString() || '0',
              area_size_more_5: data.normalBanshPlantAreaMore5Acre?.toString() || '0'
            }
          ];

          // Handle additional plant types from other_plant
          if (data.OtherPlant || data.other_plant) {
            const otherPlants = (data.OtherPlant || data.other_plant).split(',').map((plant: string) => plant.trim());
            otherPlants.forEach((plant: string) => {
              if (plant) {
                this.listOfPlantationDetailsNew.push({
                  prajatiName: plant,
                  plant_count_less_5: data.otherLabhkariNoOfPlantLess5Acre?.toString() || '0',
                  area_size_less_5: data.otherLabhkariPlantAreaLess5Acre?.toString() || '0',
                  plant_count_more_5: data.otherLabhkariNoOfPlantMore5Acre?.toString() || '0',
                  area_size_more_5: data.otherLabhkariPlantAreaMore5Acre?.toString() || '0'
                });
              }
            });
          }

          // Filter out entries with zero counts and areas
          this.listOfPlantationDetailsNew = this.listOfPlantationDetailsNew.filter(
            item =>
              item.plant_count_less_5 !== '0' ||
              item.area_size_less_5 !== '0' ||
              item.plant_count_more_5 !== '0' ||
              item.area_size_more_5 !== '0'
          );


          // Update totals for the plantation table
          this.updatePlantationTotals();

          // Trigger change detection
          this.cdRef.detectChanges();
        } catch (error) {
          console.error('Error processing application data:', error);
          this.longToast('आवेदन डेटा प्रसंस्करण में त्रुटि');
        }
      },
      error: (err) => {
        this.dismissLoading();
        console.error('API Error loading application data:', err);
        this.longToast('आवेदन डेटा लोड करने में त्रुटि: ' + (err?.error?.response?.msg || err?.message || 'अज्ञात त्रुटि'));
      }
    });

  }



  async getCircleList() {
    this.showLoading('कृपया प्रतीक्षा करें.....');
    this.apiService.getCircles().subscribe(
      async (response: any) => {
        // await this.dismissLoading();
        if (response.response.code === 200) {
          // console.log('response.data :', response.data);
          this.listOfCircle = response.data;
          this.cdRef.detectChanges();
        } else {
          this.longToast(response.response.msg);
        }
      },
      async (error: any) => {
        // await this.dismissLoading();
        this.shortToast(error);
      }
    );
  }

  // Add these methods to download PDFs
  async downloadAdharPdf() {
    if (!this.adharFilename) {
      this.longToast('No file available to download');
      return;
    }

    this.showLoading('Downloading PDF...');
    this.apiService.getSecurePDF(this.adharFilename).subscribe({
      next: (blob: Blob) => {
        this.dismissLoading();
        this.openBlobInNewTab(blob, this.adharFilename!);
      },
      error: (err) => {
        this.dismissLoading();
        this.longToast('Error downloading file');
        console.error('Error downloading PDF:', err);
      }
    });
  }

  async downloadBankPassbookPdf() {
    if (!this.bankPassbookFilename) {
      this.longToast('No file available to download');
      return;
    }

    this.showLoading('Downloading PDF...');
    this.apiService.getSecurePDF(this.bankPassbookFilename).subscribe({
      next: (blob: Blob) => {
        this.dismissLoading();
        this.openBlobInNewTab(blob, this.bankPassbookFilename!);
      },
      error: (err) => {
        this.dismissLoading();
        this.longToast('Error downloading file');
        console.error('Error downloading PDF:', err);
      }
    });
  }

  async downloadB1P1Pdf() {
    if (!this.b1P1Filename) {
      this.longToast('No file available to download');
      return;
    }

    this.showLoading('Downloading PDF...');
    this.apiService.getSecurePDF(this.b1P1Filename).subscribe({
      next: (blob: Blob) => {
        this.dismissLoading();
        this.openBlobInNewTab(blob, this.b1P1Filename!);
      },
      error: (err) => {
        this.dismissLoading();
        this.longToast('Error downloading file');
        console.error('Error downloading PDF:', err);
      }
    });
  }

  async downloadKmlFile() {
    if (!this.kmlFilename) {
      this.longToast('No file available to download');
      return;
    }

    this.showLoading('Downloading file...');
    this.apiService.getSecurePDF(this.kmlFilename).subscribe({
      next: (blob: Blob) => {
        this.dismissLoading();
        this.openBlobInNewTab(blob, this.kmlFilename!);
      },
      error: (err) => {
        this.dismissLoading();
        this.longToast('Error downloading file');
        console.error('Error downloading file:', err);
      }
    });
  }

  openBlobInNewTab(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


  async getDivisionList(circleId: string) {
    if (!circleId) return;

    this.apiService.getDivision(circleId).subscribe(
      async (response: any) => {
        // await this.dismissLoading();
        if (response.response.code === 200) {
          this.listOfDivision = response.data;
          this.cdRef.detectChanges();
        } else {
          this.longToast(response.response.msg);
        }
      },
      async (error: any) => {
        // await this.dismissLoading();
        this.shortToast(error);
      }
    );
  }

  // Add these change event handlers
  onCircleChange(circleId: string) {
    this.selectedCircleId = circleId;
    this.selectedDistId = '';
    this.selectedDivId = '';
    this.rangId = '';
    this.listOfDist = [];
    this.listOfDivision = [];
    this.listOfRang = [];

    if (circleId) {
      this.getDistList(circleId); // Pass circleId to get districts
    }
  }

  onDivisionChange(divisionId: string) {
    this.selectedDivId = divisionId;
    this.rangId = '';
    this.listOfRang = [];

    if (divisionId) {
      this.getRangListByDivision(divisionId); // Get ranges for this division
    }
  }

  async getRangListByDivision(divisionId: string) {
    // this.showLoading('कृपया प्रतीक्षा करें.....');

    this.apiService.getRangesByDivision(divisionId).subscribe(
      async (response: any) => {
        await this.dismissLoading();
        if (response.response.code === 200) {
          this.listOfRang = response.data;
          this.cdRef.detectChanges();
        } else {
          this.longToast(response.response.msg);
        }
      },
      async (error: any) => {
        await this.dismissLoading();
        this.shortToast(error);
      }
    );
  }

  onDistrictChange(districtId: string) {
    this.selectedDistId = districtId;
    this.selectedDivId = '';
    this.rangId = '';
    this.listOfDivision = [];
    this.listOfRang = [];

    if (districtId) {
      this.getDivisionListByDistrict(districtId); // Get divisions for this district
    }
  }

  async getDivisionListByDistrict(districtId: string) {
    this.showLoading('कृपया प्रतीक्षा करें.....');

    this.apiService.getDivisionsByDistrict(districtId).subscribe(
      async (response: any) => {
        await this.dismissLoading();
        if (response.response.code === 200) {
          this.listOfDivision = response.data;
          this.cdRef.detectChanges();
        } else {
          this.longToast(response.response.msg);
        }
      },
      async (error: any) => {
        await this.dismissLoading();
        this.shortToast(error);
      }
    );
  }



  async get_bank_details(selectedBankId?: string | number) {
    // this.showLoading('कृपया प्रतीक्षा करें.....');
    // console.log('🔹 Selected Bank ID (input):', selectedBankId);

    this.apiService.getBankDetails().subscribe({
      next: async (data) => {
        // await this.dismissLoading();

        // ✅ Check if API returns expected structure
        if (data?.response?.dynamicdata && Array.isArray(data.response.dynamicdata)) {
          // ✅ Map API data to match dropdown format
          this.listOfBank = data.response.dynamicdata.map((item: any) => ({
            id: item.id.toString(), // convert number → string
            name: item.bank_name_hi || item.bank_name_en || 'Unknown Bank',
          }));

          // console.log('✅ Bank list:', this.listOfBank);

          // ✅ Preselect bank if selectedBankId is available
          if (selectedBankId != null) {
            const selectedId = selectedBankId.toString();
            const bankExists = this.listOfBank.some(b => b.id === selectedId);

            if (bankExists) {
              this.selectedBankName = selectedId; // ✅ Bind to [(ngModel)]
              // console.log('🏦 Preselected bank ID:', this.selectedBankName);
            } else {
              console.warn('⚠️ Selected bank not found in list');
            }
          }

          this.cdRef.detectChanges();
        } else {
          console.warn('⚠️ Invalid API response structure:', data);
        }
      },

      error: async (err) => {
        // await this.dismissLoading();
        // console.error('❌ Error fetching banks:', err);
        this.shortToast(err.message || 'डेटा लोड करने में त्रुटि हुई।');
      }
    });
  }


  async get_sand_type(selectedSandId?: string | number) {
    // this.showLoading('कृपया प्रतीक्षा करें.....');

    this.apiService.getSandType().subscribe({
      next: async (data) => {
        // await this.dismissLoading();

        if (data?.response?.dynamicdata && Array.isArray(data.response.dynamicdata)) {
          // ✅ Map API data for dropdown
          this.listOfSandType = data.response.dynamicdata.map((item: any) => ({
            id: item.id.toString(),
            name: item.sand_type, // from your backend
          }));


          // ✅ Preselect sand type if ID provided
          if (selectedSandId != null) {
            const selectedId = selectedSandId.toString();
            const exists = this.listOfSandType.some(s => s.id === selectedId);

            if (exists) {
              this.selected_sand_type = selectedId;
              // console.log('🏖 Preselected sand type ID:', this.selected_sand_type);
            } else {
              console.warn('⚠️ Provided sand ID not found in list');
            }
          }

          this.cdRef.detectChanges();
        } else {
          console.warn('⚠️ Invalid API response for sand type:', data);
        }
      },
      error: async (err) => {
        // await this.dismissLoading();
        console.error('❌ Error fetching sand type:', err);
        this.shortToast(err.message || 'डेटा लोड करने में त्रुटि हुई।');
      }
    });
  }

  goBack() {
    if (window.history.length > 1) {
      if (sessionStorage.getItem('logined_officer_data') != null) {
        const dashboardUrl = this.getDashboardUrlByDesignation();
        this.router.navigateByUrl(dashboardUrl, { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/landingpage', { replaceUrl: true });
      }
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

  checkMobileNumberAlreadyFilledAwedanOrNot() {
    if (!this.inputMobileNumber || this.inputMobileNumber.toString().length !== 10) {
      this.showError('सही मोबाइल नंबर दर्ज करें');
      this.longToast('सही मोबाइल नंबर दर्ज करें');
    } else {
      this.showLoading('ओटीपी प्राप्त हो रहा है कृपया प्रतीक्षा करें.....');
      this.apiService.checkMobileNumberAlreadyExist(this.inputMobileNumber).subscribe(
        (response) => {
          this.dismissLoading();
          if (response.response.code === 200) {
            // Handle OTP or next steps
          }
        },
        (error) => {
          this.longToast(error);
          this.dismissLoading();
        }
      );
    }
  }

  private canUseNativeToast(): boolean {
    return this.platform.is('hybrid') || this.platform.is('cordova') || this.platform.is('capacitor') || this.platform.is('android') || this.platform.is('ios');
  }

  async shortToast(msg: string) {
    if (this.canUseNativeToast()) {
      try {
        await Toast.show({
          text: msg,
          duration: 'short',
          position: 'bottom',
        });
        return;
      } catch (error) {
        console.warn('Toast plugin error (short):', error);
      }
    }
    await this.showErrorDialog(msg);
  }

  async longToast(msg: string) {
    if (this.canUseNativeToast()) {
      try {
        await Toast.show({
          text: msg,
          duration: 'long',
          position: 'bottom',
        });
        return;
      } catch (error) {
        console.warn('Toast plugin error (long):', error);
      }
    }
    await this.showErrorDialog(msg);
  }

  showLoading(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }
  dismissLoading() {
    this.isLoading = false;
    this.cdRef.detectChanges();

    if (this.isLoading) {
      setTimeout(() => {
        const overlay = document.querySelector('#ion-overlay-1') as HTMLElement;
        overlay?.focus();
      }, 100);
    }
  }

  async showProgressLoader() {
    this.progressData = {
      dataUploaded: false,
      plantUploaded: false,
      fileUploaded: false,
      dataUploadError: false,
      plantUploadError: false,
      fileUploadError: false,
      dataUploadErrorMessage: '',
      plantUploadErrorMessage: '',
      fileUploadErrorMessage: ''
    };

    this.progressModal = await this.modalCtrl.create({
      component: ProgressLoaderComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        dataUploaded: this.progressData.dataUploaded,
        plantUploaded: this.progressData.plantUploaded,
        fileUploaded: this.progressData.fileUploaded,
        dataUploadError: this.progressData.dataUploadError,
        plantUploadError: this.progressData.plantUploadError,
        fileUploadError: this.progressData.fileUploadError,
        dataUploadErrorMessage: this.progressData.dataUploadErrorMessage,
        plantUploadErrorMessage: this.progressData.plantUploadErrorMessage,
        fileUploadErrorMessage: this.progressData.fileUploadErrorMessage
      },
      backdropDismiss: false,
    });

    await this.progressModal.present();
  }

  async updateProgressLoader() {
    if (this.progressModal) {
      // Always recreate modal with updated props - this is more reliable
      // than trying to access the component instance
      await this.recreateProgressLoader();
    }
  }

  async recreateProgressLoader() {
    if (this.progressModal) {
      // Preserve current progress state
      const currentProgress = {
        dataUploaded: this.progressData.dataUploaded,
        plantUploaded: this.progressData.plantUploaded,
        fileUploaded: this.progressData.fileUploaded,
        dataUploadError: this.progressData.dataUploadError,
        plantUploadError: this.progressData.plantUploadError,
        fileUploadError: this.progressData.fileUploadError,
        dataUploadErrorMessage: this.progressData.dataUploadErrorMessage,
        plantUploadErrorMessage: this.progressData.plantUploadErrorMessage,
        fileUploadErrorMessage: this.progressData.fileUploadErrorMessage
      };

      await this.progressModal.dismiss();
      this.progressModal = null;

      // Recreate with current progress state
      this.progressModal = await this.modalCtrl.create({
        component: ProgressLoaderComponent,
        cssClass: 'custom-dialog-modal',
        componentProps: {
          dataUploaded: currentProgress.dataUploaded,
          plantUploaded: currentProgress.plantUploaded,
          fileUploaded: currentProgress.fileUploaded,
          dataUploadError: currentProgress.dataUploadError,
          plantUploadError: currentProgress.plantUploadError,
          fileUploadError: currentProgress.fileUploadError,
          dataUploadErrorMessage: currentProgress.dataUploadErrorMessage,
          plantUploadErrorMessage: currentProgress.plantUploadErrorMessage,
          fileUploadErrorMessage: currentProgress.fileUploadErrorMessage
        },
        backdropDismiss: false,
      });

      await this.progressModal.present();
    }
  }

  async dismissProgressLoader() {
    if (this.progressModal) {
      await this.progressModal.dismiss();
      this.progressModal = null;
    }
  }

  async showError(errorMsg: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: MessageDialogComponent,
        componentProps: {
          server_message: errorMsg,
          isYesNo: false,
        },
        cssClass: 'custom-dialog-modal',
        backdropDismiss: false,
      });
      await modal.present();
    } catch (err) {
      console.error(err);
    }
  }

  async showErrorDialog(errorMsg: string) {
    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: errorMsg,
        isYesNo: false, // This shows OK button only
      },
      backdropDismiss: false,
    });

    await modal.present();
    // Modal will auto-dismiss when user clicks OK
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  getOfficerIdFromSession(): number {
    try {
      const storedData = sessionStorage.getItem('logined_officer_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData?.officerId ?? 0;
      }
      return 0;
    } catch (error) {
      console.error('Error reading officer data from session:', error);
      return 0;
    }
  }

  // async getDistList() {
  //   // this.showLoading('कृपया प्रतीक्षा करें.....');
  //   this.apiService.getDist(this.circleId).subscribe(
  //     async (response) => {
  //       await this.dismissLoading();
  //       if (response.response.code === 200) {
  //         this.listOfDist = response.dist;
  //         this.listOfSandType = response.sand_type;
  //         this.listOfBank = response.bank;
  //       } else {
  //         this.longToast(response.response.msg);
  //       }
  //     },
  //     async (error) => {
  //       await this.dismissLoading();
  //       this.shortToast(error);
  //     }
  //   );
  // }

  async getDistList(circleId?: string) {
    this.showLoading('कृपया प्रतीक्षा करें.....');
    const targetCircleId = circleId || this.circleId;

    this.apiService.getDist(targetCircleId).subscribe(
      async (response) => {
        await this.dismissLoading();
        if (response.response.code === 200) {
          this.listOfDist = response.dist;

          this.listOfSandType = response.sand_type;
          this.listOfBank = response.bank;
          this.cdRef.detectChanges();
        } else {
          this.longToast(response.response.msg);
        }
      },
      async (error) => {
        await this.dismissLoading();
        this.shortToast(error);
      }
    );
  }
  // getRangList(divisionId?: string) {
  //   this.listOfRang = [];
  //   // this.rangId = '';
  //   // this.showLoading('कृपया प्रतीक्षा करें.....');
  //   this.apiService.getRang(divisionId || this.rangId.toString(), this.circleId.toString()).subscribe(
  //     (response) => {
  //       this.dismissLoading();
  //       if (response.response.code === 200) {
  //         this.listOfRang = response.data;
  //         this.cdRef.detectChanges();
  //       } else {
  //         this.longToast(response.response.msg);
  //       }
  //     },
  //     (error) => {
  //       this.dismissLoading();
  //       this.shortToast(error);
  //     }
  //   );
  // }
  getRangList(divisionId?: string) {
    this.listOfRang = [];
    // this.rangId = '';
    this.showLoading('कृपया प्रतीक्षा करें.....');

    this.apiService.getRang(divisionId || this.rangId.toString(), this.circleId.toString()).subscribe(
      (response) => {
        this.dismissLoading();
        if (response.response.code === 200) {
          this.listOfRang = response.data;
          this.cdRef.detectChanges();
        } else {
          this.longToast(response.response.msg);
        }
      },
      (error) => {
        this.dismissLoading();
        this.shortToast(error);
      }
    );
  }


  async addPlant() {
    const modal = await this.modalCtrl.create({
      component: AddPlantDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: '',
        isYesNo: true,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      // debugger

      if (result.data?.confirmed) {

        const addedJson = JSON.parse(this.sharedService.getAddedPlanJson()) as PlantationDetailNew;
        const alreadyAdded = this.listOfPlantationDetailsNew.find(
          (plant) => plant.prajatiName === addedJson.prajatiName
        );
        if (!alreadyAdded) {
          // Allow first entry without comparison; else validate against total
          if (this.listOfPlantationDetailsNewTotal.length === 0) {
            this.listOfPlantationDetailsNew.push(addedJson);
            this.updatePlantationTotals();
            this.cdRef.detectChanges();
          } else {
            let comingTotal = Number(addedJson.area_size_less_5) + Number(addedJson.area_size_more_5);
            let totalArea = Number(this.listOfPlantationDetailsNewTotal[0].area_size_less_5)
              + Number(this.listOfPlantationDetailsNewTotal[0].area_size_more_5);
            let grandTotal = comingTotal + totalArea;
            if (Number(grandTotal) <= Number(this.total_rakba)) {
              this.listOfPlantationDetailsNew.push(addedJson);
              this.updatePlantationTotals();
              this.cdRef.detectChanges();
            } else {
              alert(" कुल भूमि (एकड़) मे रोपण योग्य कुल भूमि (एकड़ मे ) से अधिक ना हो |  ");
            }
          }
        } else {
          alert(`${alreadyAdded.prajatiName} की जानकारी पहले ही डाली जा चुकी है`);
          this.longToast(`${alreadyAdded.prajatiName} की जानकारी पहले ही डाली जा चुकी है`);
        }
      }
    });

    await modal.present();
  }

  deletePlant(item: PlantationDetailNew) {
    const index = this.listOfPlantationDetailsNew.findIndex(
      (plant) => plant.prajatiName === item.prajatiName
    );
    if (index !== -1) {
      this.listOfPlantationDetailsNew.splice(index, 1);
      this.updatePlantationTotals();
      this.cdRef.detectChanges();
      // Defer backend save to after successful main form submission
    }
  }

  updatePlantationTotals() {
    let total_plant = 0;
    let total_area = 0;

    let plant_count_less_5 = 0;
    let area_size_less_5 = 0;
    let plant_count_more_5 = 0;
    let area_size_more_5 = 0;

    for (const item of this.listOfPlantationDetailsNew) {
      total_plant += Number(item.plant_count_less_5) || 0;
      total_plant += Number(item.plant_count_more_5) || 0;
      total_area += Number(item.area_size_less_5) || 0;
      total_area += Number(item.area_size_more_5) || 0;

      plant_count_less_5 += Number(item.plant_count_less_5);
      area_size_less_5 += Number(item.area_size_less_5);
      plant_count_more_5 += Number(item.plant_count_more_5);
      area_size_more_5 += Number(item.area_size_more_5);
    }

    this.total_ropit_number_of_plant_less_than_5_acre = plant_count_less_5;
    this.total_ropit_area_less_than_5_acre = area_size_less_5;


    this.total_ropit_number_of_plant_more_than_5_acre = plant_count_more_5;
    this.total_ropit_area_more_than_5_acre = area_size_more_5;



    this.listOfPlantationDetailsNewTotal = [{
      prajatiName: 'कुल',
      plant_count_less_5: plant_count_less_5.toString(),
      area_size_less_5: area_size_less_5.toString(),
      plant_count_more_5: plant_count_more_5.toString(),
      area_size_more_5: area_size_more_5.toString(),
    }];
  }

  getTotalPlant(item: PlantationDetailNew): Number {
    return Number(item.plant_count_less_5) + Number(item.plant_count_more_5);
  }

  getTotalArea(item: PlantationDetailNew): Number {
    return Number(item.area_size_more_5) + Number(item.area_size_less_5);
  }


  onAdharPdfFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.adharPdfFile = null;
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      this.longToast('आधार कार्ड PDF फाइल का आकार 2MB से अधिक नहीं होना चाहिए');
      event.target.value = ''; // Clear the input
      this.adharPdfFile = null;
      return;
    }

    // Validate file type (PDF)
    if (file.type !== 'application/pdf') {
      this.longToast('कृपया केवल PDF फाइल अपलोड करें');
      event.target.value = '';
      this.adharPdfFile = null;
      return;
    }

    this.adharPdfFile = file;
  }

  onBankPassbookPdfFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.bankPassbookPdfFile = null;
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      this.longToast('बैंक पासबुक PDF फाइल का आकार 2MB से अधिक नहीं होना चाहिए');
      event.target.value = ''; // Clear the input
      this.bankPassbookPdfFile = null;
      return;
    }

    // Validate file type (PDF)
    if (file.type !== 'application/pdf') {
      this.longToast('कृपया केवल PDF फाइल अपलोड करें');
      event.target.value = '';
      this.bankPassbookPdfFile = null;
      return;
    }

    this.bankPassbookPdfFile = file;
  }

  onB1P1PdfFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.b1P1PdfFile = null;
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      this.longToast('B1 और P1 PDF फाइल का आकार 2MB से अधिक नहीं होना चाहिए');
      event.target.value = ''; // Clear the input
      this.b1P1PdfFile = null;
      return;
    }

    // Validate file type (PDF)
    if (file.type !== 'application/pdf') {
      this.longToast('कृपया केवल PDF फाइल अपलोड करें');
      event.target.value = '';
      this.b1P1PdfFile = null;
      return;
    }

    this.b1P1PdfFile = file;
  }

  onKmlFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.kmlFile = null;
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      this.longToast('KML फाइल का आकार 2MB से अधिक नहीं होना चाहिए');
      event.target.value = ''; // Clear the input
      this.kmlFile = null;
      return;
    }

    // Validate file type (KML/KMZ)
    const validTypes = [
      'application/vnd.google-earth.kml+xml',
      'application/vnd.google-earth.kmz',
      'application/xml',
      'text/xml'
    ];
    const validExtensions = ['.kml', '.kmz'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      this.longToast('कृपया केवल KML या KMZ फाइल अपलोड करें');
      event.target.value = '';
      this.kmlFile = null;
      return;
    }

    this.kmlFile = file;
  }

  calculateSumOfTotalPlants(
    isLessThan5Acre: boolean,
    isNumberOfPlanInput: boolean,
    isTotalAcreInput: boolean,
    event: any
  ) {
    if (isLessThan5Acre && isNumberOfPlanInput) {
      let inputVal = Number(event.target.value);
      if (inputVal > 5000) {
        event.target.value = '';
        return;
      }
    }
    if (isLessThan5Acre && isTotalAcreInput) {
      let inputVal = Number(event.target.value);
      if (inputVal > 5) {
        event.target.value = '';
        return;
      }
    }
    if (!isLessThan5Acre && isTotalAcreInput) {
      let inputVal = Number(event.target.value);
      if (inputVal < 5) {
        event.target.value = '';
        return;
      }
    }

    this.total_ropit_number_of_plant_less_than_5_acre =
      Number(this.klonal_neelgiri_plant_no_less_than_5_acre || 0) +
      Number(this.tishu_culture_sagon_plan_no_less_than_5_acre || 0) +
      Number(this.tishu_culture_bans_plan_no_less_than_5_acre || 0) +
      Number(this.normal_sagon_plan_no_less_than_5_acre || 0) +
      Number(this.normal_bansh_plan_no_less_than_5_acre || 0) +
      Number(this.milia_dubiya_plan_no_less_than_5_acre || 0) +
      Number(this.chandan_plan_no_less_than_5_acre || 0) +
      Number(this.other_labhkari_plan_no_less_than_5_acre || 0);

    this.total_ropit_area_less_than_5_acre =
      Number(this.klonal_neelgiri_area_less_than_5_acre || 0) +
      Number(this.tishu_culture_sagon_area_less_than_5_acre || 0) +
      Number(this.tishu_culture_bans_area_less_than_5_acre || 0) +
      Number(this.normal_sagon_area_less_than_5_acre || 0) +
      Number(this.normal_bansh_area_less_than_5_acre || 0) +
      Number(this.milia_dubiya_area_less_than_5_acre || 0) +
      Number(this.chandan_area_less_than_5_acre || 0) +
      Number(this.other_labhkari_plant_area_less_than_5_acre || 0);

    this.total_ropit_number_of_plant_more_than_5_acre =
      Number(this.klonal_neelgiri_plant_no_more_than_5_acre || 0) +
      Number(this.tishu_culture_sagon_plan_no_more_than_5_acre || 0) +
      Number(this.tishu_culture_bans_plan_no_more_than_5_acre || 0) +
      Number(this.normal_sagon_plan_no_more_than_5_acre || 0) +
      Number(this.normal_bansh_plan_no_more_than_5_acre || 0) +
      Number(this.milia_dubiya_plan_no_more_than_5_acre || 0) +
      Number(this.chandan_plan_no_more_than_5_acre || 0) +
      Number(this.other_labhkari_plan_no_more_than_5_acre || 0);

    this.total_ropit_area_more_than_5_acre =
      Number(this.klonal_neelgiri_area_more_than_5_acre || 0) +
      Number(this.tishu_culture_sagon_area_more_than_5_acre || 0) +
      Number(this.tishu_culture_bans_area_more_than_5_acre || 0) +
      Number(this.normal_sagon_area_more_than_5_acre || 0) +
      Number(this.normal_bansh_area_more_than_5_acre || 0) +
      Number(this.milia_dubiya_area_more_than_5_acre || 0) +
      Number(this.chandan_area_more_than_5_acre || 0) +
      Number(this.other_labhkari_plant_area_more_than_5_acre || 0);
  }

  isWebPlatform(): boolean {
    return this.platform.is('desktop');
  }

  onselect() {
    if (this.selectfrarevenue === '1') //FRA
    {
      // this.compartment_no = '';
      this.khasra_no = '';
      // this.patta_no = '';
    } else if (this.selectfrarevenue === '2') //Revenue
    {
      this.compartment_no = '';
      // this.khasra_no = '';
      this.patta_no = '';
    }
  }

  submitFormData() {
    // //debugger;

    // 1. Validate Circle
    if (!this.selectedCircleId || this.selectedCircleId.toString().trim() === '') {
      this.longToast('कृपया वृत्त का नाम चुनें');
      return;
    }

    // 2. Validate District
    if (!this.selectedDistId || this.selectedDistId.toString().trim() === '') {
      this.longToast('कृपया जिले का नाम चुनें');
      return;
    }

    // 3. Validate Division
    if (!this.selectedDivId || this.selectedDivId.toString().trim() === '') {
      this.longToast('कृपया वनमण्डल का नाम चुनें');
      return;
    }

    // 4. Validate Range
    if (!this.rangId || this.rangId.toString().trim() === '') {
      this.longToast('कृपया परिक्षेत्र का नाम चुनें');
      return;
    }
    if (!this.selectedCastCatId || this.selectedCastCatId.toString().trim() === '') {
      this.longToast('कृपया जाति वर्ग चुनें');
      return;
    }

    // Validate PVTG if cast category 4 is selected
    if (this.selectedCastCatId === '4') {
      if (this.isPvtg === null || this.isPvtg === '') {
        this.longToast('कृपया PVTG का चयन करें');
        return;
      }
    }

    // 6. Validate Aadhar
    if (!this.adhaar || this.adhaar.toString().trim() === '') {
      this.longToast('कृपया आधार कार्ड नम्बर दर्ज करें');
      return;
    }
    // if (this.adhaar.toString().trim().length !== 12) {
    //   this.longToast('आधार कार्ड नम्बर 12 अंकों का होना चाहिए');
    //   return;
    // }

    // 7. Validate Hitgrahi Name
    if (!this.hitgrahiName || this.hitgrahiName.toString().trim() === '') {
      this.longToast('कृपया कृषक/हितग्राही का नाम दर्ज करें');
      return;
    }

    // 8. Validate Father Name
    if (!this.fatherName || this.fatherName.toString().trim() === '') {
      this.longToast('कृपया पिता का नाम दर्ज करें');
      return;
    }

    // 9. Validate Address
    if (!this.address || this.address.toString().trim() === '') {
      this.longToast('कृपया पता दर्ज करें');
      return;
    }

    // 10. Validate Bank Name
    if (!this.selectedBankName || this.selectedBankName.toString().trim() === '') {
      this.longToast('कृपया बैंक का नाम चुनें');
      return;
    }

    // 11. Validate IFSC Code
    if (!this.ifsc_code || this.ifsc_code.toString().trim() === '') {
      this.longToast('कृपया IFSC कोड दर्ज करें');
      return;
    }

    // 12. Validate Bank Account Number
    if (!this.bank_account_no || this.bank_account_no.toString().trim() === '') {
      this.longToast('कृपया बैंक खाता नम्बर दर्ज करें');
      return;
    }

    // 13. Validate Area (हितग्राही का कुल रकबा)
    if (!this.area || this.area.toString().trim() === '' || Number(this.area) <= 0) {
      this.longToast('कृपया हितग्राही का कुल रकबा (एकड़ में) दर्ज करें');
      return;
    }

    // 14. Validate Available Area
    if (!this.available_area || this.available_area.toString().trim() === '' || Number(this.available_area) <= 0) {
      this.longToast('कृपया उपलब्ध रोपण योग्य भूमि का रकबा (एकड़ में) दर्ज करें');
      return;
    }

    // 15. Sync total_rakba with available_area (they should always be the same)
    this.total_rakba = Number(this.available_area);

    // 16. Validate Available Area <= Area
    if (Number(this.available_area) > Number(this.area)) {
      this.longToast('उपलब्ध रोपण योग्य भूमि हितग्राही के कुल रकबे से अधिक नहीं हो सकती');
      return;
    }

    // 18. Validate Kaksha Kramank (if yes selected)
    if (this.selectedYesNoForKakshaKramank === 'yes') {
      if (!this.kaksha_kramank || this.kaksha_kramank.toString().trim() === '') {
        this.longToast('कृपया कक्ष क्रमांक दर्ज करें');
        return;
      }
    }

    // 19. Validate Sinchit/Asinchit
    if (!this.sinchitOrA_sinchit || this.sinchitOrA_sinchit.toString().trim() === '') {
      this.longToast('कृपया भूमि सिंचित/असिंचित का चयन करें');
      return;
    }

    // 20. Validate Land Type (FRA/Revenue)
    if (!this.selectfrarevenue || this.selectfrarevenue.toString().trim() === '') {
      this.longToast('कृपया भूमि का प्रकार (FRA/Revenue) चुनें');
      return;
    }

    // 21. Validate FRA Land fields
    if (this.selectfrarevenue === '1') {
      if (!this.compartment_no || this.compartment_no.toString().trim() === '') {
        this.longToast('कृपया कक्ष क्रमांक (FRA) दर्ज करें');
        return;
      }
      if (!this.patta_no || this.patta_no.toString().trim() === '') {
        this.longToast('कृपया वन अधिकार पत्र क्रमांक (पट्टा नंबर) दर्ज करें');
        return;
      }
    }

    // 22. Validate Revenue Land fields
    if (this.selectfrarevenue === '2') {
      if (!this.khasra_no || this.khasra_no.toString().trim() === '') {
        this.longToast('कृपया खसरा नंबर दर्ज करें');
        return;
      }
    }

    // 23. Validate Halka Number
    if (!this.halka_no || this.halka_no.toString().trim() === '') {
      this.longToast('कृपया पटवारी हल्का नम्बर दर्ज करें');
      return;
    }

    // 24. Validate Village Name
    if (!this.village_name || this.village_name.toString().trim() === '') {
      this.longToast('कृपया ग्राम का नाम दर्ज करें');
      return;
    }

    // 25. Validate Gram Panchayat Name
    if (!this.gram_panchayat_name || this.gram_panchayat_name.toString().trim() === '') {
      this.longToast('कृपया ग्राम पंचायत का नाम दर्ज करें');
      return;
    }

    // 26. Validate Sand Type
    if (!this.selected_sand_type || this.selected_sand_type.toString().trim() === '') {
      this.longToast('कृपया मिट्टी का प्रकार चुनें');
      return;
    }

    // 27. Validate Plantation Type
    if (!this.selectedPlantationType || this.selectedPlantationType.toString().trim() === '') {
      this.longToast('कृपया वृक्षारोपण मॉडल का प्रकार चुनें');
      return;
    }

    // 28. Validate Plant Type Final
    if (!this.plantTypeFinal || this.plantTypeFinal.toString().trim() === '') {
      this.longToast('कृपया प्रजातीय चुनें');
      return;
    }

    // 29. Validate Plants (already has validation, but ensure at least one plant is added)
    if (!this.selectedPlants || this.selectedPlants.length === 0) {
      this.longToast('कृपया कम से कम एक पौधा जोड़ें');
      return;
    }

    // 30. Validate total area of plants doesn't exceed available_area
    const totalAreaUsed = this.getTotalAreaUsed();
    const availableArea = this.getAvailableAreaAsNumber();
    if (availableArea > 0 && totalAreaUsed > availableArea) {
      this.longToast(`⚠️ कुल रकबा (${totalAreaUsed.toFixed(2)} एकड़) उपलब्ध रकबा (${availableArea} एकड़) से अधिक नहीं हो सकता`);
      return;
    }

    // 31. Validate that no plantable area is left unassigned
    const remainingArea = this.getRemainingArea();
    if (availableArea > 0 && remainingArea > 0) {
      this.longToast(`कृपया सभी पौधे जोड़ें। शेष रकबा ${remainingArea.toFixed(2)} एकड़ है जिसे पौधों से भरना आवश्यक है।`);
      return;
    }

    if (this.selectedPlants && this.selectedPlants.length > 0) {
      for (let i = 0; i < this.selectedPlants.length; i++) {
        const p = this.selectedPlants[i];
        const missingId = !p.plant_id || p.plant_id === 0;
        const invalidArea = !p.total_area || Number(p.total_area) <= 0;
        const invalidTree = !p.total_tree || Number(p.total_tree) <= 0;
        if (missingId || invalidArea || invalidTree) {
          const msg = `कृपया पौधा #${i + 1} की पूरी जानकारी भरें (पौधा, रकबा, पौध संख्या)`;
          this.plantValidationMessage = msg;
          this.longToast(msg);
          return;
        }
      }
    }

    this.plantValidationMessage = '';

    // Validate files - for new submission, all files are required
    // For edit mode, files might already exist (we have filenames), so we don't require new files
    const isEditMode = !!this.applicationNumber;

    if (!isEditMode) {
      // New submission - mandatory documents required (including KML)
      if (!this.adharPdfFile) {
        this.longToast('कृपया आधार कार्ड PDF अपलोड करें');
        return;
      }
      if (!this.bankPassbookPdfFile) {
        this.longToast('कृपया बैंक पासबुक PDF अपलोड करें');
        return;
      }
      if (!this.b1P1PdfFile) {
        this.longToast('कृपया B1 और P1 PDF अपलोड करें');
        return;
      }
      if (!this.kmlFile) {
        this.longToast('कृपया KML फाइल अपलोड करें');
        return;
      }
    } else {
      // Edit mode - if user is updating mandatory files, backend still expects the full mandatory set
      const isUploadingMandatoryDocs = this.adharPdfFile || this.bankPassbookPdfFile || this.b1P1PdfFile || this.kmlFile;
      const missingAnyMandatoryDoc =
        !this.adharPdfFile || !this.bankPassbookPdfFile || !this.b1P1PdfFile || !this.kmlFile;
      const hasExistingMandatoryDocs =
        !!this.adharFilename && !!this.bankPassbookFilename && !!this.b1P1Filename && !!this.kmlFilename;

      if (isUploadingMandatoryDocs && missingAnyMandatoryDoc) {
        this.longToast('कृपया सभी आवश्यक दस्तावेज (आधार, बैंक पासबुक, B1/P1, KML) एक साथ अपलोड करें');
        return;
      }

      if (!hasExistingMandatoryDocs && missingAnyMandatoryDoc) {
        this.longToast('कृपया सभी आवश्यक दस्तावेज (आधार, बैंक पासबुक, B1/P1, KML) अपलोड करें');
        return;
      }
    }

    // Create FormData with all fields for single API call
    const formData = new FormData();

    // Application Info
    formData.append('awedan_number', this.applicationNumber || '');
    const officerId = this.getOfficerIdFromSession().toString();
    formData.append('userid', officerId);
    formData.append('created_by', officerId);

    // Location Fields (convert to int as expected by backend)
    formData.append('circle_id', this.circleId || '0');
    formData.append('division_id', this.divId || '0');
    formData.append('dist_id', this.selectedDistId || '0');
    formData.append('rang_id', this.rangId || '0');

    // Personal Information
    formData.append('hitgrahi_name', this.hitgrahiName);
    formData.append('father_name', this.fatherName);
    formData.append('cast_category', this.selectedCastCatId);

    // Add PVTG field - only send if cast category 4 is selected
    if (this.selectedCastCatId === '4') {
      const pvtgValue = this.isPvtg === 'true';
      formData.append('is_pvtg', pvtgValue.toString());
    } else {
      formData.append('is_pvtg', 'false'); // Default to false for other cast categories
    }

    formData.append('aadhar_no', this.adhaar);
    formData.append('mobile', this.inputMobileNumber || '1234567890');
    formData.append('address', this.address);

    // Bank Information
    formData.append('bank_name', this.selectedBankName);
    formData.append('ifsc_code', this.ifsc_code);
    formData.append('account_no', this.bank_account_no);

    // Land Information
    formData.append('khasra_no', this.khasra_no || '');
    formData.append('kaksha_kramank', this.kaksha_kramank || '');
    formData.append('halka_no', this.halka_no || '');
    formData.append('village_name', this.village_name);
    formData.append('gram_panchayat_name', this.gram_panchayat_name);
    formData.append('sand_type', this.selected_sand_type);
    formData.append('LandType', this.selectfrarevenue || '');
    formData.append('TotalAcre', (this.total_rakba ?? 0).toString());
    formData.append('PattaNo', this.patta_no || '');
    formData.append('compartment_no', this.compartment_no || '');
    formData.append('available_area', (this.available_area ?? 0).toString());
    formData.append('area', (this.area ?? 0).toString());

    // Plantation Information
    formData.append('plantation_type', this.selectedPlantationType);
    formData.append('sinchit_asinchit', this.sinchitOrA_sinchit);
    formData.append('vrikharopan_akshansh', this.vrikharopan_akshansh || '0.0');
    formData.append('vrikharopan_dikshansh', this.vrikharopan_dikshansh || '0.0');
    formData.append('awedan_status', this.awedan_status || '1');
    formData.append('plantTypeFinal', this.plantTypeFinal);

    // Plants - Send as indexed form fields for ASP.NET Core model binding
    // Format: plants[0].plant_id, plants[0].total_area, etc.
    if (this.selectedPlants && this.selectedPlants.length > 0) {
      this.selectedPlants.forEach((plant, index) => {
        formData.append(`plants[${index}].plant_id`, plant.plant_id.toString());
        formData.append(`plants[${index}].total_area`, plant.total_area.toString());
        formData.append(`plants[${index}].total_tree`, plant.total_tree.toString());
        formData.append(`plants[${index}].total_ropit`, (plant.total_ropit || 0).toString());
        formData.append(`plants[${index}].is_other`, (plant.is_other || false).toString());
      });
    }

    // File Uploads (only append if file exists, backend will handle existing files)
    if (this.adharPdfFile) {
      formData.append('FileAdhar', this.adharPdfFile);
    }
    if (this.bankPassbookPdfFile) {
      formData.append('FileBankPassbook', this.bankPassbookPdfFile);
    }
    if (this.b1P1PdfFile) {
      formData.append('FileB1P1', this.b1P1PdfFile);
    }
    if (this.kmlFile) {
      formData.append('KmlFile', this.kmlFile);
    }

    // Show loading
    this.showLoading('आवेदन जमा हो रहा है...');

    // Single API call to submit everything
    this.apiService.submitCompleteRegistration(formData).subscribe({
      next: async (response: any) => {
        this.dismissLoading();

        if (response && response.response) {
          const responseCode = response.response.code;
          const responseMsg = response.response.msg || '';

          if (responseCode === 200) {
            // Success - show success message
            const successMsg = responseMsg || 'आवेदन सफलतापूर्वक जमा हो गया है';
            this.afterSubmitAwedanSuccessfully(successMsg, true);
          } else {
            // Error - show error message
            let errorMsg = responseMsg || 'आवेदन जमा करने में त्रुटि';

            if (response.response.errors && Array.isArray(response.response.errors)) {
              const additionalErrors = response.response.errors.join('\n');
              errorMsg = errorMsg + '\n\n' + additionalErrors;
            } else if (response.response.error) {
              errorMsg = errorMsg + '\n\n' + response.response.error;
            }

            await this.showErrorDialog(errorMsg);
          }
        } else {
          // Invalid response structure
          await this.showErrorDialog('अमान्य प्रतिक्रिया प्राप्त हुई');
        }
      },
      error: async (error: any) => {
        this.dismissLoading();
        const errorMsg = error?.error?.response?.msg || error?.message || 'आवेदन जमा करने में त्रुटि';
        await this.showErrorDialog(errorMsg);
      }
    });
  }

  //File upload 
  uploadFiles() {
    //debugger;
    if (!this.adharPdfFile || !this.bankPassbookPdfFile || !this.b1P1PdfFile || !this.kmlFile) {
      this.longToast('कृपया सभी आवश्यक दस्तावेज (आधार, बैंक पासबुक, B1/P1, KML) अपलोड करें');
      return;
    }
    // //debugger;

    const formData = new FormData();
    formData.append('FileAdhar', this.adharPdfFile);
    formData.append('FileBankPassbook', this.bankPassbookPdfFile);
    formData.append('FileB1P1', this.b1P1PdfFile);
    formData.append('KmlFile', this.kmlFile);
    formData.append('ApplicationNumber', this.applicationNumber);
    formData.append('UserId', this.getOfficerIdFromSession().toString());

    this.showLoading('फाइलें अपलोड हो रही हैं...');
    this.apiService.uploadApplicationDocuments(formData).subscribe(
      (response) => {
        debugger
        this.dismissLoading();
        if (response.response.code === 200) {
          this.longToast('फाइलें सफलतापूर्वक अपलोड हो गईं');
        } else {
          this.longToast(response.response.msg);
        }
      },
      (error) => {
        this.dismissLoading();
        this.longToast('फाइल अपलोड में त्रुटि: ' + (error.error?.response?.msg || error.message));
      }
    );
  }

  // Internal file upload method called after plant upload
  uploadFilesInternal() {
    // Note: This method is used internally and may handle cases where files already exist
    // For new submissions, validation is handled in submitFormData()
    // For edit mode, files might already exist, so we allow empty strings

    const formData = new FormData();
    formData.append('FileAdhar', this.adharPdfFile || '');
    formData.append('FileBankPassbook', this.bankPassbookPdfFile || '');
    formData.append('FileB1P1', this.b1P1PdfFile || '');
    formData.append('KmlFile', this.kmlFile || '');
    formData.append('ApplicationNumber', this.applicationNumber);
    formData.append('UserId', this.getOfficerIdFromSession().toString());

    this.apiService.uploadApplicationDocuments(formData).subscribe(
      async (response: any) => {
        // Check response structure
        debugger
        console.log('response :', response);
        if (response.response.code === 500) {
          // Mark file upload as failed with error
          this.progressData.fileUploaded = true;
          this.progressData.fileUploadError = true;
          this.progressData.fileUploadErrorMessage = response.response.msg || 'फाइल अपलोड असफल';
          await this.updateProgressLoader();

          setTimeout(async () => {
            await this.dismissProgressLoader();
            await this.showErrorDialog(response.response.msg || 'सर्वर त्रुटि: फाइल अपलोड में समस्या हुई');
          }, 2000);
          return;
        }
        if (response.response.code === 404) {
          // Mark file upload as failed with error
          this.progressData.fileUploaded = true;
          this.progressData.fileUploadError = true;
          this.progressData.fileUploadErrorMessage = response.response.msg || 'फाइल अपलोड असफल';
          await this.updateProgressLoader();

          setTimeout(async () => {
            await this.dismissProgressLoader();
            await this.showErrorDialog(response.response.msg || 'आवेदन नहीं मिला');
          }, 2000);
          return;
        }
        if (response.response.code === 100) {
          // Mark file upload as failed with error
          this.progressData.fileUploaded = true;
          this.progressData.fileUploadError = true;

          // Get all server messages
          let errorMsg = response.response.msg || 'फाइल अपलोड असफल';

          // If response has additional error details, append them
          if (response.response.errors && Array.isArray(response.response.errors)) {
            const additionalErrors = response.response.errors.join('\n');
            errorMsg = errorMsg + '\n\n' + additionalErrors;
          } else if (response.response.error) {
            errorMsg = errorMsg + '\n\n' + response.response.error;
          }

          this.progressData.fileUploadErrorMessage = errorMsg;
          await this.updateProgressLoader();

          setTimeout(async () => {
            await this.dismissProgressLoader();
            await this.showErrorDialog(errorMsg);
          }, 2000);
          return;
        }
        if (response && response.response) {
          const responseCode = response.response.code;
          const responseMsg = response.response.msg || '';

          // Mark file upload as complete (regardless of success/failure)
          this.progressData.fileUploaded = true;
          await this.updateProgressLoader();

          if (responseCode === 200) {
            // Wait a bit to show success message, then dismiss
            setTimeout(async () => {
              await this.dismissProgressLoader();
              const successMsg = responseMsg || 'आवेदन सफलतापूर्वक जमा हो गया है';
              this.afterSubmitAwedanSuccessfully(successMsg, true);
            }, 2000);
          } else {
            // Other errors
            this.progressData.fileUploadError = true;
            this.progressData.fileUploadErrorMessage = responseMsg || 'फाइल अपलोड में त्रुटि';
            await this.updateProgressLoader();

            setTimeout(async () => {
              await this.dismissProgressLoader();
              const errorMsg = responseMsg || 'फाइल अपलोड में त्रुटि';
              this.longToast(errorMsg);
              this.afterSubmitAwedanSuccessfully('आवेदन जमा हो गया है (फाइल अपलोड में त्रुटि)', true);
            }, 2000);
          }
        } else {
          // Invalid response structure
          this.progressData.fileUploaded = true;
          this.progressData.fileUploadError = true;
          this.progressData.fileUploadErrorMessage = 'अमान्य प्रतिक्रिया प्राप्त हुई';
          await this.updateProgressLoader();

          setTimeout(async () => {
            await this.dismissProgressLoader();
            this.longToast('अमान्य प्रतिक्रिया प्राप्त हुई');
            this.afterSubmitAwedanSuccessfully('आवेदन जमा हो गया है (फाइल अपलोड में त्रुटि)', true);
          }, 2000);
        }
      },
      async (error: any) => {
        // Network/HTTP error
        this.progressData.fileUploaded = true;
        this.progressData.fileUploadError = true;
        const errorMsg = error?.error?.response?.msg || error?.message || 'फाइल अपलोड में त्रुटि';
        this.progressData.fileUploadErrorMessage = errorMsg;
        await this.updateProgressLoader();

        setTimeout(async () => {
          await this.dismissProgressLoader();
          await this.showErrorDialog(errorMsg);
        }, 2000);
      }
    );
  }
  //File upload

  async afterSubmitAwedanSuccessfully(msg: string, isGoBack: boolean) {
    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: false,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed && isGoBack) {
        this.goBack();
      }
    });

    await modal.present();
  }

  async doYouWantToCancelDialog() {
    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप वास्तव में समाप्त करना चाहते हैं?',
        isYesNo: true,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.goBack();
      }
    });

    await modal.present();
  }

  // async doYouWantToCancelDialog() {
  //   const modal = await this.modalCtrl.create({
  //     component: MessageDialogComponent,
  //     cssClass: 'custom-dialog-modal',
  //     componentProps: {
  //       server_message: 'क्या आप वास्तव में समाप्त करना चाहते हैं?',
  //       isYesNo: true,
  //     },
  //     backdropDismiss: false,
  //   });

  //   modal.onDidDismiss().then((result) => {
  //     if (result.data?.confirmed) {
  //       this.goBack();
  //     }
  //   });

  //   await modal.present();
  // }

  // ========== ANYA PLANT METHODS ==========
  getSpeciesMaster() {
    this.apiService.getSpeciesMaster().subscribe({
      next: (response: any) => {
        if (response.response.code === 200) {
          this.listOfSpeciesMaster = response.data.map((item: any) => ({
            id: item.id,
            speciesName: item.speciesName,
            isActive: item.isActive
          }));
        }
      },
      error: (err) => {
        console.error('Error loading species:', err);
      }
    });
  }

  // Load Plant Master for dynamic dropdown
  loadPlantMaster() {
    if (this.isPlantMasterLoading) {
      console.log('🌱 Plant master is already loading, skipping...');
      return;
    }

    console.log('🌱 Loading plant master...');
    this.isPlantMasterLoading = true;

    this.apiService.getPlantMaster().subscribe({
      next: (response: any) => {
        console.log('🌱 Plant master response:', response);
        console.log('🌱 Plant master full response:', JSON.stringify(response, null, 2));

        // Check multiple possible response structures
        let plantData = null;

        if (response?.response?.code === 200 && response?.data) {
          // Standard structure: { response: { code: 200 }, data: [...] }
          plantData = response.data;
          console.log('✅ Found plants in response.data:', plantData);
        } else if (response?.data && Array.isArray(response.data)) {
          // Alternative: { data: [...] }
          plantData = response.data;
          console.log('✅ Found plants in response.data (alternative):', plantData);
        } else if (Array.isArray(response)) {
          // Direct array response
          plantData = response;
          console.log('✅ Found plants as direct array:', plantData);
        } else if (response?.response?.code === 200 && Array.isArray(response?.response?.data)) {
          // Nested in response.response.data
          plantData = response.response.data;
          console.log('✅ Found plants in response.response.data:', plantData);
        } else {
          console.error('❌ Unable to parse plant data. Response structure:', response);
          console.error('Response keys:', Object.keys(response || {}));
          this.longToast('पौधों की सूची का प्रारूप अमान्य है');
          return;
        }

        if (plantData && Array.isArray(plantData) && plantData.length > 0) {
          this.listOfPlants = plantData.map((item: any) => ({
            id: item.id || item.plant_id,
            plantName: item.plantName || item.plant_name || item.name,
            treesPerAcre: item.treesPerAcre || item.trees_per_acre || '0',
            isActive: item.isActive !== undefined ? item.isActive : (item.id_active !== undefined ? item.id_active : 1)
          }));
          console.log('✅ Loaded plants successfully. Count:', this.listOfPlants.length);
          console.log('✅ Plants list:', this.listOfPlants);
          this.isPlantMasterLoading = false;
          this.cdRef.detectChanges();
        } else {
          console.warn('⚠️ Plant data is empty or not an array:', plantData);
          this.isPlantMasterLoading = false;
          this.longToast('पौधों की सूची खाली है');
        }
      },
      error: (err: any) => {
        console.error('❌ Error loading plant master:', err);
        console.error('Error details:', {
          message: err?.message,
          error: err?.error,
          status: err?.status,
          statusText: err?.statusText
        });
        this.isPlantMasterLoading = false;
        this.longToast('पौधों की सूची लोड करने में त्रुटि: ' + (err?.message || 'अज्ञात त्रुटि'));
      }
    });
  }

  loadAnyaPlants() {
    this.apiService.getAnyaPlantsByAppNumber(this.applicationNumber).subscribe({
      next: (response: any) => {
        if (response.response.code === 200 && response.data) {
          this.listOfAnyaPlants = response.data.map((item: any) => ({
            id: item.id,
            speciesId: item.speciesId,
            speciesName: item.speciesName,
            totalArea: item.totalArea,
            totalTree: item.totalTree,
            ropitCount: item.ropitCount
          }));
        }
      },
      error: (err) => {
        console.error('Error loading anya plants:', err);
      }
    });
  }

  addAnyaPlant() {
    const newPlant: AnyaPlantRequest = {
      speciesId: 0,
      speciesName: '',
      totalArea: 0,
      totalTree: 0,
      ropitCount: 0
    };
    this.listOfAnyaPlants.push(newPlant);
  }

  deleteAnyaPlant(index: number) {
    this.listOfAnyaPlants.splice(index, 1);
  }

  addNewSpecies() {
    if (!this.newSpeciesName || this.newSpeciesName.trim() === '') {
      this.longToast('कृपया प्रजाति का नाम दर्ज करें');
      return;
    }

    const payload: AddSpeciesMasterRequest = {
      speciesName: this.newSpeciesName.trim(),
      userId: this.getOfficerIdFromSession()
    };

    this.apiService.addSpeciesMaster(payload).subscribe({
      next: (response: any) => {
        if (response.response.code === 200) {
          this.longToast('प्रजाति सफलतापूर्वक जोड़ी गई');
          this.showAddSpeciesModal = false;
          this.newSpeciesName = '';
          this.getSpeciesMaster(); // Refresh list
        } else {
          this.longToast(response.response.msg);
        }
      },
      error: (err) => {
        this.longToast('त्रुटि: प्रजाति जोड़ने में समस्या');
      }
    });
  }

  onSpeciesSelect(index: number) {
    const selectedSpecies = this.listOfSpeciesMaster.find(
      s => s.id === this.listOfAnyaPlants[index].speciesId
    );
    if (selectedSpecies) {
      this.listOfAnyaPlants[index].speciesName = selectedSpecies.speciesName;
    }
    this.cdRef.detectChanges();
  }

  submitAnyaPlants() {
    if (this.listOfAnyaPlants.length === 0) {
      return;
    }

    const payload = {
      applicationNumber: this.applicationNumber,
      userId: this.getOfficerIdFromSession(),
      plants: this.listOfAnyaPlants.map(plant => ({
        speciesId: plant.speciesId,
        speciesName: plant.speciesName,
        totalArea: plant.totalArea,
        totalTree: plant.totalTree,
        ropitCount: plant.ropitCount
      }))
    };

    this.showLoading('अन्य पौधों की जानकारी जमा हो रही है...');
    this.apiService.submitAnyaPlants(payload).subscribe({
      next: (response: any) => {
        this.dismissLoading();
        if (response.response.code === 200) {
          this.longToast(response.response.msg);
        } else {
          this.longToast(response.response.msg);
        }
      },
      error: (err) => {
        this.dismissLoading();
        console.error('Error submitting anya plants:', err);
        this.longToast('अन्य पौधे जमा करने में त्रुटि');
      }
    });
  }

  // ========== NEW DYNAMIC PLANT SYSTEM METHODS ==========
  // Add new plant to selectedPlants array
  addNewPlant() {
    console.log('➕ Adding new plant, current count:', this.selectedPlants.length);
    console.log('Available plants:', this.listOfPlants.length);
    console.log('Is plant master loading:', this.isPlantMasterLoading);

    // If plants list is empty, try to reload it
    if (this.listOfPlants.length === 0) {
      if (this.isPlantMasterLoading) {
        this.longToast('कृपया पौधों की सूची लोड होने की प्रतीक्षा करें...');
        return;
      } else {
        // Try reloading the plant master
        console.log('🔄 Plants list is empty, attempting to reload...');
        this.longToast('पौधों की सूची लोड हो रही है...');
        this.loadPlantMaster();

        // Wait a moment and then check again (user can try again)
        setTimeout(() => {
          if (this.listOfPlants.length === 0) {
            this.longToast('पौधों की सूची लोड नहीं हो सकी। कृपया पृष्ठ को रिफ्रेश करें।');
          }
        }, 2000);
        return;
      }
    }

    // Add new plant entry
    this.selectedPlants.push({
      plant_id: 0,
      plant_name: '',
      total_area: 0,
      total_tree: 0,
      total_ropit: 0,
      is_other: false
    });
    console.log('✅ Added plant, new count:', this.selectedPlants.length);
    this.cdRef.detectChanges();
  }

  // Delete plant from selectedPlants array
  deleteNewPlant(index: number) {
    if (index >= 0 && index < this.selectedPlants.length) {
      this.selectedPlants.splice(index, 1);
      this.cdRef.detectChanges();
    }
  }

  // When plant is selected from dropdown, update plant_name and recalculate trees
  onPlantSelect(index: number) {
    const selectedPlant = this.listOfPlants.find(p => p.id === this.selectedPlants[index].plant_id);
    if (selectedPlant) {
      this.selectedPlants[index].plant_name = selectedPlant.plantName;
      // Recalculate trees when plant is selected (if area is already set)
      if (this.selectedPlants[index].total_area > 0) {
        this.onPlantAreaChange(index);
      }
    }
    this.cdRef.detectChanges();
  }

  // When area changes, calculate total_tree based on treesPerAcre
  onPlantAreaChange(index: number) {
    const plant = this.selectedPlants[index];
    const masterPlant = this.listOfPlants.find(p => p.id === plant.plant_id);

    if (masterPlant && plant.total_area > 0) {
      const treesPerAcre = parseInt(masterPlant.treesPerAcre) || 0;
      const calculatedTrees = Math.round(plant.total_area * treesPerAcre);
      plant.total_tree = calculatedTrees;

      // Validate total area doesn't exceed available_area
      if (!this.validateTotalArea()) {
        // If area exceeds available, reset this plant's area
        const availableArea = this.getAvailableAreaAsNumber();
        const otherPlantsArea = this.selectedPlants
          .filter((p, idx) => idx !== index)
          .reduce((sum, p) => sum + (p.total_area || 0), 0);
        const maxAllowedForThisPlant = Math.max(0, availableArea - otherPlantsArea);

        if (plant.total_area > maxAllowedForThisPlant) {
          plant.total_area = maxAllowedForThisPlant;
          if (maxAllowedForThisPlant > 0) {
            plant.total_tree = Math.round(maxAllowedForThisPlant * treesPerAcre);
          } else {
            plant.total_tree = 0;
          }
        }
      }
    } else {
      plant.total_tree = 0;
    }

    this.cdRef.detectChanges();
  }

  // When trees are manually entered, validate against max allowed
  onPlantTreeChange(index: number) {
    const plant = this.selectedPlants[index];
    const masterPlant = this.listOfPlants.find(p => p.id === plant.plant_id);

    if (masterPlant && plant.total_area > 0) {
      const treesPerAcre = parseInt(masterPlant.treesPerAcre) || 0;
      const maxTrees = plant.total_area * treesPerAcre;

      if (plant.total_tree > maxTrees) {
        this.longToast(`⚠️ पौधों की अधिकतम संख्या ${maxTrees} हो सकती है (${plant.total_area} एकड़ × ${treesPerAcre})`);
        plant.total_tree = maxTrees;
        this.cdRef.detectChanges();
      }
    }
  }

  // Validate total area of all plants doesn't exceed available_area
  validateTotalArea(): boolean {
    const totalAreaUsed = this.getTotalAreaUsed();
    const availableArea = this.getAvailableAreaAsNumber();

    if (availableArea > 0 && totalAreaUsed > availableArea) {
      this.longToast(`⚠️ कुल रकबा (${totalAreaUsed.toFixed(2)}) उपलब्ध रकबा (${availableArea}) से अधिक नहीं हो सकता`);
      return false;
    }

    return true;
  }

  // Get treesPerAcre for a plant
  getTreesPerAcre(plantId: number): number {
    const plant = this.listOfPlants.find(p => p.id === plantId);
    return plant ? (parseInt(plant.treesPerAcre) || 0) : 0;
  }

  // Get max trees allowed for a plant entry
  getMaxTreesForPlant(index: number): number {
    const plant = this.selectedPlants[index];
    if (!plant || !plant.plant_id || !plant.total_area) return 0;

    const treesPerAcre = this.getTreesPerAcre(plant.plant_id);
    return plant.total_area * treesPerAcre;
  }

  // Submit plant requests to plant_request_new table
  submitPlantRequests() {
    if (!this.applicationNumber || this.selectedPlants.length === 0) {
      return; // No plants to submit or no application number
    }

    // Validate total area doesn't exceed available_area
    if (!this.validateTotalArea()) {
      return;
    }

    // Validate that all required fields are filled and trees don't exceed max
    for (let i = 0; i < this.selectedPlants.length; i++) {
      const plant = this.selectedPlants[i];

      if (!plant.plant_id || plant.total_area <= 0 || plant.total_tree <= 0) {
        this.longToast(`कृपया पौधा #${i + 1} की सभी जानकारी भरें`);
        return;
      }

      const maxTrees = this.getMaxTreesForPlant(i);
      if (plant.total_tree > maxTrees) {
        this.longToast(`⚠️ पौधा #${i + 1}: पौधों की संख्या ${maxTrees} से अधिक नहीं हो सकती`);
        return;
      }
    }

    const payload = {
      application_number: this.applicationNumber,
      userid: this.getOfficerIdFromSession().toString(),
      plants: this.selectedPlants.map(plant => ({
        plant_id: plant.plant_id,
        total_area: plant.total_area,
        total_tree: plant.total_tree,
        total_ropit: plant.total_ropit,
        is_other: plant.is_other
      }))
    };

    this.apiService.submitPlantRequests(payload).subscribe({
      next: (response: any) => {
        if (response?.response?.code === 200) {
          // Success - already shown in main form submission
          // console.log('Plants saved successfully');
        } else {
          this.longToast(response?.response?.msg || 'पौधों की जानकारी सहेजने में त्रुटि');
        }
      },
      error: (err) => {
        console.error('Error submitting plant requests:', err);
        this.longToast('पौधों की जानकारी सहेजने में त्रुटि');
      }
    });
  }

  // Load existing plants from plant_request_new table for edit mode
  loadExistingPlants(applicationNumber: string) {
    if (!applicationNumber) {
      console.warn('⚠️ Cannot load existing plants: application number is missing');
      return;
    }

    // console.log('🔍 Loading existing plants for:', applicationNumber);

    this.apiService.getPlantRequestsByAppNumber(applicationNumber).subscribe({
      next: (response: any) => {
        // console.log('🔍 Existing plants response:', response);

        if (response?.response?.code === 200 && response?.data && Array.isArray(response.data)) {
          this.selectedPlants = response.data.map((item: any) => {
            const plantName = item.plantName || this.getPlantNameById(item.plant_id) || '';
            // console.log(`✅ Loading plant: ${plantName} (ID: ${item.plant_id})`);
            return {
              plant_id: item.plant_id,
              plant_name: plantName,
              total_area: item.total_area || 0,
              total_tree: typeof item.total_tree === 'number' ? item.total_tree : (parseFloat(item.total_tree) || 0),
              total_ropit: item.total_ropit || 0,
              is_other: item.is_other === true || item.is_other === 1 || false
            };
          });

          // console.log(`✅ Loaded ${this.selectedPlants.length} existing plants`);
          // Populate legacy modal table from plant_request_new so UI shows backend data
          this.rebuildLegacyFromSelectedPlants();
          this.updatePlantationTotals();
          this.cdRef.detectChanges();
        } else {
          console.log('⚠️ No existing plants found or invalid response structure');
          // Not an error - just no existing plants
        }
      },
      error: (err: any) => {
        console.error('❌ Error loading existing plants:', err);
        // Don't show error toast - it's okay if there are no existing plants
      }
    });
  }

  // Helper method to get plant name by ID
  getPlantNameById(plantId: number): string {
    const plant = this.listOfPlants.find(p => p.id === plantId);
    return plant ? plant.plantName : '';
  }

  // Build legacy modal rows from dynamic selectedPlants (plant_request_new)
  private rebuildLegacyFromSelectedPlants() {
    if (!this.selectedPlants || this.selectedPlants.length === 0) {
      return;
    }
    const rows: PlantationDetailNew[] = [];
    for (const p of this.selectedPlants) {
      const name = p.plant_name || this.getPlantNameById(p.plant_id) || '';
      const totalArea = Number(p.total_area) || 0;
      const totalTree = Number(p.total_tree) || 0;
      if (totalArea <= 0 && totalTree <= 0) continue;
      rows.push({
        prajatiName: name,
        // Put totals under <5 bucket to display in existing grid
        plant_count_less_5: totalTree.toString(),
        area_size_less_5: totalArea.toString(),
        plant_count_more_5: '0',
        area_size_more_5: '0',
      });
    }
    if (rows.length > 0) {
      this.listOfPlantationDetailsNew = rows;
    }
  }
  // Map legacy modal rows to new API plant_request_new payload
  private mapLegacyPlantsToNewPayload(): Array<{ plant_id: number; total_area: number; total_tree: number; total_ropit: number; is_other: boolean }> {
    const result: Array<{ plant_id: number; total_area: number; total_tree: number; total_ropit: number; is_other: boolean }> = [];
    if (!this.listOfPlantationDetailsNew || this.listOfPlantationDetailsNew.length === 0) {
      return result;
    }

    for (const item of this.listOfPlantationDetailsNew) {
      const totalArea = (Number(item.area_size_less_5) || 0) + (Number(item.area_size_more_5) || 0);
      const totalTree = (Number(item.plant_count_less_5) || 0) + (Number(item.plant_count_more_5) || 0);
      if (totalArea <= 0 || totalTree <= 0) {
        continue;
      }

      // Try to resolve plant id by name against Plant Master
      let matched = this.listOfPlants.find(p => (p.plantName || '').trim() === (item.prajatiName || '').trim());
      // Fallback mappings for common aliases
      if (!matched) {
        const alias = (item.prajatiName || '').trim();
        const mapAliases: Record<string, string> = {
          'सामान्य सागौन': 'साधारण सागौन',
          'साधारण सागौन': 'साधारण सागौन',
          'सामान्य बांस': 'साधारण बांस',
          'साधारण बांस': 'साधारण बांस',
          'टिश्यू कल्चर सागौन': 'टिश्यू कल्चर सागौन',
          'टिश्यू कल्चर बांस': 'टिश्यू कल्चर बांस',
          'क्लोनल नीलगिरी': 'क्लोनल नीलगिरी',
          'मिलिया डुबिया': 'मिलिया डुबिया',
          'चंदन': 'चंदन पौधा',
          'चंदन पौधा': 'चंदन पौधा'
        };
        const targetName = mapAliases[alias];
        if (targetName) {
          matched = this.listOfPlants.find(p => (p.plantName || '').trim() === targetName);
        }
        // Generic 'अन्य' handling: pick the first plant with name starting with 'अन्य'
        if (!matched && /अन्य/.test(alias)) {
          matched = this.listOfPlants.find(p => ((p.plantName || '')).trim().startsWith('अन्य'));
        }
      }

      const plantId = matched ? Number(matched.id) : 0;
      const isOther = !matched;

      result.push({
        plant_id: plantId,
        total_area: totalArea,
        total_tree: totalTree,
        total_ropit: 0,
        is_other: isOther
      });
    }

    return result;
  }

  // Persist legacy modal plants immediately to plant_request_new
  private saveLegacyPlantsToBackend() {
    if (!this.applicationNumber) return;
    const plants = this.mapLegacyPlantsToNewPayload();
    if (plants.length === 0) return;
    const payload = {
      application_number: this.applicationNumber,
      userid: this.getOfficerIdFromSession().toString(),
      plants
    };
    this.apiService.submitPlantRequests(payload).subscribe({
      next: (res: any) => {
        // Optionally notify success
      },
      error: () => {
        this.longToast('पौधों की जानकारी सहेजने में त्रुटि');
      }
    });
  }

  // Get total area used by all selected plants
  getTotalAreaUsed(): number {
    return this.selectedPlants.reduce((sum, p) => sum + (p.total_area || 0), 0);
  }
  //get total tree count
  getTotalTree(): number {
    return this.selectedPlants.reduce((sum, p) => sum + (p.total_tree || 0), 0);
  }

  // Helper to get available_area as number
  getAvailableAreaAsNumber(): number {
    return this.available_area ? parseFloat(this.available_area.toString()) : 0;
  }

  // Get remaining area after all plants are added
  getRemainingArea(): number {
    const availableArea = this.getAvailableAreaAsNumber();
    const totalAreaUsed = this.getTotalAreaUsed();
    const remaining = availableArea - totalAreaUsed;
    return remaining >= 0 ? parseFloat(remaining.toFixed(2)) : 0;
  }
}




