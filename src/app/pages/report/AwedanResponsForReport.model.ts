interface SuccessResponse {
    code: number;
    message: string;
}

export interface AwedanResponseForReport {
    response: SuccessResponse;
    data: AwedanResponseForReportModel[];
}

export interface AwedanResponseForReportModel {
    regTableId: number;
    circle_name: string;
    division_name: string;
    rang_name: string;
    dist_name: string;
    circle_id: number | null;
    division_id: number | null;
    rang_id: number | null;
    dist_id: number | null;
    hitgrahi_name: string;
    father_name: string;
    cast: string;
    pdfFilePath: string;
    awedan_status: string;
    awedan_status_text: string;
    online_or_offline: string;
    application_number: string | null;
    mobile_no: string;
    aadhar_no: string;
    address: string;
    bank_name: string;
    ifsc_code: string;
    account_no: string;
    khasra_no: string;
    kaksha_kramank: string;
    halka_no: string;
    village_name: string;
    panchayat_name: string;

    plantation_type: string;
    sand_type: string;
    sinchit_asinchit: string;
    vrikharopan_akshansh: string;
    vrikharopan_dikshansh: string;

    klonal_neelgiri_no_of_plant_less_5_acre: string;
    klonal_neelgiri_no_of_plant_more_5_acre: string;
    klonal_neelgiri_plan_area_less_5_acre: string;
    klonal_neelgiri_plan_area_more_5_acre: string;

    tishu_culture_sagon_no_of_plant_less_5_acre: string;
    tishu_culture_sagon_no_of_plant_more_5_acre: string;
    tishu_culture_sagon_plant_area_less_5_acre: string;
    tishu_culture_sagon_plant_area_more_5_acre: string;

    tishu_culture_bansh_no_of_plant_less_5_acre: string;
    tishu_culture_bansh_no_of_plant_more_5_acre: string;
    tishu_culture_bansh_plant_area_less_5_acre: string;
    tishu_culture_bansh_plant_area_more_5_acre: string;

    normal_sagon_no_of_plant_less_5_acre: string;
    normal_sagon_no_of_plant_more_5_acre: string;
    normal_sagon_plant_area_less_5_acre: string;
    normal_sagon_plant_area_more_5_acre: string;

    normal_bansh_no_of_plant_less_5_acre: string;
    normal_bansh_no_of_plant_more_5_acre: string;
    normal_bansh_plant_area_less_5_acre: string;
    normal_bansh_plant_area_more_5_acre: string;

    miliya_dubiya_no_of_plant_less_5_acre: string;
    miliya_dubiya_no_of_plant_more_5_acre: string;
    miliya_dubiya_plant_area_less_5_acre: string;
    miliya_dubiya_plant_area_more_5_acre: string;

    chandan_no_of_plant_less_5_acre: string;
    chandan_no_of_plant_more_5_acre: string;
    chandan_plant_area_less_5_acre: string;
    chandan_plant_area_more_5_acre: string;

    other_labhkari_no_of_plant_less_5_acre: string;
    other_labhkari_no_of_plant_more_5_acre: string;
    other_labhkari_plan_area_less_5_acre: string;
    other_labhkari_plan_area_more_5_acre: string;

    total_number_of_plant_less_5_acre: string;
    total_number_of_plant_more_5_acre: string;
    total_area_less_5_acre: string;
    total_area_more_5_acre: string;
}