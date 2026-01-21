import { OnInit, Component, Input } from '@angular/core';
import { IonDatetime } from '@ionic/angular/standalone'
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IonButton, IonGrid, IonCol } from '@ionic/angular/standalone';
import { SharedserviceService } from '../services/sharedservice.service';

@Component({
  standalone: true,
  selector: 'app-select-date-dialog',
  templateUrl: './select-date-dialog.component.html',
  styleUrls: ['./select-date-dialog.component.scss'],
  imports: [
    IonDatetime, FormsModule, IonButton, IonGrid, IonCol
]
})
export class SelectDateDialogComponent implements OnInit {

  @Input() fromOrToDate!: string; // 1-fromDate, 2-toDate

  selectedDate: string = '';
  maxDate: string = new Date().toISOString();

  constructor(private modalCtrl: ModalController, private sharedService: SharedserviceService) { }

  ngOnInit() { }

  closeModel() {
    this.modalCtrl.dismiss();
  }

  onSelectDate() {
    if (this.fromOrToDate === "1") {
      this.sharedService.setFromDate(this.selectedDate);
    } else {
      this.sharedService.setToDate(this.selectedDate);
    }

    this.modalCtrl.dismiss({ confirmed: true });

  }

}
