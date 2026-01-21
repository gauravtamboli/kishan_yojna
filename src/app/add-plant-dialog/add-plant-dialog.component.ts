import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

@Component({
  standalone: true,
  selector: 'app-add-plant-dialog',
  templateUrl: './add-plant-dialog.component.html',
  styleUrls: ['./add-plant-dialog.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddPlantDialogComponent implements OnInit {
  @Input() plantMaster: Array<{ id: number; plantName: string; treesPerAcre: number }> = [];
  selectedPlantId: number | null = null;
  plantation_area: number | null = null;
  number_of_plant: number | null = null;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() { }

  onPrajatiChange(event: any) {
    const active = document.activeElement as HTMLElement;
active?.blur();

    this.selectedPlantId = event.detail.value;
    this.updatePlantCount();
  }

  updatePlantCount() {
    const selectedPlant = this.plantMaster.find(p => p.id === this.selectedPlantId);
    if (selectedPlant && this.plantation_area && this.plantation_area > 0) {
      const tpa = Number(selectedPlant.treesPerAcre) || 0;
      this.number_of_plant = Math.round(tpa * this.plantation_area);
    } else {
      this.number_of_plant = null;
    }
  }

  cancel() {
    const active = document.activeElement as HTMLElement;
    active?.blur();

    this.modalCtrl.dismiss();
  }

  submitData() {
    if (!this.selectedPlantId) {
      this.showMessage('कृपया प्रजाति का नाम चुनें।');
      const active = document.activeElement as HTMLElement;
      active?.blur();
      return;
    }
    if (!this.plantation_area || this.plantation_area <= 0) {
      this.showMessage('कृपया मान्य रकबा दर्ज करें।');
      const active = document.activeElement as HTMLElement;
      active?.blur();
      return;
    }

    const selectedPlant = this.plantMaster.find(p => p.id === this.selectedPlantId);

    const active = document.activeElement as HTMLElement;
    active?.blur();
    this.modalCtrl.dismiss({
      confirmed: true,
      plant: {
        plant_id: selectedPlant?.id || 0,
        plant_name: selectedPlant?.plantName || '',
        total_area: Number(this.plantation_area),
        total_tree: Number(this.number_of_plant || 0),
      }
    });
  }

  async showMessage(msg: string) {

    const modal = await this.modalCtrl.create({
      component: MessageDialogComponent,
      cssClass: 'custom-dialog-modal',
      componentProps: {
        server_message: msg,
        isYesNo: false,

      },

      backdropDismiss: false,
    });
    const active = document.activeElement as HTMLElement;
    active?.blur();
    await modal.present();
  }
}