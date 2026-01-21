import { Component, Input, OnInit } from '@angular/core';
import { IonGrid, IonCol, IonText, IonRow, IonButton } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-update-app-dialog',
  templateUrl: './update-app-dialog.component.html',
  styleUrls: ['./update-app-dialog.component.scss'],
  imports: [IonGrid, IonCol, IonText, IonRow, CommonModule, IonButton]
})
export class UpdateAppDialogComponent implements OnInit {

  @Input() isForcelyUpdate!: boolean;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  getForcelyUpdate(): boolean {
    return this.isForcelyUpdate;
  }

  updateApp() {
    this.modalCtrl.dismiss({ confirmed: true });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

}
