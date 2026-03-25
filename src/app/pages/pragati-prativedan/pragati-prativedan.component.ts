import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { LanguageService } from '../../services/language.service';
import { AlertController } from '@ionic/angular';
import { LoadingController, Platform } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { ModalController } from '@ionic/angular';
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
} from 'ionicons/icons';
import { SharedserviceService } from '../../services/sharedservice.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { MastersModelClass } from 'src/app/services/response_classes/GetMastsersResponseModel';

@Component({
  standalone: true,
  selector: 'app-pragati-prativedan',
  templateUrl: './pragati-prativedan.component.html',
  styleUrls: ['./pragati-prativedan.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule, NgSelectModule],
})

export class PragatiPrativedanComponent implements OnInit {
columnNumbers: any;
  formData: any = {};
  private loading: any;

  async exportToExcel() {
    await this.showToast('Export to Excel is not implemented yet');
  }

reportData: any;
  todayDate: string = '';
  fiencial_year: string = '';
  listOfCircle: MastersModelClass[] = [];
  listOfDivision: MastersModelClass[] = [];
  listOfRang: MastersModelClass[] = [];

  userDesignation: number = 0;
  isSuperAdmin: boolean = false;
  isCircleAdmin: boolean = false;
  isDivisionAdmin: boolean = false;
  isRO: boolean = false;


  goBack() {
    const user = this.authService.getOfficerData();
    if (user && user.designation) {
      const designation = Number(user.designation);
      let route = '/landingpage';
      
      switch (designation) {
        case 1:
          route = '/officers-dashboard-circle'; // Circle/CFO
          break;
        case 2:
          route = '/officers-dashboard'; // DFO
          break;
        case 3:
          route = '/officers-dashboard-sdo'; // SDO
          break;
        case 4:
          route = '/officers-dashboard-ro'; // RO
          break;
        case 6:
        case 7:
          route = '/officers-dashboard-supreme'; // SUPER ADMIN
          break;
      }
      this.router.navigateByUrl(route, { replaceUrl: true });
    } else {
      this.location.back();
    }
  }




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
    private httpClient: HttpClient,
    private authService: AuthServiceService,
    private storageService: StorageService
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
  
  
  async ngOnInit() { 
    const today = new Date();
    this.todayDate = today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const totalColumns = 41; 
    this.columnNumbers = Array.from({ length: totalColumns }, (_, i) => i + 1);

    this.fiencial_year = await this.storageService.get('current_session') || '';
    
    const user = this.authService.getOfficerData();
    if (user && user.designation) {
      this.userDesignation = Number(user.designation);
      if (this.userDesignation === 6 || this.userDesignation === 7) {
        this.isSuperAdmin = true;
      } else if (this.userDesignation === 1) {
        this.isCircleAdmin = true;
      } else if (this.userDesignation === 2 || this.userDesignation === 3) {
        this.isDivisionAdmin = true;
      } else if (this.userDesignation === 4) {
        this.isRO = true;
      }

      if (this.isRO) {
        this.loadReportData(Number(user.rang_id));
      } else if (this.isDivisionAdmin) {
        if (user.devision_id) {
          this.formData.division_id = Number(user.devision_id);
          this.loadRangesForDivision(this.formData.division_id);
        }
      } else if (this.isCircleAdmin) {
        if (user.circle_id) {
          this.formData.circle_id = Number(user.circle_id);
          this.loadDivisionsForCircle(this.formData.circle_id);
        }
      } else if (this.isSuperAdmin) {
        this.loadMasterData();
      }
    }
  } 

  async loadReportData(rangeId: number) {
    if (!rangeId) return;
    const curentSession = this.fiencial_year;
      
      const loading = await this.loadingController.create({
        message: 'Loading report data...',
        spinner: 'circles'
      });
      await loading.present();

      this.apiService.getPragatiPrativedanReport(rangeId, curentSession).subscribe({
        next: async (res: any) => {
          await loading.dismiss();
          if (res && res.success) {
            this.reportData = res.data;
            this.cdRef.detectChanges();
          } else {
            const toast = await this.toastController.create({
              message: res?.message || 'Failed to load report data',
              duration: 2000,
              position: 'bottom'
            });
            await toast.present();
          }
        },
        error: async (err: any) => {
          await loading.dismiss();
          const toast = await this.toastController.create({
            message: 'Error fetching report data',
            duration: 2000,
            position: 'bottom'
          });
          await toast.present();
        }
      });
  }
  
  loadMasterData() {
    this.showLoading('डेटा लोड हो रहा है...');
    
    this.apiService.getCircles().subscribe(
      (response) => {
        this.dismissLoading();
        
        // Parse the JSON response if it's a string
        let parsedResponse = response;
        if (typeof response === 'string') {
          parsedResponse = JSON.parse(response);
        }
        
        if (parsedResponse.response && parsedResponse.response.code === 200) {
          this.listOfCircle = parsedResponse.data || [];
        } else {
          this.showToast(parsedResponse.response?.msg || 'डेटा लोड करने में त्रुटि');
        }
      },
      (error) => {
        this.dismissLoading();
        this.showToast('डेटा लोड करने में त्रुटि');
      }
    );
  }

  loadDivisionsForCircle(circleId: any) {
    this.showLoading('डेटा लोड हो रहा है...');
    this.apiService.getDivision(circleId.toString()).subscribe(
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

  loadRangesForDivision(divisionId: any) {
    this.showLoading('डेटा लोड हो रहा है...');
    this.apiService.getRangesByDivision(divisionId.toString()).subscribe(
      (response) => {
        this.dismissLoading();
        if (response.response.code === 200) {
          this.listOfRang = response.data || [];
        } else {
          this.showToast(response.response.msg);
        }
      },
      (error) => {
        this.dismissLoading();
        this.showToast('परिक्षेत्र डेटा लोड करने में त्रुटि');
      }
    );
  }

  onCircleChange(event: any) {
    // Clear division and range when circle changes
    this.listOfDivision = [];
    this.formData.division_id = '';
    this.listOfRang = [];
    this.formData.range_id = '';
    this.reportData = null;
    
    // Get the ID from the selected object
    const circleId = event?.id || event;
    if (!circleId) return;    
    
    this.loadDivisionsForCircle(circleId);
  }
  async showLoading(message: string) {
    this.loading = await this.loadingController.create({
      message: message,
      spinner: 'circles'
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  async showToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  onDivisionChange(event: any) {
    // Clear range when division changes
    this.listOfRang = [];
    this.formData.range_id = '';
    this.reportData = null;
    
    // Get the ID from the selected object
    const divisionId = event?.id || event;
    if (!divisionId) return;
 
    this.loadRangesForDivision(divisionId);
  }

  onRangeChange(event: any) {
    const rangeId = event?.id || event;
    if (!rangeId) {
      this.reportData = null;
      return;
    }
    this.loadReportData(rangeId);
  }



}

