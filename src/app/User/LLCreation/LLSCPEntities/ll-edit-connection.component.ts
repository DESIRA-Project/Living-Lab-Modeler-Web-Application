import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SCPInputData } from "src/app/Models/SCPInputData";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { LLSCPEntity, SCPGroup } from "../../Admin/LivingLabEntityManagement/scp-entity";
import { LLNewSCPEntityConnectionComponent } from "./ll-new-connection.component";
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
    selector: 'll-edit-scp-entity-connection',
    templateUrl: './ll-edit-connection.component.html',
    styleUrls:['./ll-new-connection.css'],
})
export class LLEditConnectionComponent extends LLNewSCPEntityConnectionComponent{
    title = "Edit Socio-Cyber-Physical connection";
    currentConnection:SCPConnection = {} as SCPConnection;
    source:any = {}
    dest:any = {};
    initialDescription:string = "";
    
    constructor(@Inject(MAT_DIALOG_DATA) public data: SCPInputData, protected dialogRef: MatDialogRef<LLNewSCPEntityConnectionComponent>,
    protected service: SCPEntitiesService, protected servicesProviderService: AngularServicesProviderService){
        super(data, dialogRef, service, servicesProviderService);
        this.ready = false;
        if(data.currentConnection){
            this.currentConnection = data.currentConnection;            
            this.initialDescription = this.connectionDescription = this.currentConnection.description;
        }
        this.source = this.getSource();
        this.dest =  this.getDest();

        this.connectionFromControl.setValue(this.source.value);
        this.connectionToControl.setValue(this.dest.value);     
        
        this.connectionFromControl.disable({onlySelf:true, emitEvent:true});
        this.connectionToControl.disable({onlySelf:true, emitEvent:true});
    }

    getSource(){
        return this.currentConnection && this.currentConnection.source ? {value: this.currentConnection.source.name, viewValue: this.currentConnection.source.name} : {value:'', viewValue: ''};        
    }

    getDest(){
        return this.currentConnection && this.currentConnection.dest ? {value: this.currentConnection.dest.name, viewValue: this.currentConnection.dest.name} : {value:'', viewValue: ''};        
    }

    setupFormControls() {
    }

    saveConnection(){
       this.currentConnection.description = this.connectionDescription;

       this.dialogRef.close(this.currentConnection);
    }

}