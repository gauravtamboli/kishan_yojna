import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem, IonList, IonRow, IonCol, IonLabel, IonGrid, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-uplabdhiya',
  templateUrl: './uplabdhiya.page.html',
  styleUrls: ['./uplabdhiya.page.scss'],
  standalone: true,
  imports: [IonRow, IonCol, IonLabel, IonGrid, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonBackButton]
})
export class UplabdhiyaPage implements OnInit {

  languageData: any = {};
isDarkMode: boolean = false;

   toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        localStorage.setItem('theme-mode', this.isDarkMode ? 'dark' : 'light');
    }

    private applyTheme() {
        const isDarkClass = 'ion-palette-dark';
        if (this.isDarkMode) {
            document.documentElement.classList.add(isDarkClass);
            document.body.classList.add(isDarkClass);
        } else {
            document.documentElement.classList.remove(isDarkClass);
            document.body.classList.remove(isDarkClass);
        }
    }
     private restoreSavedTheme() {
        const savedTheme = localStorage.getItem('theme-mode');
        this.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
    }

  goBack() {
    if (window.history.length > 1) {
      this.router.navigateByUrl('/landingpage', { replaceUrl: true });
    } else {
      this.location.back();
    }
  }

  constructor(private router: Router, private location: Location, private navController: NavController, private langService: LanguageService) { }

  async ngOnInit() {
    this.updateTranslation()
        this.restoreSavedTheme();
  }

  updateTranslation() {
    this.langService.language$.subscribe((data) => {
      this.languageData = data;
    });
  }

  getTranslation(key: string) {
    return this.langService.getTranslation(key);
  }

}
