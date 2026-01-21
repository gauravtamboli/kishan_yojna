// ... existing code ...

import { SuccessResponse } from "../splash/GetStateNameResponse.model";

export interface PlantationDetailNew{
    prajatiName:string;
    plant_count_less_5:string;
    area_size_less_5:string;
    plant_count_more_5:string;
    area_size_more_5:string;
  }
  
  // New interface for the getAllRegistrationDetails API response
  export interface RegistrationDetailsResponse {
    response: SuccessResponse;
    data: RegistrationDetailsResponseModel[];
  }
  
  export interface RegistrationDetailsResponseModel {
    // Fields from online_awedan_request
    id: number;
    applicationNumber: string;
    circleId?: number;
    divisionId?: number;
    distId?: number;
    rangId?: number;
    hitgrahiName: string;
    fatherName: string;
    castCategory?: number;
    aadharNo: string;
    mobileNo: string;
    address: string;
    bankName: string;
    ifscCode: string;
    accountNo: string;
    khasraNo: string;
    kakshaKramank: string;
    halkaNo: string;
    villageName: string;
    gramPanchayatName: string;
    sandType: string;
    sinchitAsinchit: string;
    vrikharopanAkshansh: string;
    vrikharopanDikshansh: string;
    createdAt: string;
    adharPdfFile: string;
    plantationType?: number;
    createdBy: string;

    b1P1PdfFile: string;
    bankpassbookPdfFile: string;

    total_rakba:string;
  
    // Fields from plant_request_table
    plantRequestId?: number;
    klonalNeelgiriNoOfPlantLess5Acre?: number;
    klonalNeelgiriPlantAreaLess5Acre?: number;
    tishuCultureSagonNoOfPlantLess5Acre?: number;
    tishuCultureSagonPlantAreaLess5Acre?: number;
    tishuCultureBanshNoOfPlantLess5Acre?: number;
    tishuCultureBanshPlantAreaLess5Acre?: number;
    normalSagonNoOfPlantLess5Acre?: number;
    normalSagonPlantAreaLess5Acre?: number;
    miliyaDubiyaNoOfPlantLess5Acre?: number;
    miliyaDubiyaPlantAreaLess5Acre?: number;
    chandanNoOfPlantLess5Acre?: number;
    chandanPlantAreaLess5Acre?: number;
    otherLabhkariNoOfPlantLess5Acre?: number;
    otherLabhkariPlantAreaLess5Acre?: number;
    normalBanshNoOfPlantLess5Acre?: number;
    normalBanshPlantAreaLess5Acre?: number;
    totalNumberOfPlantLess5Acre?: number;
    totalAreaLess5Acre?: number;
    klonalNeelgiriNoOfPlantMore5Acre?: number;
    klonalNeelgiriPlantAreaMore5Acre?: number;
    tishuCultureSagonNoOfPlantMore5Acre?: number;
    tishuCultureSagonPlantAreaMore5Acre?: number;
    tishuCultureBanshNoOfPlantMore5Acre?: number;
    tishuCultureBanshPlantAreaMore5Acre?: number;
    normalSagonNoOfPlantMore5Acre?: number;
    normalSagonPlantAreaMore5Acre?: number;
    miliyaDubiyaNoOfPlantMore5Acre?: number;
    miliyaDubiyaPlantAreaMore5Acre?: number;
    chandanNoOfPlantMore5Acre?: number;
    chandanPlantAreaMore5Acre?: number;
    otherLabhkariNoOfPlantMore5Acre?: number;
    otherLabhkariPlantAreaMore5Acre?: number;
    normalBanshNoOfPlantMore5Acre?: number;
    normalBanshPlantAreaMore5Acre?: number;
    totalNumberOfPlantMore5Acre?: number;
    totalAreaMore5Acre?: number;
    otherLabhkariPlanAreaMore5Acre?: number;
    patta_no?:number;
    userid?:number;
    compartment_no ? : any ;

    area ?: any;
plantTypeFinal ? : string ;
//      TotalAcre ? : number
  }