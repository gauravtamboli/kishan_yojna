export interface SuccessResponse {
  code: number;
  msg: string;
}

export interface KisanWiseReportResponseModel {
  hitgrahi_name: string;
  father_name: string;
  cast_category: string;
  aadhar_no: string;
  mobile_no: string;
  address: string;
  bank_name: string;
  ifsc_code: string;
  account_no: string;
  khasra_no: string;
  kaksha_kramank: string;
  halka_no: string;
  village_name: string;
  gram_panchayat_name: string;
  sand_type: string;
  sinchit_asinchit: string;
  awedan_status: string;
  awedan_status_text: string;
  application_number: string;
  plantation_type: string;
  area: string;
  plant_type: string;
  land_type: string;
  total_acre: string;
  patta_no: string;
  available_area: string;
  compartment_no: string;
}

export interface KisanWiseReportResponse {
  response: SuccessResponse;
  data: KisanWiseReportResponseModel[];
  totalCount: number;
}

