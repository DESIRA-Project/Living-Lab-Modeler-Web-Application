import { Component, Inject } from "@angular/core";
import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DynamicModalDialogComponent } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { ErrorResponse } from "src/app/Models/Response/error-response";
import { Response } from "src/app/Models/Response/response";
import { SCPInputData } from "src/app/Models/SCPInputData";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { LLSCPEntity, SCPEntity, SCPGroup } from "./scp-entity";


export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'scp-entity-edit',
    templateUrl: './scp-entity-edit.component.html',
    styleUrls: ['./scp-entity-edit.component.css']
})

export class SCPEntityEditComponent {

    name: string = "";
    description: string = "";
    entity: SCPEntity | null = null;
    handle: DynamicModalDialogComponent | null = null;
    nameExists = false;
    initialNameValue = "";
    initialDescriptionValue = "";
    matcher = new MyErrorStateMatcher();
    errorMessage = "";
    selectedGroupIdIndex: number = -1;
    initialSelectedGroupIndex: number = -1;
    showGroups:boolean = false;
    groups: SCPGroup[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: SCPInputData, protected service: SCPEntitiesService, protected servicesProviderService: AngularServicesProviderService) {
        this.entity = data.entity;
        this.handle = data.handle;

        this.groups = data.groups.map(x => Object.assign({}, x));
        this.groups.splice(0, 1);

        this.showGroups = this.data.showGroups;
        console.log(this.showGroups)

        if (this.entity === null) {
            this.name = this.initialNameValue = "";
            this.description = this.initialDescriptionValue = "";
        }
        else {
            this.name = this.initialNameValue = this.entity.name;
            this.description = this.initialDescriptionValue = this.entity.description;
            let groupId = this.entity.groupId;
            this.selectedGroupIdIndex = this.findCurrentGroup(groupId);
            this.initialSelectedGroupIndex = this.selectedGroupIdIndex;
        }
    }

    findCurrentGroup(groupId:number){
        for (let i = 0; i < this.groups.length; i++) {
            if (this.groups[i].id === groupId) {
                return i;
            }
        }
        return -1;
    }

    save(): void {
        let inst = this;
        if (this.entity === null) {

            this.service.createSCPEntityLabel(this.name, this.description). subscribe((data: any) => {
                inst.data.onEditSuccessCallback();
                inst.close();
                inst.servicesProviderService.createNewModal().alert(true, data.message);

            },(error:any)=>{
                inst.data.onEditErrorCallback();
                inst.close();
                inst.servicesProviderService.createNewModal().alert(false, error.error.message);
            });
        }
        else {
            this.service.updateSCPEntityLabel(this.entity.id ,this.name, this.description/*,this.groups[this.selectedGroupIdIndex].id*/).subscribe((data:any)=>{
                inst.data.onEditSuccessCallback();
                inst.close();
                inst.servicesProviderService.createNewModal().alert(true, data.message);
         },(error:any)=>{
            inst.data.onEditErrorCallback();
            inst.close();
            inst.servicesProviderService.createNewModal().alert(false, error.error.message);
         });

        }
    }

    canSave() {
        return (this.contentChanged() || (this.entity === null && this.name.trim() !== '' && this.nameExists === false)) && !this.nameExists && 
        (( this.selectedGroupIdIndex !== -1 && this.showGroups ) || !this.showGroups) ;
    }


    selectGroup(i: number) {
        this.selectedGroupIdIndex = i;
    }

    checkIfNameExists() {
        if(this.name.trim() === "" || this.name.length < 3){
            this.nameExists = false;
            return;
        }
        this.name = this.name.trim();
        let inst = this;
        this.service.checkIfSCPEntityExists(this.name).subscribe((result: Response<boolean>) => {
            // console.log(result);
            this.nameExists = result.data;

            if (result.data === true) {
                this.errorMessage = result.message;
            }
            else {
                this.errorMessage = "";
            }
        },(error:ErrorResponse)=>{
            inst.servicesProviderService.createNewModal().alert(false, error.error.message);
        });
    }

    contentChanged() {
        return this.initialDescriptionValue !== this.description || this.initialNameValue !== this.name || (this.selectedGroupIdIndex !== this.initialSelectedGroupIndex && this.initialSelectedGroupIndex !== -1);
    }

    close(): void {
        this.handle?.close();
    }

    getTitle(): string {
        return this.entity === null ? "Create New Entity" : "Edit Entity";
    }

    getActionButtonTitle() {
        return this.entity === null ? "Save" : "Update";
    }
}
