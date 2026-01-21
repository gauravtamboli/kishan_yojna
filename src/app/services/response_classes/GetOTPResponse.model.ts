export  interface GetOtpResponse {
  response: SuccessResponse;
  data: GetOtpResponseModel
}

export interface SuccessResponse {
    code: number;
    msg: string;
}

export interface GetOtpResponseModel{
    otp:string,
    registeration_id:string
}