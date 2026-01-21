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
}

// Form data interface for the UI
interface KisanAwedanFormData {
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
}

@Component({
  selector: 'app-kisan-awedan',
  templateUrl: './kisan-awaden.page.html',
  styleUrls: ['./kisan-awedan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})


export class KisanAwedanPage implements OnInit {
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
    available_area: ''
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

  listOfPlantTypes = [
    { id: '1', name: 'क्लोनल नीलगिरी' },
    { id: '2', name: 'टिश्यू कल्चर सागौन' },
    { id: '3', name: 'टिश्यू कल्चर बांस' },
    { id: '4', name: 'साधारण बांस' },
    { id: '5', name: 'साधारण सागौन' },
    { id: '6', name: 'मिलिया डुबिया' },
    { id: '7', name: 'चंदन पौधा' },
    { id: '8', name: 'अन्य' },
  ];

  selectedPlantType: string[] = [];

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}
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
  }

  loadMasterData() {
    this.showLoading('डेटा लोड हो रहा है...');
    
    // Load all districts initially/
   // Load all districts after OTP verification
    this.apiService.getAllDistricts().subscribe(
      (response) => {
        console.log('getAllDistricts response:', response); // Debug log
        this.dismissLoading();
        
        // Parse the JSON response if it's a string
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.listOfDist = parsedResponse.data || [];
          console.log('Districts loaded:', this.listOfDist); // Debug log
        } else {
          this.showToast(parsedResponse.response?.msg || 'डेटा लोड करने में त्रुटि');
        }
      },
      (error) => {
        console.error('getAllDistricts error:', error); // Debug log
        this.dismissLoading();
        this.showToast('डेटा लोड करने में त्रुटि');
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
    const plant = this.listOfPlantTypes.find(p => p.id === plantId);
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
      district_id: parseInt(this.formData.district_id) || 1,
      division_id: parseInt(this.formData.division_id) || 1,
      range_id: parseInt(this.formData.range_id) || 1,
      hitgrahi_name: this.formData.hitgrahi_name || "Test Name",
      father_husband_name: this.formData.father_husband_name || "Test Father",
      caste: parseInt(this.formData.caste) || 1,
      village_city: this.formData.village_city || "Test Village",
      gram_panchayat: this.formData.gram_panchayat || "Test Panchayat",
      address: this.formData.address || "Test Address",
      area: this.formData.area || "1",
      available_area: this.formData.available_area || "1",
      mobile_no: parseInt(this.formData.mobile_no) || 9876543210,
      plat_type: this.formData.plat_type || "Test Plant",
      other_plant: this.formData.other_plant || "Test Other Plant",
      approved: false
    };
  }

  submitFormData() {
    // debugger;
    this.showLoading('आवेदन जमा किया जा रहा है...');
    
    // Debug: Log form data before processing
    // console.log('Form data before processing:', this.formData);
    // console.log('Selected plant types:', this.selectedPlantType);
    
    // Convert form data to API model
    const apiModel: SubmitKisanAwedanRequestModel = this.convertFormDataToApiModel();
    
    console.log('API Model data:', apiModel);
    
    // Send data directly as the request body (same as working dummy data)
    this.apiService.submitKisanAwedan(apiModel).subscribe(
      (response) => {
        this.dismissLoading();
        
        // Parse the JSON response if it's a string
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.showSuccessDialog(parsedResponse.response.msg);
        } else {
          this.showToast(parsedResponse.response?.msg || 'आवेदन जमा करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        console.error('Submit error:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.showToast('आवेदन जमा करने में त्रुटि');
      }
    );
  }

  submitDummyData() {
    this.showLoading('डमी डेटा जमा किया जा रहा है...');
    
    // Create dummy data using the same interface
    const dummyData: SubmitKisanAwedanRequestModel = {
      isMale : 1,
      district_id: 2,
      division_id: 1,
      range_id: 1,
      hitgrahi_name: "डमी हितग्राही",
      father_husband_name: "डमी पिता",
      caste: 1,
      village_city: "डमी गांव",
      gram_panchayat: "डमी पंचायत",
      address: "डमी पता, डमी शहर, डमी राज्य",
      area: "5",
      available_area: "3",
      mobile_no: 9876543210,
      plat_type: "क्लोनल नीलगिरी, टिश्यू कल्चर सागौन",
      other_plant: "डमी अन्य पौधे",
      approved: false
    };

    console.log('Submitting dummy data:', dummyData);
    
    this.apiService.submitKisanAwedan(dummyData).subscribe(
      (response) => {
        this.dismissLoading();
        
        // Parse the JSON response if it's a string
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.showSuccessDialog('डमी डेटा सफलतापूर्वक जमा किया गया: ' + parsedResponse.response.msg);
        } else {
          this.showToast(parsedResponse.response?.msg || 'डमी डेटा जमा करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        console.error('Dummy submit error:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.showToast('डमी डेटा जमा करने में त्रुटि');
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
}