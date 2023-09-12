import { Component, Inject, OnDestroy } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DynamicModalDialogComponent } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { Deepcopy } from "src/app/Utils/deepcopy";


export interface SDGImpactNode{
    currentlyPositive:boolean|null;
    impactDescription:string|null;
    futureImpactDescription:string|null,
    futurePositive:boolean|null;
}

export interface SDGImpactModalData{
    node:SDGImpactNode;
    id:string;
    handle:DynamicModalDialogComponent;
};

@Component({
    selector: 'sdg-impact-modal',
    templateUrl: './sdg-impact-modal.component.html',
    styleUrls: ['./sdg-impact-modal.component.css'],
})

export class SDGImpactModalComponent  {
    initialNode:SDGImpactNode;

    constructor(@Inject(MAT_DIALOG_DATA) public data: SDGImpactModalData, protected dialogRef: MatDialogRef<SDGImpactModalComponent>,
        protected servicesProviderService: AngularServicesProviderService) {
            this.initialNode = Deepcopy.copy(this.data.node );
        
    }

    clearCurrentImpactDescription(){
        this.data.node.impactDescription = "";
    }

    clearFutureImpactDescription(){
        this.data.node.futureImpactDescription = "";
    }

    save(){
          this.dialogRef.close(this.data.node);
    }

    canSave(){
        if(this.initialNode.currentlyPositive !== this.data.node.currentlyPositive) return true;
        if(this.initialNode.futurePositive !== this.data.node.futurePositive) return true;

        if(this.initialNode.futureImpactDescription === null && this.data.node.futureImpactDescription !== null) return true;
        if(this.initialNode.futureImpactDescription !== null && this.data.node.futureImpactDescription === null) return true;        
        if(this.initialNode.futureImpactDescription !== null && this.data.node.futureImpactDescription !== null && this.initialNode.futureImpactDescription.trim() !== this.data.node.futureImpactDescription.trim()) return true;

        if(this.initialNode.impactDescription === null && this.data.node.impactDescription !== null) return true;
        if(this.initialNode.impactDescription !== null && this.data.node.impactDescription === null) return true;  
        if(this.initialNode.impactDescription !== null && this.data.node.impactDescription !== null && this.initialNode.impactDescription.trim() !== this.data.node.impactDescription.trim()) return true;        
        return false;
    }
    close(){
        this.dialogRef.close(null);
    }

    switchCurrentPositiveImpact(){
        let v = this.data.node.currentlyPositive;
        if(v === undefined){
            this.data.node.currentlyPositive = true;
        }
        else{
            this.data.node.currentlyPositive = !v;
        }
    }

    switchFuturePositiveImpact(){
        let v = this.data.node.futurePositive;
        if(v === undefined){
            this.data.node.futurePositive = true;
        }
        else{
            this.data.node.futurePositive = !v;
        }
    }

}