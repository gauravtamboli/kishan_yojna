export interface GetRopitAwedanByRangeRequestModel {
  RangeId: number;
  PageNumber: number;
  PageSize: number;
}

export interface RopitKisanAwedanListResponseModel {
  ApplicationNumber: string;
  HitgrahiName: string;
  FatherName: string;
  Address: string;
  VillageCityName: string;
  GramPanchayatNagar: string;
  Plants: RopitPlantDetailModel[];
}

export interface RopitPlantDetailModel {
  PlantId: number;
  PlantName: string;
  TotalArea: number | null;
  TotalTree: number | null;
  TotalRopit?: number | null;
}

export interface GetRopitAwedanResponse {
  response: {
    Code: number;
    Message: string;
  };
  data: RopitKisanAwedanListResponseModel[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Interfaces for UpdateRopitCount API
export interface UpdateRopitCountItem {
  application_number: string;
  plant_id: number;
  total_ropit: number;
}

export interface UpdateRopitCountRequestModel {
  items: UpdateRopitCountItem[];
}

export interface UpdateRopitCountResponse {
  response: {
    code: number;
    msg: string;
  };
  totalProcessed?: number;
  plantRequestUpdated?: number;
  estimateApprovalUpdated?: number;
}

