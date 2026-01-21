export interface OfficersLoginResponse {
    response: SuccessResponse;
    data: OfficersLoginResponseModel[];
}

export interface SuccessResponse {
    code: number,
    msg: string
}

export interface OfficersLoginResponseModel {
    officerId: number,
    officer_name: string,
    designation: string,
    designation_name: string,
    circle_id: string,
    circle_name: string,
    devision_id: string,
    div_name: string,
    rang_id: string,
    rang_name: string
}