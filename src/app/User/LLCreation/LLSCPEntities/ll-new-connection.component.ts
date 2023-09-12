import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SCPInputData } from "src/app/Models/SCPInputData";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { LLSCPEntity, SCPGroup } from "../../Admin/LivingLabEntityManagement/scp-entity";
import { SCPConnection } from "./ll-scp-entities.component";

interface Entity {
    value: string;
    viewValue: string;
    node: LLSCPEntity;
}

interface EntityGroup {
    disabled?: boolean;
    name: string;
    id:number;
    entity: Entity[];
}

@Component({
    selector: 'll-new-scp-entity-connection',
    templateUrl: './ll-new-connection.component.html',
    styleUrls:['./ll-new-connection.css'],
})
export class LLNewSCPEntityConnectionComponent {
    currentlySelected: { [key: number]: LLSCPEntity[] } = {};
    title = "New Socio-Cyber-Physical connection"
    groups: SCPGroup[] = [];
    ready = false;
    entityGroupFrom: EntityGroup[] = [];
    entityGroupTo: EntityGroup[] = [];
    connectionFromControl = new FormControl('');
    connectionToControl = new FormControl('');
    selectionFrom: LLSCPEntity | undefined = undefined;
    selectionTo: LLSCPEntity | undefined = undefined;
    currentConnections: SCPConnection[] = [];
    connectionDescription: string = "";

    constructor(@Inject(MAT_DIALOG_DATA) public data: SCPInputData, protected dialogRef: MatDialogRef<LLNewSCPEntityConnectionComponent>,
        protected service: SCPEntitiesService, protected servicesProviderService: AngularServicesProviderService) {
        if (data.currentlySelected) {
            this.currentlySelected = data.currentlySelected;
        }
        if (data.currentConnections) {
            this.currentConnections = data.currentConnections;
        }

        this.groups = data.groups;
        this.setupFormControls();
        this.prepareEntityGroups();
    }

    clearConnectionDescription(){
        this.connectionDescription = "";
    }

    groupInConnection(group:EntityGroup):boolean{
         if(this.selectionFrom ){
            if(this.selectionFrom.groupId === group.id){
                return true;
            }
         }

         if(this.selectionTo ){
            if(this.selectionTo.groupId === group.id){
                return true;
            }
         }         
         return false;
    }

    setupFormControls() {
        let inst = this;
        this.connectionFromControl.valueChanges.subscribe((v: LLSCPEntity) => {
            /*console.log(v);*/
            inst.selectionFrom = v;
        });

        this.connectionToControl.valueChanges.subscribe((v: LLSCPEntity) => {
            /*console.log(v);*/
            inst.selectionTo = v;
        });
    }

    prepareEntityGroups() {
        if (!this.currentlySelected) return;
        let keys = Object.keys(this.currentlySelected);
        for (let i = 0; i < keys.length; i++) {
            let groupId = keys[i];
            let groupIndx = this.findCurrentGroup(parseInt(groupId));
            if (groupIndx === -1) {
                console.error("Couldnt find group for id = " + groupId);
                continue;
            }
            let group = this.groups[groupIndx];
            let es: LLSCPEntity[] = this.currentlySelected[parseInt(groupId)];
            let gr: EntityGroup = { disabled: false, name: group.value, entity: [] , id:group.id};
            for (let j = 0; j < es.length; j++) {
                gr.entity.push({ value: es[j].id.toString(), viewValue: es[j].name, node: es[j] });
            }
            this.entityGroupFrom.push({ ...gr });
            this.entityGroupTo.push({ ...gr });
        }
        this.ready = true;
    }

    connectionExists(optionEntity:Entity, selectedEntity:LLSCPEntity|undefined ):boolean{
        if(!selectedEntity){
            return false;
        }
        let e = optionEntity.node;
        for(let i = 0;i<this.currentConnections.length;i++){
            let c = this.currentConnections[i];
            if(c && c.source === e && c.dest === selectedEntity){
                return true;
            }
            if(c && c.dest === e && c.source === selectedEntity){
                return true;
            }            
        }
        return false;
    }

    findCurrentGroup(groupId: number) {
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id === groupId) {
                return i;
            }
        }
        return -1;
    }

    addConnection() {
        this.dialogRef.close({ source: this.selectionFrom, dest: this.selectionTo, description: this.connectionDescription } as SCPConnection)
    }

    onAddConnection() {
        return (this.selectionFrom !== this.selectionTo && this.selectionFrom !== undefined && this.selectionTo !== undefined)
    }

    close(): void {
        this.dialogRef.close();
    }
}