export interface GetDashboardResponse{
    response: SuccessResponse;
    data: GetDashboardResponseModel[];
}

export interface SuccessResponse{
    code:number,
    msg:string
}

export interface GetDashboardResponseModel{
    countOfdata:number,
    whichData:number, // 1 - total, 2-pending, 3-accept, 4-reject
    awedanStatus:string
}