import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-year-planning',
  templateUrl: './year-planning.page.html',
  styleUrls: ['./year-planning.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class YearPlanningPage implements OnInit {
  stageLabel = '';
  selectedYear: number | null = null;

  private stageMap: Record<string, string> = {
    second: 'द्वितीय वर्ष',
    third: 'तृतीय वर्ष',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    const stage = this.route.snapshot.queryParamMap.get('stage');
    this.stageLabel = stage ? this.stageMap[stage] ?? '' : '';

    if (!stage || !this.stageLabel) {
      this.router.navigateByUrl('/year-stage', { replaceUrl: true });
      return;
    }

    this.selectedYear = await this.storageService.get<number>('selected_year');
  }

  goBack() {
    this.router.navigateByUrl('/year-stage', { replaceUrl: true });
  }
}










