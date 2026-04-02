import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonLoading, IonText } from '@ionic/angular/standalone';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { LanguageService } from '../../services/language.service';
import { addIcons } from 'ionicons';
import { lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.page.html',
    styleUrls: ['./change-password.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonLoading, CommonModule, FormsModule]
})
export class ChangePasswordPage implements OnInit {
    oldPassword = '';
    newPassword = '';
    confirmPassword = '';

    showOldPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;

    isLoading = false;
    languageData: any = {};

    constructor(
        private apiService: ApiService,
        private langService: LanguageService,
        private navController: NavController,
        private alertCtrl: AlertController,
        private authService: AuthServiceService
    ) {
        addIcons({ lockClosedOutline, eyeOutline, eyeOffOutline });
    }

    ngOnInit() {
        this.updateTranslation();
    }

    updateTranslation() {
        this.langService.language$.subscribe((data) => {
            this.languageData = data;
        });
    }

    getTranslation(key: string) {
        return this.langService.getTranslation(key);
    }

    async changePassword() {
        if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
            this.showAlert('Error', 'All fields are required');
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.showAlert('Error', 'New password and confirm password do not match');
            return;
        }

        const officerData = this.authService.getOfficerData();
        if (!officerData) {
            this.navController.navigateRoot('/officer-login');
            return;
        }

        this.isLoading = true;
        this.apiService.changePassword(officerData.officerId, this.oldPassword, this.newPassword).subscribe(
            async (res) => {
                this.isLoading = false;
                if (res.response && res.response.code === 200) {
                    const alert = await this.alertCtrl.create({
                        header: 'Success',
                        message: 'Password changed successfully',
                        buttons: [{
                            text: 'OK',
                            handler: () => {
                                this.navController.back();
                            }
                        }]
                    });
                    await alert.present();
                } else {
                    this.showAlert('Error', res.response.msg || 'Failed to change password');
                }
            },
            (err) => {
                this.isLoading = false;
                this.showAlert('Error', 'An error occurred. Please try again.');
            }
        );
    }

    async showAlert(header: string, message: string) {
        const alert = await this.alertCtrl.create({
            header,
            message,
            buttons: ['OK']
        });
        await alert.present();
    }

    togglePasswordVisibility(field: string) {
        if (field === 'old') this.showOldPassword = !this.showOldPassword;
        if (field === 'new') this.showNewPassword = !this.showNewPassword;
        if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
    }
}
