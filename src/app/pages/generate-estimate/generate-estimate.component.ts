import { AfterViewInit, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, Platform, ModalController, NavController, AlertController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedserviceService } from '../../services/sharedservice.service';
import { addIcons } from 'ionicons';
import { buildSharp, homeOutline, informationOutline, informationCircle, buildOutline, addCircleOutline, callOutline, addCircle, refreshCircleOutline, refreshOutline, boat } from 'ionicons/icons';
import { ChangeDetectorRef } from '@angular/core';
import { tableData } from './estimate-table'; // adjust path if needed

@Component({
  standalone: true,
  selector: 'app-generate-estimate',
  templateUrl: './generate-estimate.component.html',
  styleUrls: ['./generate-estimate.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})
export class GenerateEstimateComponent implements OnInit {


  awaden_kramank: string | null = null;
  reportData: any[] = []; // API response or mock data
  // response : any;
  loadingMessage: string = 'Please wait.....';
  isLoading: boolean = false;
  tableData: any;
  tableData1: any;
  tableData2: any;
  vanMandalAdhikari: string = '';
  upVanMandalAdhikari: string = '';
  vanParikshanAdhikari: string = '';

  //वनमंडलाधिकारी (DFO)
  vanMandalOptions = [
    { label: 'प्रस्तुत प्राकलन में सुधार कर पुनः भेजें |', value: '5' },
    { label: 'प्राकलन स्वीकृति है |', value: '6' },
  ];

  // उप-वनमंडलाधिकारी (SDO)
  upVanMandalOptions = [
    { label: 'प्राकलन जांच कर स्वीकृति हेतु अनुशंसा की जाती है |', value: '3' },
    { label: 'उपरोक्तानुसार प्राकलन स्वीकृति हेतु सादर प्रस्तुत है |', value: '4' },
  ];

  // वन परिक्षेत्र अधिकारी (RO)
  vanParikshanOptions = [
    { label: 'उपरोक्तानुसार प्राकलन स्वीकृति हेतु सादर प्रस्तुत है |', value: '2' }
  ];
  applicationNumber: any;

  chandan_total_plant: any;
  chandan_total_area: any;


  klonalnilgiri_total_plant: any;
  klonalnilgiri_total_area: any;

  miliyadubiya_total_plant: any;
  miliyadubiya_total_area: any;

  normal_sagon_total_plant: any;
  normal_sagon_total_area: any;

  other_labhkari_total_palnt: any;
  other_labhkari_total_area: any;

  tissueclturebans_total_palnt: any;
  tissueclturebans_total_area: any;


  tissueclturesagon_total_plant: any;
  tissueclturesagon_total_area: any;

  normalbans_total_plant: any;
  normalbans_total_area: any;
  klonalnilgiri_total_amount: any;
  totalKlonalAmount: any;
  totalPrathamVarshAmount: any;
  totalDwitiyaVarshAmount: any;
  totalTritiyaVarshAmount: any;


  grand_total: any;
  amountInWordsEnglish: any;
  totalTissueBansTritiyaVarsh: any;
  tissuebansGrandTotal: any;
  tissuebansAmountInWordsEnglish: any;

  totalTissueBansPrathamVarsh1: any;
  totalNormalBansPrathamVarsh: any;
  totalChandanPrathamVarsh: any;
  totalMiliyaDubiyaPrathamVarsh: any;
  totalNormalSagonPrathamVarsh: any;
  totalTissueSagonPrathamVarsh: any;
  totalOtherLabhkariPrathamVarsh: any;
  totalTissueBansPrathamVarsh: any;
  totalTissuebansDwitiyaVarsh2: any;
  totalTissueBansTritiyaVarsh3: any;
  totalNormalBansPrathamVarsh1: any;
  totalNormalBansDwitiyaVarsh2: any;
  totalNormalBansTritiyaVarsh3: any;
  normalBansGrandTotal: any;
  normalBansAmountInWordsEnglish: any;
  totalChandanDwitiyaVarsh: any;
  totalChandanTritiyaVarsh: any;
  chandanGrandTotal: any;
  chandanAmountInWordsEnglish: any;
  totalMiliyaDubiyaDwitiyaVarsh: any;
  totalMiliyaDubiyaTritiyaVarsh: any;
  miliyaDubiyaGrandTotal: any;
  miliyaDubiyaAmountInWordsEnglish: any;
  totalNormalSagonDwitiyaVarsh: any;
  totalNormalSagonTritiyaVarsh: any;
  normalSagonGrandTotal: any;
  normalSagonAmountInWordsEnglish: any;
  totalTissueSagonDwitiyaVarsh: any;
  totalTissueSagonTritiyaVarsh: any;
  tissueSagonGrandTotal: any;
  tissueSagonAmountInWordsEnglish: any;
  totalOtherLabhkariDwitiyaVarsh: any;
  totalOtherLabhkariTritiyaVarsh: any;
  otherLabhkariGrandTotal: any;
  otherLabhkariAmountInWordsEnglish: any;
  totalTissueBansPrathamVarshamount: any;
  totalTissuebansDwitiyaVarshamount: any;
  totalTissueBansTritiyaVarshamount: any;
  officer_name: any;




  constructor(
    private location: Location,
    private sharedService: SharedserviceService,
    private router: Router,
    private modalCtrl: ModalController,
    private platform: Platform,
    private navController: NavController,
    private apiService: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    public tableDataService: tableData // Inject tableData service
  ) {
    addIcons({
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
    });
  }

  ngOnInit() {
    // Get query param ?awaden_kramank=123
    this.route.queryParamMap.subscribe(params => {
      this.awaden_kramank = params.get('awaden_kramank');
    });

    this.route.queryParams.subscribe(params => {

      if (params['applicationNumber']) {

        this.applicationNumber = params['applicationNumber'];
        // console.log(this.applicationNumber = params['applicationNumber'])
        this.loadApplicationData(params['applicationNumber']);
      }

    })



    this.tableData = this.tableDataService.tableData['प्रथम_वर्ष'];
    this.tableData1 = this.tableDataService.tableData['द्वितीय_वर्ष'];
    this.tableData2 = this.tableDataService.tableData['तृतीय_वर्ष'];

    const storedData = sessionStorage.getItem('logined_officer_data');

    console.log('storedData :', storedData);
    this.officer_name = storedData ? JSON.parse(storedData).officer_name : '';

  }

  singleData: any;




  loadApplicationData(applicationNumber: string) {
    this.showLoading('आवेदन की जानकारी लोड हो रही है...');

    this.apiService.getSingleAwedanData(applicationNumber).subscribe({
      next: (response: any) => {
        this.dismissLoading();

        this.singleData = response?.response?.data?.[0];
        console.log('data :', this.singleData);

        if (!this.singleData) {
          console.warn('No data found for application number:', applicationNumber);
          // this.showToast('आवेदन डेटा नहीं मिला।');
          return;
        }

        const n = (val: any) => Number(val || 0);

        // Klonal Neelgiri
        this.klonalnilgiri_total_plant =
          n(this.singleData.klonalNeelgiriNoOfPlantLess5Acre) +
          n(this.singleData.klonalNeelgiriNoOfPlantMore5Acre);
        this.klonalnilgiri_total_area =
          n(this.singleData.klonalNeelgiriPlantAreaLess5Acre) +
          n(this.singleData.klonalNeelgiriPlantAreaMore5Acre);

        // Tissue Culture Bansh
        this.tissueclturebans_total_palnt =
          n(this.singleData.tishuCultureBanshNoOfPlantLess5Acre) +
          n(this.singleData.tishuCultureBanshNoOfPlantMore5Acre);
        this.tissueclturebans_total_area =
          n(this.singleData.tishuCultureBanshPlantAreaLess5Acre) +
          n(this.singleData.tishuCultureBanshPlantAreaMore5Acre);

        // Normal Bansh
        this.normalbans_total_plant =
          n(this.singleData.normalBanshNoOfPlantLess5Acre) +
          n(this.singleData.normalBanshNoOfPlantMore5Acre);
        this.normalbans_total_area =
          n(this.singleData.normalBanshPlantAreaLess5Acre) +
          n(this.singleData.normalBanshPlantAreaMore5Acre);

        // Chandan
        this.chandan_total_plant =
          n(this.singleData.chandanNoOfPlantLess5Acre) +
          n(this.singleData.chandanNoOfPlantMore5Acre);
        this.chandan_total_area =
          n(this.singleData.chandanPlantAreaLess5Acre) +
          n(this.singleData.chandanPlantAreaMore5Acre);

        // Miliya Dubiya
        this.miliyadubiya_total_plant =
          n(this.singleData.miliyaDubiyaNoOfPlantLess5Acre) +
          n(this.singleData.miliyaDubiyaNoOfPlantMore5Acre);
        this.miliyadubiya_total_area =
          n(this.singleData.miliyaDubiyaPlantAreaLess5Acre) +
          n(this.singleData.miliyaDubiyaPlantAreaMore5Acre);

        // Normal Sagon
        this.normal_sagon_total_plant =
          n(this.singleData.normalSagonNoOfPlantLess5Acre) +
          n(this.singleData.normalSagonNoOfPlantMore5Acre);
        this.normal_sagon_total_area =
          n(this.singleData.normalSagonPlantAreaLess5Acre) +
          n(this.singleData.normalSagonPlantAreaMore5Acre);

        // Tissue Culture Sagon
        this.tissueclturesagon_total_plant =
          n(this.singleData.tishuCultureSagonNoOfPlantLess5Acre) +
          n(this.singleData.tishuCultureSagonNoOfPlantMore5Acre);
        this.tissueclturesagon_total_area =
          n(this.singleData.tishuCultureSagonPlantAreaLess5Acre) +
          n(this.singleData.tishuCultureSagonPlantAreaMore5Acre);

        // Other Labhkari
        this.other_labhkari_total_palnt =
          n(this.singleData.otherLabhkariNoOfPlantLess5Acre) +
          n(this.singleData.otherLabhkariNoOfPlantMore5Acre);
        this.other_labhkari_total_area =
          n(this.singleData.otherLabhkariPlantAreaLess5Acre) +
          n(this.singleData.otherLabhkariPlantAreaMore5Acre);


        let totalPrathamVarsh = 0;
        let totalDwitiyaVarsh = 0;
        let totalTritiyaVarsh = 0;

        //1st year
        let totalTissueBansPrathamVarsh1 = 0;
        let totalNormalBansPrathamVarsh1 = 0;
        let totalChandanPrathamVarsh1 = 0;
        let totalMiliyaDubiyaPrathamVarsh1 = 0;
        let totalNormalSagonPrathamVarsh1 = 0;
        let totalTissueSagonPrathamVarsh1 = 0;
        let totalOtherLabhkariPrathamVarsh1 = 0;

        //2nd year
        let totalTissuebansDwitiyaVarsh2 = 0;
        let totalNormalBansDwitiyaVarsh2 = 0;
        let totalChandanDwitiyaVarsh2 = 0;
        let totalMiliyaDubiyaDwitiyaVarsh2 = 0;
        let totalNormalSagonDwitiyaVarsh2 = 0;
        let totalTissueSagonDwitiyaVarsh2 = 0;
        let totalOtherLabhkariDwitiyaVarsh2 = 0;

        //3rd year 
        let totalTissueBansTritiyaVarsh3 = 0;
        let totalNormalBansTritiyaVarsh3 = 0;
        let totalChandanTritiyaVarsh3 = 0;
        let totalMiliyaDubiyaTritiyaVarsh3 = 0;
        let totalNormalSagonTritiyaVarsh3 = 0;
        let totalTissueSagonTritiyaVarsh3 = 0;
        let totalOtherLabhkariTritiyaVarsh3 = 0;



        this.tableDataService.tableData['प्रथम_वर्ष'].forEach((item: any) => {
          const rate = Number(item.klonalNeelgiri) || 0;
          const totalPlant = Number(this.klonalnilgiri_total_plant) || 0;
          totalPrathamVarsh += rate * totalPlant;
          totalTissueBansPrathamVarsh1 += rate * (Number(this.tissueclturebans_total_palnt) || 0);
          totalNormalBansPrathamVarsh1 += rate * (Number(this.normalbans_total_plant) || 0);
          totalChandanPrathamVarsh1 += rate * (Number(this.chandan_total_plant) || 0);
          totalMiliyaDubiyaPrathamVarsh1 += rate * (Number(this.miliyadubiya_total_plant) || 0);
          totalNormalSagonPrathamVarsh1 += rate * (Number(this.normal_sagon_total_plant) || 0);
          totalTissueSagonPrathamVarsh1 += rate * (Number(this.tissueclturesagon_total_plant) || 0);
          totalOtherLabhkariPrathamVarsh1 += rate * (Number(this.other_labhkari_total_palnt) || 0);
        });

        this.tableDataService.tableData['द्वितीय_वर्ष'].forEach((item: any) => {
          const rate = Number(item.klonalNeelgiri) || 0;
          const totalPlant = Number(this.klonalnilgiri_total_plant) || 0;
          totalDwitiyaVarsh += rate * totalPlant;

          totalTissuebansDwitiyaVarsh2 += rate * (Number(this.tissueclturebans_total_palnt) || 0);
          totalNormalBansDwitiyaVarsh2 += rate * (Number(this.normalbans_total_plant) || 0);
          totalChandanDwitiyaVarsh2 += rate * (Number(this.chandan_total_plant) || 0);
          totalMiliyaDubiyaDwitiyaVarsh2 += rate * (Number(this.miliyadubiya_total_plant) || 0);
          totalNormalSagonDwitiyaVarsh2 += rate * (Number(this.normal_sagon_total_plant) || 0);
          totalTissueSagonDwitiyaVarsh2 += rate * (Number(this.tissueclturesagon_total_plant) || 0);
          totalOtherLabhkariDwitiyaVarsh2 += rate * (Number(this.other_labhkari_total_palnt) || 0);

        });

        this.tableDataService.tableData['तृतीय_वर्ष'].forEach((item: any) => {
          const rate = Number(item.klonalNeelgiri) || 0;
          const totalPlant = Number(this.klonalnilgiri_total_plant) || 0;
          totalTritiyaVarsh += rate * totalPlant;

          //calculate and asign

          totalTissueBansTritiyaVarsh3 += rate * (Number(this.tissueclturebans_total_palnt) || 0);
          totalNormalBansTritiyaVarsh3 += rate * (Number(this.normalbans_total_plant) || 0);
          totalChandanTritiyaVarsh3 += rate * (Number(this.chandan_total_plant) || 0);
          totalMiliyaDubiyaTritiyaVarsh3 += rate * (Number(this.miliyadubiya_total_plant) || 0);
          totalNormalSagonTritiyaVarsh3 += rate * (Number(this.normal_sagon_total_plant) || 0);
          totalTissueSagonTritiyaVarsh3 += rate * (Number(this.tissueclturesagon_total_plant) || 0);
          totalOtherLabhkariTritiyaVarsh3 += rate * (Number(this.other_labhkari_total_palnt) || 0);
        });


        //klonal nilgiri
        this.totalPrathamVarshAmount = totalPrathamVarsh;
        this.totalDwitiyaVarshAmount = totalDwitiyaVarsh;
        this.totalTritiyaVarshAmount = totalTritiyaVarsh;
        this.grand_total = totalPrathamVarsh + totalDwitiyaVarsh + totalTritiyaVarsh;
        this.amountInWordsEnglish = this.convertNumberToWords(this.grand_total);

        // Tissue Culture Bans
        this.totalTissueBansPrathamVarshamount = totalTissueBansPrathamVarsh1;
        this.totalTissuebansDwitiyaVarshamount = totalTissuebansDwitiyaVarsh2;
        this.totalTissueBansTritiyaVarshamount = totalTissueBansTritiyaVarsh3;

        this.tissuebansGrandTotal = totalTissueBansPrathamVarsh1 + totalTissuebansDwitiyaVarsh2 + totalTissueBansTritiyaVarsh3;
        this.tissuebansAmountInWordsEnglish = this.convertNumberToWords(this.tissuebansGrandTotal);

        // Normal Bans
        this.totalNormalBansPrathamVarsh1 = totalNormalBansPrathamVarsh1;
        this.totalNormalBansDwitiyaVarsh2 = totalNormalBansDwitiyaVarsh2;
        this.totalNormalBansTritiyaVarsh3 = totalNormalBansTritiyaVarsh3;
        this.normalBansGrandTotal = totalNormalBansPrathamVarsh1 + totalNormalBansDwitiyaVarsh2 + totalNormalBansTritiyaVarsh3;
        this.normalBansAmountInWordsEnglish = this.convertNumberToWords(this.normalBansGrandTotal);

        // Chandan
        this.totalChandanPrathamVarsh = totalChandanPrathamVarsh1;
        this.totalChandanDwitiyaVarsh = totalChandanDwitiyaVarsh2;
        this.totalChandanTritiyaVarsh = totalChandanTritiyaVarsh3;
        this.chandanGrandTotal = totalChandanPrathamVarsh1 + totalChandanDwitiyaVarsh2 + totalChandanTritiyaVarsh3;
        this.chandanAmountInWordsEnglish = this.convertNumberToWords(this.chandanGrandTotal);

        // Miliya Dubiya
        this.totalMiliyaDubiyaPrathamVarsh = totalMiliyaDubiyaPrathamVarsh1;
        this.totalMiliyaDubiyaDwitiyaVarsh = totalMiliyaDubiyaDwitiyaVarsh2;
        this.totalMiliyaDubiyaTritiyaVarsh = totalMiliyaDubiyaTritiyaVarsh3;

        this.miliyaDubiyaGrandTotal = totalMiliyaDubiyaPrathamVarsh1 + totalMiliyaDubiyaDwitiyaVarsh2 + totalMiliyaDubiyaTritiyaVarsh3;
        this.miliyaDubiyaAmountInWordsEnglish = this.convertNumberToWords(this.miliyaDubiyaGrandTotal);

        // Normal Sagon
        this.totalNormalSagonPrathamVarsh = totalNormalSagonPrathamVarsh1;
        this.totalNormalSagonDwitiyaVarsh = totalNormalSagonDwitiyaVarsh2;
        this.totalNormalSagonTritiyaVarsh = totalNormalSagonTritiyaVarsh3;
        this.normalSagonGrandTotal = totalNormalSagonPrathamVarsh1 + totalNormalSagonDwitiyaVarsh2 + totalNormalSagonTritiyaVarsh3;
        this.normalSagonAmountInWordsEnglish = this.convertNumberToWords(this.normalSagonGrandTotal);

        // Tissue Sagon
        this.totalTissueSagonPrathamVarsh = totalTissueSagonPrathamVarsh1;
        this.totalTissueSagonDwitiyaVarsh = totalTissueSagonDwitiyaVarsh2;
        this.totalTissueSagonTritiyaVarsh = totalTissueSagonTritiyaVarsh3;
        this.tissueSagonGrandTotal = totalTissueSagonPrathamVarsh1 + totalTissueSagonDwitiyaVarsh2 + totalTissueSagonTritiyaVarsh3;
        this.tissueSagonAmountInWordsEnglish = this.convertNumberToWords(this.tissueSagonGrandTotal);

        // Other Labhkari
        this.totalOtherLabhkariPrathamVarsh = totalOtherLabhkariPrathamVarsh1;
        this.totalOtherLabhkariDwitiyaVarsh = totalOtherLabhkariDwitiyaVarsh2;
        this.totalOtherLabhkariTritiyaVarsh = totalOtherLabhkariTritiyaVarsh3;

        this.otherLabhkariGrandTotal = totalOtherLabhkariPrathamVarsh1 + totalOtherLabhkariDwitiyaVarsh2 + totalOtherLabhkariTritiyaVarsh3;
        this.otherLabhkariAmountInWordsEnglish = this.convertNumberToWords(this.otherLabhkariGrandTotal);



      },
      error: (err) => {
        this.dismissLoading();
        console.error('API Error:', err);
        // this.showToast('डेटा लोड करने में त्रुटि हुई।');
      },
    });

    // Fetch plant-wise details from plant_request_new and map into totals
    this.apiService.getEstimateByApplication(applicationNumber).subscribe({
      next: (res: any) => {
        console.log('res', res);
        const rows = res?.data || [];
        const parseNum = (v: any) => {
          const num = Number(v);
          return isNaN(num) ? 0 : num;
        };

        // Reset totals sourced from plant_request_new
        let totalsByCategory: Record<string, number> = {
          klonalnilgiri: 0,
          tissueclturebans: 0,
          normalbans: 0,
          chandan: 0,
          miliyadubiya: 0,
          normal_sagon: 0,
          tissueclturesagon: 0,
          other_labhkari: 0,
        };

        // Also track total area per category from plant_request_new
        let areasByCategory: Record<string, number> = {
          klonalnilgiri: 0,
          tissueclturebans: 0,
          normalbans: 0,
          chandan: 0,
          miliyadubiya: 0,
          normal_sagon: 0,
          tissueclturesagon: 0,
          other_labhkari: 0,
        };

        const classify = (name: string): keyof typeof totalsByCategory | null => {
          const n = (name || '').toLowerCase();
          if (!n) return null;
          if (n.includes('नीलगिरी') || n.includes('neelgiri') || n.includes('nilgiri')) return 'klonalnilgiri';
          if ((n.includes('टिशू') || n.includes('tissue')) && (n.includes('बांस') || n.includes('bans') || n.includes('bamboo'))) return 'tissueclturebans';
          if (n.includes('बांस') || n.includes('bans') || n.includes('bamboo')) return 'normalbans';
          if (n.includes('चंदन') || n.includes('chandan') || n.includes('sandal')) return 'chandan';
          if (n.includes('मिलिया') || n.includes('डूबिया') || n.includes('miliya') || n.includes('dubia') || n.includes('melia')) return 'miliyadubiya';
          if ((n.includes('सागौन') || n.includes('sagon') || n.includes('teak')) && (n.includes('टिशू') || n.includes('tissue'))) return 'tissueclturesagon';
          if (n.includes('सागौन') || n.includes('sagon') || n.includes('teak')) return 'normal_sagon';
          return 'other_labhkari';
        };

        rows.forEach((r: any) => {
          // Classify 'Anya' plants by plant_id >= 8 per requirement
          const plantId = Number(r?.plant_id) || 0;
          const plantName = r?.plant_name || '';
          const category = plantId >= 8 ? 'other_labhkari' : classify(plantName);
          const count = parseNum(r?.total_tree) || parseNum(r?.estimated_required_trees);
          if (category) totalsByCategory[category] += count;
          const area = parseNum(r?.total_area);
          if (category) areasByCategory[category] += area;
        });

        // Override totals using ONLY plant_request_new response as per requirement
        if (Object.values(totalsByCategory).some(v => v > 0)) {
          this.klonalnilgiri_total_plant = totalsByCategory['klonalnilgiri'];
          this.tissueclturebans_total_palnt = totalsByCategory['tissueclturebans'];
          this.normalbans_total_plant = totalsByCategory['normalbans'];
          this.chandan_total_plant = totalsByCategory['chandan'];
          this.miliyadubiya_total_plant = totalsByCategory['miliyadubiya'];
          this.normal_sagon_total_plant = totalsByCategory['normal_sagon'];
          this.tissueclturesagon_total_plant = totalsByCategory['tissueclturesagon'];
          this.other_labhkari_total_palnt = totalsByCategory['other_labhkari'];

          // Set areas from response
          this.klonalnilgiri_total_area = areasByCategory['klonalnilgiri'];
          this.tissueclturebans_total_area = areasByCategory['tissueclturebans'];
          this.normalbans_total_area = areasByCategory['normalbans'];
          this.chandan_total_area = areasByCategory['chandan'];
          this.miliyadubiya_total_area = areasByCategory['miliyadubiya'];
          this.normal_sagon_total_area = areasByCategory['normal_sagon'];
          this.tissueclturesagon_total_area = areasByCategory['tissueclturesagon'];
          this.other_labhkari_total_area = areasByCategory['other_labhkari'];

          // Recalculate all amount totals based on the updated counts
          let totalPrathamVarsh = 0;
          let totalDwitiyaVarsh = 0;
          let totalTritiyaVarsh = 0;

          let totalTissueBansPrathamVarsh1 = 0;
          let totalNormalBansPrathamVarsh1 = 0;
          let totalChandanPrathamVarsh1 = 0;
          let totalMiliyaDubiyaPrathamVarsh1 = 0;
          let totalNormalSagonPrathamVarsh1 = 0;
          let totalTissueSagonPrathamVarsh1 = 0;
          let totalOtherLabhkariPrathamVarsh1 = 0;

          let totalTissuebansDwitiyaVarsh2 = 0;
          let totalNormalBansDwitiyaVarsh2 = 0;
          let totalChandanDwitiyaVarsh2 = 0;
          let totalMiliyaDubiyaDwitiyaVarsh2 = 0;
          let totalNormalSagonDwitiyaVarsh2 = 0;
          let totalTissueSagonDwitiyaVarsh2 = 0;
          let totalOtherLabhkariDwitiyaVarsh2 = 0;

          let totalTissueBansTritiyaVarsh3 = 0;
          let totalNormalBansTritiyaVarsh3 = 0;
          let totalChandanTritiyaVarsh3 = 0;
          let totalMiliyaDubiyaTritiyaVarsh3 = 0;
          let totalNormalSagonTritiyaVarsh3 = 0;
          let totalTissueSagonTritiyaVarsh3 = 0;
          let totalOtherLabhkariTritiyaVarsh3 = 0;

          this.tableDataService.tableData['प्रथम_वर्ष'].forEach((item: any) => {
            const rate = Number(item.klonalNeelgiri) || 0;
            const totalPlant = Number(this.klonalnilgiri_total_plant) || 0;
            totalPrathamVarsh += rate * totalPlant;
            totalTissueBansPrathamVarsh1 += rate * (Number(this.tissueclturebans_total_palnt) || 0);
            totalNormalBansPrathamVarsh1 += rate * (Number(this.normalbans_total_plant) || 0);
            totalChandanPrathamVarsh1 += rate * (Number(this.chandan_total_plant) || 0);
            totalMiliyaDubiyaPrathamVarsh1 += rate * (Number(this.miliyadubiya_total_plant) || 0);
            totalNormalSagonPrathamVarsh1 += rate * (Number(this.normal_sagon_total_plant) || 0);
            totalTissueSagonPrathamVarsh1 += rate * (Number(this.tissueclturesagon_total_plant) || 0);
            totalOtherLabhkariPrathamVarsh1 += rate * (Number(this.other_labhkari_total_palnt) || 0);
          });

          this.tableDataService.tableData['द्वितीय_वर्ष'].forEach((item: any) => {
            const rate = Number(item.klonalNeelgiri) || 0;
            const totalPlant = Number(this.klonalnilgiri_total_plant) || 0;
            totalDwitiyaVarsh += rate * totalPlant;
            totalTissuebansDwitiyaVarsh2 += rate * (Number(this.tissueclturebans_total_palnt) || 0);
            totalNormalBansDwitiyaVarsh2 += rate * (Number(this.normalbans_total_plant) || 0);
            totalChandanDwitiyaVarsh2 += rate * (Number(this.chandan_total_plant) || 0);
            totalMiliyaDubiyaDwitiyaVarsh2 += rate * (Number(this.miliyadubiya_total_plant) || 0);
            totalNormalSagonDwitiyaVarsh2 += rate * (Number(this.normal_sagon_total_plant) || 0);
            totalTissueSagonDwitiyaVarsh2 += rate * (Number(this.tissueclturesagon_total_plant) || 0);
            totalOtherLabhkariDwitiyaVarsh2 += rate * (Number(this.other_labhkari_total_palnt) || 0);
          });

          this.tableDataService.tableData['तृतीय_वर्ष'].forEach((item: any) => {
            const rate = Number(item.klonalNeelgiri) || 0;
            const totalPlant = Number(this.klonalnilgiri_total_plant) || 0;
            totalTritiyaVarsh += rate * totalPlant;
            totalTissueBansTritiyaVarsh3 += rate * (Number(this.tissueclturebans_total_palnt) || 0);
            totalNormalBansTritiyaVarsh3 += rate * (Number(this.normalbans_total_plant) || 0);
            totalChandanTritiyaVarsh3 += rate * (Number(this.chandan_total_plant) || 0);
            totalMiliyaDubiyaTritiyaVarsh3 += rate * (Number(this.miliyadubiya_total_plant) || 0);
            totalNormalSagonTritiyaVarsh3 += rate * (Number(this.normal_sagon_total_plant) || 0);
            totalTissueSagonTritiyaVarsh3 += rate * (Number(this.tissueclturesagon_total_plant) || 0);
            totalOtherLabhkariTritiyaVarsh3 += rate * (Number(this.other_labhkari_total_palnt) || 0);
          });

          this.totalPrathamVarshAmount = totalPrathamVarsh;
          this.totalDwitiyaVarshAmount = totalDwitiyaVarsh;
          this.totalTritiyaVarshAmount = totalTritiyaVarsh;
          this.grand_total = totalPrathamVarsh + totalDwitiyaVarsh + totalTritiyaVarsh;
          this.amountInWordsEnglish = this.convertNumberToWords(this.grand_total);

          this.totalTissueBansPrathamVarshamount = totalTissueBansPrathamVarsh1;
          this.totalTissuebansDwitiyaVarshamount = totalTissuebansDwitiyaVarsh2;
          this.totalTissueBansTritiyaVarshamount = totalTissueBansTritiyaVarsh3;
          this.tissuebansGrandTotal = totalTissueBansPrathamVarsh1 + totalTissuebansDwitiyaVarsh2 + totalTissueBansTritiyaVarsh3;
          this.tissuebansAmountInWordsEnglish = this.convertNumberToWords(this.tissuebansGrandTotal);

          this.totalNormalBansPrathamVarsh1 = totalNormalBansPrathamVarsh1;
          this.totalNormalBansDwitiyaVarsh2 = totalNormalBansDwitiyaVarsh2;
          this.totalNormalBansTritiyaVarsh3 = totalNormalBansTritiyaVarsh3;
          this.normalBansGrandTotal = totalNormalBansPrathamVarsh1 + totalNormalBansDwitiyaVarsh2 + totalNormalBansTritiyaVarsh3;
          this.normalBansAmountInWordsEnglish = this.convertNumberToWords(this.normalBansGrandTotal);

          this.totalChandanPrathamVarsh = totalChandanPrathamVarsh1;
          this.totalChandanDwitiyaVarsh = totalChandanDwitiyaVarsh2;
          this.totalChandanTritiyaVarsh = totalChandanTritiyaVarsh3;
          this.chandanGrandTotal = totalChandanPrathamVarsh1 + totalChandanDwitiyaVarsh2 + totalChandanTritiyaVarsh3;
          this.chandanAmountInWordsEnglish = this.convertNumberToWords(this.chandanGrandTotal);

          this.totalMiliyaDubiyaPrathamVarsh = totalMiliyaDubiyaPrathamVarsh1;
          this.totalMiliyaDubiyaDwitiyaVarsh = totalMiliyaDubiyaDwitiyaVarsh2;
          this.totalMiliyaDubiyaTritiyaVarsh = totalMiliyaDubiyaTritiyaVarsh3;
          this.miliyaDubiyaGrandTotal = totalMiliyaDubiyaPrathamVarsh1 + totalMiliyaDubiyaDwitiyaVarsh2 + totalMiliyaDubiyaTritiyaVarsh3;
          this.miliyaDubiyaAmountInWordsEnglish = this.convertNumberToWords(this.miliyaDubiyaGrandTotal);

          this.totalNormalSagonPrathamVarsh = totalNormalSagonPrathamVarsh1;
          this.totalNormalSagonDwitiyaVarsh = totalNormalSagonDwitiyaVarsh2;
          this.totalNormalSagonTritiyaVarsh = totalNormalSagonTritiyaVarsh3;
          this.normalSagonGrandTotal = totalNormalSagonPrathamVarsh1 + totalNormalSagonDwitiyaVarsh2 + totalNormalSagonTritiyaVarsh3;
          this.normalSagonAmountInWordsEnglish = this.convertNumberToWords(this.normalSagonGrandTotal);

          this.totalTissueSagonPrathamVarsh = totalTissueSagonPrathamVarsh1;
          this.totalTissueSagonDwitiyaVarsh = totalTissueSagonDwitiyaVarsh2;
          this.totalTissueSagonTritiyaVarsh = totalTissueSagonTritiyaVarsh3;
          this.tissueSagonGrandTotal = totalTissueSagonPrathamVarsh1 + totalTissueSagonDwitiyaVarsh2 + totalTissueSagonTritiyaVarsh3;
          this.tissueSagonAmountInWordsEnglish = this.convertNumberToWords(this.tissueSagonGrandTotal);

          this.totalOtherLabhkariPrathamVarsh = totalOtherLabhkariPrathamVarsh1;
          this.totalOtherLabhkariDwitiyaVarsh = totalOtherLabhkariDwitiyaVarsh2;
          this.totalOtherLabhkariTritiyaVarsh = totalOtherLabhkariTritiyaVarsh3;
          this.otherLabhkariGrandTotal = totalOtherLabhkariPrathamVarsh1 + totalOtherLabhkariDwitiyaVarsh2 + totalOtherLabhkariTritiyaVarsh3;
          this.otherLabhkariAmountInWordsEnglish = this.convertNumberToWords(this.otherLabhkariGrandTotal);

          this.cdRef.detectChanges();
        }
      },
      error: (e) => {
        console.warn('Estimate fetch failed, using form data totals.', e);
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

  showLoading(msg: string) {
    this.loadingMessage = msg;
    this.isLoading = true;
    this.cdRef.detectChanges();
  }

  dismissLoading() {
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  prnti_pdf() {
    alert("print not working yet");
  }


  convertNumberToHindiWords(num: number): string {
    const ones = ['', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
    const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

    const inWords = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' सौ ' + (n % 100 ? inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' हजार ' + (n % 1000 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' लाख ' + (n % 100000 ? inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' करोड़ ' + (n % 10000000 ? inWords(n % 10000000) : '');
    };

    return inWords(num).trim();
  }

  convertNumberToWords(num: number): string {
    if (num === 0) return 'Zero';
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

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



}
