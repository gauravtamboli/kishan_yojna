interface SuccessResponse {
    code: number;
    message: string;
}

export  interface SingleAwedanDataResponse {
  response: SuccessResponse;
  data: SingleAwedanDataResponseModel;
}

export interface SingleAwedanDataResponseModel {
  application_table_id: number;
  application_number: string;
  hitgrahi_name: string;
  aadhar_no: string;
  father_name: string;
  mobile_no: string;
  address: string;
  ifsc_code: string;
  account_no: string;
  plantation_type:string;
  khasra_no: string;
  kaksha_kramank: string;
  halka_no: string;
  village_name: string;
  gram_panchayat_name: string;
  sinchit_asinchit: string;
  vrikharopan_akshansh: string;
  vrikharopan_dikshansh: string;
  circle_name: string;
  div_name: string;
  dist_name: string;
  rang_name: string;
  cast_name: string;
  bank_name: string;
  sand_type: string;
  klonal_neelgiri_no_of_plant_less_5_acre: string;
  klonal_neelgiri_plan_area_less_5_acre: string;
  klonal_neelgiri_no_of_plant_more_5_acre: string;
  klonal_neelgiri_plan_area_more_5_acre: string;
  tishu_culture_sagon_no_of_plant_less_5_acre: string;
  tishu_culture_sagon_plant_area_less_5_acre: string;
  tishu_culture_sagon_no_of_plant_more_5_acre: string;
  tishu_culture_sagon_plant_area_more_5_acre: string;
  tishu_culture_bansh_no_of_plant_less_5_acre: string;
  tishu_culture_bansh_plant_area_less_5_acre: string;
  tishu_culture_bansh_no_of_plant_more_5_acre: string;
  tishu_culture_bansh_plant_area_more_5_acre: string;
  normal_sagon_no_of_plant_less_5_acre: string;
  normal_sagon_plant_area_less_5_acre: string;
  normal_sagon_no_of_plant_more_5_acre: string;
  normal_sagon_plant_area_more_5_acre: string;
  miliya_dubiya_no_of_plant_less_5_acre: string;
  miliya_dubiya_plant_area_less_5_acre: string;
  miliya_dubiya_no_of_plant_more_5_acre: string;
  miliya_dubiya_plant_area_more_5_acre: string;
  chandan_no_of_plant_less_5_acre: string;
  chandan_plant_area_less_5_acre: string;
  chandan_no_of_plant_more_5_acre: string;
  chandan_plant_area_more_5_acre: string;
  other_labhkari_no_of_plant_less_5_acre: string;
  other_labhkari_plan_area_less_5_acre: string;
  other_labhkari_no_of_plant_more_5_acre: string;
  other_labhkari_plan_area_more_5_acre: string;
  normal_bansh_no_of_plant_less_5_acre: string;
  normal_bansh_plant_area_less_5_acre: string;
  normal_bansh_no_of_plant_more_5_acre: string;
  normal_bansh_plant_area_more_5_acre: string;
  total_number_of_plant_less_5_acre: string;
  total_area_less_5_acre: string;
  total_number_of_plant_more_5_acre: string;
  total_area_more_5_acre: string;
  auth_token: string;
}


export interface PlantationDetail{
  prajatiName:string;
  plant_count:string;
  area_size:string;
}

export interface PlantationDetailNew {
  
  prajatiName: string;
  plant_count_less_5: string;
  area_size_less_5: string;
  plant_count_more_5: string;
  area_size_more_5: string;
}

