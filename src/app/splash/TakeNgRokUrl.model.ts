export  interface TakeNGRokURLResponse {
  response: SuccessResponse;
  data: TakeNGRokURLModel;
}

export interface SuccessResponse{
    status:string,
    msg:string
}

export interface TakeNGRokURLModel{
    ngrok_url:string
}