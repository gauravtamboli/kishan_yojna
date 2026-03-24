import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service'; 

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);

  const isLoggedIn = authService.getOfficersSessionData();
  const isExpired = authService.isTokenExpired();

  if (!await isLoggedIn || isExpired) {
    if (isExpired) {
      await authService.logout();
    }
    router.navigate(['/splash']);
    return false;
  }

  // Extract user designation (converted to number for matching)
  const officerData = authService.getOfficerData();
  const designation = officerData ? Number(officerData.designation) : null;

  if (designation !== null) {

    // Define Role Access Control Map
    // 1: Circle/CFO, 2: DFO, 3: SDO, 4: RO, 6/7: Supreme/SuperAdmin
    const roleRestrictions: { [pattern: string]: number[] } = {
      '/officers-dashboard-circle': [1],
      '/officers-dashboard-sdo': [3],
      '/officers-dashboard-ro': [4],
      '/officers-dashboard-supreme': [6, 7],
      '/vendor-payment-list': [2, 4],      // Testing: DFO (2) & RO (4)
      '/payment': [2, 4],                  // Only DFO & RO
      '/create-bill': [2, 4],              // Only DFO & RO
      '/payment-report': [2, 4]            // Only DFO & RO
    };

    // Strict check for DFO base dashboard
    const url = state.url.split('?')[0]; // discard query params
    const isBaseDfoDashboard = url.endsWith('/officers-dashboard') || url.endsWith('/officers-dashboard/');
    
    if (isBaseDfoDashboard && designation !== 2) {
      router.navigate(['/year-select'], { replaceUrl: true });
      return false;
    }

    // Dynamic pattern matching
    for (const [pattern, allowedRoles] of Object.entries(roleRestrictions)) {
      if (url.includes(pattern)) {
        if (!allowedRoles.includes(designation)) {
          router.navigate(['/year-select'], { replaceUrl: true });
          return false;
        }
      }
    }

  }

  return true;
};