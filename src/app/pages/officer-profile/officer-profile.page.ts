import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonText, IonAvatar, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, callOutline, businessOutline, ribbonOutline } from 'ionicons/icons';

@Component({
    selector: 'app-officer-profile',
    templateUrl: './officer-profile.page.html',
    styleUrls: ['./officer-profile.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonGrid, IonRow, IonCol, CommonModule, FormsModule]
})
export class OfficerProfilePage implements OnInit {
    officerData: OfficersLoginResponseModel | null = null;
    languageData: any = {};

    constructor(
        private navController: NavController,
        private langService: LanguageService
    ) {
        addIcons({ personOutline, mailOutline, callOutline, businessOutline, ribbonOutline });
    }

    ngOnInit() {
        this.updateTranslation();
        this.loadOfficerData();
    }

    updateTranslation() {
        this.langService.language$.subscribe((data) => {
            this.languageData = data;
        });
    }

    getTranslation(key: string) {
        return this.langService.getTranslation(key);
    }

    loadOfficerData() {
        const storedData = sessionStorage.getItem('logined_officer_data');
        if (storedData) {
            this.officerData = JSON.parse(storedData);
        }
    }

    goBack() {
        this.navController.back();
    }
}
