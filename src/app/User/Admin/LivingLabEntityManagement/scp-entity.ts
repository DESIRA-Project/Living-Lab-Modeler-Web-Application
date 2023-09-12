export interface SCPEntity {
    id:number;
    name:string;
    description:string;
    groupId:number;
    groupName:string;
    needsModeration:boolean;
    labCount:number;
    connectionsCount:boolean;
    labelId?:number
    scpEntityToLivingLabId?:number;
    usesGlobalDescription:boolean;
    entityLabelDescription:string;
}

export interface LLSCPEntity {
  id:number;
  name:string;
  description:string;
  groupId:number;
  needsModeration?:boolean;
  labelId?:number
  scpEntityToLivingLabId?:number;
  usesGlobalDescription:boolean;
  entityLabelDescription:string;
/*  groupName:string;*/
}


export interface SCPGroup{
  value: string, color: string, id: number 
}