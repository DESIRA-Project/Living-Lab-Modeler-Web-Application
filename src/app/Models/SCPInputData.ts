import { DynamicModalDialogComponent } from "../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { LLSCPEntity, SCPEntity, SCPGroup } from "../User/Admin/LivingLabEntityManagement/scp-entity";
import { SCPConnection } from "../User/LLCreation/LLSCPEntities/ll-scp-entities.component";

export interface SCPPosition{
    i:number;
    groupId:number;
}
export interface SCPInputData {
    entity: SCPEntity | null;
    handle: DynamicModalDialogComponent | null;
    groups: SCPGroup[];
    onEditSuccessCallback: Function;
    onEditErrorCallback: Function;
    currentlySelected?:  { [key: number]: LLSCPEntity[] } ;
    llEntity?: LLSCPEntity;
    currentConnections?:SCPConnection[];
    showGroups:boolean;
    initialPosition?:SCPPosition;
    currentConnection?:SCPConnection;
};