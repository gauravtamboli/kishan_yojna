export interface YearThreeAwedanResponse {
  response: {
    code: number;
    msg: string;
    dynamicdata?: any;
    data?: any;
  };
  data: YearThreeAwedanListResponseModel[];
  totalCount: number;
}

export interface YearThreeAwedanListResponseModel {
  application_number: string;
  hitgrahi_name: string;
  father_name: string;
  van_mandal_name: string;
  rang_name: string;
  circle_name: string;
  has_record_in_year3: string; // "Yes" or "No"
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
  has_year3_data: boolean;
  year2_id?: number | null;
  plants_remaining_two?: number | null;
  year2_survival_percentage?: number | null;
  year3_id?: number | null;
  plants_remaining_three?: number | null;
  plant_request_new_id?: number | null;
  year3_survival_percentage?: number | null;
}





