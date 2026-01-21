export interface GetMastersResponse{

    response: SuccessResponse;
    data: MastersModelClass[],
    dist: MastersModelClass[]
    bank: MastersModelClass[]
    sand_type: MastersModelClass[]

} 

export interface SuccessResponse {
    code: number;
    msg: string;
}

export interface MastersModelClass{
    id : string,
    name:string
}