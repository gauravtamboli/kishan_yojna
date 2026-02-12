import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { LoginResponse } from '../login/login_response.model';
// ... existing imports ...
import { RegistrationDetailsResponse } from '../pages/ra-dwara-vivran/RegistrationDetailsResponseModel';

import { GetOtpResponse } from './response_classes/GetOTPResponse.model';
import { AlertController } from '@ionic/angular';
import { GetVerifyOtpResponse } from './response_classes/VerifyOTPResponseModel';
import { GetMastersResponse } from './response_classes/GetMastsersResponseModel';
import { GetAwedanResponse } from '../pages/registeration-status/AwedanResponseList.model';
import { ImportantContactResponse } from '../pages/important-contact/ImportantContactResponse.modal';
import { Toast } from '@capacitor/toast';
import { NetworkCheckService } from './network-check.service';
import { OfficersLoginResponse } from '../pages/officer-login/OfficersLoginResponse.model';
import { GetDashboardResponse } from '../pages/officers-dashboard/GetDashboardResponse.model';
import { GetAppDetailResponse, GetStateNameResponseModel } from '../splash/GetStateNameResponse.model';
import { StorageService } from './storage.service';
import { Preferences } from '@capacitor/preferences';
import { SingleAwedanDataResponse } from '../pages/view-awedan/SingleAwedanDataResponse.model';
import { AwedanResponseForReport } from '../pages/report/AwedanResponsForReport.model';
import { Bankresponse, Sandresponse } from '../pages/ra-dwara-vivran/Getbankdetail.modal';
// import { AddSpeciesMasterRequest } from '../models/AnyaPlant.model';
import { AddSpeciesMasterRequest } from '../models/AnyaPlant.model';
import { VivranRegistrationDetailsResponse } from '../pages/view-vivran-after-sampadit/VivranRegistrationDetailsResponseModel';
import { YearTwoAwedanResponse } from '../pages/year-two-dashboard/YearTwoAwedanResponse.model';
import { YearTwoAwedanCountsResponse } from '../pages/year-two-dashboard/YearTwoAwedanCountsResponse.model';
import { YearTwoPlantResponse, SubmitPlantRequestYearTwoModel } from '../pages/year-two-plant-entry/YearTwoPlantResponse.model';
import { YearThreeAwedanResponse } from '../pages/year-three-dashboard/YearThreeAwedanResponse.model';
import { YearThreeAwedanCountsResponse } from '../pages/year-three-dashboard/YearThreeAwedanCountsResponse.model';
import { SubmitPlantRequestYearThreeModel } from '../pages/year-three-dashboard/YearThreePlantResponse.model';



@Injectable({
  providedIn: 'root'
})


export class ApiService {

  baseUrl: any;
  get(arg0: string, payload: { fromDate: string; toDate: string; }) {
    throw new Error('Method not implemented.');
  }

  private apiUrlGetKisanAwedanData: string = `/api/KissanMitraYojnaRegisteration/getKisanAwedanData`;
  private apiUrlLogin: string = `/api/KissanMitraYojnaRegisteration/login`;
  private apiUrlGetMaster: string = `/api/KissanMitraYojnaRegisteration/get_master_value`;
  private apiUrlgetOTP: string = `/api/KissanMitraYojnaRegisteration/sentOTP`;
  private apiUrlVerifyOTP: string = `/api/KissanMitraYojnaRegisteration/verifyOTP`;
  private apiUrlGetCircle: string = `/api/KissanMitraYojnaRegisteration/getCircle`;
  private apiUrlGetDivision: string = `/api/KissanMitraYojnaRegisteration/getDivision`;
  private apiUrlGetRang: string = `/api/KissanMitraYojnaRegisteration/getRang`;
  private apiUrlSubmitAwedanInfo: string = `/api/KissanMitraYojnaRegisteration/submitRegisterationForm`;
  private apiUrlSubmitAwedanInfo2: string = `/api/KissanMitraYojnaRegisteration/submitRegisterationForm2`;
  private apiUrlGetAwedanList: string = `/api/KissanMitraYojnaRegisteration/getMyAwedanList`;
  private apiUrlSubmitOfflineRegisterationForm: string = `/api/KissanMitraYojnaRegisteration/submitOfflineRegisterationForm`;
  private apiUrlToGetImportantContacts: string = `/api/KissanMitraYojnaRegisteration/getImpContacts`;
  private apiUrlgetOTPToKnowAwedanStatus: string = `/api/KissanMitraYojnaRegisteration/sentOTPForAwedanStatus`;
  private apiUrlToOfficersLogin: string = `/api/KissanMitraYojnaRegisteration/officerLogin`;
  private apiUrlToChangePassword: string = `/api/KissanMitraYojnaRegisteration/changePassword`;
  private apiUrlToGetDashboardData: string = `/api/KissanMitraYojnaRegisteration/officersDashboardData`;
  private apiUrlGetAwedanListAccordingToAwedanStatus: string = `/api/KissanMitraYojnaRegisteration/getAwedanListAccordingToAwedanStatus`;
  private apiUrlToGetStateName: string = `https://nominatim.openstreetmap.org/reverse`;
  private apiUrlGetOfflineAwedanList: string = `/api/KissanMitraYojnaRegisteration/getOfflineAwedanList`;
  private apiUrlMakeOfflineAwedanInfoToOnline: string = `/api/KissanMitraYojnaRegisteration/makeOfflineDataToOnline`;
  private apiUrlGetAwedanStatusCounts: string = `/api/KissanMitraYojnaRegisteration/getAwedanStatusCounts`;
  private apiUrlGetRopitKisanAwedanListByRange: string = `/api/KissanMitraYojnaRegisteration/getRopitKisanAwedanListByRange`;
  private apiUrlUpdateRopitCount: string = `/api/KissanMitraYojnaRegisteration/UpdateRopitCount`;
  private apiUrlGetGaddaKisanAwedanListByRange: string = `/api/KissanMitraYojnaRegisteration/getGaddaKisanAwedanListByRange`;
  private apiUrlAddOrUpdateGaddaPlant: string = `/api/KissanMitraYojnaRegisteration/AddOrUpdateGaddaPlant`;
  private apiUrlGetYearTwoAwedanList: string = `/api/KissanMitraYojnaRegisteration/getYearTwoAwedanList`;
  private apiUrlGetYearTwoAwedanCounts: string = `/api/KissanMitraYojnaRegisteration/getYearTwoAwedanCounts`;
  private apiUrlGetPlantRequestsWithYearTwo: string = `/api/KissanMitraYojnaRegisteration/GetPlantRequestsWithYearTwoByApplicationNumber`;
  private apiUrlSubmitYearTwoPlants: string = `/api/KissanMitraYojnaRegisteration/SubmitPlantRequestYearTwo`;
  private apiUrlSubmitYearThreePlants: string = `/api/KissanMitraYojnaRegisteration/SubmitPlantRequestYearThree`;
  private apiUrlGetYearThreeAwedanList: string = `/api/KissanMitraYojnaRegisteration/getYearThreeAwedanList`;
  private apiUrlGetYearThreeAwedanCounts: string = `/api/KissanMitraYojnaRegisteration/getYearThreeAwedanCounts`;
  private apiUrlGetGaddaplantKisanAwedanListByRange: string = `/api/KissanMitraYojnaRegisteration/getGaddaplantKisanAwedanListByRange`;
  private apiUrlToAcceptRejectApplication: string = `/api/KissanMitraYojnaRegisteration/awedanApproveReject`;

