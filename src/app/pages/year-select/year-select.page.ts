import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

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
    { label: '2025-26', years: 2025 },
    { label: '2026-27', years: 2026 },
    { label: '2027-28', years: 2027 }
  ];

  userName = '';
  userDesignation: any;
  constructor(
    private storageService: StorageService,
    private router: Router
  ) { }

  async ngOnInit() {
    const rawUser = await this.storageService.get<any>('user_data');
    const user = this.parseUser(rawUser);
    this.userDesignation = user?.designation;
    console.log('Parsed User:', this.userDesignation);
    if (!user) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.userName = user?.user_name || '';
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

  async selectYear(year: number): Promise<void> {
    try {
      await this.storageService.set('current_year', year);
      await this.storageService.set('current_session', this.years.find(y => y.years === year)?.label || '');

      if (this.userDesignation === '4') {
        await this.router.navigateByUrl(
          '/officers-dashboard-ro',
          { replaceUrl: true }
        );
      }

      // else {
      //   await this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      // }

    } catch (error) {
      console.error('Failed to select year:', error);
    }
  }

}

