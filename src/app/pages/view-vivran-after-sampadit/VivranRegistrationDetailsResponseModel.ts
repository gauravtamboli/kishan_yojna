export interface SuccessFailure {
  code: number;
  msg: string;
  dynamicdata: VivranRegistrationDetailsResponseModel | null;
  data: any;
}

export interface VivranRegistrationDetailsResponse {
  response: SuccessFailure;
}

export interface VivranRegistrationDetailsResponseModel {
  registrationDetails: VivranRegistrationDetails | null;
  plants: VivranPlantDetails[];
}

export interface VivranRegistrationDetails {
  id: number;
  applicationNumber: string;
  circleId: number | null;
  circleName: string | null;
  divisionId: number | null;
  divisionName: string | null;
  distId: number | null;
  distName: string | null;
  rangId: number | null;
  rangName: string | null;
  hitgrahiName: string | null;
  fatherName: string | null;
  castCategory: number | null;
  castCategoryName: string | null;
  aadharNo: string | null;
  mobileNo: string | null;
  address: string | null;
  bankId: string | null;
  bankName: string | null;
  ifscCode: string | null;
  accountNo: string | null;
  khasraNo: string | null;
  kakshaKramank: string | null;
  halkaNo: string | null;
  villageName: string | null;
  gramPanchayatName: string | null;
  vrikharopanYear: number | null;
  sandTypeId: string | null;
  sandTypeName: string | null;
  vrikharopanGap: string | null;
  sinchitAsinchit: string | null;
  vrikharopanAkshanshDesans: string | null;
  vrikharopanAkshansh: string | null;
  vrikharopanDikshansh: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
  adharPdfFile: string | null;
  kmlFile: string | null;
  awedanStatus: number | null;
  plantationType: number | null;
  createdBy: string | null;
  createdByName: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  bankpassbookPdfFile: string | null;
  b1P1PdfFile: string | null;
  area: string | null;
  otherPlant: string | null;
  plantTypeFinal: string | null;
  landType: number | null;
  totalAcre: string | null;
  availableArea: string | null;
  compartmentNo: string | null;
  pattaNo: string | null;
}

export interface VivranPlantDetails {
  id: number;
  applicationNumber: string;
  plantId: number | null;
  plantName: string;
  totalArea: number | null;
  totalTree: number | null;
  totalRopit: number | null;
  isOther: boolean | null;
  createBy: string;
  createDate: string | null;
  lastUpdated: string | null;
  isDelete: boolean | null;
}