  private apiUrlToGetSingleApplicationDetail: string = `/api/KissanMitraYojnaRegisteration/getSingleAwedanDetail`;
  private apiUrlGetAllDistricts: string = `/api/KissanMitraYojnaRegisteration/getAllDistricts`;
  private apiUrlGetDivisionsByDistrict: string = `/api/KissanMitraYojnaRegisteration/getDivisionsByDistrict`;
  private apiUrlGetRangesByDivision: string = `/api/KissanMitraYojnaRegisteration/getRangeByDivision`;
  private apiUrlSubmitKisanAwedan: string = `/api/KissanMitraYojnaRegisteration/submitKisanAwedan`;


  private apiUrlGetDataForReport: string = `/api/KissanMitraYojnaRegisteration/getAwedanListForReport`;

  private apiUrlGetAppDetails: string = `/api/KissanMitraYojnaRegisteration/getAppDetail`; // Ensure no 

  public apiGetSecurePath: string = "https://forest.cg.gov.in/KVMY/api/KissanMitraYojnaRegisteration/get-secure-pdf";

  private apiUrlGetDistList: string = `/api/KissanMitraYojnaRegisteration/getDist`;

  private check_mobile_already_exist_in_pending_awedan: string = `/api/KissanMitraYojnaRegisteration/check_mobile_already_exist_in_pending_awedan`;
  ////new api by kiran 
  private apiUrlToGetAllRegistrationDetails: string = `/api/KissanMitraYojnaRegisteration/GetAllRegistrationDetails`;
  // private apiUrlTransferApplication: string = `/api/ApplicationTransferController/transferApplication`;
  private apiUrlTransferApplication: string = `/api/KissanMitraYojnaRegisteration/transferApplication`;
  constructor(private storageService: StorageService, private http: HttpClient, private alertController: AlertController, private checkNetworkService: NetworkCheckService) { }

  isConnected: boolean = false;

  async buildApiUrl(path: string): Promise<string | null> {
    const { value: baseUrl } = await Preferences.get({ key: 'ngrok_url' });

    if (baseUrl) {
      const finalUrl = `${baseUrl}${path}`;
      return finalUrl;
    } else {
      return null;
    }
  }


