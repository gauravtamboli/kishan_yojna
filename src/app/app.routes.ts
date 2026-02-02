import { Routes } from '@angular/router';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  // {
  //   path: 'home',
  //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  // },
  {
    path: '',
    redirectTo: '/splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./splash/splash.page').then(m => m.SplashPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  // {
  //   path: 'registeration',
  //   loadComponent: () => import('./registeration/registeration.page').then(m => m.RegisterationPage)
  // },
  {
    path: 'landingpage',
    loadComponent: () => import('./landingpage/landingpage.page').then(m => m.LandingpagePage)
  },
  {
    path: 'year-select',
    loadComponent: () => import('./pages/year-select/year-select.page').then(m => m.YearSelectPage),
    canActivate: [authGuard]
  },
  // {
  //   path: 'year-stage',
  //   loadComponent: () => import('./pages/year-stage/year-stage.page').then(m => m.YearStagePage),
  //   canActivate: [authGuard]
  // },
  {
    path: 'year-planning',
    loadComponent: () => import('./pages/year-planning/year-planning.page').then(m => m.YearPlanningPage),
    canActivate: [authGuard]
  },
  {
    path: 'about-yojna',
    loadComponent: () => import('./pages/about-yojna/about-yojna.page').then(m => m.AboutYojnaPage)
  },
  {
    path: 'tree-techniques-and-expenses',
    loadComponent: () => import('./pages/tree-techniques-and-expenses/tree-techniques-and-expenses.page').then(m => m.TreeTechniquesAndExpensesPage)
  },
  {
    path: 'tissu-culture-bima-bans',
    loadComponent: () => import('./pages/tissu-culture-bima-bans/tissu-culture-bima-bans.page').then(m => m.TissuCultureBimaBansPage)
  },
  {
    path: 'clonal-nilgiri',
    loadComponent: () => import('./pages/clonal-nilgiri/clonal-nilgiri.page').then(m => m.ClonalNilgiriPage)
  },
  {
    path: 'milia-dubiya-malabar-neem',
    loadComponent: () => import('./pages/milia-dubiya-malabar-neem/milia-dubiya-malabar-neem.page').then(m => m.MiliaDubiyaMalabarNeemPage)
  },
  {
    path: 'tissu-culture-sagon',
    loadComponent: () => import('./pages/tissu-culture-sagon/tissu-culture-sagon.page').then(m => m.TissuCultureSagonPage)
  },
  {
    path: 'safed-chanddan',
    loadComponent: () => import('./pages/safed-chanddan/safed-chanddan.page').then(m => m.SafedChanddanPage)
  },
  {
    path: 'uplabdhiya',
    loadComponent: () => import('./pages/uplabdhiya/uplabdhiya.page').then(m => m.UplabdhiyaPage)
  },
  {
    path: 'registeration-status',
    loadComponent: () => import('./pages/registeration-status/registeration-status.page').then(m => m.RegisterationStatusPage)
  },
  {
    path: 'otp-page',
    loadComponent: () => import('./pages/otp-page/otp-page.page').then(m => m.OtpPagePage)
  },
  {
    path: 'important-contact',
    loadComponent: () => import('./pages/important-contact/important-contact.page').then(m => m.ImportantContactPage)
  },
  {
    path: 'officer-login',
    loadComponent: () => import('./pages/officer-login/officer-login.page').then(m => m.OfficerLoginPage)
  },
  {
    path: 'officers-dashboard',
    loadComponent: () => import('./pages/officers-dashboard/officers-dashboard.page').then(m => m.OfficersDashboardPage),
    canActivate: [authGuard]
  },
  {
    path: 'make-offline-awedan-to-online',
    loadComponent: () => import('./pages/make-offline-awedan-to-online/make-offline-awedan-to-online.page').then(m => m.MakeOfflineAwedanToOnlinePage),
    canActivate: [authGuard]
  },
  {
    path: 'reg-page-to-make-offline-to-online',
    loadComponent: () => import('./pages/reg-page-to-make-offline-to-online/reg-page-to-make-offline-to-online.page').then(m => m.RegPageToMakeOfflineToOnlinePage),
    canActivate: [authGuard]
  },
  {
    path: 'view-awedan',
    loadComponent: () => import('./pages/view-awedan/view-awedan.page').then(m => m.ViewAwedanPage)
  },
  {
    path: 'report',
    loadComponent: () => import('./pages/report/report.page').then(m => m.ReportPage),
    canActivate: [authGuard]
  },
  {
    path: 'view-pdf',
    loadComponent: () => import('./pages/view-pdf/view-pdf.component').then(m => m.ViewPdfComponent)
  },
  {
    path: 'submit-awedan-by-ro-dfo',
    loadComponent: () => import('./submit-awedan-by-rang/submit-awedan-by-rang.component').then(m => m.SubmitAwedanByRangComponent)
  },
  {
    path: 'kisan-awedan',
    // loadComponent: () => import('./kisan-awedan/kisan-awedan.page').then(m => m.KisanAwedanPage)
    loadComponent: () => import('./pages/kisan-awedan/kisan-awedan.page').then(m => m.KisanAwedanPage)
  },
  {
    path: 'view-awedan-bykisanRO',
    loadComponent: () => import('./pages/view-awedan-bykisanRO/view-awedan-bykisanRO.page').then(m => m.ViewAwedanBykisanROPage)
  },
  {
    path: 'officers-dashboard-ro',
    loadComponent: () => import('./pages/officers-dashboard-ro/officers-dashboard-ro.page').then(m => m.OfficersDashboardROPage),
    canActivate: [authGuard]
  },
  {
    path: 'submit-awedan-by-ro2',
    loadComponent: () => import('./submit-awedan-by-rang2/submit-awedan-by-rang2.component').then(m => m.SubmitAwedanByRang2Component)
  },
  {
    path: 'kissan-wise-report',
    loadComponent: () => import('./pages/kissan-wise-report/kissan-wise-report.component').then(m => m.KissanWiseReportComponent)
  },

  {
    path: 'ra-dwara-vivran/:id',
    loadComponent: () => import('./pages/ra-dwara-vivran/ra-dwara-vivran.page').then(m => m.RaDwaraVivranPage),
    canActivate: [authGuard]
  },
  {
    path: 'view-vivran-after-sampadit/:application_number',
    loadComponent: () => import('./pages/view-vivran-after-sampadit/view-vivran-after-sampadit.page').then(m => m.ViewVivranAfterSampaditPage),
    canActivate: [authGuard]
  },

  {
    path: 'goswara-report',
    loadComponent: () => import('./pages/goswara-report/goswara-report.page').then(m => m.GoswaraReportPage)
  },
  {
    path: 'pragati-prativedan',
    loadComponent: () => import('./pages/pragati-prativedan/pragati-prativedan.component').then(m => m.PragatiPrativedanComponent)
  },

  {
    path: 'generate-estimate-dynamic',
    loadComponent: () => import('./pages/generate-estimate-dynamic/generate-estimate-dynamic.component').then(m => m.GenerateEstimateDynamicComponent)
  },
  {
    path: 'prajati-goswara-report',
    loadComponent: () => import('./pages/prajati-var-goswara/prajativargoswara.page').then(m => m.PrajativargoswaraPage)
  },
  {
    path: 'prajati-goswara-report-circle',
    loadComponent: () => import('./pages/prajati-var-goswara-circle/prajativargoswara-circle.page').then(m => m.PrajativargoswaraCirclePage)
  },
  {
    path: 'prajati-goswara-report-head',
    loadComponent: () => import('./pages/prajati-goswara-report-head/prajati-goswara-report-head.page').then(m => m.PrajatiGoswaraReportHeadPage)
  },
  {
    path: 'officers-dashboard-sdo',
    loadComponent: () => import('./pages/officers-dashboard-sdo/officers-dashboard-sdo.page').then(m => m.OfficersDashboardSDOPage),
    canActivate: [authGuard]
  },
  {
    path: 'officers-dashboard-circle',
    loadComponent: () => import('./pages/officers-dashboard-circle/officers-dashboard-circle.page').then(m => m.OfficersDashboardCirclePage),
    canActivate: [authGuard]
  },
  {
    path: 'officers-dashboard-supreme',
    loadComponent: () => import('./pages/officers-dashboard-supreme/officers-dashboard-supreme.page').then(m => m.OfficersDashboardSupremePage),
    canActivate: [authGuard]
  },
  {
    path: 'ropit-paudho-ki-sankhya',
    loadComponent: () => import('./pages/ropit-paudho-ki-sankhya/ropit-paudho-ki-sankhya.page').then(m => m.RopitPaudhoKiSankhyaPage),
    canActivate: [authGuard]
  },
  {
    path: 'year-two-dashboard',
    loadComponent: () => import('./pages/year-two-dashboard/year-two-dashboard.page').then(m => m.YearTwoDashboardPage),
    canActivate: [authGuard]
  },
  {
    path: 'year-two-plant-entry/:applicationNumber',
    loadComponent: () => import('./pages/year-two-plant-entry/year-two-plant-entry.page').then(m => m.YearTwoPlantEntryPage),
    canActivate: [authGuard]
  },
  {
    path: 'year-three-dashboard',
    loadComponent: () => import('./pages/year-three-dashboard/year-three-dashboard.page').then(m => m.YearThreeDashboardPage),
    canActivate: [authGuard]
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment-create',
    loadComponent: () => import('./pages/payment-create/payment-create.component').then(m => m.PaymentCreateComponent),
    canActivate: [authGuard]
  },

  {
    path: 'gaon-var-goswara',
    loadComponent: () => import('./pages/gaon-var-goswara/gaon-var-goswara.page').then(m => m.GaonVarGoswaraPage),
    canActivate: [authGuard]
  },
  {
    path: 'not-found-page',
    loadComponent: () => import('./pages/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/officer-profile/officer-profile.page').then(m => m.OfficerProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'change-password',
    loadComponent: () => import('./pages/change-password/change-password.page').then(m => m.ChangePasswordPage),
    canActivate: [authGuard]
  }

];
