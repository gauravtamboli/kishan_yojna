export interface SpeciesMaster {
    id: number;
    speciesName: string;
    createdBy?: number;
    createdDate: Date;
    isActive: boolean;
  }
  
  export interface AnyaPlantRequest {
    id?: number;
    speciesId: number;
    speciesName: string;
    totalArea: number;
    totalTree: number;
    ropitCount: number;
  }

  export interface AddSpeciesMasterRequest {
    speciesName: string;
    userId: number;
  }
  
  export interface UpdateSpeciesMasterRequest {
    id: number;
    speciesName: string;
    isActive: boolean;
    userId: number;
  }


  export interface SubmitAnyaPlantsRequest {
    applicationNumber: string;
    userId: number;
    plants: AnyaPlantRequest[];
  }