  getKisanAwedanByNumber(applicationNumber: string): Observable<any> {
    const request = { ApplicationId: applicationNumber };
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/getKisanAwedanDataByNumber')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, request, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error fetching Kisan Awedan data'));
      })
    );
  }

  login(mobile: string, password: string): Observable<LoginResponse> {
    const body = { mobile, password };

    return from(this.buildApiUrl(this.apiUrlLogin)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<LoginResponse>(url, body);
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );
  }

  // GET STATE NAME PROGRAMATICALLY
  getStateNameProgramatically(lat: number, lng: number): Observable<GetStateNameResponseModel> {
    return this.http.get<GetStateNameResponseModel>(this.apiUrlToGetStateName + "?lat=" + lat.toString() + "&lon=" + lng.toString() + "&format=json").pipe(
      catchError((error) => {
        throw new Error('Error logging in');
      })
    );
  }

  // start
  // Add these new API methods to your ApiService class

  // Get all districts (for initial load)
  getAllDistricts(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' // Add this header to skip ngrok warning
    };

    return from(this.buildApiUrl(this.apiUrlGetAllDistricts)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        console.log('Calling getAllDistricts API:', url); // Debug log
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error in getAllDistricts:', error); // Debug log
        console.error('Error details:', error.error); // Log the actual error response
        return throwError(() => new Error('Error fetching districts'));
      })
    );
  }

  // Get divisions by district ID
  getDivisionsByDistrict(districtId: string): Observable<GetMastersResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const body = {
      dist_id: districtId.toString()  // Use 'id' parameter as expected by existing getDivision API
    };

    return from(this.buildApiUrl(this.apiUrlGetDivisionsByDistrict)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error fetching divisions'));
      })
    );
  }

  // Get ranges by division ID
  // getRangesByDivision(divisionId: string): Observable<GetMastersResponse> {
  //   const headers = { 'Content-Type': 'application/json',
  //     'ngrok-skip-browser-warning': 'true'
  //    };

  //   const body = {
  //     id: divisionId.toString()
  //   };

  //   return from(this.buildApiUrl(this.apiUrlGetRangesByDivision)).pipe(
  //     switchMap((url) => {
  //       if (!url) return throwError(() => new Error('No API URL configured'));
  //       return this.http.post<GetMastersResponse>(url, body, { headers });
  //     }),
  //     catchError((error) => {
  //       return throwError(() => new Error('Error fetching ranges'));
  //     })
  //   );
  // } 

  // Get ranges by division ID (+ optional district filter)
  getRangesByDivision(divisionId: string, districtId?: string): Observable<GetMastersResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const body: any = { id: divisionId.toString() };
    if (districtId) {
      body.dist_id = districtId.toString();
    }

    return from(this.buildApiUrl(this.apiUrlGetRangesByDivision)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, body, { headers });
      }),
      catchError(() => throwError(() => new Error('Error fetching ranges')))
    );
  }

  submitKisanAwedan(formData: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(this.apiUrlSubmitKisanAwedan)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, formData, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error submitting Kisan Awedan'));
      })
    );
  }

  //end

  // Check Mobile Number Already Exist //
  checkMobileNumberAlreadyExist(mobileNumber: string): Observable<GetOtpResponse> {

    const body = {
      mobileNumber: mobileNumber.toString()
    };

    const headers = { 'Content-Type': 'application/json' };


    return from(this.buildApiUrl(this.check_mobile_already_exist_in_pending_awedan)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetOtpResponse>(url, body, { headers });
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );


  }


  // GET OTP //
  getOTP(mobileNumber: string): Observable<GetOtpResponse> {

    const body = {
      mobileNumber: mobileNumber.toString()
    };

    const headers = { 'Content-Type': 'application/json' };


    return from(this.buildApiUrl(this.apiUrlgetOTP)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetOtpResponse>(url, body, { headers });
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );


  }

  // GET OTP //
  getOTPToKnowAwedanStatus(mobileNumber: string): Observable<GetOtpResponse> {

    const body = {
      mobileNumber: mobileNumber.toString()
    };

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlgetOTPToKnowAwedanStatus)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetOtpResponse>(url, body, { headers });
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );


  }

  // Show server messages
  async showServerMessages(msg: string) {
    const alert = await this.alertController.create({
      message: msg,
      backdropDismiss: false // optional: prevent manual dismissal
    });

    await alert.present();

    // Auto-dismiss after 2 seconds
    setTimeout(() => {
      alert.dismiss();
    }, 2000);

  }



  verifyOTP(OTP: string, registerationId: string, mobileNumber: string): Observable<GetVerifyOtpResponse> {

    const body = {
      OTP: OTP.toString(),
      registerationId: registerationId.toString(),
      mobileNumber: mobileNumber.toString()
    };


    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlVerifyOTP)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetVerifyOtpResponse>(url, body, { headers });
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );

  }


  // Get Circle
  getCircles(): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlGetCircle)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, { headers });
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  // Get Dist
  getDist(circleId: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      circle_id: circleId.toString()
    };

    return from(this.buildApiUrl(this.apiUrlGetDistList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, body, { headers });
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  // Get Division
  getDivision(id: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      id: id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlGetDivision)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, body, { headers });
      }),
      catchError((error) => {
        // 
        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  // Get Rang
  getRang(id: string, circleId: string): Observable<GetMastersResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      id: id.toString(),
      circle_id: circleId.toString()
    };

    return from(this.buildApiUrl(this.apiUrlGetRang)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, body, { headers });
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );

  }
  uploadApplicationDocuments(formData: FormData): Observable<any> {
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/uploadApplicationDocuments')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, formData);
      }),
      catchError((error) => {
        return throwError(() => new Error('Error uploading files'));
      })
    );
  }

  // Submit complete registration (form data + plants + files in one call)
  submitCompleteRegistration(formData: FormData): Observable<any> {
    return from(this.buildApiUrl('/api/CompleteRegistration/submitCompleteRegistration')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, formData);
      }),
      catchError((error) => {
        console.error('Error submitting complete registration:', error);
        return throwError(() => new Error('Error submitting complete registration'));
      })
    );
  }
  // Submit awedan
  submitAwedan(formData: FormData): Observable<GetMastersResponse> {

    //const headers = {'Content-Type': 'application/json'};


    formData.forEach((value, key) => {
      if (value instanceof File) {

      } else {

      }
    });

    return from(this.buildApiUrl(this.apiUrlSubmitAwedanInfo)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, formData);
      }),
      catchError((error) => {
        // 
        return throwError(() => new Error('Error logging in'));
      })
    );

  }


  submitAwedan2(formData: FormData): Observable<GetMastersResponse> {


    formData.forEach((value, key) => {
      if (value instanceof File) {

      } else {

      }
    });

    return from(this.buildApiUrl(this.apiUrlSubmitAwedanInfo2)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, formData);
      }),
      catchError((error) => {
        ////debugger;
        return throwError(() => new Error('Error logging in'));
      })
    );

  }



  // Get My Submited Awedan List
  getListOfAwedan(mobileNumber: string): Observable<GetAwedanResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      mobileNumber: mobileNumber.toString()
    };

    return from(this.buildApiUrl(this.apiUrlGetAwedanList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetAwedanResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  // Submit awedan
  submitOfflineAwedan(formData: FormData): Observable<GetMastersResponse> {


    formData.forEach((value, key) => {
      if (value instanceof File) {

      } else {

      }
    });

    return from(this.buildApiUrl(this.apiUrlSubmitOfflineRegisterationForm)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, formData);
      }),
      catchError((error) => {

        return throwError(() => new Error('Error logging in'));
      })
    );

  }


  // Get Imp contacts
  getImportantContact(): Observable<ImportantContactResponse> {

    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlToGetImportantContacts)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<ImportantContactResponse>(url, { headers });
      }),
      catchError((error) => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Request timed out'));
        }

        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  async shortToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'short',
      position: 'bottom',
    });
  }

  async longToast(msg: string) {
    await Toast.show({
      text: msg,
      duration: 'long',
      position: 'bottom',
    });
  }


  // OFFICER LOGIN //
  officerLogin(mobileNumber: string, password: string): Observable<OfficersLoginResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      mobile: mobileNumber.toString(),
      password: password.toString()
    };

    return from(this.buildApiUrl(this.apiUrlToOfficersLogin)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<OfficersLoginResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  changePassword(officerId: number, oldPassword: string, newPassword: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    const body = {
      officer_id: officerId,
      old_password: oldPassword,
      new_password: newPassword
    };

    return from(this.buildApiUrl(this.apiUrlToChangePassword)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error changing password'));
      })
    );
  }

  // GET DASHBOARD DATAT //
  getDashboardData(
    officers_id: string,
    designation_id: string,
    circle_id: string,
    devision_id: string,
    rang_id: string): Observable<GetDashboardResponse> {
    const headers = { 'Content-Type': 'application/json' };
    ////debugger;
    const body = {
      officers_id: officers_id.toString(),
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      devision_id: devision_id ? devision_id.toString() : null,
      rang_id: rang_id ? rang_id.toString() : null,
    };

    return from(this.buildApiUrl(this.apiUrlToGetDashboardData)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetDashboardResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Error logging in'));
      })
    );

  }




  // Get Awedan List according to clicked data on dashboard
  getListOfAwedanAccordingToAwedanStatus(
    whichData: number,
    designation_id: string,
    circle_id: string,
    devision_id: string,
    rang_id: string,
    officers_id: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<GetAwedanResponse> {

    const headers = { 'Content-Type': 'application/json' };
    //debugger;  
    const body = {
      which_data: whichData.toString(),
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      division_id: devision_id ? devision_id.toString() : null,
      rang_id: rang_id ? rang_id.toString() : null,
      officers_id: officers_id.toString(),
      page: page,
      pageSize: pageSize
    };
    console.log(body);
    ////debugger;
    return from(this.buildApiUrl(this.apiUrlGetAwedanListAccordingToAwedanStatus)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetAwedanResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Error logging in'));
      })
    );

  }


  // Get Awedan Status Counts for dashboard
  getAwedanStatusCounts(
    designation_id: string,
    circle_id: string,
    devision_id: string,
    rang_id: string,
    officers_id: string
  ): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      division_id: devision_id ? devision_id.toString() : null,
      rang_id: rang_id ? rang_id.toString() : null,
      officers_id: officers_id.toString(),
    };

    return from(this.buildApiUrl(this.apiUrlGetAwedanStatusCounts)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting status counts'));
      })
    );
  }

  // Get Year Two Awedan Counts
  getYearTwoAwedanCounts(
    designation_id: string,
    circle_id: string,
    devision_id: string | null,
    rang_id: string | null,
    officers_id: string
  ): Observable<YearTwoAwedanCountsResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      which_data: 1, // Not used but required
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      division_id: devision_id ? devision_id.toString() : null,
      rang_id: rang_id ? rang_id.toString() : null,
      officers_id: officers_id.toString(),
      page: 1,
      pageSize: 10
    };

    return from(this.buildApiUrl(this.apiUrlGetYearTwoAwedanCounts)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<YearTwoAwedanCountsResponse>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting year two awedan counts'));
      })
    );
  }

  // Get Year Two Awedan List (only status 6 - DFO Approved)
  getYearTwoAwedanList(
    whichData: number,
    designation_id: string,
    circle_id: string,
    devision_id: string | null,
    rang_id: string | null,
    officers_id: string,
    page: number = 1,
    pageSize: number = 10,
    filter_year2: string | null = null // "Yes", "No", or null for all
  ): Observable<YearTwoAwedanResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      which_data: whichData,
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      division_id: devision_id ? devision_id.toString() : null,
      rang_id: rang_id ? rang_id.toString() : null,
      officers_id: officers_id.toString(),
      page: page,
      pageSize: pageSize,
      filter_year2: filter_year2 // Add filter parameter
    };

    return from(this.buildApiUrl(this.apiUrlGetYearTwoAwedanList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<YearTwoAwedanResponse>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting year two awedan list'));
      })
    );
  }

  // Get Plant Requests with Year Two Data
  getPlantRequestsWithYearTwo(applicationNumber: string): Observable<YearTwoPlantResponse> {
    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlGetPlantRequestsWithYearTwo)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<YearTwoPlantResponse>(url + `?applicationNumber=${encodeURIComponent(applicationNumber)}`, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting plant requests with year two data'));
      })
    );
  }

  // Submit Year Two Plants
  submitYearTwoPlants(request: SubmitPlantRequestYearTwoModel): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitYearTwoPlants)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, request, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error submitting year two plants'));
      })
    );
  }

  // Submit Year Three Plants
  submitYearThreePlants(request: SubmitPlantRequestYearThreeModel): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };

    return from(this.buildApiUrl(this.apiUrlSubmitYearThreePlants)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, request, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error submitting year three plants'));
      })
    );
  }

  // Get Year Three Awedan Counts
  getYearThreeAwedanCounts(
    designation_id: string,
    circle_id: string,
    devision_id: string | null,
    rang_id: string | null,
    officers_id: string
  ): Observable<YearThreeAwedanCountsResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      which_data: 1, // Not used but required
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      division_id: devision_id ? devision_id.toString() : null,
      rang_id: rang_id ? rang_id.toString() : null,
      officers_id: officers_id.toString(),
      page: 1,
      pageSize: 10
    };

    return from(this.buildApiUrl(this.apiUrlGetYearThreeAwedanCounts)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<YearThreeAwedanCountsResponse>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting year three awedan counts'));
      })
    );
  }

  // Get Year Three Awedan List
  getYearThreeAwedanList(
    whichData: number,
    designation_id: string,
    circle_id: string,
    devision_id: string | null,
    rang_id: string | null,
    officers_id: string,
    page: number = 1,
    pageSize: number = 10,
    filter_year3: string | null = null // "Yes", "No", or null for all
  ): Observable<YearThreeAwedanResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      which_data: whichData,
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      division_id: devision_id ? devision_id.toString() : null,
      rang_id: rang_id ? rang_id.toString() : null,
      officers_id: officers_id.toString(),
      page: page,
      pageSize: pageSize,
      filter_year3: filter_year3 // Add filter parameter
    };

    return from(this.buildApiUrl(this.apiUrlGetYearThreeAwedanList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<YearThreeAwedanResponse>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting year three awedan list'));
      })
    );
  }

  // Get Ropit Kisan Awedan List By Range
  getRopitKisanAwedanListByRange(
    rangeId: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const body = {
      RangeId: rangeId,
      PageNumber: pageNumber,
      PageSize: pageSize
    };

    return from(this.buildApiUrl(this.apiUrlGetRopitKisanAwedanListByRange)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting ropit kisan awedan list'));
      })
    );
  }

  // Update Ropit Count
  updateRopitCount(requestModel: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(this.apiUrlUpdateRopitCount)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, requestModel, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error updating ropit count'));
      })
    );
  }

  // Get offline Awedan List
  getListOfOfflineAwedanList(
    designation_id: string,
    circle_id: string,
    devision_id: string
  ): Observable<GetAwedanResponse> {

    const headers = { 'Content-Type': 'application/json' };

    const body = {
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      devision_id: devision_id.toString()
    };

    return from(this.buildApiUrl(this.apiUrlGetOfflineAwedanList)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetAwedanResponse>(url, body, { headers });
      }),
      catchError((error) => {

        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  // SUBMIT OFFLINE DATA TO ONLINE
  // Submit awedan
  makeOfflineAwedanToOnlineAwedan(formData: FormData): Observable<GetMastersResponse> {


    formData.forEach((value, key) => {
      if (value instanceof File) {

      } else {

      }
    });

    return from(this.buildApiUrl(this.apiUrlMakeOfflineAwedanInfoToOnline)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetMastersResponse>(url, formData);
      }),
      catchError((error) => {

        return throwError(() => new Error('Error logging in'));
      })
    );

  }

  // Application accept reject //
  awedanAcceptReject(id: number, approve_reject: string, updatedBy: number): Observable<GetDashboardResponse> {
    const headers = { 'Content-Type': 'application/json' };

    const body = {
      awedan_id: id,
      updated_by: updatedBy.toString(),
      approve_reject: approve_reject
    };

    return from(this.buildApiUrl(this.apiUrlToAcceptRejectApplication)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<GetDashboardResponse>(url, body);
      }),
      catchError((error) => {
        //
        return throwError(() => new Error('Error logging in'));
      })
    );

  }


  // Get Single Awedan Data
  // getSingleAwedanData(applicationId: string): Observable<SingleAwedanDataResponse> {


  //   const headers = { 'Content-Type': 'application/json' };

  //   const body = {
  //     application_id: applicationId.toString()
  //   };



  //   return from(this.buildApiUrl(this.apiUrlToGetAllRegistrationDetails)).pipe(
  //     switchMap((url) => {
  //       if (!url) return throwError(() => new Error('No API URL configured'));
  //       return this.http.post<SingleAwedanDataResponse>(url, body, { headers });
  //     }),
  //     catchError((error) => {
  //       //
  //       return throwError(() => new Error('Error logging in'));
  //     })
  //   );

  // }
  getSingleAwedanData(applicationNumber: string): Observable<SingleAwedanDataResponse> {
    return from(this.buildApiUrl(this.apiUrlToGetAllRegistrationDetails)).pipe(
      switchMap((baseUrl) => {
        if (!baseUrl) {
          return throwError(() => new Error('No API URL configured'));
        }

        const url = `${baseUrl}/${encodeURIComponent(applicationNumber)}`;
        return this.http.get<SingleAwedanDataResponse>(url);
      }),
      catchError((error) => {
        console.error('Error fetching application data:', error);
        return throwError(() => new Error('Error loading application data'));
      })
    );
  }


  getAwedanListForReport(
    designation_id: string,
    circle_id: string,
    devision_id: string,
    fromDate: string,
    toDate: string,
    selectedAwedanStatus: string
  ): Observable<AwedanResponseForReport> {

    const headers = { 'Content-Type': 'application/json' };

    if (circle_id === null) {
      circle_id = "";
    }
    if (devision_id === null) {
      devision_id = "";
    }

    const body = {
      designation_id: designation_id.toString(),
      circle_id: circle_id.toString(),
      division_id: devision_id.toString(),
      fromDate: fromDate.toString(),
      toDate: toDate.toString(),
      awedan_status: selectedAwedanStatus.toString()
    };

    return from(this.buildApiUrl(this.apiUrlGetDataForReport)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<AwedanResponseForReport>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error logging in'));
      })
    );

  }


  // GET CURRENT APP DETAILS //
  getAppDetails(): Observable<GetAppDetailResponse> {
    //const headers = { 'Content-Type': 'application/json' };

    const body = {

    };

    return from(this.buildApiUrl(this.apiUrlGetAppDetails)).pipe(
      switchMap((url) => {

        if (!url) return throwError(() => new Error('No API URL configured'));

        return this.http.post<GetAppDetailResponse>(url, body);

      }),
      catchError((error) => {
        return throwError(() => new Error('Error logging in'));
      })
    );
  }



  // ... existing code ...

  // Get All Registration Details
  getAllRegistrationDetails(id: number): Observable<RegistrationDetailsResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/getAllRegistrationDetails/${id}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<RegistrationDetailsResponse>(url, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error fetching registration details'));
      })
    );
  }

  getAllRegistrationDetailsForVivran(applicationNumber: string): Observable<VivranRegistrationDetailsResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/getAllRegistrationDetailsForVivran/${applicationNumber}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<VivranRegistrationDetailsResponse>(url, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error fetching vivran registration details'));
      })
    );
  }

  getBankDetails(): Observable<Bankresponse> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/getBankDetails`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<Bankresponse>(url, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error fetching registration details'));
      })
    );
  }

  getSandType(): Observable<Sandresponse> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/getSandTypeDetails`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<Sandresponse>(url, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error fetching registration details'));
      })
    );
  }



  //16 10 25 ss start
  //s

  GetAllSpeciesReportByDivision(divisionId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetAllSpeciesReportByDivision/${divisionId}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('❌ Error fetching species division report by division:', error);
        return throwError(() => new Error('Error fetching species division report by division'));
      })
    );
  }


  GetAllSpeciesReportByRange(rangId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetAllSpeciesReportByRange/${rangId}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('❌ Error fetching species division report by range:', error);
        return throwError(() => new Error('Error fetching species division report by range'));
      })
    );
  }

  ///
  GetMahayogSummaryByRange(rangId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    // Note: This uses route parameter, not query parameter
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetMahayogSummaryByRange/${rangId}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error fetching Mahayog Summary by Range data'));
      })
    );
  }


  GetMahayogSummaryByDivision(divisionId: number): Observable<any> {
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetMahayogSummaryByDivision/${divisionId}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url);
      }),
      catchError((error) => {
        console.error('❌ Error fetching Mahayog summary by division:', error);
        return throwError(() => new Error('Error fetching Mahayog summary by division'));
      })
    );
  }

  //s
  //16 10 25 ss end

  //27 10 25 ss start
  getSecurePDF(filename: string): Observable<Blob> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/get-secure-pdf?filename=${encodeURIComponent(filename)}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get(url, {
          headers,
          responseType: 'blob' // Important: set responseType to 'blob' for file downloads
        });
      }),
      catchError((error) => {
        console.error('Error fetching secure PDF:', error);
        return throwError(() => new Error('Error downloading PDF'));
      })
    );
  }

  //27 10 25 ss end
  //27 10 25 ss end

  // ADD ALL THESE NEW METHODS FOR ANYA PLANTS
  getSpeciesMaster(): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/GetSpeciesMaster')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching species:', error);
        return throwError(() => new Error('Error fetching species'));
      })
    );
  }

  addSpeciesMaster(data: AddSpeciesMasterRequest): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/AddSpeciesMaster')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, data, { headers });
      }),
      catchError((error) => {
        console.error('Error adding species:', error);
        return throwError(() => new Error('Error adding species'));
      })
    );
  }

  getAnyaPlantsByAppNumber(appNumber: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetAnyaPlantsByAppNumber?appNumber=${appNumber}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching anya plants:', error);
        return throwError(() => new Error('Error fetching anya plants'));
      })
    );
  }

  submitAnyaPlants(data: any): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/SubmitAnyaPlants')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, data, { headers });
      }),
      catchError((error) => {
        console.error('Error submitting anya plants:', error);
        return throwError(() => new Error('Error submitting anya plants'));
      })
    );
  }

  // Get Plant Master for dynamic plant dropdown
  getPlantMaster(): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/GetPlantMaster')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching plant master:', error);
        return throwError(() => new Error('Error fetching plant master'));
      })
    );
  }

  // Submit Plant Requests to plant_request_new table
  submitPlantRequests(data: any): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/SubmitPlantRequests')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, data, { headers });
      }),
      catchError((error) => {
        console.error('Error submitting plant requests:', error);
        return throwError(() => new Error('Error submitting plant requests'));
      })
    );
  }

  // Clear existing plant requests for an application (reflect deletions)
  clearPlantRequestsByAppNumber(applicationNumber: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/ClearPlantRequestsByApplicationNumber?applicationNumber=${encodeURIComponent(applicationNumber)}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.delete<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error clearing plant requests:', error);
        return throwError(() => new Error('Error clearing plant requests'));
      })
    );
  }

  // Get existing plant requests by application number (for edit mode)
  getPlantRequestsByAppNumber(applicationNumber: string): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetPlantRequestsByApplicationNumber?applicationNumber=${encodeURIComponent(applicationNumber)}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching plant requests:', error);
        return throwError(() => new Error('Error fetching plant requests'));
      })
    );
  }

  // Generate estimate (plant-wise) for a specific application number
  getEstimateByApplication(applicationNumber: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetEstimateByApplication?applicationNumber=${encodeURIComponent(applicationNumber)}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error generating estimate:', error);
        return throwError(() => new Error('Error generating estimate'));
      })
    );
  }

  // Unified bundle for dynamic estimate page: rows + totals + singleData + officers
  getEstimateBundle(applicationNumber: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetEstimateBundle?applicationNumber=${encodeURIComponent(applicationNumber)}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching estimate bundle:', error);
        return throwError(() => new Error('Error fetching estimate bundle'));
      })
    );
  }

  // Get Goswara Report based on plant_request_new, online_awedan_request, plant_master
  getGoswaraReport(divisionId?: number, rangId?: number, sdoId?: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    let urlPath = '/api/KissanMitraYojnaRegisteration/GetGoswaraReport';
    if (rangId) {
      urlPath += `?rangId=${rangId}`;
    } else if (divisionId) {
      urlPath += `?divisionId=${divisionId}`;
    } else if (sdoId) {
      urlPath += `?sdoId=${sdoId}`;
    }

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching goswara report:', error);
        return throwError(() => new Error('Error fetching goswara report'));
      })
    );
  }

  // Get Goswara Report Circle (grouped by Circle and Division only, no Range)
  getGoswaraReportCircle(circleId?: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    let urlPath = '/api/KissanMitraYojnaRegisteration/GetGoswaraReportCircle';
    if (circleId) {
      urlPath += `?circleId=${circleId}`;
    }

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching goswara report circle:', error);
        return throwError(() => new Error('Error fetching goswara report circle'));
      })
    );
  }

  // Get Goswara Report All Circles (for designation 7 - Head level)
  getGoswaraReportAllCircles(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const urlPath = '/api/KissanMitraYojnaRegisteration/GetGoswaraReportAllCircles';

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching goswara report all circles:', error);
        return throwError(() => new Error('Error fetching goswara report all circles'));
      })
    );
  }

  // Get Prajati Goswara Report with <5 and >=5 acres breakdown
  getPrajatiGoswaraReport(divisionId?: number, rangId?: number, sdoId?: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    let urlPath = '/api/KissanMitraYojnaRegisteration/GetPrajatiGoswaraReport';
    if (rangId) {
      urlPath += `?rangId=${rangId}`;
    } else if (divisionId) {
      urlPath += `?divisionId=${divisionId}`;
    } else if (sdoId) {
      urlPath += `?sdoId=${sdoId}`;
    }

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching prajati goswara report:', error);
        return throwError(() => new Error('Error fetching prajati goswara report'));
      })
    );
  }

  // Get Prajati Goswara Report Circle (grouped by Division only)
  getPrajatiGoswaraReportCircle(circleId?: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    let urlPath = '/api/KissanMitraYojnaRegisteration/GetPrajatiGoswaraReportCircle';
    if (circleId) {
      urlPath += `?circleId=${circleId}`;
    }

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching prajati goswara report circle:', error);
        return throwError(() => new Error('Error fetching prajati goswara report circle'));
      })
    );
  }

  // Get Prajati Goswara Report All Circles (Head/Supreme level)
  getPrajatiGoswaraReportAllCircles(): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const urlPath = '/api/KissanMitraYojnaRegisteration/GetPrajatiGoswaraReportAllCircles';

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching prajati goswara report all circles:', error);
        return throwError(() => new Error('Error fetching prajati goswara report all circles'));
      })
    );
  }

  // Save estimate approval workflow (RO)
  saveEstimateApproval(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/SaveEstimateApproval')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      })
    );
  }

  updateEstimateApproval(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/UpdateEstimateApproval')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      })
    );
  }

  SdoSendBackToRo(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/SdoSendBackToRo')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      })
    );
  }


  SdoSendToDfo(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/SdoSendToDfo')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      })
    );
  }


  dfoReturnToRO(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/DfoSendBackToRo')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      })
    );
  }



  dfoAccept(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/DfoAccept')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      })
    );
  }




  // Fetch saved estimate approval rows for an application
  getEstimateApprovalByApplication(applicationNumber: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetEstimateApprovalByApplication?applicationNumber=${encodeURIComponent(applicationNumber)}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      })
    );
  }

  // Soft delete estimate approval
  softDeleteEstimateApproval(applicationNumber: string): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/SoftDeleteEstimateApproval?applicationNumber=${encodeURIComponent(applicationNumber)}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, {}, { headers });
      })
    );
  }

  // Get Kisan Wise Report
  getKissanWiseReport(
    circleId?: number,
    divisionId?: number,
    distId?: number,
    rangId?: number,
    officerId?: number
  ): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    // Build query parameters
    let queryParams = '';
    const params: string[] = [];

    if (circleId && circleId > 0) {
      params.push(`circleId=${circleId}`);
    }
    if (divisionId && divisionId > 0) {
      params.push(`divisionId=${divisionId}`);
    }
    if (distId && distId > 0) {
      params.push(`distId=${distId}`);
    }
    if (rangId && rangId > 0) {
      params.push(`rangId=${rangId}`);
    }
    if (officerId && officerId > 0) {
      params.push(`officerId=${officerId}`);
    }

    if (params.length > 0) {
      queryParams = '?' + params.join('&');
    }

    return from(this.buildApiUrl(`/api/KisanReport/kissan-wise-report${queryParams}`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching kisan wise report:', error);
        return throwError(() => new Error('Error fetching kisan wise report'));
      })
    );
  }

  // Transfer application to new location
  transferApplication(transferData: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(this.apiUrlTransferApplication)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, transferData, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error transferring application'));
      })
    );
  }



  uploadRo(data: FormData): Observable<any> {
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/UploadRoFile`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error("No API URL configured"));
        return this.http.post<any>(url, data);
      })
    );
  }

  uploadSdo(data: FormData): Observable<any> {
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/UploadSdoFile`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error("No API URL configured"));
        return this.http.post<any>(url, data);
      })
    );
  }

  uploadDfo(data: FormData): Observable<any> {
    return from(this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/UploadDfoFile`)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error("No API URL configured"));
        return this.http.post<any>(url, data);
      })
    );
  }

  GetEstimateFile(applicationNumber: string): Observable<any> {
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetEstimateFile?applicationNumber=${encodeURIComponent(applicationNumber)}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          return this.http.get<any>(url);
        })
      );
  }


    VendorPaymentListData(selectedPaymentYear: string, rangeId: number): Observable<any> {
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/VendorPaymentListData?selectedPaymentYear=${encodeURIComponent(selectedPaymentYear)}&rangeId=${rangeId}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          const headers = { 'ngrok-skip-browser-warning': 'true' };
          return this.http.get<any>(url, { headers });
        })
      );
  }

    HitgrahiPaymentListData(selectedPaymentYear: string, rangeId: number): Observable<any> {
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/HitgrahiPaymentListData?selectedPaymentYear=${encodeURIComponent(selectedPaymentYear)}&rangeId=${rangeId}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          const headers = { 'ngrok-skip-browser-warning': 'true' };
          return this.http.get<any>(url, { headers });
        })
      );
  }


  paymentlistdata(selectedPaymentYear: string, rangeId: number, paymentType: number): Observable<any> {
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/paymentlistdata?selectedPaymentYear=${encodeURIComponent(selectedPaymentYear)}&rangeId=${rangeId}&paymentType=${paymentType}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          const headers = { 'ngrok-skip-browser-warning': 'true' };
          return this.http.get<any>(url, { headers });
        })
      );
  }

  getPaymentBundel(application_number: string): Observable<any> {
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/paymentbundel?applicationNumber=${encodeURIComponent(application_number)}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          return this.http.get<any>(url);
        })
      );
  }

  getPaymentDetails(billNumber?: string): Observable<any> {
    const params = billNumber ? `?billNumber=${encodeURIComponent(billNumber)}` : '';
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/getPaymentDetails${params}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          const headers = { 'ngrok-skip-browser-warning': 'true' };
          return this.http.get<any>(url, { headers });
        })
      );
  }

  // Get Division Report with Village Name (for DFO - Division Officer)
  getDivisionReportWithVillage(divisionId: number, plantId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const urlPath = `/api/KissanMitraYojnaRegisteration/get-division-plant-report?divisionId=${divisionId}&plantId=${plantId}`;

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching division report with village:', error);
        return throwError(() => new Error('Error fetching division report with village'));
      })
    );
  }

  // Get Range Report with Village Name (for RO - Range Officer)
  getRangeReportWithVillage(rangeId: number, plantId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const urlPath = `/api/KissanMitraYojnaRegisteration/get-range-plant-report?rangeId=${rangeId}&plantId=${plantId}`;

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching range report with village:', error);
        return throwError(() => new Error('Error fetching range report with village'));
      })
    );
  }

  // Get Sub-Division Report with Village Name (for SDO - Sub-Division Officer)
  getSubDivisionReportWithVillage(subDivisionId: number, plantId: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const urlPath = `/api/KissanMitraYojnaRegisteration/get-subdivision-plant-report?subDivisionId=${subDivisionId}&plantId=${plantId}`;

    return from(this.buildApiUrl(urlPath)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.get<any>(url, { headers });
      }),
      catchError((error) => {
        console.error('Error fetching sub-division report with village:', error);
        return throwError(() => new Error('Error fetching sub-division report with village'));
      })
    );
  }

  addRopitPlant(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/AddOrUpdateRopitPlant'))
      .pipe(
        switchMap((url) => {
          if (!url) {
            return throwError(() => new Error('No API URL configured'));
          }
          return this.http.post<any>(url, payload, { headers });
        })
      );
  }

  getPitKisanAwedanListByRange(
    rangeId: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const body = {
      RangeId: rangeId,
      PageNumber: pageNumber,
      PageSize: pageSize
    };

    return from(this.buildApiUrl(this.apiUrlGetGaddaKisanAwedanListByRange)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting gadda kisan awedan list'));
      })
    );
  }

  addGaddaPlant(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    return from(this.buildApiUrl(this.apiUrlAddOrUpdateGaddaPlant))
      .pipe(
        switchMap((url) => {
          if (!url) {
            return throwError(() => new Error('No API URL configured'));
          }
          return this.http.post<any>(url, payload, { headers });
        })
      );
  }




  getGaddaplantKisanAwedanListByRange(
    rangeId: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const body = {
      RangeId: rangeId,
      PageNumber: pageNumber,
      PageSize: pageSize
    };

    return from(this.buildApiUrl(this.apiUrlGetGaddaplantKisanAwedanListByRange)).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, body, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error getting gadda kisan awedan list'));
      })
    );
  }


  getPaymentBundelVendor(application_number: string): Observable<any> {
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/PaymentBundelVendor?applicationNumber=${encodeURIComponent(application_number)}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          return this.http.get<any>(url);
        })
      );
  }

  submitVendorPayment(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/SubmitVendorPayment')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error submitting vendor payment'));
      })
    );
  }


  submitHitgrahiPayment(payload: any): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    return from(this.buildApiUrl('/api/KissanMitraYojnaRegisteration/SubmitHitgrahiPayment')).pipe(
      switchMap((url) => {
        if (!url) return throwError(() => new Error('No API URL configured'));
        return this.http.post<any>(url, payload, { headers });
      }),
      catchError((error) => {
        return throwError(() => new Error('Error submitting hitgrahi payment'));
      })
    );
  }


    GetAllPaymentDetailsByApplication(application_number: string): Observable<any> {
    return from(
      this.buildApiUrl(`/api/KissanMitraYojnaRegisteration/GetAllPaymentDetailsByApplication?application_number=${encodeURIComponent(application_number)}`)).pipe(
        switchMap((url) => {
          if (!url) return throwError(() => new Error("No API URL configured"));
          return this.http.get<any>(url);
        })
      );
  }

}




