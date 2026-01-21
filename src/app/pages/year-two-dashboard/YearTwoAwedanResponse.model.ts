export interface YearTwoAwedanResponse {
  response: {
    code: number;
    msg: string;
    dynamicdata?: any;
    data?: any;
  };
  data: YearTwoAwedanListResponseModel[];
  totalCount: number;
}

export interface YearTwoAwedanListResponseModel {
   application_number: string;
  hitgrahi_name: string;
  father_name: string;
  van_mandal_name: string;
  rang_name: string;
  circle_name: string;
  has_record_in_year2: string; // "Yes" or "No"
  plants?: PlantDataModel[]; // Add plants array
}

// Plant data model matching API response
export interface PlantDataModel {
  id: number;
  application_number: string;
  plant_id: number;
  total_area: number;
  total_tree: number;
  total_ropit: number;
  is_other: boolean;
  plant_name: string;
  has_year2_data: boolean;
  year2_id?: number | null;
  plants_remaining_two?: number | null;
  plant_request_new_id?: number | null;
  survival_percentage?: number | null;
}


