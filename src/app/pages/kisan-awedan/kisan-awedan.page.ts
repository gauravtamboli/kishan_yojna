import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiService } from 'src/app/services/api.service';
import { MastersModelClass } from 'src/app/services/response_classes/GetMastsersResponseModel';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { Toast } from '@capacitor/toast';
import { OTPDialogComponent } from 'src/app/otpdialog/otpdialog.component';


// Interface matching the backend model exactly
interface SubmitKisanAwedanRequestModel {
  isMale: number;
  district_id: number;
  division_id: number;
  range_id: number;
  hitgrahi_name: string;
  father_husband_name: string;
  caste: number;
  village_city: string;
  gram_panchayat: string;
  address: string;
  area: string;
  available_area: string;
  mobile_no: number;
  plat_type: string;
  other_plant: string;
  approved: boolean;
  adharFilename: string | null;
  bankPassbookFilename: string | null;
  b1P1Filename: string | null;
  adhaar: string;
  halka_no: string;
  land_village: string;
  land_gram_panchayat: string;
  sinchitOrA_sinchit: string;
  selectedYesNoForKakshaKramank: string;
  kaksha_kramank: string;
  selectfrarevenue: string;
  compartment_no: string;
  patta_no: string;
  khasra_no: string;
  bank_name: string;
  ifsc_code: string;
  account_no: string;
}

// Form data interface for the UI
interface KisanAwedanFormData {
  gram_panchayat_name: any;
  khasra_no: any;
  patta_no: any;
  compartment_no: any;
  kaksha_kramank: any;
  selectfrarevenue: any;
  selectedYesNoForKakshaKramank: any;
  sinchitOrA_sinchit: any;
  village_name: any;
  halka_no: any;
  isMale: boolean | null;
  available_area: string;
  district_id: string;
  division_id: string;
  range_id: string;
  hitgrahi_name: string;
  father_husband_name: string;
  caste: string;
  village_city: string;
  gram_panchayat: string;
  address: string;
  area: string;
  mobile_no: string;
  plat_type: string;
  other_plant: string;
  bank_name: string;
  ifsc_code: string;
  account_no: string;
}

