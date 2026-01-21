import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service'; 

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  const isLoggedIn = authService.getOfficersSessionData();

  if (!await isLoggedIn) {
    router.navigate(['/splash']);
    return false;
  }

  // Get officer data to check designation
  const storedData = sessionStorage.getItem('logined_officer_data');
  if (storedData) {
    const officerData = JSON.parse(storedData);
    
    // If RO tries to access regular officers-dashboard, redirect to RO dashboard
    if (state.url.includes('/officers-dashboard') && 
        !state.url.includes('/officers-dashboard-ro') && 
        !state.url.includes('/officers-dashboard-sdo') &&
        officerData.designation === "4") {
      router.navigate(['/officers-dashboard-ro'], { replaceUrl: true });
      return false; // Block access to regular dashboard
    }
  }

  return true;
};