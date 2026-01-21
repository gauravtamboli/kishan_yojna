export interface GetVerifyOtpResponse{
      response: SuccessResponse;
      data: GetVerifyOtpResponseModel
}

export interface SuccessResponse {
    code: number;
    msg: string;
}

export interface GetVerifyOtpResponseModel{
    registeration_id:string
}