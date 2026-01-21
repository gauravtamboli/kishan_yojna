export interface SuccessResponse {
  code: number;
  message: string;
}

export interface GoswaraResponseForReport {
  response: SuccessResponse;
  data: GoswaraReportModel[];
  plantTypes?: PlantType[];
}

// Plant type information from plant_master
export interface PlantType {
  id: number;
  plant_name: string;
}

// Plant data for each plant type
export interface PlantData {
  farmersCount: number;
  area: number;
  plantsCount: number;
  plantedCount: number;
}

// New dynamic model for goswara report
export interface GoswaraReportModel {
  circleName?: string;
  divisionName?: string;
  rangName?: string;
  
  // Dynamic plant data - key is plant_id, value is PlantData
  plants?: { [plantId: string]: PlantData };
  
  // Total Mahayog
  totalFarmers?: number;
  totalArea?: number;
  totalPlants?: number;
  totalPlanted?: number;
  
  // Index signature for dynamic access
  [key: string]: any;
}

// Legacy model kept for backward compatibility
export interface GoswaraReportModelLegacy {
  circleName?: string;
  divisionName?: string;
  rangName?: string;

  tishuSagonFarmersCount?: string | number;
  tishuSagonAreaCount?: string | number;
  tishuSagonRopanLakhyaCount?: string | number;
  tishuSagonRopitPlanCount?: string | number;

  sagonFarmersCount?: string | number;
  sagonAreaCount?: string | number;
  sagonRopanLakhyaCount?: string | number;
  sagonRopitPlanCount?: string | number;

  tishuCultureBanshFarmersCount?: string | number;
  tishuCultureBanshAreaCount?: string | number;
  tishuCultureBanshRopanLakhyaCount?: string | number;
  tishuCultureBanshPlanCount?: string | number;

  banshFarmersCount?: string | number;
  banshAreaCount?: string | number;
  banshRopanLakhyaCount?: string | number;
  banshPlanCount?: string | number;

  clonalNilgiriFarmersCount?: string | number;
  clonalNilgiriAreaCount?: string | number;
  clonalNilgiriRopanLakhyaCount?: string | number;
  clonalNilgiriPlanCount?: string | number;

  chandanFarmersCount?: string | number;
  chandanAreaCount?: string | number;
  chandanRopanLakhyaCount?: string | number;
  chandanPlanCount?: string | number;

  miliyaDubiaFarmersCount?: string | number;
  miliyaDubiaAreaCount?: string | number;
  miliyaDubiaRopanLakhyaCount?: string | number;
  miliyaDubiaPlanCount?: string | number;

  anyaLabhkariPlantFarmersCount?: string | number;
  anyaLabhkariPlantAreaCount?: string | number;
  anyaLabhkariPlantRopanLakhyaCount?: string | number;
  anyaLabhkariPlantPlanCount?: string | number;

  mhaYogPlantFarmersCount?: string | number;
  mhaYogPlantAreaCount?: string | number;
  mhaYogPlantRopanLakhyaCount?: string | number;
  mhaYogPlantPlanCount?: string | number;

  // Index signature for dynamic access
  [key: string]: string | number | undefined;
}