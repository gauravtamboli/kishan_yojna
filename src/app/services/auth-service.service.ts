import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { jwtDecode } from 'jwt-decode';
import { OfficersLoginResponseModel } from '../pages/officer-login/OfficersLoginResponse.model';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  private readonly TOKEN_KEY = 'token';

  constructor(private router: Router, private storageService: StorageService) { }

  /**
   * ✅ Store JWT token
   */
  setToken(token: string) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * ✅ Retrieve JWT token
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * ✅ Store specific string labels in local storage, rest in JWT token
   */
  setOfficerData(officer: OfficersLoginResponseModel) {
    const namesData = {
      circle_name: officer.circle_name,
      designation_name: officer.designation_name,
      div_name: officer.div_name,
      officer_name: officer.officer_name,
      rang_name: officer.rang_name
    };
    sessionStorage.setItem('officer_names', JSON.stringify(namesData));

    // Store essential backend API IDs that are NOT natively inside the JWT
    const idsData = {
      circle_id: officer.circle_id,
      devision_id: officer.devision_id,
      rang_id: officer.rang_id,
      sub_div_id: officer.sub_div_id,
      is_active: officer.is_active,
      email: officer.email
    };
    sessionStorage.setItem('officer_ids', JSON.stringify(idsData));

    if (officer.token) {
      this.setToken(officer.token);
    }
  }

  /**
   * ✅ Retrieve Officer Data (Merge Token + Names)
   */
  getOfficerData(): OfficersLoginResponseModel | null {
    const token = this.getToken();
    if (!token) return null;

    let decodedToken: any = {};
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }

    let localNames: any = {};
    const storedNames = sessionStorage.getItem('officer_names');
    if (storedNames) {
      try { localNames = JSON.parse(storedNames); } catch (error) { }
    }

    let localIds: any = {};
    const storedIds = sessionStorage.getItem('officer_ids');
    if (storedIds) {
      try { localIds = JSON.parse(storedIds); } catch (error) { }
    }

    // Merge the verified token payload fields with the locally stored display names and IDs
    return { ...localIds, ...localNames, ...decodedToken } as OfficersLoginResponseModel;
  }

  /**
   * ✅ Check if Token is Expired
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded: any = jwtDecode(token);
      // If no expiration time is found, assume it is valid (since the token itself might not be standard JWT format)
      if (decoded.exp === undefined) return false;

      // Check against current time
      const expirationDate = new Date(0); 
      expirationDate.setUTCSeconds(decoded.exp);
      return expirationDate.valueOf() < new Date().valueOf();
    } catch (error) {
      // If it's not a valid JWT format, we can't check its expiry client-side.
      // We will assume it's valid and rely on the server returning 401 instead.
      return false; 
    }
  }

  /**
   * ✅ Legacy check for session (now checks token)
   */
  getOfficersSessionData() {
    return !!this.getOfficerData();
  }

  async logout() {
    // Clear token
    sessionStorage.removeItem(this.TOKEN_KEY);
    
    // Clear legacy & explicit officer storage
    sessionStorage.removeItem('logined_officer_data');
    sessionStorage.removeItem('officer_names');
    sessionStorage.removeItem('officer_ids');
    localStorage.removeItem('officer_data'); // keeping legacy cleanup just in case

    // Clear Ionic storage
    await this.storageService.remove('user_data');
    await this.storageService.remove('selected_year');
    await this.storageService.remove('selected_stage');
    await this.storageService.remove('current_year');
    await this.storageService.remove('current_session');

    // Redirect
    this.router.navigateByUrl('/landingpage', { replaceUrl: true });
  }

}

