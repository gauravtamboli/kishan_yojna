import { Component, Input,OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone :true,
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss'],
  imports: [IonicModule,
    CommonModule, FormsModule]
})
export class MessageDialogComponent implements OnInit  {

  @Input() server_message!: string;
  @Input() isYesNo!: boolean;

  yesOrOk:string = "OK"

  async ngOnInit(){
      if(this.isYesNo){
        this.yesOrOk = "हाँ"
      }
  }

  getIsYesNO():boolean{
    return this.isYesNo;
  }

  constructor(private modalCtrl: ModalController) {
  }

  yesClick(){
    this.modalCtrl.dismiss({ confirmed: true });
  }

  noClick(){
    this.modalCtrl.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss({ confirmed: false });
  }



}
