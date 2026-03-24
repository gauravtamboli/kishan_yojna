import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';

@Component({
  selector: 'app-year-select',
  templateUrl: './year-select.page.html',
  styleUrls: ['./year-select.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class YearSelectPage implements OnInit {
  // years = [2025, 2026, 2027];

  years = [
    { label: '2025_26', years: 2025 },
    { label: '2026_27', years: 2026 },
    { label: '2027_28', years: 2027 }
  ];

  userName = '';
  userDesignation: any;
  constructor(
    private storageService: StorageService,
    private authService: AuthServiceService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = this.authService.getOfficerData();
    if (!user) {
      this.router.navigateByUrl('/officer-login', { replaceUrl: true });
      return;
    }

    this.userDesignation = user.designation;
    this.userName = user.officer_name || '';
    console.log('Parsed User:', this.userDesignation);
  }


  async selectYear(year: number): Promise<void> {
    try {
      await this.storageService.set('current_year', year);
      await this.storageService.set(
        'current_session',
        this.years.find(y => y.years === year)?.label || ''
      );

      const designation = Number(this.userDesignation);
      let route = '/not-found-page';

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

      await this.router.navigateByUrl(route, { replaceUrl: true });

    } catch (error) {
      console.error('Failed to select year:', error);
    }
  }

}