@Component({
  selector: 'app-kisan-awedan',
  templateUrl: './kisan-awaden.page.html',
  styleUrls: ['./kisan-awedan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})


export class KisanAwedanPage implements OnInit {


  alrtedy_worked : number = 0; // 0 for not worked, 1 for worked
  selectedBankCode: any;
  listOfBank: readonly any[] | null | undefined;
  ifsc_code: any;
  bank_account_no: any;
  listOfIfsc: readonly any[] | null | undefined;

  async downloadB1P1Pdf() {
    if (!this.b1P1Filename) {
      this.showToast('No file available to download');
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
        this.showToast('Error downloading file');
        console.error('Error downloading PDF:', err);
      }
    });
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
      this.showToast('B1 और P1 PDF फाइल का आकार 2MB से अधिक नहीं होना चाहिए');
      event.target.value = ''; // Clear the input
      this.b1P1PdfFile = null;
      return;
    }

    // Validate file type (PDF)
    if (file.type !== 'application/pdf') {
      this.showToast('कृपया केवल PDF फाइल अपलोड करें');
      event.target.value = '';
      this.b1P1PdfFile = null;
      return;
    }

    this.b1P1PdfFile = file;
  }


  async downloadBankPassbookPdf() {
    if (!this.bankPassbookFilename) {
      this.showToast('No file available to download');
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
        this.showToast('Error downloading file');
        console.error('Error downloading PDF:', err);
      }
    });
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
      this.showToast('बैंक पासबुक PDF फाइल का आकार 2MB से अधिक नहीं होना चाहिए');
      event.target.value = ''; // Clear the input
      this.bankPassbookPdfFile = null;
      return;
    }

    // Validate file type (PDF)
    if (file.type !== 'application/pdf') {
      this.showToast('कृपया केवल PDF फाइल अपलोड करें');
      event.target.value = '';
      this.bankPassbookPdfFile = null;
      return;
    }

    this.bankPassbookPdfFile = file;
  }

  async downloadAdharPdf() {
    if (!this.adharFilename) {
      this.showToast('No file available to download');
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
        this.showToast('Error downloading file');
        console.error('Error downloading PDF:', err);
      }
    });
  }


  adharFilename: string | null = null;
  bankPassbookFilename: string | null = null;
  b1P1Filename: string | null = null;
  adharPdfFile: File | null = null;
  bankPassbookPdfFile: File | null = null;
  b1P1PdfFile: File | null = null;

  onAdharPdfFileSelect(event: any) {
    const file = event.target.files[0];
    if (!file) {
      this.adharPdfFile = null;
      return;
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      this.showToast('आधार कार्ड PDF फाइल का आकार 2MB से अधिक नहीं होना चाहिए');
      event.target.value = ''; // Clear the input
      this.adharPdfFile = null;
      return;
    }

    // Validate file type (PDF)
    if (file.type !== 'application/pdf') {
      this.showToast('कृपया केवल PDF फाइल अपलोड करें');
      event.target.value = '';
      this.adharPdfFile = null;
      return;
    }

    this.adharPdfFile = file;
  }






  plantTypeFinalNames: string = '';
  plantTypeFinal: any;
  adhaar: string = '';

  listOfPlantTypes: MastersModelClass[] = [];

  getPlantTypes() {
    this.apiService.getPlantMaster().subscribe((response) => {
      let res = typeof response === 'string' ? JSON.parse(response) : response;

      if (res && res.response && res.response.code === 200) {
        const dataArray = res.data ? res.data : [];
        this.listOfPlantTypes = dataArray.map((item: any) => ({
          ...item,
          id: item.id?.toString(),
          name: item.plantName || item.name
        }));
        console.log('Loaded plant types:', this.listOfPlantTypes);
      } else {
        console.error('Backend returned an error or non-200 code:', res?.response);
        alert('Backend Error: ' + (res?.response?.msg || 'Failed to load plants'));
      }
      this.cdRef.detectChanges(); // Explicitly tell Angular to update the UI
    }, (error) => {
      console.error('Failed to load planted types HTTP error:', error);
    });
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
  isLoading: boolean = false;
  loadingMessage: string = 'कृपया प्रतीक्षा करें...';
  termsAccepted: boolean = false;

  isOTPVerified: boolean = false;
  inputMobileNumber: string = '';
  sendedOTP: string = '';
  sendedRegId: string = '';
  isOtpCameFromServer: boolean = false;

  formData: KisanAwedanFormData = {
    district_id: '',
    isMale: null,
    division_id: '',
    range_id: '',
    hitgrahi_name: '',
    father_husband_name: '',
    caste: '',
    village_city: '',
    gram_panchayat: '',
    address: '',
    area: '',
    mobile_no: '',
    plat_type: '',
    other_plant: '',
    available_area: '',
    halka_no: '',
    village_name: '',
    sinchitOrA_sinchit: '',
    selectedYesNoForKakshaKramank: '',
    selectfrarevenue: '',
    compartment_no: '',
    patta_no: '',
    khasra_no: '',
    gram_panchayat_name: '',
    kaksha_kramank: '',
    bank_name: '',
    ifsc_code: '',
    account_no: ''
  };

  listOfDist: MastersModelClass[] = [];
  listOfDivision: MastersModelClass[] = [];
  listOfRang: MastersModelClass[] = [];

  listOfCastCategory = [
    { id: '1', name: 'सामान्य' },
    { id: '2', name: 'अन्य पिछड़ा वर्ग' },
    { id: '3', name: 'अनुसूचित जाति' },
    { id: '4', name: 'अनुसूचित जन जाति' },
  ];

  // pes = [
  //     { id: '1', name: 'क्लोनल नीलगिरी' },
  //     { id: '2', name: 'टिश्यू कल्चर सागौन' },
  //     { id: '3', name: 'टिश्यू कल्चर बांस' },
  //     { id: '4', name: 'साधारण बांस' },
  //     { id: '5', name: 'साधारण सागौन' },
  //     { id: '6', name: 'मिलिया डुबिया' },
  //     { id: '7', name: 'चंदन पौधा' },
  //     { id: '8', name: 'अन्य' },
  //   ];

  selectedPlantType: string[] = [];

  halka_no: string = '';
  village_name: string = '';
  sinchitOrA_sinchit: string = '';
  selectedYesNoForKakshaKramank: string = '';
  kaksha_kramank: string = '';
  selectfrarevenue: string = '';
  compartment_no: string = '';
  patta_no: string = '';
  khasra_no: string = '';
  gram_panchayat_name: string = '';



  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) { }
  // Add OTP verification methods (copied from registration page)
  getOTP() {
    if (
      !this.inputMobileNumber ||
      this.inputMobileNumber.toString().length !== 10
    ) {
      this.showError("सही मोबाइल नंबर दर्ज करें");
      this.showToast('सही मोबाइल नंबर दर्ज करें');
    } else {
      this.showLoading('ओटीपी प्राप्त हो रहा है कृपया प्रतीक्षा करें.....');

      // Sync mobile number to form data
      this.formData.mobile_no = this.inputMobileNumber;

      this.apiService.getOTP(this.inputMobileNumber).subscribe(
        (response) => {
          this.dismissLoading();

          if (response.response.code === 200) {
            this.sendedOTP = response.data.otp;
            this.sendedRegId = response.data.registeration_id;
            this.isOtpCameFromServer = true;

            this.presentOTPDialog();
          } else {
            this.showError(response.response.msg);
          }
        },
        (error) => {
          this.showToast(error);
          this.dismissLoading();
        }
      );
    }
  }


  isFormReadyForSubmission(): boolean {
    return (
      this.termsAccepted &&
      !!this.formData.district_id &&
      !!this.formData.division_id &&
      !!this.formData.range_id &&
      !!this.formData.hitgrahi_name &&
      !!this.formData.village_city &&
      !!this.formData.gram_panchayat &&
      !!this.formData.address &&
      !!this.formData.area &&
      !!this.formData.available_area &&
      !!this.formData.mobile_no &&
      !!this.selectedPlantType &&
      this.selectedPlantType.length > 0 &&
      !!this.formData.caste
    );
  }
  async presentOTPDialog() {
    const modal = await this.modalCtrl.create({
      component: OTPDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        sendedRegId: this.sendedRegId,
        inputMobileNumber: this.inputMobileNumber,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.isOTPVerified = true;
        this.loadMasterData(); // Load data after OTP verification
        this.cdRef.detectChanges();
      } else {
        this.showToast('OTP सत्यापित नहीं किया गया');
      }
    });

    await modal.present();
  }



  ngOnInit() {
    // this.loadMasterData();
    this.getPlantTypes();
  }




  loadMasterData() {
    this.showLoading('डेटा लोड हो रहा है...');

    // Load all districts after OTP verification
    this.apiService.getAllDistricts().subscribe(
      (response) => {
        this.dismissLoading();

        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }

        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.listOfDist = parsedResponse.data || [];
        } else {
          this.showToast(parsedResponse.response?.msg || 'डेटा लोड करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        this.showToast('डेटा लोड करने में त्रुटि');
      }
    );

    // Load banks using the updated API
    this.apiService.getBankList().subscribe(
      (response: any) => {
        const banks = response || [];
        this.listOfBank = banks.map((b: any) => ({
          ...b,
          // Support cases where properties might be PascalCase or camelCase depending on serialization
          displayLabel: (b.bank_Name_Hi || b.Bank_Name_Hi || b.bank_name_hi || '') + ' / ' + (b.bank_Name_En || b.Bank_Name_En || b.bank_name_en || ''),
          bankCode: b.bankCode || b.BankCode
        }));
      },
      (error) => {
        console.error('Error fetching banks:', error);
      }
    );
  }


  onBankChange(event: any) {
    this.ifsc_code = null;
    this.listOfIfsc = [];

    // Support typical casing scenarios from .NET backends
    const bankCode = event?.bankCode || event?.BankCode;
    this.selectedBankCode = bankCode;

    if (!bankCode) return;

    this.showLoading('IFSC लिस्ट लोड हो रहा है...');
    this.apiService.getIfscByBank(bankCode).subscribe(
      (response: any[]) => {
        this.dismissLoading();
        const rawList = response || [];
        this.listOfIfsc = rawList.map(item => ({
          ...item,
          // Normalize property cases from C# to TS for binding
          ifsc: item.iFSC || item.IFSC || item.ifsc,
          branchName: item.branchName || item.BranchName
        }));
      },
      (error) => {
        this.dismissLoading();
        this.showToast('IFSC लोड करने में त्रुटि');
        console.error('Error fetching IFSC:', error);
      }
    );
  }

  onDistrictChange(event: any) {
    // Clear division and range when district changes
    this.listOfDivision = [];
    this.formData.division_id = '';
    this.listOfRang = [];
    this.formData.range_id = '';

    // Get the ID from the selected object
    const districtId = event?.id || event;
    if (!districtId) return;

    this.showLoading('वनमण्डल लोड हो रहा है...');

    // Fetch divisions based on selected district
    this.apiService.getDivisionsByDistrict(districtId.toString()).subscribe(
      (response) => {
        this.dismissLoading();
        if (response.response.code === 200) {
          this.listOfDivision = response.data || [];
        } else {
          this.showToast(response.response.msg);
        }
      },
      (error) => {
        this.dismissLoading();
        this.showToast('वनमण्डल डेटा लोड करने में त्रुटि');
      }
    );
  }

  onDivisionChange(event: any) {
    // Clear range when division changes
    this.listOfRang = [];
    this.formData.range_id = '';

    // Get the ID from the selected object
    const divisionId = event?.id || event;
    if (!divisionId) return;

    this.showLoading('परिक्षेत्र लोड हो रहा है...');

    // Fetch ranges based on selected division
    // this.apiService.getRangesByDivision(divisionId.toString()).subscribe(
    //   (response) => {
    //     this.dismissLoading();
    //     if (response.response.code === 200) {
    //       this.listOfRang = response.data || [];
    //     } else {
    //       this.showToast(response.response.msg);
    //     }
    //   },
    //   (error) => {
    //     this.dismissLoading();
    //     this.showToast('परिक्षेत्र डेटा लोड करने में त्रुटि');
    //   }
    // );

    this.apiService
      .getRangesByDivision(divisionId.toString(), this.formData.district_id)
      .subscribe(
        (response) => {
          this.dismissLoading();
          if (response.response.code === 200) {
            this.listOfRang = response.data || [];
          } else {
            this.showToast(response.response.msg);
          }
        },
        () => {
          this.dismissLoading();
          this.showToast('परिक्षेत्र डेटा लोड करने में त्रुटि');
        }
      );

  }

  onPlantTypeChange(event: any) {
    if (this.selectedPlantType && this.selectedPlantType.length > 0) {
      // Join the IDs with comma
      this.formData.plat_type = this.selectedPlantType.join(', ');
    } else {
      this.formData.plat_type = '';
    }
  }

  getPlantNameById(plantId: string): string {
    const plant = this.listOfPlantTypes.find((p: any) => p.id === plantId);
    return plant ? plant.name : plantId;
  }

  showOtherPlantField(): boolean {
    return (
      this.selectedPlantType &&
      this.selectedPlantType.includes('8') // Check for ID "8" which is "अन्य"
    );
  }

  validateForm(): boolean {
    if (!this.formData.district_id) {
      this.showError('जिला चुनें');
      return false;
    }
    if (this.formData.isMale === null) {
      this.showError('लिंग चुनें (पुरुष / महिला)');
      return false;
    }
    if (!this.formData.division_id) {
      this.showError('वनमण्डल चुनें');
      return false;
    }
    if (!this.formData.range_id) {
      this.showError('परिक्षेत्र चुनें');
      return false;
    }
    if (!this.formData.hitgrahi_name) {
      this.showError('हितग्राही का नाम दर्ज करें');
      return false;
    }
    if (!this.formData.caste) {
      this.showError('जाति वर्ग चुनें');
      return false;
    }
    if (!this.formData.village_city) {
      this.showError('गांव/शहर का नाम दर्ज करें');
      return false;
    }
    if (!this.formData.gram_panchayat) {
      this.showError('ग्राम पंचायत का नाम दर्ज करें');
      return false;
    }
    if (!this.formData.address) {
      this.showError('पूरा पता दर्ज करें');
      return false;
    }
    if (!this.formData.area) {
      this.showError('क्षेत्रफल दर्ज करें');
      return false;
    }


    if (!this.formData.available_area) {
      this.showError('रोपण योग्य भूमि का रकबा दर्ज करें');
      return false;
    }

    // Regex validation for available_area: must be a number >= 1
    const availableAreaRegex = /^([1-9]\d*(\.\d+)?|0*\.\d*[1-9]\d*)$/;
    if (!availableAreaRegex.test(this.formData.available_area.trim())) {
      this.showError('रोपण योग्य भूमि का रकबा 1 या उससे अधिक होना चाहिए');
      return false;
    }
    const availableAreaValue = parseFloat(this.formData.available_area);
    if (isNaN(availableAreaValue) || availableAreaValue < 1) {
      this.showError('रोपण योग्य भूमि का रकबा 1 या उससे अधिक होना चाहिए');
      return false;
    }

    const totalArea = parseFloat(this.formData.area);
    const availableArea = parseFloat(this.formData.available_area);
    if (
      !isNaN(totalArea) &&
      !isNaN(availableArea) &&
      availableArea > totalArea
    ) {
      this.showError(
        'उपलब्ध रोपण योग्य भूमि का रकबा कुल रकबे से अधिक नहीं हो सकता'
      );
      return false;
    }
    if (!this.formData.mobile_no) {
      this.showError('मोबाइल नंबर दर्ज करें');
      return false;
    }
    // Regex validation for mobile number: must be exactly 10 digits
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(this.formData.mobile_no.toString().trim())) {
      this.showError('सही मोबाइल नंबर दर्ज करें (केवल 10 अंक)');
      return false;
    }
    if (this.formData.mobile_no.toString().length !== 10) {
      this.showError('सही मोबाइल नंबर दर्ज करें');
      return false;
    }
    if (!this.selectedPlantType || this.selectedPlantType.length === 0) {
      this.showError('कम से कम एक पौधे की प्रजाति चुनें');
      return false;
    }
    if (this.showOtherPlantField() && !this.formData.other_plant) {
      this.showError('अन्य पौधों का विवरण दर्ज करें');
      return false;
    }
    return true;
  }

  async submitForm() {
    // debugger
    if (!this.validateForm()) {
      return;
    }

    const confirmModal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप आवेदन जमा करना चाहते हैं?',
        isYesNo: true,
      },
      backdropDismiss: false,
    });

    confirmModal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.submitFormData();
      }
    });

    await confirmModal.present();
  }

  // Convert form data to API model
  private convertFormDataToApiModel(): SubmitKisanAwedanRequestModel {
    return {
      isMale: this.formData.isMale ? 1 : 0,
      district_id: parseInt(this.formData.district_id) || 0,
      division_id: parseInt(this.formData.division_id) || 0,
      range_id: parseInt(this.formData.range_id) || 0,
      hitgrahi_name: this.formData.hitgrahi_name ? this.formData.hitgrahi_name.toString() : "Test Name",
      father_husband_name: this.formData.father_husband_name ? this.formData.father_husband_name.toString() : "Test Father",
      caste: parseInt(this.formData.caste) || 0,
      village_city: this.formData.village_city ? this.formData.village_city.toString() : "Test Village",
      gram_panchayat: this.formData.gram_panchayat ? this.formData.gram_panchayat.toString() : "Test Panchayat",
      address: this.formData.address ? this.formData.address.toString() : "Test Address",
      area: this.formData.area ? this.formData.area.toString() : "0",
      available_area: this.formData.available_area ? this.formData.available_area.toString() : "0",
      mobile_no: parseInt(this.formData.mobile_no) || 0,
      plat_type: this.formData.plat_type ? this.formData.plat_type.toString() : "0",
      other_plant: this.formData.other_plant ? this.formData.other_plant.toString() : "",
      approved: false,
      adharFilename: this.adharFilename || "",
      bankPassbookFilename: this.bankPassbookFilename || "",
      b1P1Filename: this.b1P1Filename || "",
      adhaar: this.adhaar ? this.adhaar.toString() : "",
      halka_no: this.formData.halka_no ? this.formData.halka_no.toString() : "",
      land_village: this.formData.village_name ? this.formData.village_name.toString() : "",
      land_gram_panchayat: this.formData.gram_panchayat_name ? this.formData.gram_panchayat_name.toString() : "",
      sinchitOrA_sinchit: this.formData.sinchitOrA_sinchit ? this.formData.sinchitOrA_sinchit.toString() : "",
      selectedYesNoForKakshaKramank: this.formData.selectedYesNoForKakshaKramank ? this.formData.selectedYesNoForKakshaKramank.toString() : "",
      kaksha_kramank: this.formData.kaksha_kramank ? this.formData.kaksha_kramank.toString() : "",
      selectfrarevenue: this.formData.selectfrarevenue ? this.formData.selectfrarevenue.toString() : "",
      compartment_no: this.formData.compartment_no ? this.formData.compartment_no.toString() : "",
      patta_no: this.formData.patta_no ? this.formData.patta_no.toString() : "",
      khasra_no: this.formData.khasra_no ? this.formData.khasra_no.toString() : "",
      bank_name: this.selectedBankCode ? this.selectedBankCode.toString() : "",
      ifsc_code: this.ifsc_code || "",
      account_no: this.bank_account_no || ""
    };
  }

  submitFormData() {
    this.showLoading('आवेदन जमा किया जा रहा है...');

    const formData = new FormData();

    // Mapping fields to FormData (matching SubmitKisanAwedanRequestModel2 on backend)
    formData.append('district_id', this.formData.district_id);
    formData.append('division_id', this.formData.division_id);
    formData.append('range_id', this.formData.range_id);
    formData.append('hitgrahi_name', this.formData.hitgrahi_name || "");
    formData.append('father_husband_name', this.formData.father_husband_name || "");
    formData.append('caste', this.formData.caste);
    formData.append('village_city', this.formData.village_city || "");
    formData.append('gram_panchayat', this.formData.gram_panchayat || "");
    formData.append('address', this.formData.address || "");
    formData.append('area', this.formData.area ? this.formData.area.toString() : "0");
    formData.append('available_area', this.formData.available_area ? this.formData.available_area.toString() : "0");
    formData.append('mobile_no', this.formData.mobile_no ? this.formData.mobile_no.toString() : "0");
    formData.append('plat_type', this.formData.plat_type || "");
    formData.append('other_plant', this.formData.other_plant || "");
    formData.append('approved', 'false'); // Initial submission is usually not approved

    // Personal/Land Info
    formData.append('adhaar', this.adhaar || "");
    formData.append('isMale', this.formData.isMale ? '1' : '0');
    formData.append('halka_no', this.formData.halka_no || "");
    formData.append('land_village', this.formData.village_name || "");
    formData.append('land_gram_panchayat', this.formData.gram_panchayat_name || "");
    formData.append('sinchitOrA_sinchit', this.formData.sinchitOrA_sinchit || "");
    formData.append('selectedYesNoForKakshaKramank', this.formData.selectedYesNoForKakshaKramank || "");
    formData.append('kaksha_kramank', this.formData.kaksha_kramank || "");
    formData.append('selectfrarevenue', this.formData.selectfrarevenue || "");
    formData.append('compartment_no', this.formData.compartment_no || "");
    formData.append('patta_no', this.formData.patta_no || "");
    formData.append('khasra_no', this.formData.khasra_no || "");

    // Bank Details
    formData.append('bank_name', this.selectedBankCode ? this.selectedBankCode.toString() : "");
    formData.append('ifsc_code', this.ifsc_code || "");
    formData.append('account_no', this.bank_account_no || "");

    // Files
    if (this.adharPdfFile) {
      formData.append('FileAdhar', this.adharPdfFile, this.adharPdfFile.name);
    }
    if (this.bankPassbookPdfFile) {
      formData.append('FileBankPassbook', this.bankPassbookPdfFile, this.bankPassbookPdfFile.name);
    }
    if (this.b1P1PdfFile) {
      formData.append('FileB1P1', this.b1P1PdfFile, this.b1P1PdfFile.name);
    }

    console.log('Submitting FormData...');

    this.apiService.submitKisanAwedan(formData).subscribe(
      (response) => {
        this.dismissLoading();

        let parsedResponse = response;
        if (typeof response === 'string') {
          try {
            parsedResponse = JSON.parse(response);
          } catch (e) {
            console.error('Error parsing response:', e);
          }
        }

        if ((parsedResponse.response && parsedResponse.response.code === 200) || parsedResponse.status === true) {
          const successMsg = parsedResponse.response?.msg || parsedResponse.message || 'आपका आवेदन सफलतापूर्वक जमा हो गया है।';
          const appNumber = parsedResponse.applicationNumber || parsedResponse.application_number || '';
          this.showSuccessDialog(successMsg + (appNumber ? ' आवेदन क्रमांक: ' + appNumber : ''));
        } else {
          this.showToast(parsedResponse.response?.msg || parsedResponse.message || 'आवेदन जमा करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        console.error('Submit error:', error);
        this.showToast('आवेदन जमा करने में त्रुटि');
      }
    );
  }


  async showSuccessDialog(msg: string) {
    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: false,
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then(() => {
      this.goBack();
    });

    await modal.present();
  }

  async cancelForm() {
    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप वास्तव में रद्द करना चाहते हैं?',
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

  goBack() {
    this.router.navigateByUrl('/landingpage', { replaceUrl: true });
  }

  async showError(errorMsg: string) {
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
  }

  async showToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long',
      position: 'bottom',
    });
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

  validateArea() {
    const totalArea = parseFloat(this.formData.area);
    const availableArea = parseFloat(this.formData.available_area);
    if (!isNaN(totalArea) && !isNaN(availableArea) && availableArea > totalArea) {
      this.showError('उपलब्ध रोपण योग्य भूमि का रकबा कुल रकबे से अधिक नहीं हो सकता');
      this.formData.available_area = '';
    }
  }


  onselect_no() {
    // alert(this.kaksha_kramank);
    this.kaksha_kramank = '';
  }

  openBlobInNewTab(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

}