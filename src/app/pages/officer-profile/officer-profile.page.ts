import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonText, IonAvatar, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent, IonIcon, IonGrid, IonRow, IonCol, IonButton } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { OfficersLoginResponseModel } from '../officer-login/OfficersLoginResponse.model';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, callOutline, businessOutline, ribbonOutline, logOutOutline, documentTextOutline, locationOutline, person } from 'ionicons/icons';
import { AuthServiceService } from '../../services/auth-service.service';
import { AlertController } from '@ionic/angular';


@Component({
    selector: 'app-officer-profile',
    templateUrl: './officer-profile.page.html',
    styleUrls: ['./officer-profile.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonIcon, IonButton, CommonModule, FormsModule]
})
export class OfficerProfilePage implements OnInit {
    officerData: OfficersLoginResponseModel | null = null;
    languageData: any = {};

    constructor(
        private navController: NavController,
        private langService: LanguageService,
        private authService: AuthServiceService,
        private alertController: AlertController
    ) {
        addIcons({ logOutOutline, person, documentTextOutline, locationOutline, personOutline, mailOutline, callOutline, businessOutline, ribbonOutline });
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
        this.officerData = this.authService.getOfficerData();
    }

    goBack() {
        this.navController.back();
    }

    async onLogout() {
        const alert = await this.alertController.create({
            header: this.getTranslation('confirm_logout') || 'Confirm Logout',
            message: this.getTranslation('logout_message') || 'Are you sure you want to log out?',
            buttons: [
                {
                    text: this.getTranslation('cancel') || 'Cancel',
                    role: 'cancel'
                },
                {
                    text: this.getTranslation('logout') || 'Logout',
                    cssClass: 'alert-danger',
                    handler: () => {
                        this.authService.logout();
                    }
                }
            ]
        });

        await alert.present();
    }
}

