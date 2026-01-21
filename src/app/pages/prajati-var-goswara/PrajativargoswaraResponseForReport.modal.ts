export interface SuccessResponse {
  code: number;
  message: string;
}

export interface PrajativargoswaraResponseForReport {
  response: SuccessResponse;
  data: PrajativargoswaraReportModel[];
  plantTypes?: PlantType[];
}

// Plant type information from plant_master
export interface PlantType {
  id: number;
  plant_name: string;
}

// Plant data with <5 and >=5 acres breakdown
export interface PrajatiPlantData {
  lessFarmers: number;
  lessArea: number;
  lessPlants: number;
  moreFarmers: number;
  moreArea: number;
  morePlants: number;
}

// New dynamic model for prajati goswara report
export interface PrajativargoswaraReportModel {
  circleName?: string;
  divisionName?: string;
  rangName?: string;
  
  // Dynamic plant data - key is plant_id, value is PrajatiPlantData
  plants?: { [plantId: string]: PrajatiPlantData };
  
  // Index signature for dynamic access
  [key: string]: any;
}

// Legacy model kept for backward compatibility
export interface PrajativargoswaraReportModelLegacy {
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