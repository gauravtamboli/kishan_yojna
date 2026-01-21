

interface SuccessResponse {
    code: number;
    msg: string;
    dynamicdata: BankModal[];
}
export interface BankModal {
    id: string,
    bank_name_hi: string,
    bank_name_en: string,

}
interface SandresponseSuccessResponse {
    code: number;
    msg: string;
    dynamicdata: BankModal[];
}


export interface Bankresponse {
    response: SuccessResponse;
}

export interface Sandresponse {
    response: SandresponseSuccessResponse;
}
