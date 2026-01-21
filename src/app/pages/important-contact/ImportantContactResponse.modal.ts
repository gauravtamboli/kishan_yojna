export interface ImportantContactResponse{
    response: SuccessResponse;
    data: ImportantContactResponseModel[];
}

export interface ImportantContactResponseModel{
    id:number,
    officer_name:string,
    designation:string,
    circle_name:string,
    office_address:string,
    mobile:string,
    dist_name:string,
}

interface SuccessResponse {
    code: number;
    message: string;
}