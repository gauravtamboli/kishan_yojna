import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstimateService {

  private workPlanDataSubject = new BehaviorSubject<any[]>([]);
  workPlanData$ = this.workPlanDataSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadWorkPlanData() {
    if (this.workPlanDataSubject.value.length > 0) {
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/api/KissanMitraYojnaRegisteration/GetAllEstimateTable`)
      .subscribe({
        next: (res) => this.workPlanDataSubject.next(res.data),
        error: (err) => console.error('API error', err)
      });
  }
}
