

interface SuccessResponse {
    code: number;
    msg: string;
    dynamicdata: SandresponseModal[];
}
export interface SandresponseModal {
    id: string,
    sandType: string,

}


export interface Sandresponse {
    response: SuccessResponse;
}
