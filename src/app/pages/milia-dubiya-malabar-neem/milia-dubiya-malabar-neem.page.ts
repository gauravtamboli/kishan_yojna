import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonItem, IonList, IonRow, IonCol, IonLabel, IonGrid, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { LanguageService } from '../../services/language.service';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-milia-dubiya-malabar-neem',
  templateUrl: './milia-dubiya-malabar-neem.page.html',
  styleUrls: ['./milia-dubiya-malabar-neem.page.scss'],
  standalone: true,
  imports: [IonItem, IonList, IonRow, IonCol, IonLabel, IonGrid, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonBackButton]
})
export class MiliaDubiyaMalabarNeemPage implements OnInit {

  languageData: any = {};

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
