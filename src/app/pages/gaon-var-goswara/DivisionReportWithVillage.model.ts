export interface SuccessResponse {
  code: number;
  msg: string;
}

export interface DivisionReportWithVillageResponse {
  response: SuccessResponse;
  data: DivisionReportWithVillageModel[];
}

export interface DivisionReportWithVillageModel {
  divisionId: number;
  divName: string;
  subDivisionId: number;
  subDivisionName: string;
  rangeId: number;
  rangeName: string;
  villageName: string;
  plantId: number;
  plantName: string;
  totalFarmers: number;
  totalArea: number;
  totalPlants: number;
  totalPlanted: number;
}

export interface PlantMasterModel {
  id: number;
  plantName: string;
  treesPerAcre: string;
  isActive: number;
}

