interface SuccessResponse {
    code: number;
    message: string;
  }
  
  export interface KisanAwedanResponse {
    response: SuccessResponse;
    data: KisanAwedanData;
  }
  
  export interface KisanAwedanData {
    application_table_id: number;
    application_number: string;
    district_id: number;
    division_id: number;
    range_id: number;
    hitgrahi_name: string;
    father_name: string;
    caste: number;
    village_name: string;
    gram_panchayat_name: string;
    address: string;
    
    area: string;
    available_area: string;
    mobile_no: string;
    plantation_type: string;
    plant_type_final: string;
    other_plant: string;
    approved: boolean;
    created_date: string;
    updated_date: string;
    // Additional fields for display
    dist_name: string;
    div_name: string;
    rang_name: string;
    cast_name: string;
  }
  
  export interface GetKisanAwedanDataRequest {
    application_id: string;
  }