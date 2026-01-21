interface SuccessResponse {
    code: number;
    msg: string;
    data: any[];
}

export interface RegistrationDetailsResponse {
    response: SuccessResponse;
}

export interface RegistrationDetailsResponseModel {
    Id?: number;
    ApplicationNumber?: string;
    CircleId?: number;
    DivisionId?: number;
    DistId?: number;
    RangId?: number;
    HitgrahiName?: string;
    FatherName?: string;
    CastCategory?: number;
    AadharNo?: string;
    MobileNo?: string;
    Address?: string;
    Bank_Name?: string;
    IfscCode?: string;
    AccountNo?: string;
    KhasraNo?: string;
    KakshaKramank?: string;
    HalkaNo?: string;
    VillageName?: string;
    GramPanchayatName?: string;
    SandType?: string;
    SinchitAsinchit?: string;
    VrikharopanAkshansh?: string;
    VrikharopanDikshansh?: string;
    CreatedAt?: string;
    AdharPdfFile?: string;
    PlantationType?: number;
    CreatedBy?: string;
    B1P1PdfFile?: string;
    BankpassbookPdfFile?: string;
    PlantRequestId?: number;
    CastCategoryName?:string;
    
    // Plant data for less than 5 acres
    KlonalNeelgiriNoOfPlantLess5Acre?: number;
    KlonalNeelgiriPlantAreaLess5Acre?: number;
    TishuCultureSagonNoOfPlantLess5Acre?: number;
    TishuCultureSagonPlantAreaLess5Acre?: number;
    TishuCultureBanshNoOfPlantLess5Acre?: number;
    TishuCultureBanshPlantAreaLess5Acre?: number;
    NormalSagonNoOfPlantLess5Acre?: number;
    NormalSagonPlantAreaLess5Acre?: number;
    MiliyaDubiyaNoOfPlantLess5Acre?: number;
    MiliyaDubiyaPlantAreaLess5Acre?: number;
    ChandanNoOfPlantLess5Acre?: number;
    ChandanPlantAreaLess5Acre?: number;
    OtherLabhkariNoOfPlantLess5Acre?: number;
    OtherLabhkariPlantAreaLess5Acre?: number;
    NormalBanshNoOfPlantLess5Acre?: number;
    NormalBanshPlantAreaLess5Acre?: number;
    TotalNumberOfPlantLess5Acre?: number;
    TotalAreaLess5Acre?: number;
    
    // Plant data for more than 5 acres
    KlonalNeelgiriNoOfPlantMore5Acre?: number;
    KlonalNeelgiriPlantAreaMore5Acre?: number;
    TishuCultureSagonNoOfPlantMore5Acre?: number;
    TishuCultureSagonPlantAreaMore5Acre?: number;
    TishuCultureBanshNoOfPlantMore5Acre?: number;
    TishuCultureBanshPlantAreaMore5Acre?: number;
    NormalSagonNoOfPlantMore5Acre?: number;
    NormalSagonPlantAreaMore5Acre?: number;
    MiliyaDubiyaNoOfPlantMore5Acre?: number;
    MiliyaDubiyaPlantAreaMore5Acre?: number;
    ChandanNoOfPlantMore5Acre?: number;
    ChandanPlantAreaMore5Acre?: number;
    OtherLabhkariNoOfPlantMore5Acre?: number;
    OtherLabhkariPlantAreaMore5Acre?: number;
    NormalBanshNoOfPlantMore5Acre?: number;
    NormalBanshPlantAreaMore5Acre?: number;
    TotalNumberOfPlantMore5Acre?: number;
    TotalAreaMore5Acre?: number;

    balu_type? : string;
    Created_By? : string;

    
}