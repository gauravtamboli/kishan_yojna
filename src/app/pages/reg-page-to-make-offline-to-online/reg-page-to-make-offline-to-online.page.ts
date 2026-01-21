import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRouterOutlet, IonMenuToggle, IonMenu, IonMenuButton, IonList, IonAvatar, IonCardHeader, IonCardContent, IonCardTitle, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonItem, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonHeader, IonTitle, IonToolbar, IonIcon, IonContent, IonRadioGroup, IonRadio, IonTextarea, IonSelect, IonSelectOption, } from '@ionic/angular/standalone';
import { LanguageService } from '../../services/language.service';
import { NavController, MenuController } from '@ionic/angular';
import { Toast } from '@capacitor/toast';
import { ChangeDetectorRef } from '@angular/core';

import { ApiService } from 'src/app/services/api.service';

import { SharedserviceService } from 'src/app/services/sharedservice.service';

import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { appsOutline, homeOutline, informationOutline, informationCircle, buildOutline, personOutline, cardOutline, earthOutline, leafOutline, addCircleOutline, documentOutline, cloudUploadOutline, checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

import { Platform, AlertController } from '@ionic/angular';
import { NetworkCheckService } from 'src/app/services/network-check.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TableModule } from 'primeng/table'; // Import TableModule
import { GetAwedanResponseModel } from '../registeration-status/AwedanResponseList.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { MastersModelClass } from 'src/app/services/response_classes/GetMastsersResponseModel';

import { MessageDialogComponent } from 'src/app/message-dialog/message-dialog.component';
import { ModalController } from '@ionic/angular';
import { AddPlantDialogComponent } from 'src/app/add-plant-dialog/add-plant-dialog.component';
import { PlantationDetailNew } from '../view-awedan/SingleAwedanDataResponse.model';

import { Browser } from '@capacitor/browser';

@Component({
  selector: 'app-reg-page-to-make-offline-to-online',
  templateUrl: './reg-page-to-make-offline-to-online.page.html',
  styleUrls: ['./reg-page-to-make-offline-to-online.page.scss'],
  standalone: true,
  imports: [IonRadioGroup, IonRadio, IonCardHeader, IonCardContent, IonCardTitle, IonCard, IonLoading, IonText, IonButton, IonInput, IonLabel, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, TableModule, NgSelectModule, IonTextarea]
})
export class RegPageToMakeOfflineToOnlinePage implements OnInit {

  tableHeaders: string[] = [
    'हितग्राही का नाम',
    'पिता का नाम',
    'मोबाइल नंबर',
    'वृत्त (वन मंडल)',
    'जिले का नाम',
    'दस्तावेज'
  ];

  sendedAwedanObject: any;

  isConnected: boolean = false;

  languageData: any = {};

  isLoading: boolean = false;
  loadingMessage: string = 'Please wait.....';

  adhaar: string = "";
  selectedCastCatId: string = "";
  address: string = "";
  selectedBankName: string = "";
  ifsc_code: string = "";
  bank_account_no: string = "";
  khasra_no: string = "";
  selected_sand_type: string = "";
  selectedPlantationType: string = "";
  vriksharopan_akshansh: string = '0.0'
  vriksharopan_dikshansh: string = '0.0'

  halka_no: string = "";
  gram_panchayat_name: string = "";
  village_name: string = "";
  selectedYesNoForKakshaKramank: string = 'no';
  kaksha_kramank: string = '0'

  listOfBank: MastersModelClass[] = [];
  listOfSandType: MastersModelClass[] = [];
  sinchitOrA_sinchit: string = 'sinchit';


  total_ropit_area_less_than_5_acre: number = 0
  total_ropit_number_of_plant_less_than_5_acre: number = 0

  total_ropit_area_more_than_5_acre: number = 0
  total_ropit_number_of_plant_more_than_5_acre: number = 0

  other_labhkari_plant_area_less_than_5_acre: string = '0'
  other_labhkari_plan_no_less_than_5_acre: string = '0'
  other_labhkari_plant_area_more_than_5_acre: string = '0'
  other_labhkari_plan_no_more_than_5_acre: string = '0'


  chandan_area_less_than_5_acre: string = '0'
  chandan_plan_no_less_than_5_acre: string = '0'
  chandan_area_more_than_5_acre: string = '0'
  chandan_plan_no_more_than_5_acre: string = '0'



  milia_dubiya_area_less_than_5_acre: string = '0'
  milia_dubiya_plan_no_less_than_5_acre: string = '0'
  milia_dubiya_area_more_than_5_acre: string = '0'
  milia_dubiya_plan_no_more_than_5_acre: string = '0'


  normal_bansh_area_less_than_5_acre: string = '0'
  normal_bansh_plan_no_less_than_5_acre: string = '0'
  normal_bansh_area_more_than_5_acre: string = '0'
  normal_bansh_plan_no_more_than_5_acre: string = '0'



  normal_sagon_area_less_than_5_acre: string = '0'
  normal_sagon_plan_no_less_than_5_acre: string = '0'
  normal_sagon_area_more_than_5_acre: string = '0'
  normal_sagon_plan_no_more_than_5_acre: string = '0'



  tishu_culture_bans_area_less_than_5_acre: string = '0'
  tishu_culture_bans_plan_no_less_than_5_acre: string = '0'
  tishu_culture_bans_area_more_than_5_acre: string = '0'
  tishu_culture_bans_plan_no_more_than_5_acre: string = '0'




  tishu_culture_sagon_area_less_than_5_acre: string = '0'
  tishu_culture_sagon_plan_no_less_than_5_acre: string = '0'
  tishu_culture_sagon_area_more_than_5_acre: string = '0'
  tishu_culture_sagon_plan_no_more_than_5_acre: string = '0'


  klonal_neelgiri_area_less_than_5_acre: string = '0'
  klonal_neelgiri_plant_no_less_than_5_acre: string = '0'
  klonal_neelgiri_area_more_than_5_acre: string = '0'
  klonal_neelgiri_plant_no_more_than_5_acre: string = '0'




  /////////// ERROR TITLEs //////////
  wrong_adhar_msg: string = "";
  no_cast_selection_error: string = "";
  no_address_fill_error: string = "";

  no_bank_selection_error: string = "";
  no_ifsc_fill_error: string = "";
  no_bank_account_number_fill_error: string = "";

  no_village_name_fill_error: string = "";
  no_gram_panchayat_fill_error: string = "";
  no_halka_number_fill_error: string = "";
  no_khasra_number_fill_error: string = "";
  no_kaksh_kramank_number_fill_error: string = "";

  no_plantation_model_type_selection_error: string = "";
  no_sand_type_selection_error: string = "";
  no_document_error = "";


  listOfCastCategory = [
    { id: "1", name: "सामान्य" },
    { id: "2", name: "अनुसूचित पिछड़ा वर्ग" },
    { id: "3", name: "अनुसूचित जाति" },
    { id: "4", name: "अनुसूचित जन जाति" }
  ]

  listOfPlantationModel = [
    { id: "1", name: "ब्लॉक" },
    { id: "2", name: "खेत का मेड़" },
    { id: "3", name: "अंतरफसल (Intercropping)" },
  ]

  goBack() {
    this.navController.back();
  }

  constructor(private modalCtrl: ModalController, private location: Location, private alertController: AlertController, private route: ActivatedRoute, private router: Router, private menuCtrl: MenuController, private networkCheckService: NetworkCheckService, private platform: Platform, private navController: NavController, private langService: LanguageService, private cdRef: ChangeDetectorRef,
    private apiService: ApiService, private sharedServices: SharedserviceService) {

    this.route.queryParams.subscribe(params => {
      this.sendedAwedanObject = JSON.parse(params['offlineAwedanJson']);
    });

  }

  getApplicationNumber(): string {
    return this.sendedAwedanObject.application_number;
    //return this.sendedAwedanObject?.application_number;
  }

  async ngOnInit() {
    this.updateTranslation();
    this.getMasterList();
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

  async getMasterList() {

    //this.showLoading("कृपया प्रतीक्षा करें.....");

    this.apiService.getCircles().subscribe(
      async (response) => {

        this.dismissLoading();
        this.cdRef.detectChanges();

        if (response.response.code === 200) {

          this.listOfSandType = response.sand_type
          this.listOfBank = response.bank

          //this.cdRef.detectChanges();


        } else {
          this.longToast(response.response.msg)
        }


      },
      async (error) => {
        await this.dismissLoading();
        this.cdRef.detectChanges();
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

  isKakshKramankDisabled(): boolean {
    if (this.selectedYesNoForKakshaKramank === "yes") {
      return false;
    }
    return true;
  }

  onIsPlantationInLandRadioGroupChange() {
    this.kaksha_kramank = "";
  }

  calculateSumOfTotalPlants(isLessThan5Acre: boolean, isNumberOfPlanInput: boolean, isTotalAcreInput: boolean, event: any) {


    // if(event.target.value == ""){
    //   event.target.value = '0';
    //   return;
    // }

    if (isLessThan5Acre) {
      if (isNumberOfPlanInput) {
        let inputVal = Number(event.target.value);
        if (inputVal > 5000) {
          event.target.value = '';
          return;
        }
      }

      if (isTotalAcreInput) {
        let inputVal = Number(event.target.value);
        if (inputVal > 5) {
          event.target.value = '';
          return;
        }
      }

    } else {
      if (isTotalAcreInput) {
        let inputVal = Number(event.target.value);
        if (inputVal < 5) {
          event.target.value = '';
          return;
        }
      }
    }


    this.total_ropit_number_of_plant_less_than_5_acre =
      (Number(this.klonal_neelgiri_plant_no_less_than_5_acre) || 0) +
      (Number(this.tishu_culture_sagon_plan_no_less_than_5_acre) || 0) +
      (Number(this.tishu_culture_bans_plan_no_less_than_5_acre) || 0) +
      (Number(this.normal_sagon_plan_no_less_than_5_acre) || 0) +
      (Number(this.normal_bansh_plan_no_less_than_5_acre) || 0) +
      (Number(this.milia_dubiya_plan_no_less_than_5_acre) || 0) +
      (Number(this.chandan_plan_no_less_than_5_acre) || 0) +
      (Number(this.other_labhkari_plan_no_less_than_5_acre) || 0);


    this.total_ropit_area_less_than_5_acre =
      (Number(this.klonal_neelgiri_area_less_than_5_acre) || 0) +
      (Number(this.tishu_culture_sagon_area_less_than_5_acre) || 0) +
      (Number(this.tishu_culture_bans_area_less_than_5_acre) || 0) +
      (Number(this.normal_sagon_area_less_than_5_acre) || 0) +
      (Number(this.normal_bansh_area_less_than_5_acre) || 0) +
      (Number(this.milia_dubiya_area_less_than_5_acre) || 0) +
      (Number(this.chandan_area_less_than_5_acre) || 0) +
      (Number(this.other_labhkari_plant_area_less_than_5_acre) || 0);






    this.total_ropit_number_of_plant_more_than_5_acre =
      (Number(this.klonal_neelgiri_plant_no_more_than_5_acre) || 0) +
      (Number(this.tishu_culture_sagon_plan_no_more_than_5_acre) || 0) +
      (Number(this.tishu_culture_bans_plan_no_more_than_5_acre) || 0) +
      (Number(this.normal_sagon_plan_no_more_than_5_acre) || 0) +
      (Number(this.normal_bansh_plan_no_more_than_5_acre) || 0) +
      (Number(this.milia_dubiya_plan_no_more_than_5_acre) || 0) +
      (Number(this.chandan_plan_no_more_than_5_acre) || 0) +
      (Number(this.other_labhkari_plan_no_more_than_5_acre) || 0);


    this.total_ropit_area_more_than_5_acre =
      (Number(this.klonal_neelgiri_area_more_than_5_acre) || 0) +
      (Number(this.tishu_culture_sagon_area_more_than_5_acre) || 0) +
      (Number(this.tishu_culture_bans_area_more_than_5_acre) || 0) +
      (Number(this.normal_sagon_area_more_than_5_acre) || 0) +
      (Number(this.normal_bansh_area_more_than_5_acre) || 0) +
      (Number(this.milia_dubiya_area_more_than_5_acre) || 0) +
      (Number(this.chandan_area_more_than_5_acre) || 0) +
      (Number(this.other_labhkari_plant_area_more_than_5_acre) || 0);



  }

  pdfFile: File | null = null;

  onDocPdfFileSelect(event: any) {
    this.pdfFile = event.target.files[0];
  }

  async doYouWantToCancelDialog() {
    // const alert = await this.alertController.create({
    //   message: 'क्या आप वास्तव में कैंसिल करना चाहते हैं?',
    //   buttons: [
    //     {
    //       text: 'नहीं',
    //       role: 'cancel',
    //       cssClass: 'secondary',
    //     },
    //     {
    //       text: 'हाँ',
    //       handler: () => {
    //         this.goBack();
    //       }
    //     }
    //   ]
    // });

    // await alert.present();

    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: 'क्या आप वास्तव में कैंसिल करना चाहते हैं?',
        isYesNo: true
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result.data?.confirmed) {
        this.goBack();
      }
    });

    await modal.present();

  }



  submitFormData() {

    this.wrong_adhar_msg = ""
    this.no_cast_selection_error = ""
    this.no_address_fill_error = "";
    this.no_bank_selection_error = "";
    this.no_ifsc_fill_error = "";
    this.no_bank_account_number_fill_error = "";
    this.no_village_name_fill_error = "";
    this.no_gram_panchayat_fill_error = "";
    this.no_halka_number_fill_error = "";
    this.no_khasra_number_fill_error = "";
    this.no_kaksh_kramank_number_fill_error = "";
    this.no_plantation_model_type_selection_error = "";
    this.no_sand_type_selection_error = "";
    this.no_document_error = "";


    if (this.selectedCastCatId === "") {
      this.no_cast_selection_error = "जाति वर्ग चुनें";
      this.shortToast("जाति वर्ग चुनें");
      return;
    }

    if (this.adhaar === "") {
      this.wrong_adhar_msg = "आधार कार्ड नम्बर डालें";
      this.shortToast("आधार कार्ड नम्बर");
      return;
    }

    if (this.adhaar.toString().length != 12) {
      this.wrong_adhar_msg = "सही आधार कार्ड नम्बर डालें";
      this.shortToast("सही आधार कार्ड नम्बर डालें");
      return;
    }

    if (this.address === "") {
      this.no_address_fill_error = "पता";
      this.shortToast("पता");
      return;
    }

    if (this.selectedBankName === "") {
      this.no_bank_selection_error = "बैंक का नाम";
      this.shortToast("बैंक का नाम");
      return;
    }

    if (this.ifsc_code === "") {
      this.no_ifsc_fill_error = "IFSC कोड़";
      this.shortToast("IFSC कोड़");
      return;
    }

    if (this.bank_account_no === "") {
      this.no_bank_account_number_fill_error = "बैंक खाता नम्बर";
      this.shortToast("बैंक खाता नम्बर");
      return;
    }

    if (this.village_name === "") {
      this.no_village_name_fill_error = "ग्राम का नाम";
      this.shortToast("ग्राम का नाम");
      return;
    }

    if (this.gram_panchayat_name === "") {
      this.no_gram_panchayat_fill_error = "ग्राम पंचायत का नाम";
      this.shortToast("ग्राम पंचायत का नाम");
      return;
    }

    if (this.halka_no === "") {
      this.no_halka_number_fill_error = "पटवारी हल्का नम्बर";
      this.shortToast("पटवारी हल्का नम्बर");
      return;
    }


    if (this.khasra_no === "") {
      this.no_khasra_number_fill_error = "खसरा नम्बर";
      this.shortToast("खसरा नम्बर");
      return;
    }

    if (this.selectedYesNoForKakshaKramank === "yes" &&
      this.kaksha_kramank === "") {
      this.no_kaksh_kramank_number_fill_error = "कक्ष क्रमांक";
      this.shortToast("कक्ष क्रमांक");
      return;
    }

    if (this.selectedPlantationType === "") {
      this.no_plantation_model_type_selection_error = "वृक्षारोपण माॅडल का प्रकार चुनें";
      this.shortToast("वृक्षारोपण माॅडल का प्रकार चुनें");
      return;
    }

    if (this.selected_sand_type === "") {
      this.shortToast("मिट्टी का प्रकार");
      this.no_sand_type_selection_error = "मिट्टी का प्रकार";
      return;
    }

    if (this.vriksharopan_akshansh === "") {
      this.shortToast("वृक्षारोपण क्षेत्र अक्षांश");
      return;
    }

    if (this.vriksharopan_dikshansh === "") {
      this.shortToast("वृक्षारोपण क्षेत्र देक्षांश");
      return;
    }

    // extract value from listof plant and add into single models //
    for (let i = 0; i < this.listOfPlantationDetailsNew.length; i++) {
      const item = this.listOfPlantationDetailsNew[i];
      if (item.prajatiName === 'क्लोनल नीलगिरी') {
        this.klonal_neelgiri_plant_no_less_than_5_acre =
          item.plant_count_less_5;
        this.klonal_neelgiri_plant_no_more_than_5_acre =
          item.plant_count_more_5;
        this.klonal_neelgiri_area_less_than_5_acre = item.area_size_less_5;
        this.klonal_neelgiri_area_more_than_5_acre = item.area_size_more_5;
      }
      if (item.prajatiName === 'टिश्यू कल्चर सागौन') {
        this.tishu_culture_sagon_plan_no_less_than_5_acre =
          item.plant_count_less_5;
        this.tishu_culture_sagon_plan_no_more_than_5_acre =
          item.plant_count_more_5;
        this.tishu_culture_sagon_area_less_than_5_acre = item.area_size_less_5;
        this.tishu_culture_sagon_area_more_than_5_acre = item.area_size_more_5;
      }
      if (item.prajatiName === 'टिश्यू कल्चर बांस') {
        this.tishu_culture_bans_plan_no_less_than_5_acre =
          item.plant_count_less_5;
        this.tishu_culture_bans_plan_no_more_than_5_acre =
          item.plant_count_more_5;
        this.tishu_culture_bans_area_less_than_5_acre = item.area_size_less_5;
        this.tishu_culture_bans_area_more_than_5_acre = item.area_size_more_5;
      }
      if (item.prajatiName === 'साधारण बांस') {
        this.normal_bansh_plan_no_less_than_5_acre = item.plant_count_less_5;
        this.normal_bansh_plan_no_more_than_5_acre = item.plant_count_more_5;
        this.normal_bansh_area_less_than_5_acre = item.area_size_less_5;
        this.normal_bansh_area_more_than_5_acre = item.area_size_more_5;
      }
      if (item.prajatiName === 'साधारण सागौन') {
        this.normal_sagon_plan_no_less_than_5_acre = item.plant_count_less_5;
        this.normal_sagon_plan_no_more_than_5_acre = item.plant_count_more_5;
        this.normal_sagon_area_less_than_5_acre = item.area_size_less_5;
        this.normal_sagon_area_more_than_5_acre = item.area_size_more_5;
      }
      if (item.prajatiName === 'मिलिया डुबिया') {
        this.milia_dubiya_plan_no_less_than_5_acre = item.plant_count_less_5;
        this.milia_dubiya_plan_no_more_than_5_acre = item.plant_count_more_5;
        this.milia_dubiya_area_less_than_5_acre = item.area_size_less_5;
        this.milia_dubiya_area_more_than_5_acre = item.area_size_more_5;
      }
      if (item.prajatiName === 'चंदन पौधा') {
        this.chandan_plan_no_less_than_5_acre = item.plant_count_less_5;
        this.chandan_plan_no_more_than_5_acre = item.plant_count_more_5;
        this.chandan_area_less_than_5_acre = item.area_size_less_5;
        this.chandan_area_more_than_5_acre = item.area_size_more_5;
      }
      if (item.prajatiName === 'अन्य अतिरिक्त लाभकारी पौधा') {
        this.other_labhkari_plan_no_less_than_5_acre = item.plant_count_less_5;
        this.other_labhkari_plan_no_more_than_5_acre = item.plant_count_more_5;
        this.other_labhkari_plant_area_less_than_5_acre = item.area_size_less_5;
        this.other_labhkari_plant_area_more_than_5_acre = item.area_size_more_5;
      }
    }

    for (let i = 0; i < this.listOfPlantationDetailsNewTotal.length; i++) {
      const item = this.listOfPlantationDetailsNewTotal[i];
      this.total_ropit_number_of_plant_less_than_5_acre = Number(
        item.plant_count_less_5
      );
      this.total_ropit_number_of_plant_more_than_5_acre = Number(
        item.plant_count_more_5
      );

      this.total_ropit_area_less_than_5_acre = Number(item.area_size_less_5);
      this.total_ropit_area_more_than_5_acre = Number(item.area_size_more_5);
    }

    if (this.listOfPlantationDetailsNewTotal.length == 0) {

      this.showErrorDialogIfNoAnyPlanEntry(
        'कृपया कम से कम 1 प्रजाति के पौधों की संख्या और क्षेत्र की जानकारी डालें '
      );
      return;
    }

    if ((this.total_ropit_number_of_plant_less_than_5_acre === 0 ||
      this.total_ropit_area_less_than_5_acre === 0) &&
      (this.total_ropit_number_of_plant_more_than_5_acre === 0 ||
        this.total_ropit_area_more_than_5_acre === 0)) {
      this.shortToast("कृपया कम से कम 1 प्रजाति के पौधों की संख्या और क्षेत्र की जानकारी डालें ");
      this.showErrorDialogIfNoAnyPlanEntry("कृपया कम से कम 1 प्रजाति के पौधों की संख्या और क्षेत्र की जानकारी डालें ");
      return;
    }



    if (this.pdfFile == null) {
      this.no_document_error = "दस्तावेज की फाइल आवश्यक है";
      this.shortToast("दस्तावेज की फाइल आवश्यक है");
      return;
    }


    const formData = new FormData();
    formData.append('File', this.pdfFile);

    formData.append('circle_id', this.sendedAwedanObject.circle_id);
    formData.append('division_id', this.sendedAwedanObject.division_id);
    formData.append('dist_id', this.sendedAwedanObject.dist_id);
    formData.append('rang_id', this.sendedAwedanObject.rang_id);

    formData.append('hitgrahi_name', this.sendedAwedanObject.hitgrahi_name);
    formData.append('father_name', this.sendedAwedanObject.father_name);
    formData.append('cast_category', this.selectedCastCatId);
    formData.append('aadhar_no', this.adhaar);

    formData.append('mobile', this.sendedAwedanObject.mobile_no);
    formData.append('address', this.address);
    formData.append('bank_name', this.selectedBankName);
    formData.append('ifsc_code', this.adhaar);

    formData.append('account_no', this.bank_account_no);
    formData.append('khasra_no', this.khasra_no);
    formData.append('kaksha_kramank', this.kaksha_kramank);
    formData.append('halka_no', this.halka_no);

    formData.append('village_name', this.village_name);
    formData.append('gram_panchayat_name', this.gram_panchayat_name);
    formData.append('vrikharopan_year', "");
    formData.append('sand_type', this.selected_sand_type);

    formData.append('vrikharopan_gap', "");
    formData.append('sinchit_asinchit', this.sinchitOrA_sinchit);
    formData.append('vrikharopan_akshansh', this.vriksharopan_akshansh);
    formData.append('vrikharopan_dikshansh', this.vriksharopan_dikshansh);
    formData.append('planation_type', this.selectedPlantationType);

    // LESS 5 acre //
    formData.append('klonal_neelgiri_no_of_plant_less_5_acre', this.klonal_neelgiri_plant_no_less_than_5_acre);
    formData.append('klonal_neelgiri_plan_area_less_5_acre', this.klonal_neelgiri_area_less_than_5_acre);

    formData.append('tishu_culture_sagon_no_of_plant_less_5_acre', this.tishu_culture_bans_plan_no_less_than_5_acre);
    formData.append('tishu_culture_sagon_plant_area_less_5_acre', this.tishu_culture_sagon_area_less_than_5_acre);

    formData.append('tishu_culture_bansh_no_of_plant_less_5_acre', this.tishu_culture_bans_plan_no_less_than_5_acre);
    formData.append('tishu_culture_bansh_plant_area_less_5_acre', this.tishu_culture_bans_area_less_than_5_acre);

    formData.append('normal_sagon_no_of_plant_less_5_acre', this.normal_sagon_plan_no_less_than_5_acre);
    formData.append('normal_sagon_plant_area_less_5_acre', this.normal_sagon_area_less_than_5_acre);

    formData.append('normal_bansh_no_of_plant_less_5_acre', this.normal_bansh_plan_no_less_than_5_acre);
    formData.append('normal_bansh_plant_area_less_5_acre', this.normal_bansh_area_less_than_5_acre);

    formData.append('miliya_dubiya_no_of_plant_less_5_acre', this.milia_dubiya_plan_no_less_than_5_acre);
    formData.append('miliya_dubiya_plant_area_less_5_acre', this.milia_dubiya_area_less_than_5_acre);

    formData.append('chandan_no_of_plant_less_5_acre', this.chandan_plan_no_less_than_5_acre);
    formData.append('chandan_plant_area_less_5_acre', this.chandan_area_less_than_5_acre);

    formData.append('other_labhkari_no_of_plant_less_5_acre', this.other_labhkari_plan_no_less_than_5_acre);
    formData.append('other_labhkari_plan_area_less_5_acre', this.other_labhkari_plant_area_less_than_5_acre);

    formData.append('total_no_of_plant_less_5_acre', this.total_ropit_number_of_plant_less_than_5_acre.toString());
    formData.append('total_plan_area_less_5_acre', this.total_ropit_area_less_than_5_acre.toString());


    ////////////////////////////////END///////////////////////////////////////



    // MORE 5 acre //
    formData.append('klonal_neelgiri_no_of_plant_more_5_acre', this.klonal_neelgiri_plant_no_more_than_5_acre);
    formData.append('klonal_neelgiri_plan_area_more_5_acre', this.klonal_neelgiri_area_more_than_5_acre);

    formData.append('tishu_culture_sagon_no_of_plant_more_5_acre', this.tishu_culture_bans_plan_no_more_than_5_acre);
    formData.append('tishu_culture_sagon_plant_area_more_5_acre', this.tishu_culture_sagon_area_more_than_5_acre);

    formData.append('tishu_culture_bansh_no_of_plant_more_5_acre', this.tishu_culture_bans_plan_no_more_than_5_acre);
    formData.append('tishu_culture_bansh_plant_area_more_5_acre', this.tishu_culture_bans_area_more_than_5_acre);

    formData.append('normal_sagon_no_of_plant_more_5_acre', this.normal_sagon_plan_no_more_than_5_acre);
    formData.append('normal_sagon_plant_area_more_5_acre', this.normal_sagon_area_more_than_5_acre);

    formData.append('normal_bansh_no_of_plant_more_5_acre', this.normal_bansh_plan_no_more_than_5_acre);
    formData.append('normal_bansh_plant_area_more_5_acre', this.normal_bansh_area_more_than_5_acre);

    formData.append('miliya_dubiya_no_of_plant_more_5_acre', this.milia_dubiya_plan_no_more_than_5_acre);
    formData.append('miliya_dubiya_plant_area_more_5_acre', this.milia_dubiya_area_more_than_5_acre);

    formData.append('chandan_no_of_plant_more_5_acre', this.chandan_plan_no_more_than_5_acre);
    formData.append('chandan_plant_area_more_5_acre', this.chandan_area_more_than_5_acre);

    formData.append('other_labhkari_no_of_plant_more_5_acre', this.other_labhkari_plan_no_more_than_5_acre);
    formData.append('other_labhkari_plan_area_more_5_acre', this.other_labhkari_plant_area_more_than_5_acre);

    formData.append('total_no_of_plant_more_5_acre', this.total_ropit_number_of_plant_more_than_5_acre.toString());
    formData.append('total_plan_area_more_5_acre', this.total_ropit_area_more_than_5_acre.toString());
    ////////////////////////////////END///////////////////////////////////////

    const officersLoginModel = this.getOfficersSessionData() as OfficersLoginResponseModel;

    formData.append('updated_by', officersLoginModel.officerId.toString());

    formData.append('offline_awedan_table_id', this.sendedAwedanObject.regTableId);



    this.showLoading("आवेदन जमा किया जा रहा है कृपया इंतजार करें");
    this.apiService.makeOfflineAwedanToOnlineAwedan(formData).subscribe(
      (response) => {

        this.dismissLoading();

        if (response.response.code === 200) {
          this.afterSubmitAwedanSuccessfully(response.response.msg);
        } else {
          this.longToast(response.response.msg);
        }


      },
      (error) => {
        this.dismissLoading();
        this.longToast(error);
      }
    );

  }

  afterSubmitAwedanDialog: any;

  async afterSubmitAwedanSuccessfully(msg: string) {
    
    this.afterSubmitAwedanDialog = await this.alertController.create({
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: () => {

            // setting true to refresh
            this.sharedServices.setRefresh(true);
            ////////////////////////////
            this.afterSubmitAwedanDialog.dismiss();
            this.goBack();
            return false;
          },
        }
      ],
      backdropDismiss: false
    });

    await this.afterSubmitAwedanDialog.present();

  }


  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  }

  async showErrorDialogIfNoAnyPlanEntry(msg: string) {
    // const alert = await this.alertController.create({
    //   header: 'ℹ️ Alert',
    //   message: msg,
    //   cssClass: 'auto-dismiss-alert',
    //   backdropDismiss: false,
    //   buttons: [
    //     {
    //       text: 'OK',
    //       role: 'cancel',
    //       cssClass: 'secondary'
    //     }
    //   ]
    // });

    // await alert.present();

    // setTimeout(() => {
    //   alert.dismiss();
    // }, 2000);


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

  async openUploadedDocument(model: GetAwedanResponseModel) {
    
    await Browser.open({ url: model.adhar_pdfFilePath });
    //const browser = this.iab.create(model.pdfFilePath, '_system');
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
      ////debugger;
      if (result.data?.confirmed) {

        const addedJson = JSON.parse(
          this.sharedServices.getAddedPlanJson()
        ) as PlantationDetailNew;

        const alreadyAdded = this.listOfPlantationDetailsNew.find(
          (plant) => plant.prajatiName === addedJson.prajatiName
        );

        if (!alreadyAdded) {
          this.listOfPlantationDetailsNew.push(addedJson);

          let less_5_total_plant = 0;
          let less_5_total_area = 0;
          let more_5_total_plant = 0;
          let more_5_total_area = 0;

          for (let i = 0; i < this.listOfPlantationDetailsNew.length; i++) {
            const item = this.listOfPlantationDetailsNew[i];

            less_5_total_plant =
              Number(item.plant_count_less_5) + less_5_total_plant;
            more_5_total_plant =
              Number(item.plant_count_more_5) + more_5_total_plant;

            less_5_total_area =
              Number(item.area_size_less_5) + less_5_total_area;
            more_5_total_area =
              Number(item.area_size_more_5) + more_5_total_area;

            this.listOfPlantationDetailsNewTotal = [];

            const plantTypeTotalPlant: PlantationDetailNew = {
              prajatiName: 'कुल',
              plant_count_less_5: less_5_total_plant.toString(),
              area_size_less_5: less_5_total_area.toString(),
              plant_count_more_5: more_5_total_plant.toString(),
              area_size_more_5: more_5_total_area.toString(),
            };

            this.listOfPlantationDetailsNewTotal.push(plantTypeTotalPlant);
          }

          this.cdRef.detectChanges();
        } else {
          this.longToast(
            `${alreadyAdded.prajatiName} की जानकारी पहले ही डाली जा चुकी है`
          );
        }
      }
    });

    await modal.present();
  }

  listOfPlantationDetailsNew: PlantationDetailNew[] = [];
  listOfPlantationDetailsNewTotal: PlantationDetailNew[] = [];


  deletePlant(item: PlantationDetailNew) {
    const index = this.listOfPlantationDetailsNew.findIndex(
      (plant) => plant.prajatiName === item.prajatiName
    );

    if (index !== -1) {
      this.listOfPlantationDetailsNew.splice(index, 1);
    }

    let less_5_total_plant = 0;
    let less_5_total_area = 0;
    let more_5_total_plant = 0;
    let more_5_total_area = 0;

    if (this.listOfPlantationDetailsNew.length > 0) {
      for (let i = 0; i < this.listOfPlantationDetailsNew.length; i++) {
        const item = this.listOfPlantationDetailsNew[i];

        less_5_total_plant =
          Number(item.plant_count_less_5) + less_5_total_plant;
        more_5_total_plant =
          Number(item.plant_count_more_5) + more_5_total_plant;

        less_5_total_area =
          Number(item.area_size_less_5) + less_5_total_area;
        more_5_total_area =
          Number(item.area_size_more_5) + more_5_total_area;

        this.listOfPlantationDetailsNewTotal = [];

        const plantTypeTotalPlant: PlantationDetailNew = {
          prajatiName: 'कुल',
          plant_count_less_5: less_5_total_plant.toString(),
          area_size_less_5: less_5_total_area.toString(),
          plant_count_more_5: more_5_total_plant.toString(),
          area_size_more_5: more_5_total_area.toString(),
        };

        this.listOfPlantationDetailsNewTotal.push(plantTypeTotalPlant);
      }
    } else {
      this.listOfPlantationDetailsNewTotal = [];
    }

    this.cdRef.detectChanges();

  }

}
