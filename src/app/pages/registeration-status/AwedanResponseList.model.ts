interface SuccessResponse {
    code: number;
    message: string;
}

export  interface GetAwedanResponse {
  response: SuccessResponse;
  data: GetAwedanResponseModel[];
}

export interface GetAwedanResponseModel{
    id: number;
    regTableId: number,
    circle_name: string,
    circle_id: string,
    division_name: string,
    division_id: string,
    rang_name: string,
    rang_id: string,
    dist_name: string,
    dist_id: string,
    hitgrahi_name: string,
    father_name: string,
    cast: string,
    adhar_pdfFilePath: string,
    bankpassbook_pdfFilePath: string,
    b1p1_pdfFilePath: string,
    awedan_status_text:string,
    awedan_status:string,
    online_or_offline:string,
    application_number:string,
    mobile_no:string,
}