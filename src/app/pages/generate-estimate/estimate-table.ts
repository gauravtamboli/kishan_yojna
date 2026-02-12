import { Injectable } from '@angular/core';
import { EstimateService } from '../../services/estimate.service';

@Injectable({ providedIn: 'root' })
export class tableData {

  tableData: any = {
    प्रथम_वर्ष: [],
    द्वितीय_वर्ष: [],
    तृतीय_वर्ष: []
  };

  constructor(private estimateService: EstimateService) {
    this.init();
  }

  init() {
    this.estimateService.loadWorkPlanData();
    this.estimateService.workPlanData$.subscribe((data: any) => {
        if (!data) return;

      this.tableData.प्रथम_वर्ष.length = 0;
      this.tableData.द्वितीय_वर्ष.length = 0;
      this.tableData.तृतीय_वर्ष.length = 0;

      if (Array.isArray(data)) {
        this.tableData.प्रथम_वर्ष.push(...data.filter(x => x.year === 1));
        this.tableData.द्वितीय_वर्ष.push(...data.filter(x => x.year === 2));
        this.tableData.तृतीय_वर्ष.push(...data.filter(x => x.year === 3));
      } else if (typeof data === 'object') {
        if (data['प्रथम_वर्ष']) this.tableData.प्रथम_वर्ष.push(...data['प्रथम_वर्ष']);
        if (data['द्वितीय_वर्ष']) this.tableData.द्वितीय_वर्ष.push(...data['द्वितीय_वर्ष']);
        if (data['तृतीय_वर्ष']) this.tableData.तृतीय_वर्ष.push(...data['तृतीय_वर्ष']);
      }
    });
  }
}
