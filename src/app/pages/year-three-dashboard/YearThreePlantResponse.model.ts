// Request model matching backend structure
export interface PlantRequestYearThreeItem {
  plant_id: number;
  application_number: string;
  plant_request_new_id: number;
  plants_remaining_three: number;
  create_by: string;
}

export interface SubmitPlantRequestYearThreeModel {
  plants: PlantRequestYearThreeItem[];
}

