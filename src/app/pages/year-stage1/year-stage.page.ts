import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

type StageKey = 'first' | 'second' | 'third';

interface StageOption {
  key: StageKey;
  label: string;
  description: string;
}

@Component({
  selector: 'app-year-stage',
  templateUrl: './year-stage.page.html',
  styleUrls: ['./year-stage.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class YearStagePage implements OnInit {
  selectedYear: number | null = null;
  stageOptions: StageOption[] = [
    { key: 'first', label: 'प्रथम वर्ष', description: 'वर्तमान वर्ष का डैशबोर्ड' },
    { key: 'second', label: 'द्वितीय वर्ष', description: 'योजना निर्माणाधीन' },
    { key: 'third', label: 'तृतीय वर्ष', description: 'योजना निर्माणाधीन' },
  ];

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  async ngOnInit() {
    const [rawUser, year] = await Promise.all([
      this.storageService.get<any>('user_data'),
      this.storageService.get<number>('selected_year'),
    ]);
    const user = this.parseUser(rawUser);

    if (!user) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    if (!year) {
      this.router.navigateByUrl('/year-select', { replaceUrl: true });
      return;
    }

    this.selectedYear = year;
  }

  async selectStage(stage: StageKey) {
    await this.storageService.set('selected_stage', stage);

    if (stage === 'first') {
      await this.navigateToDashboard();
      return;
    }

    if (stage === 'second') {
      // Navigate to year-two-dashboard for 2nd year applications
      this.router.navigateByUrl('/year-two-dashboard');
      return;
    }

    if (stage === 'third') {
      // Navigate to year-three-dashboard for 3rd year applications
      this.router.navigateByUrl('/year-three-dashboard');
      return;
    }

    this.router.navigate(['/year-planning'], {
      queryParams: { stage },
    });
  }

  private async navigateToDashboard() {
    const rawUser = await this.storageService.get<any>('user_data');
    const user = this.parseUser(rawUser);

    if (!user) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    const designationId = this.extractDesignationId(user);
    const route = this.resolveRouteForDesignation(designationId);
    this.router.navigateByUrl(route);
  }

  private resolveRouteForDesignation(designationId: number | null | undefined) {
    switch (designationId) {
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
        return '/home';
    }
  }

  private extractDesignationId(user: any): number | null {
    if (!user) return null;
    const possibleValues = [
      user.designation_id,
      user.designation,
      user.DesignationId,
      user.designationId,
    ];

    for (const value of possibleValues) {
      const parsed = Number(value);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }

  private parseUser(raw: any) {
    if (!raw) {
      return null;
    }
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }
}

