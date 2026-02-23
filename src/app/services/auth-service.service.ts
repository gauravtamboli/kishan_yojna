import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private router: Router, private storageService: StorageService) { }

  getOfficersSessionData() {
    const storedData = sessionStorage.getItem('logined_officer_data');
    if (storedData) {
      return true;
    }
    return false;
  }

  async logout() {
    sessionStorage.removeItem('logined_officer_data');
    await this.storageService.remove('user_data');
    await this.storageService.remove('selected_year');
    await this.storageService.remove('selected_stage');
    await this.storageService.remove('current_year');
    await this.storageService.remove('current_session');
    this.router.navigateByUrl('/landingpage', { replaceUrl: true });
  }

}

