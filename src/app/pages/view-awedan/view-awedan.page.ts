import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLoading, IonButton, IonLabel, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonHeader, IonTitle, IonToolbar, IonContent, IonIcon } from '@ionic/angular/standalone';
import { ModalController, NavController, MenuController, Platform, LoadingController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiService } from 'src/app/services/api.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { SharedserviceService } from 'src/app/services/sharedservice.service';
import { PlantationDetail, PlantationDetailNew, SingleAwedanDataResponseModel } from './SingleAwedanDataResponse.model';
import { TableModule } from 'primeng/table'; // Import TableModule
import { NgZone } from '@angular/core';
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { 
  personCircleOutline, 
  documentsOutline, 
  idCardOutline, 
  bookOutline, 
  newspaperOutline, 
  walletOutline, 
  mapOutline, 
  leafOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline 
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-view-awedan',
  templateUrl: './view-awedan.page.html',
  styleUrls: ['./view-awedan.page.scss'],
  standalone: true,
  imports: [NgIf, IonLoading, IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule, TableModule]
})

export class ViewAwedanPage implements OnInit {

  isLargeScreen = false;
  getIsLargeScreen(): boolean {
    return this.isLargeScreen;
  }

  constructor(private sanitizer: DomSanitizer, private http: HttpClient, private modalCtrl: ModalController, private route: ActivatedRoute, private router: Router, private menuCtrl: MenuController, private platform: Platform, private navController: NavController, private langService: LanguageService, private cdRef: ChangeDetectorRef, private apiService: ApiService, private sharedServices: SharedserviceService, private zone: NgZone, private authService: AuthServiceService) {
    addIcons({ 
      personCircleOutline, 
      documentsOutline, 
      idCardOutline, 
      bookOutline, 
      newspaperOutline, 
      walletOutline, 
      mapOutline, 
      leafOutline, 
      checkmarkCircleOutline, 
      closeCircleOutline 
    });
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

      if (this.authService.getOfficerData() != null) {
        this.isPendingApplication = this.passedAwedanObject.awedan_status === "0";
      }

      this.getAwedanData();
    } else {
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
      async (response: any) => {

        this.dismissLoading();

        if (response.response.code === 200) {

          this.zone.run(() => {
            const data = response.data;
            this.singleAwedanResponseData = data;

            if (!data) return;

            const plantTypeClonalNilgiri: PlantationDetailNew = {
              prajatiName: "क्लोनल नीलगिरी",
              plant_count_less_5: data.klonal_neelgiri_no_of_plant_less_5_acre,
              area_size_less_5: data.klonal_neelgiri_plan_area_less_5_acre,
              plant_count_more_5: data.klonal_neelgiri_no_of_plant_more_5_acre,
              area_size_more_5: data.klonal_neelgiri_plan_area_more_5_acre
            }

            const plantTypeTissuCultureSagon: PlantationDetailNew = {
              prajatiName: "टिश्यू कल्चर सागौन",
              plant_count_less_5: data.tishu_culture_sagon_no_of_plant_less_5_acre,
              area_size_less_5: data.tishu_culture_sagon_plant_area_less_5_acre,
              plant_count_more_5: data.tishu_culture_sagon_no_of_plant_more_5_acre,
              area_size_more_5: data.tishu_culture_sagon_plant_area_more_5_acre
            }

            const plantTypeTissuCultureBans: PlantationDetailNew = {
              prajatiName: "टिश्यू कल्चर बांस",
              plant_count_less_5: data.tishu_culture_bansh_no_of_plant_less_5_acre,
              area_size_less_5: data.tishu_culture_bansh_plant_area_less_5_acre,
              plant_count_more_5: data.tishu_culture_bansh_no_of_plant_more_5_acre,
              area_size_more_5: data.tishu_culture_bansh_plant_area_more_5_acre
            }

            const plantTypeSadharanSagon: PlantationDetailNew = {
              prajatiName: "साधारण सागौन",
              plant_count_less_5: data.normal_sagon_no_of_plant_less_5_acre,
              area_size_less_5: data.normal_sagon_plant_area_less_5_acre,
              plant_count_more_5: data.normal_sagon_no_of_plant_more_5_acre,
              area_size_more_5: data.normal_sagon_plant_area_more_5_acre
            }

            const plantTypeSadharanBans: PlantationDetailNew = {
              prajatiName: "साधारण बांस",
              plant_count_less_5: data.normal_bansh_no_of_plant_less_5_acre,
              area_size_less_5: data.normal_bansh_plant_area_less_5_acre,
              plant_count_more_5: data.normal_bansh_no_of_plant_more_5_acre,
              area_size_more_5: data.normal_bansh_plant_area_more_5_acre
            }

            const plantTypeMiliyaDubiya: PlantationDetailNew = {
              prajatiName: "मिलिया डुबिया",
              plant_count_less_5: data.miliya_dubiya_no_of_plant_less_5_acre,
              area_size_less_5: data.miliya_dubiya_plant_area_less_5_acre,
              plant_count_more_5: data.miliya_dubiya_no_of_plant_more_5_acre,
              area_size_more_5: data.miliya_dubiya_plant_area_more_5_acre
            }

            const plantTypeChandan: PlantationDetailNew = {
              prajatiName: "चंदन पौधा",
              plant_count_less_5: data.chandan_no_of_plant_less_5_acre,
              area_size_less_5: data.chandan_plant_area_less_5_acre,
              plant_count_more_5: data.chandan_no_of_plant_more_5_acre,
              area_size_more_5: data.chandan_plant_area_more_5_acre
            }

            const plantTypeOtherPlant: PlantationDetailNew = {
              prajatiName: "अन्य अतिरिक्त लाभकारी पौधा",
              plant_count_less_5: data.other_labhkari_no_of_plant_less_5_acre,
              area_size_less_5: data.other_labhkari_plan_area_less_5_acre,
              plant_count_more_5: data.other_labhkari_no_of_plant_more_5_acre,
              area_size_more_5: data.other_labhkari_plan_area_more_5_acre
            }

            const plantTypeTotalPlant: PlantationDetailNew = {
              prajatiName: "कुल",
              plant_count_less_5: data.total_number_of_plant_less_5_acre,
              area_size_less_5: data.total_area_less_5_acre,
              plant_count_more_5: data.total_number_of_plant_more_5_acre,
              area_size_more_5: data.total_area_more_5_acre
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

          });

        } else {
          this.longToast(response.response.message)
        }

      },
      async (error: any) => {
        this.dismissLoading();
        this.shortToast(error);
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

  updateTranslation() {
    this.langService.language$.subscribe((data: any) => {
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
    return this.authService.getOfficerData();
  }

  shouldShowApproveRejectButton(): boolean {
    if (this.authService.getOfficerData() != null) {

      const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;
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
        async (response: any) => {

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
        async (error: any) => {
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

    modal.onDidDismiss().then((result: any) => {
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
    window.open(url, '_system'); 
  }

}
