import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedserviceService {
  constructor() {}

  private refreshFlag = false;
  private offlineOrOnline = '0';
  private enterdOTP = '';

  private fromDate = '';
  private toDate = '';


  addedPlantJson:string = "";
  setAddPlantJson(addedPlantJson:string){
    this.addedPlantJson = addedPlantJson;
  }
  
  getAddedPlanJson():string{
    return this.addedPlantJson;
  }


  setOTP(otp: string) {
    this.enterdOTP = otp;
  }
  getOTP(): string {
    return this.enterdOTP;
  }

  setOfflineOnline(value: string) {
    this.offlineOrOnline = value;
  }

  getOfflineOnline() {
    return this.offlineOrOnline;
  }

  setRefresh(value: boolean) {
    this.refreshFlag = value;
  }

  getRefresh(): boolean {
    return this.refreshFlag;
  }

  setFromDate(value: string) {
    this.fromDate = value;
  }
  setToDate(value: string) {
    this.toDate = value;
  }

  getFromDate() {
    return this.fromDate;
  }

  getToDate() {
    return this.toDate;
  }

}
