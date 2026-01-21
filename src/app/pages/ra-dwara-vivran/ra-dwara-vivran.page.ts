import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonLabel, IonCardHeader, IonCardContent, IonCardTitle, IonCard, IonLoading, IonText, IonButton, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { RegistrationDetailsResponseModel } from './RegistrationDetailsResponseModel';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-ra-dwara-vivran',
  templateUrl: './ra-dwara-vivran.page.html',
  styleUrls: ['./ra-dwara-vivran.page.scss'],
  standalone: true,
  imports: [IonCardHeader, IonCardContent, IonCardTitle, IonCard, IonLoading, IonText, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RaDwaraVivranPage implements OnInit {

  isLoading: boolean = false;
  loadingMessage: string = 'कृपया प्रतीक्षा करें.....';
  
  registrationId: number = 0;
  registrationDetails: RegistrationDetailsResponseModel | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.registrationId = +params['id'];
        this.fetchRegistrationDetails();
      }
    });
  }

  fetchRegistrationDetails() {
    this.showDialog("आवेदन का विवरण प्राप्त कर रहे हैं...");
    
    this.apiService.getAllRegistrationDetails(this.registrationId).subscribe(
      (response) => {
        this.dismissDialog();
        
        if (response.response.code === 200 && response.response.data && response.response.data.length > 0) {
          this.registrationDetails = response.response.data[0] as RegistrationDetailsResponseModel;
          this.cdRef.detectChanges();
        } else {
          this.registrationDetails = null;
        }
      },
      (error) => {
        this.dismissDialog();
        console.error('Error fetching registration details:',error);
        this.registrationDetails = null;
      }
    );
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

  goBack() {
    this.router.navigateByUrl('/officers-dashboard-ro');
  }

}