export interface GetRangeReportRequestModel {
    RangeId: number;
    PageNumber: number;
    PageSize: number;
}

export interface RangeReportResponseModel {
    ApplicationNumber: string;
    HitgrahiName: string;
    FatherName: string;
    Address: string;
    VillageCityName: string;
    GramPanchayatNagar: string;
    Plants: RangePlantDetailModel[];
}

export interface RangePlantDetailModel {
    PlantId: number;
    PlantName: string;
    TotalArea: number | null;
    TotalTree: number | null;
    TotalRopit: number | null;
    TotalPit: number | null;
}

export interface GetRangeReportResponse {
    response: {
        Code: number;
        Message: string;
    };
    data: RangeReportResponseModel[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
