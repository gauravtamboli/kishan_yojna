export interface YearTwoPlantResponse {
  response: {
    code: number;
    msg: string;
    dynamicdata?: any;
    data?: any;
  };
  data: PlantDataWithYearTwoResponseModel[];
}

export interface PlantDataWithYearTwoResponseModel {
  // Year 1 Data (from plant_request_new)
  id: number;
  application_number: string;
  plant_id: number;
  total_area: number;
  total_tree: number;
  total_ropit: number;  // Year 1 planted count
  is_other: boolean;
  plant_name: string;
  
  // Year 2 Data (from plant_request_two) - nullable
  year2_id?: number | null;
  plants_remaining_two?: number | null;
  survival_percentage?: number | null;  // Calculated: (plants_remaining_two / total_ropit) * 100
  has_year2_data?: boolean;  // true if year 2 data exists
  plant_request_new_id?: number | null;
}

// Request model matching backend structure
export interface PlantRequestYearTwoItem {
  plant_id: number;
  application_number: string;
  plant_request_new_id: number;
  plants_remaining_two: number;
  create_by: string;
}

export interface SubmitPlantRequestYearTwoModel {
  plants: PlantRequestYearTwoItem[];
}

