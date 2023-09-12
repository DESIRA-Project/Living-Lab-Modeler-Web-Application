import { SCPEntity } from "./scp-entity";

export interface SCPEntityAction{
    label: (e:SCPEntity)=>string;
    tooltip?: (e:SCPEntity)=>string;
    actionCb:(e:SCPEntity)=>void;
    color:(e:SCPEntity)=>void;
    reprCondition?:(e:SCPEntity)=>boolean;
}

export interface SCPEntityBulkAction{
    label: (e:SCPEntity[])=>string;
    actionCb:(e:SCPEntity[])=>void;
    color:string;
    reprCondition?:(e:SCPEntity)=>boolean;
}
