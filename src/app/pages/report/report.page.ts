import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput, IonButton, IonCardContent, IonCard, IonIcon, IonDatetime, IonRow, IonCol, IonGrid, IonButtons, IonBackButton, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, IonLoading } from '@ionic/angular/standalone';
import { TableModule } from 'primeng/table'; // Import TableModule
import { LanguageService } from 'src/app/services/language.service';
import { addIcons } from 'ionicons';
import { calendarOutline, list, searchOutline, downloadOutline, alertCircleOutline } from 'ionicons/icons';
import { MastersModelClass } from 'src/app/services/response_classes/GetMastsersResponseModel';
import { ChangeDetectorRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Toast } from '@capacitor/toast';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalController } from '@ionic/angular';
// import { SelectDateDialogComponent } from 'src/app/select-date-dialog/select-date-dialog.component';
import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { SelectDateDialogComponent } from 'src/app/select-date-dialog/select-date-dialog.component';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import FileSaver, { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import { NotoSansDevanagari } from 'src/assets/fonts/NotoSansDevanagari';  // your font ts file
//import * as pdfMake from 'pdfmake/build/pdfmake';
// import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { AwedanResponseForReportModel } from './AwedanResponsForReport.model';
import { Router } from '@angular/router';



//(pdfMake as any).vfs = pdfFonts.vfs;

let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
  standalone: true,
  imports: [IonInput, IonButton, IonLoading, NgSelectModule, IonIcon, IonRow, IonCol, IonGrid, IonButtons, IonBackButton, TableModule, IonLabel, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReportPage implements OnInit {

  searchMobile = "";

  officersLoginModel: any;

  filteredAwedans: GetAwedanResponseModel[] = [];
  listOfAwedan: any[] = [];
  pdfDataToExport: any[] = [];
  fromDate: string = "";
  toDate: string = "";

  selectedAwedanStatus: string = "";
  selectedExporetedType: any = null;
  listOfExportType: any[] = [
    {
      "export_type": "0", "export_type_text": "Export In CSV"
    },
    // {
    //   "export_type": "1", "export_type_text": "Export In PDF"
    // }
  ]

  listOfAwedanStatus: any[] = [
    {
      "status_id": "", "status_text": "कुल आवेदन"
    }, {
      "status_id": "0", "status_text": "लंबित आवेदन"
    }, {
      "status_id": "1", "status_text": "स्वीकृत आवेदन"
    }, {
      "status_id": "2", "status_text": "अस्वीकृत आवेदन"
    }, {
      "status_id": "3", "status_text": "रद्द आवेदन"
    },]

  constructor(private router: Router, private location: Location, private sharedService: SharedserviceService, private modalCtrl: ModalController, private apiService: ApiService, private langService: LanguageService, private cdRef: ChangeDetectorRef) {
    addIcons({ calendarOutline, searchOutline, downloadOutline, alertCircleOutline });
  }

  addAllIcon() {
    addIcons({
      calendarOutline
    });
  }


  async ngOnInit() {

    // set from date to first date of current month //
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = "01";
    const formattedFromDate = `${yyyy}-${mm}-${dd}`;
    this.fromDate = formattedFromDate
    this.sharedService.setFromDate(this.fromDate);

    // set to date to first date of current month //
    const currentDate = String(today.getDate()).padStart(2, '0');
    const formattedToDate = `${yyyy}-${mm}-${currentDate}`;
    this.toDate = formattedToDate
    this.sharedService.setToDate(this.toDate);

    this.officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel

    if (this.officersLoginModel.designation == "6" || this.officersLoginModel.designation == "7") {
      this.getCircle();
    }
    else if (this.officersLoginModel.designation == "1") {

      this.selectedVrittId = this.officersLoginModel.circle_id;
      this.getDivisionOfOneCircle();

    } else if (this.officersLoginModel.designation == "2") {

      this.selectedVrittId = this.officersLoginModel.circle_id;
      this.selectedDivisionlId = this.officersLoginModel.devision_id;

      this.searchData();

    }


  }

  isListEmpty(): boolean {
    if (this.listOfAwedan.length > 0) {
      return false;
    }
    return true;
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

  listOfCircle: MastersModelClass[] = [];
  listOfDivision: MastersModelClass[] = [];
  selectedVrittId: any = null;
  selectedDivisionlId: any = null;

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  languageData: any = {};

  showLoading(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissLoading() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  onSelectionChangeOfCircle(event: any) {

    this.listOfDivision = [];
    this.selectedDivisionlId = null;
    this.listOfAwedan = [];

    if (event === undefined) {
      return
    }

    this.showLoading("कृपया प्रतीक्षा करें.....");


    const selectedValue = event?.id

    this.apiService.getDivision(selectedValue!!.toString()).subscribe(
      (response) => {

        this.dismissLoading();

        if (response.response.code === 200) {

          this.listOfDivision = response.data;
          this.cdRef.detectChanges();

        } else {
          this.longToast(response.response.msg)
        }


      },
      (error) => {
        this.dismissLoading();
        this.shortToast(error);
      }
    );

  }

  getDivisionOfOneCircle() {

    this.listOfDivision = [];
    this.selectedDivisionlId = null;
    this.listOfAwedan = [];

    if (event === undefined) {
      return
    }

    this.showLoading("कृपया प्रतीक्षा करें.....");

    const selectedValue = this.selectedVrittId;

    this.apiService.getDivision(selectedValue!!.toString()).subscribe(
      (response) => {

        this.dismissLoading();

        if (response.response.code === 200) {

          this.listOfDivision = response.data;
          this.cdRef.detectChanges();

        } else {
          this.longToast(response.response.msg)
        }


      },
      (error) => {
        this.dismissLoading();
        this.shortToast(error);
      }
    );

  }




  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long', // 'short' (2s) or 'long' (3.5s)
      position: 'bottom', // 'top', 'center', or 'bottom'
    });
  }

  async getCircle() {

    this.showLoading("कृपया प्रतीक्षा करें.....");

    this.apiService.getCircles().subscribe(
      async (response) => {

        await this.dismissLoading();

        if (response.response.code === 200) {

          this.listOfCircle = response.data


          this.searchData();

        } else {
          this.longToast(response.response.msg)
        }


      },
      async (error) => {
        //await this.dismissLoading();
        this.shortToast(error);
        //this.apiService.showServerMessages(error)
      }
    );

  }

  async onSelecteDate(fromOrToDate: string) {

    const modal = await this.modalCtrl.create({
      component: SelectDateDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        fromOrToDate: fromOrToDate
      },
      backdropDismiss: false,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {

        if (this.sharedService.getFromDate() != "") {
          const date = new Date(this.sharedService.getFromDate());
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          this.fromDate = `${yyyy}-${mm}-${dd}`;

        }

        if (this.sharedService.getToDate() != "") {
          if (this.sharedService.getFromDate() === "") {
            this.showMessage("पहले 'कब से' दिनांक चुने");
            this.sharedService.setToDate("");
            return;
          }
          const date = new Date(this.sharedService.getToDate());
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          this.toDate = `${yyyy}-${mm}-${dd}`;
        }


      }

    });

    await modal.present();
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

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  isNoRecordFound: boolean = true;

  isSuperAdmin(): boolean {
    if (this.officersLoginModel.designation == "6") {
      return true;
    }
    return false;
  }

  searchData() {
    ////debugger;
    if (this.fromDate === "") {
      this.showMessage("कब से दिनांक चुने");
      return;
    }
    if (this.toDate === "") {
      this.showMessage("कब तक दिनांक चुने");
      return;
    }

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.getAwedanListForReport(
      this.officersLoginModel.designation,
      this.selectedVrittId,
      this.selectedDivisionlId,
      this.fromDate,
      this.toDate,
      this.selectedAwedanStatus
    ).subscribe(
      (response) => {

        if (response.response.code === 200) {


          this.isNoRecordFound = false;
          this.listOfAwedan = response.data

          this.filteredAwedans = this.listOfAwedan;

          this.cdRef.detectChanges();

        } else {
          this.isNoRecordFound = true;
          this.listOfAwedan = [];
          this.filteredAwedans = this.listOfAwedan;
          this.cdRef.detectChanges();
          this.longToast(response.response.message)
        }

        this.dismissDialog();

      },
      (error) => {
        this.shortToast(error);
        this.dismissDialog();
      }
    );

  }

  async showMessage(msg: string) {
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
      if (result.data?.confirmed) {
      }
    });

    await modal.present();
  }

  exportData() {
    if (this.selectedExporetedType === null) {
      this.showMessage("पहले एक्सपोर्ट टाइप चुने");
      return;
    }


    if (this.selectedExporetedType === "0") {
      //this.exportToCSV(this.listOfAwedan, "awedan_data");
      this.exportToCSV();
    } else if (this.selectedExporetedType === "1") {

      for (let i = 0; i < this.listOfAwedan.length; i++) {
        let value: GetAwedanResponseModel = this.listOfAwedan[i];
        this.pdfDataToExport.push({ 'AWEDAN NUMBER': value.application_number, 'हितग्राही का नाम': value.hitgrahi_name, 'पिता का नाम': value.father_name, 'मोबाइल नंबर': value.mobile_no, 'वृत्त': value.circle_name, 'वन मंडल': value.division_name });
      }

      this.exportToPDF(this.pdfDataToExport, "awedan_data");

    }

  }

  // exportToPDF(data: any[], filename: string) {
  //   if (!data || data.length === 0) return;

  //   const doc = new jsPDF();

  //   // Add font to VFS
  //   const fontName = 'NotoSansDevanagari';
  //   const fontFileName = 'NotoSansDevanagari.ttf';

  //   // Remove data URI prefix to get raw base64
  //   const base64Font = NotoSansDevanagari.normal.replace(/^data:font\/truetype;charset=utf-8;base64,/, '');

  //   doc.addFileToVFS(fontFileName, base64Font);
  //   doc.addFont(fontFileName, fontName, 'normal');
  //   doc.setFont(fontName); // set font globally

  //   // Prepare headers and rows
  //   const headers = Object.keys(data[0]);
  //   const rows = data.map(row => headers.map(h => row[h] ?? ''));

  //   // Add title
  //   doc.text(filename, 14, 15);

  //   // Add table with your font
  //   autoTable(doc, {
  //     head: [headers],
  //     body: rows,
  //     startY: 20,
  //     styles: {
  //       font: fontName,   // use your font here
  //       fontSize: 10,
  //     },
  //     headStyles: {
  //       fillColor: [22, 160, 133]
  //     }
  //   });

  //   doc.save(`${filename}.pdf`);
  // }

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

  exportToPDF(data: any[], filename: string) {
    if (!data || data.length === 0) return;

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

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h] ?? ''));

    doc.text(filename, 14, 15);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      styles: {
        font: fontName,        // <- this applies to body
        fontStyle: 'normal',
        fontSize: 10,
      },
      headStyles: {
        font: fontName,        // <- important!
        fontStyle: 'normal',
        fontSize: 15,
        fillColor: [22, 160, 133],
      }
    });


    doc.save(`${filename}.pdf`);
  }

  // exportToCSV(data: any[], filename: string) {

  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  //   const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //   const blob = new Blob([wbout], { type: 'application/octet-stream' });
  //   saveAs(blob, `${filename}.xlsx`);

  // }

  exportToCSV() {
    //   const headers = [
    //     "आधार कार्ड नंबर", "मोबाइल नंबर", "पता", "बैंक का नाम", "IFSC कोड", "बैंक खाता नंबर",
    //     "खसरा नंबर", "कक्षा क्रमांक", "पदवली हल्का नंबर", "ग्राम नाम", "ग्राम पंचायत का नाम",

    //     // प्रजाति का नाम
    //     "क्लोनल नीलगिरी पौधा संख्या", "रकबा (एकड़ में)",
    //     "टिश्यू कल्चर सागौन पौधा संख्या", "रकबा (एकड़ में)",
    //     "टिश्यू कल्चर बांस पौधा संख्या", "रकबा (एकड़ में)",
    //     "साधारण सागौन पौधा संख्या", "रकबा (एकड़ में)",
    //     "साधारण बांस पौधा संख्या", "रकबा (एकड़ में)",
    //     "मिलिया डुबिया पौधा संख्या", "रकबा (एकड़ में)",
    //     "चंदन पौधा संख्या", "रकबा (एकड़ में)",
    //     "अतिरिक्त लाभकारी पौधे", "रकबा (एकड़ में)",

    //     // Other columns
    //     "कुल रोपित किए गए पौधों की संख्या",
    //     "कुल रोपण किए गए क्षेत्र का रकबा (एकड़ में)",
    //     "ख़ासरोपन मंडल का प्रकार (ब्लॉक/बेल्ट का रूप/इंटरक्रॉप)"
    //   ];

    //   const data: any[][] = []; // Excel rows

    //   this.listOfAwedan.forEach(item => {
    //     const row = [
    //       item.aadhar_no,
    //       item.mobile_no,
    //       item.address,
    //       item.bank_name,
    //       item.ifsc_code,
    //       item.account_no,
    //       item.khasra_no,
    //       item.kaksha_kramank,
    //       item.halka_no,
    //       item.village_name,
    //       item.panchayat_name,

    //       item.klonal_neelgiri_no_of_plant_less_5_acre,
    //       item.klonal_neelgiri_plan_area_less_5_acre,
    //       item.tishu_culture_sagon_no_of_plant_less_5_acre,
    //       item.tishu_culture_sagon_plant_area_less_5_acre,
    //       item.tishu_culture_bansh_no_of_plant_less_5_acre,
    //       item.tishu_culture_bansh_plant_area_less_5_acre,
    //       item.normal_sagon_no_of_plant_less_5_acre,
    //       item.normal_sagon_plant_area_less_5_acre,
    //       item.normal_bansh_no_of_plant_less_5_acre,
    //       item.normal_bansh_plant_area_less_5_acre,
    //       item.miliya_dubiya_no_of_plant_less_5_acre,
    //       item.miliya_dubiya_plant_area_less_5_acre,
    //       item.chandan_no_of_plant_less_5_acre,
    //       item.chandan_plant_area_less_5_acre,
    //       item.total_number_of_plant_less_5_acre,
    //       item.total_area_less_5_acre,
    //       item.plantation_type
    //     ];

    //     data.push(row);
    //   });

    //   const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    //   const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    //   const dataBlob: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    //   FileSaver.saveAs(dataBlob, 'plantation-data.xlsx');

    // }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
      [
        'वृत्त का नाम',
        'वनमण्डल का नाम',
        'जिले का नाम',
        'परिक्षेत्र का नाम',
        'कृषक/हितग्राही का नाम',
        'पिता का नाम',
        'वर्ग (सामान्य /अ.पि.व./ अ.जा./अ.ज.जा.)',
        'आधार कार्ड नंबर',
        'मोबाइल नंबर',
        'पता',
        'बैंक का नाम',
        'IFSC कोड',
        'बैंक खाता नंबर',
        'खसरा नंबर',
        'कक्ष क्रमांक',
        'पटवारी हल्का नम्बर',
        'ग्राम का नाम',
        'ग्राम पंचायत का नाम',
        'प्रजाति',
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        'वृक्षारोपण माॅडल का प्रकार (ब्लाॅक/खेत का मेड़/अंतरफसल)', 'मिट्टी का प्रकार',
        'सिंचित/ असिंचित', 'वृक्षारोपण क्षेत्र अक्षांश', 'वृक्षारोपण क्षेत्र देक्षांश', '', '', '', '', ''
      ],
      [
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        'क्लोनल नीलगिरी', '', '', '', 'टिश्यू कल्चर सागौन', '', '', '', 'टीशू कल्चर बांस', '', '', '', 'साधारण सागौन', '', '', '',
        'साधारण बांस', '', '', '', 'मिलिया डुबिया', '', '', '', 'चंदन पौधा', '', '', '', 'अतिरिक्त लाभकारी पौधे', '', '', '',
        'कुल 5 एकर से कम', '', 'कुल 5 एकर से अधिक', , '', '', '',
        '', '', '', '', '', '', '', '', '', '', '', ''
      ],
      [
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        '5 एकर से कम', '', '5 एकर से अधिक', '', '5 एकर से कम', '', '5 एकर से अधिक', '',
        '5 एकर से कम', '', '5 एकर से अधिक', '', '5 एकर से कम', '', '5 एकर से अधिक', '',
        '5 एकर से कम', '', '5 एकर से अधिक', '', '5 एकर से कम', '', '5 एकर से अधिक', '',
        '5 एकर से कम', '', '5 एकर से अधिक', '', '5 एकर से कम', '', '5 एकर से अधिक', '',
        '5 एकर से कम', '', '5 एकर से अधिक', '', '5 एकर से कम', '', '5 एकर से अधिक', '', '', '', '', '', '', '', '', '', '', '', ''
      ],
      [
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा',
        'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा',
        'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा',
        'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा',
        'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा',
        'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा',
        'पौधा संख्या', 'रकबा', 'पौधा संख्या', 'रकबा', '', '', '', '', '', '', '', '', '', '', '', ''
      ]
    ]);

    const data: any[][] = [];

    this.listOfAwedan.forEach(item => {
      const row = [
        item.circle_name,
        item.division_name,
        item.dist_name,
        item.rang_name,
        item.hitgrahi_name,
        item.father_name,
        item.cast,
        item.aadhar_no,
        item.mobile,
        item.address,
        item.bank_name,
        item.ifsc_code,
        item.account_no,
        item.khasra_no,
        item.kaksha_kramank,
        item.halka_no,
        item.village_name,
        item.panchayat_name,

        item.klonal_neelgiri_no_of_plant_less_5_acre,
        item.klonal_neelgiri_plan_area_less_5_acre,
        item.klonal_neelgiri_no_of_plant_more_5_acre,
        item.klonal_neelgiri_plan_area_more_5_acre,

        item.tishu_culture_sagon_no_of_plant_less_5_acre,
        item.tishu_culture_sagon_plant_area_less_5_acre,
        item.tishu_culture_sagon_no_of_plant_more_5_acre,
        item.tishu_culture_sagon_plant_area_more_5_acre,

        item.tishu_culture_bansh_no_of_plant_less_5_acre,
        item.tishu_culture_bansh_plant_area_less_5_acre,
        item.tishu_culture_bansh_no_of_plant_more_5_acre,
        item.tishu_culture_bansh_plant_area_more_5_acre,

        item.normal_sagon_no_of_plant_less_5_acre,
        item.normal_sagon_plant_area_less_5_acre,
        item.normal_sagon_no_of_plant_more_5_acre,
        item.normal_sagon_plant_area_more_5_acre,

        item.normal_bansh_no_of_plant_less_5_acre,
        item.normal_bansh_plant_area_less_5_acre,
        item.normal_bansh_no_of_plant_more_5_acre,
        item.normal_bansh_plant_area_more_5_acre,

        item.miliya_dubiya_no_of_plant_less_5_acre,
        item.miliya_dubiya_plant_area_less_5_acre,
        item.miliya_dubiya_no_of_plant_more_5_acre,
        item.miliya_dubiya_plant_area_more_5_acre,

        item.chandan_no_of_plant_less_5_acre,
        item.chandan_plant_area_less_5_acre,
        item.chandan_no_of_plant_more_5_acre,
        item.chandan_plant_area_more_5_acre,

        item.other_labhkari_no_of_plant_less_5_acre,
        item.other_labhkari_plan_area_less_5_acre,
        item.other_labhkari_no_of_plant_more_5_acre,
        item.other_labhkari_plan_area_more_5_acre,

        item.total_number_of_plant_less_5_acre,
        item.total_area_less_5_acre,
        item.total_number_of_plant_more_5_acre,
        item.total_area_more_5_acre,

        item.plantation_type,
        item.sand_type,
        item.sinchit_asinchit,
        item.vrikharopan_akshansh,
        item.vrikharopan_dikshansh,

        '', '', '', '', '' // Padding to match header length
      ];

      data.push(row);
    });

    XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });

    ws['!merges'] = [
      // Static fields (merge from row 0 to 3)
      { s: { r: 0, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 3, c: 2 } },
      { s: { r: 0, c: 3 }, e: { r: 3, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 3, c: 4 } },
      { s: { r: 0, c: 5 }, e: { r: 3, c: 5 } },
      { s: { r: 0, c: 6 }, e: { r: 3, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 3, c: 7 } },
      { s: { r: 0, c: 8 }, e: { r: 3, c: 8 } },
      { s: { r: 0, c: 9 }, e: { r: 3, c: 9 } },
      { s: { r: 0, c: 10 }, e: { r: 3, c: 10 } },
      { s: { r: 0, c: 11 }, e: { r: 3, c: 11 } },
      { s: { r: 0, c: 12 }, e: { r: 3, c: 12 } },
      { s: { r: 0, c: 13 }, e: { r: 3, c: 13 } },
      { s: { r: 0, c: 14 }, e: { r: 3, c: 14 } },
      { s: { r: 0, c: 15 }, e: { r: 3, c: 15 } },
      { s: { r: 0, c: 16 }, e: { r: 3, c: 16 } },
      { s: { r: 0, c: 17 }, e: { r: 3, c: 17 } },

      // प्रजाति label spanning all species (18–33)
      { s: { r: 0, c: 18 }, e: { r: 0, c: 53 } },

      // Species names in row 1 (each over 2 columns)
      { s: { r: 1, c: 18 }, e: { r: 1, c: 21 } }, // क्लोनल नीलगिरी
      { s: { r: 1, c: 22 }, e: { r: 1, c: 25 } }, // टिश्यू कल्चर सागौन
      { s: { r: 1, c: 26 }, e: { r: 1, c: 29 } }, // टीशू कल्चर बांस
      { s: { r: 1, c: 30 }, e: { r: 1, c: 33 } }, // साधारण सागौन
      { s: { r: 1, c: 34 }, e: { r: 1, c: 37 } }, // साधारण बांस
      { s: { r: 1, c: 38 }, e: { r: 1, c: 41 } }, // मिलिया डुबिया
      { s: { r: 1, c: 42 }, e: { r: 1, c: 45 } }, // चंदन पौधा
      { s: { r: 1, c: 46 }, e: { r: 1, c: 49 } }, // अतिरिक्त लाभकारी पौधे
      { s: { r: 1, c: 50 }, e: { r: 2, c: 51 } }, // Total less 5 acre
      { s: { r: 1, c: 52 }, e: { r: 2, c: 53 } }, // Total more 5 acre

      // Acre category (5 एकर से कम / अधिक) per species (row 2)
      { s: { r: 2, c: 18 }, e: { r: 2, c: 19 } }, { s: { r: 2, c: 20 }, e: { r: 2, c: 21 } },

      { s: { r: 2, c: 22 }, e: { r: 2, c: 23 } }, { s: { r: 2, c: 24 }, e: { r: 2, c: 25 } },

      { s: { r: 2, c: 26 }, e: { r: 2, c: 27 } }, { s: { r: 2, c: 28 }, e: { r: 2, c: 29 } },

      { s: { r: 2, c: 30 }, e: { r: 2, c: 31 } }, { s: { r: 2, c: 32 }, e: { r: 2, c: 33 } },

      { s: { r: 2, c: 34 }, e: { r: 2, c: 35 } }, { s: { r: 2, c: 36 }, e: { r: 2, c: 37 } },

      { s: { r: 2, c: 38 }, e: { r: 2, c: 39 } }, { s: { r: 2, c: 40 }, e: { r: 2, c: 41 } },

      { s: { r: 2, c: 42 }, e: { r: 2, c: 43 } }, { s: { r: 2, c: 44 }, e: { r: 2, c: 45 } },

      { s: { r: 2, c: 46 }, e: { r: 2, c: 47 } }, { s: { r: 2, c: 48 }, e: { r: 2, c: 49 } },

      { s: { r: 2, c: 50 }, e: { r: 2, c: 51 } }, { s: { r: 2, c: 52 }, e: { r: 2, c: 53 } },

      // Final columns (single-cell wide) from row 0–3
      { s: { r: 0, c: 54 }, e: { r: 3, c: 54 } },
      { s: { r: 0, c: 55 }, e: { r: 3, c: 55 } },
      { s: { r: 0, c: 56 }, e: { r: 3, c: 56 } },
      { s: { r: 0, c: 57 }, e: { r: 3, c: 57 } },
      { s: { r: 0, c: 58 }, e: { r: 3, c: 58 } }
    ];


    // Save as before
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Beneficiaries');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    FileSaver.saveAs(blob, `Beneficiaries_${new Date().toISOString().split('T')[0]}.xlsx`);


  }

  // onSearch(event: any) {
  //   const value = event.target.value.toLowerCase();
  //   this.filteredAwedans = this.listOfAwedan.filter(item =>
  //     item.hitgrahi_name.toLowerCase().includes(value) ||
  //     item.father_name.toLowerCase().includes(value) ||
  //     item.mobile_no.includes(value) ||
  //     item.application_number.toLowerCase().includes(value)
  //   );
  // }

  // onEnter() {
  //   console.log("Enter pressed, final search:", this.searchMobile);
  //   // optional: trigger search only on Enter
  //   this.filteredAwedans = this.listOfAwedan.filter(item =>
  //     item.hitgrahi_name.toLowerCase().includes(this.searchMobile.toLowerCase()) ||
  //     item.father_name.toLowerCase().includes(this.searchMobile.toLowerCase()) ||
  //     item.mobile_no.includes(this.searchMobile) ||
  //     item.application_number.toLowerCase().includes(this.searchMobile.toLowerCase())
  //   );
  // }

  onSearchTextChanged() {
    ////debugger;
    const value = (this.searchMobile || '').toLowerCase().trim();

    this.filteredAwedans = this.listOfAwedan.filter(item =>
      item.hitgrahi_name.toLowerCase().includes(value) ||
      item.father_name.toLowerCase().includes(value) ||
      item.mobile_no.includes(value) ||
      item.application_number.toLowerCase().includes(value)
    );
  }

}