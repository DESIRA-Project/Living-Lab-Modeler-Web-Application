import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { select } from "d3";
import { DynamicModalDialogComponent } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { PageResponse } from "src/app/Models/Response/response";
import { SCPInputData, SCPPosition } from "src/app/Models/SCPInputData";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { LLSCPEntity, SCPEntity, SCPGroup } from "../../Admin/LivingLabEntityManagement/scp-entity";
import { MyErrorStateMatcher, SCPEntityEditComponent } from "../../Admin/LivingLabEntityManagement/scp-entity-edit.component";
import { LLSCPEntityEditComponent } from "./ll-scp-entity-edit.component";
enum LLMode {
    //    NONE,
    NEW,
    //  EXISTING,
    //    EDIT_NEW,
    EDIT
}
@Component({
    selector: 'll-scp-entity-modal',
    templateUrl: './ll-scp-entity-modal.component.html',
    styleUrls: ['./ll-scp-entity-edit.css'],
})
export class LLSCPEntityModalComponent extends LLSCPEntityEditComponent {
    mode: LLMode = LLMode.NEW;
    ready: boolean = true;
    scpEntities: SCPEntity[] = [];
    selection: SCPEntity | null = null;
    useGlobalEntityLabelDescription: boolean = false;
    showGlobalEntityLabelDescriptionOption: boolean = false;
    initialUseGlobalEntityLabelDescription: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: SCPInputData, protected dialogRef: MatDialogRef<LLSCPEntityModalComponent>,
        protected service: SCPEntitiesService, protected servicesProviderService: AngularServicesProviderService) {
        super(data, dialogRef, service, servicesProviderService);
        this.mode = this.llEntity.id === undefined ? LLMode.NEW : LLMode.EDIT;
        console.log(data.llEntity);
        if (this.llEntity && this.llEntity.needsModeration !== undefined && this.llEntity.needsModeration === false && this.llEntity.usesGlobalDescription !== undefined) {
            this.useGlobalEntityLabelDescription = this.llEntity.usesGlobalDescription;
            this.showGlobalEntityLabelDescriptionOption = true;
            this.initialUseGlobalEntityLabelDescription = this.llEntity.usesGlobalDescription;
            if (this.llEntity.usesGlobalDescription) {
                //    this.llEntity.description = "";
                this.initialDescriptionValue = this.description = this.llEntity.entityLabelDescription;
            }
            //alert("Uses global? "+this.llEntity.usesGlobalDescription);
        }
    }

    currentLabelIsGlobal() {

    }

    descriptionUpdate(e:any){
        if(!this.onEditMode()){
            this.descriptionChanged(e);
        }
        else{
            this.descriptionChangedOnEdit(e);
        }
    }

    descriptionChangedOnEdit(e: any) {
        let desc = e.target.value;
        if (!this.onEditMode()) return;
        this.descriptionChangedOnEditUpdate(desc);
    }

    
    clearEntityDescription() {
        //this.description = "";
        if(this.onEditMode()){
            this.descriptionChangedOnEditUpdate("");
        }
        else{
            this.descriptionStateUpdate("");
        }
    }

    descriptionChangedOnEditUpdate(desc:string){
        if (this.selection === null) {
            this.useGlobalEntityLabelDescription = desc.trim() === this.llEntity.entityLabelDescription.trim()
        }
        else {
            this.useGlobalEntityLabelDescription = desc.trim() === this.selection.description.trim();
        }
        this.description = desc;
    }

    descriptionStateUpdate(desc:string){
        if (!this.selection) return;
        this.useGlobalEntityLabelDescription = desc.trim() === this.selection.description.trim();
        this.description = desc;
    }

    descriptionChanged(e: any) {
        let desc = e.target.value;
        if (!this.selection) return;
        this.descriptionStateUpdate(desc);
    }

    showGlobalDescriptionOption() {
        return this.showGlobalEntityLabelDescriptionOption;
    }

    getTitle() {
        return this.mode === LLMode.EDIT ? "Edit SCP Entity" : "Add SCP Entity";
    }

    onEditMode() {
        return this.mode === LLMode.EDIT;
    }

    clearEntityName() {
        this.nameExists = false;
        this.name = "";
        if (this.scpEntities.length > 0) {
            this.scpEntities = [];
            this.selection = null;
        }
        if(this.useGlobalEntityLabelDescription){
            //he was using a default entity description, its OK to erase it
            this.description = '';
        }
        this.useGlobalEntityLabelDescription = false;
        this.showGlobalEntityLabelDescriptionOption = false;
    }

    selectEntity(name: string) {
        this.selection = null;
        this.nameExists = false;

        for (let i = 0; i < this.scpEntities.length; i++) {
            if (this.scpEntities[i].name === name) {
                this.selection = this.scpEntities[i];
                this.useGlobalEntityLabelDescription = true;
                this.selection.entityLabelDescription = this.scpEntities[i].description;
                this.showGlobalEntityLabelDescriptionOption = true;
                this.description = this.selection.entityLabelDescription;
                console.log(this.selection);
                break;
            }
        }
    }

    searchForEntityLabel() {
        this.nameExists = false;
        if (this.name.trim().length < 3) {
            return;
        }
        this.service.getSCPEntityLabelsBasedOnName(this.name).subscribe((response: PageResponse<SCPEntity>) => {
            this.scpEntities = this.getUnSelectedEntities(response.data);
        });
    }

    entityDescriptionChanged(): boolean {
        return this.initialUseGlobalEntityLabelDescription !== this.useGlobalEntityLabelDescription;
    }

    canSave(): boolean {
        if (this.name.trim().length === 0) return false;
        if (this.checkEntityUniqueness()) {
            return false;
        }

        return (this.mode === LLMode.NEW && this.name.trim().length > 0 && this.selectedGroupIdIndex !== -1) ||
            (this.mode === LLMode.EDIT && (this.name.trim() !== "" && (this.name.trim() !== this.initialNameValue ||
                this.description.trim() !== this.initialDescriptionValue ||
                this.initialSelectedGroupIndex !== this.selectedGroupIdIndex || (this.entityDescriptionChanged() && this.showGlobalEntityLabelDescriptionOption))));
    }

    checkEntityUniqueness(): boolean {
        if (this.selectedGroupIdIndex === -1) return false;
        let groupId = this.groups[this.selectedGroupIdIndex].id;
        let selected = this.currentlySelected[groupId];
        if (selected === undefined || (selected && selected.length === 0)) return false;
        let entityName = "";

        if (this.mode === LLMode.NEW) {
            if (this.selection !== null) {
                entityName = this.selection.name;
            }
            else {
                entityName = this.name;
            }
            for (let i = 0; i < selected.length; i++) {
                if (selected[i].name === entityName) {
                    this.nameExists = true;
                    this.errorMessage = "The selected Entity exists in your Entity list."
                    return true;
                }
            }
            return false;
        }
        entityName = this.selection != null ? this.selection.name : this.name;

        for (let i = 0; i < selected.length; i++) {
            if (selected[i].name === entityName) {
                //there was a name change
                if (entityName !== this.initialNameValue) {
                    this.nameExists = true;
                    this.errorMessage = "An Entity exists in your Entity list with the same group and name."
                    return true;
                }
                else {
                    if (this.description !== this.initialDescriptionValue) return false;
                    if (groupId !== this.groups[this.initialSelectedGroupIndex].id) {
                        this.nameExists = true;
                        //console.log(groupId + " "+this.initialSelectedGroupIndex)
                        this.errorMessage = "An Entity exists in your Entity list with the same group and name."
                        return true;
                    }
                }
            }
        }
        return false;
    }

    selectGroup(i: number) {
        console.log(i);
        this.selectedGroupIdIndex = i;
        this.nameExists = false;
        this.checkEntityUniqueness();
    }

    save(): void {
        this.constructSelection();
        this.dialogRef.close(this.llEntity);
    }

    checkIfUserFilledNameMatchingLabelEntity() {
        if (this.scpEntities.length === 0) return;
        for (let i = 0; i < this.scpEntities.length; i++) {
            let e = this.scpEntities[i];
            if (e.name.trim() === this.name.trim()) {
                console.log("User matched an existing selection but didnt click it.." + this.name);
                this.selection = e;
                this.useGlobalEntityLabelDescription = false;
                this.showGlobalEntityLabelDescriptionOption = false;
                return;
            }
        }
    }

    constructSelection() {
        if (this.selection === null) {
            this.checkIfUserFilledNameMatchingLabelEntity();
        }

        if (this.selection === null) {
            //alert("we are editing");
            let description = this.useGlobalEntityLabelDescription ? "" : this.description;

            this.llEntity = {
                id: 0,
                name: this.name,
                description: description,
                groupId: this.groups[this.selectedGroupIdIndex].id,
                needsModeration: this.llEntity.needsModeration,
                labelId: 0,
                scpEntityToLivingLabId: undefined,
                usesGlobalDescription: this.useGlobalEntityLabelDescription,
                entityLabelDescription: this.llEntity.entityLabelDescription,
            } as LLSCPEntity;
            //console.log(this.llEntity)
        }
        else {
            //console.log(this.selection);
            let description = this.useGlobalEntityLabelDescription ? "" : this.description;
            this.llEntity = {
                id: 0,
                name: this.selection.name,
                description: description,
                groupId: this.groups[this.selectedGroupIdIndex].id,
                needsModeration: this.selection.needsModeration,
                labelId: this.selection.id,
                scpEntityToLivingLabId: this.selection.scpEntityToLivingLabId,
                usesGlobalDescription: this.useGlobalEntityLabelDescription,
                entityLabelDescription: this.selection.entityLabelDescription
            } as LLSCPEntity;
        }

        console.log("Before saving...");
        console.log(this.llEntity);
    }
}