import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLoading, IonButton, IonLabel, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonHeader, IonTitle, IonToolbar, IonContent, } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { NavController, MenuController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { PlantationDetail, PlantationDetailNew, SingleAwedanDataResponseModel } from './SingleAwedanDataResponse.model';
import { TableModule } from 'primeng/table'; // Import TableModule
import { NgZone } from '@angular/core';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
// import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
//import { IonicModule } from '@ionic/angular';
import { NgIf } from '@angular/common';
//import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Filesystem, Directory } from '@capacitor/filesystem';


@Component({
  selector: 'app-view-awedan',
  templateUrl: './view-awedan.page.html',
  styleUrls: ['./view-awedan.page.scss'],
  standalone: true,
  imports: [NgIf, IonLoading, IonButton, IonLabel, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, TableModule]
})

export class ViewAwedanPage implements OnInit {

  isLargeScreen = false;
  getIsLargeScreen(): boolean {
    return this.isLargeScreen;
  }

  constructor(private sanitizer: DomSanitizer, private http: HttpClient, private modalCtrl: ModalController, private route: ActivatedRoute, private router: Router, private menuCtrl: MenuController, private platform: Platform, private navController: NavController, private langService: LanguageService, private cdRef: ChangeDetectorRef, private apiService: ApiService, private sharedServices: SharedserviceService, private zone: NgZone) {

  }

  languageData: any = {};
  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  passedAwedanObject: any;
  mobile_no: any;

  applicationNumber: string = "";

  isPendingApplication: boolean = false;

  async ngOnInit() {
    this.updateTranslation();

    const navigation = this.router.getCurrentNavigation();
    const stateData = navigation?.extras.state?.['passedAwedanObject'];
    const passedMobile = navigation?.extras.state?.['mobile'];
    console.log("PASSED_MOBILE", passedMobile);
    if (stateData) {
      this.passedAwedanObject = stateData;
      this.mobile_no = passedMobile;

      if (sessionStorage.getItem('logined_officer_data') != null) {
        this.isPendingApplication = this.passedAwedanObject.awedan_status === "0";
      }



      this.getAwedanData();
    } else {
      // Optional: Handle cases where state is not passed (e.g., direct page load)
      // You can redirect or show an error if needed
    }
  }

  getApplicationNumber(): string {
    return this.passedAwedanObject.application_number
  }

  singleAwedanResponseData?: SingleAwedanDataResponseModel

  listOfPlantationDetails: PlantationDetail[] = [];

  listOfPlantationDetailsTotal: PlantationDetail[] = [];

  listOfPlantationDetailsNew: PlantationDetailNew[] = [];
  listOfPlantationDetailsNewTotal: PlantationDetailNew[] = [];

  async getAwedanData() {

    this.showLoading("कृपया प्रतीक्षा करें.....");


    this.apiService.getSingleAwedanData(this.passedAwedanObject.regTableId).subscribe(
      async (response) => {

        this.dismissLoading();

        if (response.response.code === 200) {

          //this.singleAwedanResponseData = response.data

          //this.cdRef.markForCheck(); // Triggers view update

          this.zone.run(() => {
            this.singleAwedanResponseData = response.data;

            // Make list for planation detail //
            const plantKlonalLess5: PlantationDetail = {
              prajatiName: "क्लोनल नीलगिरी (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.klonal_neelgiri_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.klonal_neelgiri_plan_area_less_5_acre
            };
            const plantKlonalMore5: PlantationDetail = {
              prajatiName: "क्लोनल नीलगिरी (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.klonal_neelgiri_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.klonal_neelgiri_plan_area_more_5_acre
            };

            const plantTypeClonalNilgiri: PlantationDetailNew = {
              prajatiName: "क्लोनल नीलगिरी",
              plant_count_less_5: this.singleAwedanResponseData.klonal_neelgiri_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.klonal_neelgiri_plan_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.klonal_neelgiri_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.klonal_neelgiri_plan_area_more_5_acre
            }

            const plantTypeTissuCultureSagon: PlantationDetailNew = {
              prajatiName: "टिश्यू कल्चर सागौन",
              plant_count_less_5: this.singleAwedanResponseData.tishu_culture_sagon_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.tishu_culture_sagon_plant_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.tishu_culture_sagon_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.tishu_culture_sagon_plant_area_more_5_acre
            }

            const plantTypeTissuCultureBans: PlantationDetailNew = {
              prajatiName: "टिश्यू कल्चर बांस",
              plant_count_less_5: this.singleAwedanResponseData.tishu_culture_bansh_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.tishu_culture_bansh_plant_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.tishu_culture_bansh_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.tishu_culture_bansh_plant_area_more_5_acre
            }

            const plantTypeSadharanSagon: PlantationDetailNew = {
              prajatiName: "साधारण सागौन",
              plant_count_less_5: this.singleAwedanResponseData.normal_sagon_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.normal_sagon_plant_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.normal_sagon_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.normal_sagon_plant_area_more_5_acre
            }

            const plantTypeSadharanBans: PlantationDetailNew = {
              prajatiName: "साधारण बांस",
              plant_count_less_5: this.singleAwedanResponseData.normal_bansh_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.normal_bansh_plant_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.normal_bansh_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.normal_bansh_plant_area_more_5_acre
            }

            const plantTypeMiliyaDubiya: PlantationDetailNew = {
              prajatiName: "मिलिया डुबिया",
              plant_count_less_5: this.singleAwedanResponseData.miliya_dubiya_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.miliya_dubiya_plant_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.miliya_dubiya_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.miliya_dubiya_plant_area_more_5_acre
            }

            const plantTypeChandan: PlantationDetailNew = {
              prajatiName: "चंदन पौधा",
              plant_count_less_5: this.singleAwedanResponseData.chandan_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.chandan_plant_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.chandan_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.chandan_plant_area_more_5_acre
            }

            const plantTypeOtherPlant: PlantationDetailNew = {
              prajatiName: "अन्य अतिरिक्त लाभकारी पौधा",
              plant_count_less_5: this.singleAwedanResponseData.other_labhkari_no_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.other_labhkari_plan_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.other_labhkari_no_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.other_labhkari_plan_area_more_5_acre
            }

            const plantTypeTotalPlant: PlantationDetailNew = {
              prajatiName: "कुल",
              plant_count_less_5: this.singleAwedanResponseData.total_number_of_plant_less_5_acre,
              area_size_less_5: this.singleAwedanResponseData.total_area_less_5_acre,
              plant_count_more_5: this.singleAwedanResponseData.total_number_of_plant_more_5_acre,
              area_size_more_5: this.singleAwedanResponseData.total_area_more_5_acre
            }

            if ((plantTypeClonalNilgiri.plant_count_less_5 != "0" && plantTypeClonalNilgiri.area_size_less_5 != "0") || (plantTypeClonalNilgiri.plant_count_more_5 != "0" && plantTypeClonalNilgiri.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeClonalNilgiri);
            }

            if ((plantTypeTissuCultureSagon.plant_count_less_5 != "0" && plantTypeTissuCultureSagon.area_size_less_5 != "0") || (plantTypeTissuCultureSagon.plant_count_more_5 != "0" && plantTypeTissuCultureSagon.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeTissuCultureSagon);
            }

            if ((plantTypeTissuCultureBans.plant_count_less_5 != "0" && plantTypeTissuCultureBans.area_size_less_5 != "0") || (plantTypeTissuCultureBans.plant_count_more_5 != "0" && plantTypeTissuCultureBans.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeTissuCultureBans);
            }

            if ((plantTypeSadharanBans.plant_count_less_5 != "0" && plantTypeSadharanBans.area_size_less_5 != "0") || (plantTypeSadharanBans.plant_count_more_5 != "0" && plantTypeSadharanBans.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeSadharanBans);
            }

            if ((plantTypeSadharanSagon.plant_count_less_5 != "0" && plantTypeSadharanSagon.area_size_less_5 != "0") || (plantTypeSadharanSagon.plant_count_more_5 != "0" && plantTypeSadharanSagon.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeSadharanSagon);
            }

            if ((plantTypeMiliyaDubiya.plant_count_less_5 != "0" && plantTypeMiliyaDubiya.area_size_less_5 != "0") || (plantTypeMiliyaDubiya.plant_count_more_5 != "0" && plantTypeMiliyaDubiya.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeMiliyaDubiya);
            }

            if ((plantTypeChandan.plant_count_less_5 != "0" && plantTypeChandan.area_size_less_5 != "0") || (plantTypeChandan.plant_count_more_5 != "0" && plantTypeChandan.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeChandan);
            }

            if ((plantTypeOtherPlant.plant_count_less_5 != "0" && plantTypeOtherPlant.area_size_less_5 != "0") || (plantTypeOtherPlant.plant_count_more_5 != "0" && plantTypeOtherPlant.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNew.push(plantTypeOtherPlant);
            }

            if ((plantTypeTotalPlant.plant_count_less_5 != "0" && plantTypeTotalPlant.area_size_less_5 != "0") || (plantTypeTotalPlant.plant_count_more_5 != "0" && plantTypeTotalPlant.area_size_more_5 != "0")) {
              this.listOfPlantationDetailsNewTotal.push(plantTypeTotalPlant);
            }


            const tishuSagonLess5: PlantationDetail = {
              prajatiName: "टिश्यू कल्चर सागौन (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.tishu_culture_sagon_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.tishu_culture_sagon_plant_area_less_5_acre
            };
            const tishuSagonMore5: PlantationDetail = {
              prajatiName: "टिश्यू कल्चर सागौन (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.tishu_culture_sagon_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.tishu_culture_sagon_plant_area_more_5_acre
            };


            const tishuBansLess5: PlantationDetail = {
              prajatiName: "टिश्यू कल्चर बांस (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.tishu_culture_bansh_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.tishu_culture_bansh_plant_area_less_5_acre
            };
            const tishuBansMore5: PlantationDetail = {
              prajatiName: "टिश्यू कल्चर बांस (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.tishu_culture_bansh_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.tishu_culture_bansh_plant_area_more_5_acre
            };



            const normalSagonLess5: PlantationDetail = {
              prajatiName: "साधारण सागौन (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.normal_sagon_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.normal_sagon_plant_area_less_5_acre
            };
            const normalSagonMore5: PlantationDetail = {
              prajatiName: "साधारण सागौन (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.normal_sagon_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.normal_sagon_plant_area_more_5_acre
            };


            const normalBanshLess5: PlantationDetail = {
              prajatiName: "साधारण बांस (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.normal_bansh_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.normal_bansh_plant_area_less_5_acre
            };
            const normalBanshMore5: PlantationDetail = {
              prajatiName: "साधारण बांस (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.normal_bansh_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.normal_bansh_plant_area_more_5_acre
            };


            const miliaDubiyaLess5: PlantationDetail = {
              prajatiName: "मिलिया डुबिया (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.miliya_dubiya_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.miliya_dubiya_plant_area_less_5_acre
            };
            const miliaDubiyaMore5: PlantationDetail = {
              prajatiName: "मिलिया डुबिया (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.miliya_dubiya_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.miliya_dubiya_plant_area_more_5_acre
            };

            const chandanLess5: PlantationDetail = {
              prajatiName: "चंदन पौधा (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.chandan_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.chandan_plant_area_less_5_acre
            };
            const chandanMore5: PlantationDetail = {
              prajatiName: "चंदन पौधा (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.chandan_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.chandan_plant_area_more_5_acre
            };


            const noramlPlantsLess5: PlantationDetail = {
              prajatiName: "अन्य अतिरिक्त लाभकारी पौधा (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.other_labhkari_no_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.other_labhkari_plan_area_less_5_acre
            };
            const noramlPlantsMore5: PlantationDetail = {
              prajatiName: "अन्य अतिरिक्त लाभकारी पौधा (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.other_labhkari_no_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.other_labhkari_plan_area_more_5_acre
            };

            const totalPlantsLess5: PlantationDetail = {
              prajatiName: "कुल (5 एकड़ से कम के लिए)",
              plant_count: this.singleAwedanResponseData.total_number_of_plant_less_5_acre,
              area_size: this.singleAwedanResponseData.total_area_less_5_acre
            };
            const totalPlantsMore5: PlantationDetail = {
              prajatiName: "कुल (5 एकड़ से अधिक के लिए)",
              plant_count: this.singleAwedanResponseData.total_number_of_plant_more_5_acre,
              area_size: this.singleAwedanResponseData.total_area_more_5_acre
            };



            this.listOfPlantationDetails.push(plantKlonalLess5);
            this.listOfPlantationDetails.push(plantKlonalMore5);

            this.listOfPlantationDetails.push(tishuSagonLess5);
            this.listOfPlantationDetails.push(tishuSagonMore5);

            this.listOfPlantationDetails.push(tishuBansLess5);
            this.listOfPlantationDetails.push(tishuBansMore5);

            this.listOfPlantationDetails.push(normalSagonLess5);
            this.listOfPlantationDetails.push(normalSagonMore5);

            this.listOfPlantationDetails.push(normalBanshLess5);
            this.listOfPlantationDetails.push(normalBanshMore5);

            this.listOfPlantationDetails.push(miliaDubiyaLess5);
            this.listOfPlantationDetails.push(miliaDubiyaMore5);

            this.listOfPlantationDetails.push(chandanLess5);
            this.listOfPlantationDetails.push(chandanMore5);

            this.listOfPlantationDetails.push(noramlPlantsLess5);
            this.listOfPlantationDetails.push(noramlPlantsMore5);

            this.listOfPlantationDetailsTotal.push(totalPlantsLess5);
            this.listOfPlantationDetailsTotal.push(totalPlantsMore5);

            //this.cdRef.detectChanges();
          });

        } else {
          this.longToast(response.response.message)
        }

      },
      async (error) => {
        this.dismissLoading();
        //this.cdRef.detectChanges();
        this.shortToast(error);
        //this.apiService.showServerMessages(error)
      }
    );

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

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
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

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  get isMobile() {
    return this.platform.width() <= 600;
  }

  isDesktop(): boolean {
    return this.platform.is("desktop");
  }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  shouldShowApproveRejectButton(): boolean {
    if (sessionStorage.getItem('logined_officer_data') != null) {

      const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
      ////debugger;
      if (officersLoginModel.designation === "2") {
        return true;
      }

      return false;

    }
    return false;
  }

  async openUploadedDocumentAdhar(model: GetAwedanResponseModel) {
    const token = this.singleAwedanResponseData?.auth_token;
    const data = {
      token: token,
      pdf_file_name: model.adhar_pdfFilePath
    };
    this.router.navigate(['/view-pdf'], { state: { userData: data } });
  }

  openBlob(blob: Blob) {
    ////debugger;
    const reader = new FileReader();
    reader.onloadend = async () => {
     // //debugger;
      const base64 = (reader.result as string).split(',')[1];

      const result = await Filesystem.writeFile({
        path: 'yourfile.pdf',
        data: base64,
        directory: Directory.Documents
      });

      const path = result.uri;

      var cordova: any;

      cordova.plugins.fileOpener2.open(
        path, // make sure the file exists
        'application/pdf',
        {
          error: function (e: any) {
          },
          success: function () {
          }
        }
      );

    };

    reader.readAsDataURL(blob);

  }

  async openUploadedDocumentPassbook(model: GetAwedanResponseModel) {
    const token = this.singleAwedanResponseData?.auth_token;

    const data = {
      token: token,
      pdf_file_name: model.bankpassbook_pdfFilePath
    };
    this.router.navigate(['/view-pdf'], { state: { userData: data } });
  }

  async openUploadedDocumentb1p1(model: GetAwedanResponseModel) {
    const token = this.singleAwedanResponseData?.auth_token;
    const data = {
      token: token,
      pdf_file_name: model.b1p1_pdfFilePath
    };
    this.router.navigate(['/view-pdf'], { state: { userData: data } });
  }

  callServerToApproveReject(approveOrReject: number) {
    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    this.showDialog("कृपया प्रतीक्षा करें.....");

    this.apiService.awedanAcceptReject(
      this.singleAwedanResponseData!.application_table_id,
      approveOrReject.toString(),
      officersLoginModel.officerId).subscribe(
        async (response) => {

          await this.dismissDialog();
          this.cdRef.detectChanges;

          if (response.response.code === 200) {
            this.longToast(response.response.msg);
            this.sharedServices.setRefresh(true);
            this.goBack()
          } else {
            this.apiService.showServerMessages(response.response.msg);
          }

        },
        async (error) => {
          await this.dismissDialog();
          this.shortToast(error);
          this.apiService.showServerMessages(error)
        }
      );
  }

  async approveReject(approveOrReject: number) {

    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: approveOrReject == 1 ? 'क्या आप वास्तव में आवेदन स्वीकृत करना चाहते हैं?' : 'क्या आप वास्तव में आवेदन अस्वीकृत करना चाहते हैं?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.callServerToApproveReject(approveOrReject)
      }
    });

    await modal.present();

  }

  goBack() {
    this.navController.back();
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

  openMap() {
    const lat = this.singleAwedanResponseData?.vrikharopan_akshansh;
    const lng = this.singleAwedanResponseData?.vrikharopan_dikshansh;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_system'); // '_system' works in Cordova/Capacitor apps

  }

}
