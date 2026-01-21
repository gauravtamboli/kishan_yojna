import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { SingleAwedanDataResponseModel } from '../view-awedan/SingleAwedanDataResponse.model';
import { Toast } from '@capacitor/toast';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FileSaver from 'file-saver';
import { KisanAwedanData } from './KisanAwedanResponse.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotoSansDevanagari } from 'src/assets/fonts/NotoSansDevanagari';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-view-awedan-bykisanro',
  templateUrl: './view-awedan-bykisanRO.page.html',
  styleUrls: ['./view-awedan-bykisanRO.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})
export class ViewAwedanBykisanROPage implements OnInit {
  isLoading: boolean = false;
  loadingMessage: string = 'कृपया प्रतीक्षा करें...';

  applicationNumber: string = '';
  // awedanData?: SingleAwedanDataResponseModel;
  awedanData?: KisanAwedanData;
  // Plant type mapping (same as in kisan-awedan)
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

  // Transfer application properties
  showTransferSection: boolean = false;
  listOfCircle: any[] = [];
  listOfDist: any[] = [];
  listOfDivision: any[] = [];
  listOfRang: any[] = [];

  selectedCircleId: string = '';
  selectedDistId: string = '';
  selectedDivId: string = '';
  selectedRangId: string = '';
  isRangeOfficer: boolean = false;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {


    // Check if data was passed via navigation state

    const officerData = this.getOfficersSessionData();
    this.isRangeOfficer = officerData?.designation === '4';
    const navigation = this.router.getCurrentNavigation();
    const stateData = navigation?.extras.state;

    // this.route.queryParams.subscribe(params => {
    //   if (params['applicationNumber']) {
    //     this.applicationNumber = params['applicationNumber'];
    //     this.fetchAwedanData();
    //   }
    // });

    if (stateData && stateData['applicationNumber']) {
      this.applicationNumber = stateData['applicationNumber'];
      this.fetchAwedanData();
    } else if (stateData && stateData['applicationId']) {
      // If applicationId is passed instead
      this.applicationNumber = stateData['applicationId'];
      this.fetchAwedanData();
    }
  }


  exportToPDF() {
    if (!this.awedanData) {
      this.showToast('कोई डेटा उपलब्ध नहीं है');
      return;
    }

    const fontName = 'NotoSans';
    const fontFile = 'NotoSans.ttf';

    const base64Font = NotoSansDevanagari.normal.replace(
      /^data:font\/truetype;charset=utf-8;base64,/,
      ''
    );

    const doc = new jsPDF();

    doc.addFileToVFS(fontFile, base64Font);
    doc.addFont(fontFile, fontName, 'normal');
    doc.setFont(fontName);
    // Prepare data for PDF
    const pdfData = this.prepareDataForExport();

    const headers = Object.keys(pdfData);
    const rows = [Object.values(pdfData)];

    doc.text('किसान आवेदन विवरण', 14, 15);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: {
        font: fontName,
        fontStyle: 'normal',
        fontSize: 10,
      },
      headStyles: {
        font: fontName,
        fontStyle: 'normal',
        fontSize: 12,
        fillColor: [22, 160, 133],
      }
    });

    doc.save(`किसान_आवेदन_${this.awedanData.application_number}.pdf`);
  }

  exportToExcel() {
    if (!this.awedanData) {
      this.showToast('कोई डेटा उपलब्ध नहीं है');
      return;
    }

    const excelData = this.prepareDataForExport();

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([excelData]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'किसान आवेदन');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    FileSaver.saveAs(blob, `किसान_आवेदन_${this.awedanData.application_number}.xlsx`);
  }


  private prepareDataForExport() {
    if (!this.awedanData) return {};

    // Get plant names instead of IDs
    const plantNames = this.getPlantTypeNames();
    const plantNamesString = plantNames.join(', ');

    return {
      'पता': this.awedanData.address || '',
      'आवेदन संख्या': this.awedanData.application_number || '',
      'अनुमोदित': this.awedanData.approved ? 'हाँ' : 'नहीं',
      'जाति वर्ग': this.awedanData.cast_name || '',
      'जिला': this.awedanData.dist_name || '',
      'वन मंडल': this.awedanData.div_name || '',
      'पिता/पति का नाम': this.awedanData.father_name || '',
      'ग्राम पंचायत': this.awedanData.gram_panchayat_name || '',
      'हितग्राही का नाम': this.awedanData.hitgrahi_name || '',
      'मोबाइल नंबर': this.awedanData.mobile_no || '',
      'अन्य पौधों का विवरण': this.awedanData.other_plant || '',
      'पौधों की प्रजाति': plantNamesString,
      'परिक्षेत्र': this.awedanData.rang_name || '',
      'गाँव': this.awedanData.village_name || ''
    };
  }
  onApplicationNumberChange() {
    // Clear previous data when application number changes
    this.awedanData = undefined;
  }

  searchAwedan() {
    if (!this.applicationNumber || this.applicationNumber.trim() === '') {
      this.showError('आवेदन संख्या दर्ज करें');
      return;
    }
    this.fetchAwedanData();
  }

  // ... existing code at top ...

  fetchAwedanData() {
    if (!this.applicationNumber) {
      this.showError('कृपया आवेदन संख्या दर्ज करें');
      return;
    }

    this.showLoading('डेटा लोड हो रहा है...');

    this.apiService.getKisanAwedanByNumber(this.applicationNumber).subscribe(
      (response) => {
        this.dismissLoading();
        console.log("response one one one :", response);
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }

        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.awedanData = parsedResponse.data;
          console.log("this.awedanData one :", this.awedanData);
        } else {
          this.showError(parsedResponse.response?.msg || 'डेटा लोड करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        console.error('API Error:', error);
        this.showError('डेटा लोड करने में त्रुटि');
      }
    );
  }

  // ... rest of existing code ...

  // Get plant names from the plantation_type field
  getPlantTypeNames(): string[] {
    if (!this.awedanData || !this.awedanData.plant_type_final) {


      return [];
    }

    // The plantation_type field contains plant IDs separated by comma
    const plantIds = this.awedanData.plant_type_final.split(',').map(p => p.trim());

    // Map IDs to names
    const plantNames = plantIds.map(id => {
      const plantType = this.listOfPlantTypes.find(p => p.id === id);
      return plantType ? plantType.name : id;
    });

    return plantNames;
  }

  hasOtherPlant(): boolean {
    if (!this.awedanData || !this.awedanData.plant_type_final) {
      return false;
    }

    const plantIds = this.awedanData.plant_type_final.split(',').map(p => p.trim());
    return plantIds.includes('8');
  }

  getTotalArea(): string {
    if (!this.awedanData) {
      return '0.00';
    }
    return '0';
    // const less5Area = parseFloat(this.awedanData.total_area_less_5_acre) || 0;
    // const more5Area = parseFloat(this.awedanData.total_area_more_5_acre) || 0;
    // return (less5Area + more5Area).toFixed(2);
  }

  goBack() {
    this.location.back();
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

  // Transfer Application Methods
  toggleTransferSection() {
    this.showTransferSection = !this.showTransferSection;
    if (this.showTransferSection) {
      this.loadCircles();
    } else {
      this.resetTransferFields();
    }
  }

  resetTransferFields() {
    this.selectedCircleId = '';
    this.selectedDistId = '';
    this.selectedDivId = '';
    this.selectedRangId = '';
    this.listOfDist = [];
    this.listOfDivision = [];
    this.listOfRang = [];
  }

  loadCircles() {
    this.showLoading('कृपया प्रतीक्षा करें...');
    this.apiService.getCircles().subscribe(
      (response) => {
        this.dismissLoading();
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.listOfCircle = parsedResponse.data || [];
        } else {
          this.showError(parsedResponse.response?.msg || 'वृत्त लोड करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        this.showError('वृत्त लोड करने में त्रुटि');
      }
    );
  }

  onCircleChange(event: any) {
    const circleId = event?.id || event || '';
    this.selectedCircleId = circleId;
    this.selectedDistId = '';
    this.selectedDivId = '';
    this.selectedRangId = '';
    this.listOfDist = [];
    this.listOfDivision = [];
    this.listOfRang = [];

    if (this.selectedCircleId) {
      this.loadDistricts(this.selectedCircleId);
    }
  }

  loadDistricts(circleId: string) {
    this.showLoading('जिला लोड हो रहा है...');
    this.apiService.getDist(circleId).subscribe(
      (response) => {
        this.dismissLoading();
        let parsedResponse = response;
        console.log("parsedResponse :", parsedResponse);
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.listOfDist = parsedResponse.data || [];
        } else {
          this.showError(parsedResponse.response?.msg || 'जिला लोड करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        this.showError('जिला लोड करने में त्रुटि');
      }
    );
  }

  onDistrictChange(event: any) {
    const districtId = event?.id || event || '';
    this.selectedDistId = districtId;
    this.selectedDivId = '';
    this.selectedRangId = '';
    this.listOfDivision = [];
    this.listOfRang = [];

    if (this.selectedDistId) {
      this.loadDivisions(this.selectedDistId);
    }
  }

  loadDivisions(districtId: string) {
    this.showLoading('वनमण्डल लोड हो रहा है...');
    this.apiService.getDivisionsByDistrict(districtId).subscribe(
      (response) => {
        this.dismissLoading();
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.listOfDivision = parsedResponse.data || [];
        } else {
          this.showError(parsedResponse.response?.msg || 'वनमण्डल लोड करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        this.showError('वनमण्डल लोड करने में त्रुटि');
      }
    );
  }

  onDivisionChange(event: any) {
    const divisionId = event?.id || event || '';
    this.selectedDivId = divisionId;
    this.selectedRangId = '';
    this.listOfRang = [];

    if (this.selectedDivId) {
      this.loadRanges(this.selectedDivId, this.selectedDistId);
    }
  }

  // loadRanges(divisionId: string) {
  //   this.showLoading('परिक्षेत्र लोड हो रहा है...');
  //   this.apiService.getRangesByDivision(divisionId).subscribe(
  //     (response) => {
  //       this.dismissLoading();
  //       let parsedResponse = response;
  //       if (typeof response === 'string') {
  //         parsedResponse = JSON.parse(response);
  //       }
  //       if (parsedResponse.response && parsedResponse.response.code === 200) {
  //         this.listOfRang = parsedResponse.data || [];
  //       } else {
  //         this.showError(parsedResponse.response?.msg || 'परिक्षेत्र लोड करने में त्रुटि');
  //       }
  //     },
  //     (error) => {
  //       this.dismissLoading();
  //       this.showError('परिक्षेत्र लोड करने में त्रुटि');
  //     }
  //   );
  // }

  loadRanges(divisionId: string, districtId: string) {
    this.showLoading('परिक्षेत्र लोड हो रहा है...');
    this.apiService.getRangesByDivision(divisionId.toString(), districtId.toString()).subscribe(
      (response) => {
        this.dismissLoading();
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.listOfRang = parsedResponse.data || [];
        } else {
          this.showError(parsedResponse.response?.msg || 'परिक्षेत्र लोड करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        this.showError('परिक्षेत्र लोड करने में त्रुटि');
      }
    );
  }

  onRangeChange(event: any) {
    this.selectedRangId = event?.id || event || '';
  }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }


  submitTransfer() {
    this.isLoading = false;

    if (!this.selectedCircleId || !this.selectedDistId || !this.selectedDivId || !this.selectedRangId) {
      Swal.fire({
        icon: 'warning',
        title: 'अपूर्ण जानकारी',
        text: 'कृपया सभी फ़ील्ड चुनें (वृत्त, जिला, वनमण्डल, परिक्षेत्र)',
        confirmButtonText: 'ठीक है'
      });
      return;
    }

    if (!this.awedanData || !this.awedanData.application_number) {
      Swal.fire({
        icon: 'error',
        title: 'त्रुटि',
        text: 'आवेदन संख्या उपलब्ध नहीं है',
        confirmButtonText: 'ठीक है'
      });
      return;
    }

    const officerData = this.getOfficersSessionData();
    const updatedBy = officerData?.rang_id ? parseInt(officerData.rang_id) : null;

    const transferData = {
      application_number: this.awedanData.application_number,
      circle_id: parseInt(this.selectedCircleId),
      district_id: parseInt(this.selectedDistId),
      division_id: parseInt(this.selectedDivId),
      range_id: parseInt(this.selectedRangId),
      updated_by: updatedBy
    };

    // 🔹 Confirmation Alert
    Swal.fire({
      title: 'क्या आप सुनिश्चित हैं?',
      text: 'आवेदन का अंतरण किया जाएगा',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'हाँ, अंतरण करें',
      cancelButtonText: 'रद्द करें'
    }).then((result) => {

      if (!result.isConfirmed) return;

      // 🔹 Loading Alert
      Swal.fire({
        title: 'आवेदन अंतरण हो रहा है...',
        allowOutsideClick: false,
        didOpen: () => {
          this.isLoading = false; // ✅ stop Ionic loader
          Swal.showLoading();
        }
      });


      this.apiService.transferApplication(transferData).subscribe(
        (response) => {
          Swal.close();

          let parsedResponse = response;
          if (typeof response === 'string') {
            parsedResponse = JSON.parse(response);
          }

          if (parsedResponse.response?.code === 200) {
            Swal.fire({
              icon: 'success',
              title: 'सफल',
              text: 'आवेदन सफलतापूर्वक अंतरित किया गया',
              timer: 2000,
              showConfirmButton: false
            });

            this.toggleTransferSection();
            this.fetchAwedanData();

          } else {
            Swal.fire({
              icon: 'error',
              title: 'त्रुटि',
              text: parsedResponse.response?.msg || 'आवेदन अंतरण में त्रुटि'
            });
          }
        },
        (error) => {
          Swal.close();
          console.error('Transfer Error:', error);

          Swal.fire({
            icon: 'error',
            title: 'सर्वर त्रुटि',
            text: 'आवेदन अंतरण में त्रुटि'
          });
        }
      );
    });
  }


}