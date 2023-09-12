import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { equal } from "assert";
import { PageResponse } from "src/app/Models/Response/response";
import { SCPInputData, SCPPosition } from "src/app/Models/SCPInputData";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { SCPEntitiesService } from "src/app/Service/SCPentities.service";
import { LLSCPEntity, SCPEntity } from "../../Admin/LivingLabEntityManagement/scp-entity";
import { SCPEntityEditComponent } from "../../Admin/LivingLabEntityManagement/scp-entity-edit.component";

enum LLSCPEntityType {
    NONE,
    NEW,
    EXISTING,
    EDIT_NEW,
    EDIT_EXISTING
}

@Component({
    selector: 'll-scp-entity-edit',
    templateUrl: './ll-scp-entity-edit.component.html',
    styleUrls: ['./ll-scp-entity-edit.css'],
})
export class LLSCPEntityEditComponent extends SCPEntityEditComponent {
    uiMode: LLSCPEntityType = LLSCPEntityType.NONE;
    ready: boolean = true;
    llEntity: LLSCPEntity = {} as LLSCPEntity;
    scpEntities: SCPEntity[] = [];
    entityControl = new FormControl('');
    currentlySelected: { [key: number]: LLSCPEntity[] } = {};
    position: SCPPosition | undefined;

    constructor(@Inject(MAT_DIALOG_DATA) public data: SCPInputData, protected dialogRef: MatDialogRef<LLSCPEntityEditComponent>,
        protected service: SCPEntitiesService, protected servicesProviderService: AngularServicesProviderService) {
        super(data, service, servicesProviderService);

        if (data.currentlySelected) {
            this.currentlySelected = data.currentlySelected;
        }
        if (data.initialPosition) {
            this.position = data.initialPosition;
        }
        //console.log(this.currentlySelected);
        if (data.llEntity) {
            /*console.log(data);*/
            this.llEntity = data.llEntity;
           // console.log(this.llEntity)
            if (this.llEntity.id === 0) {
                if (this.llEntity.labelId !== 0) {
                    this.uiMode = LLSCPEntityType.EDIT_EXISTING;
                }
                else {
                    this.uiMode = LLSCPEntityType.EDIT_NEW;
                }
            }
            else {
                this.uiMode = LLSCPEntityType.EDIT_EXISTING;
            }
            this.initialNameValue = this.name = this.llEntity.name;
            this.initialDescriptionValue = this.description = this.llEntity.description;
            this.initialSelectedGroupIndex = this.selectedGroupIdIndex = this.findCurrentGroup(this.llEntity.groupId);
        }
    }

    isGlobalEntity() {
        if (this.llEntity.needsModeration === undefined) {
            return false;
        }
        return !this.llEntity.needsModeration;
    }

    getExistingEntityBubbleColor(e: SCPEntity) {
        let i = this.findCurrentGroup(e.groupId);
        if (i === -1) {
            return 'grey';
        }
        return this.groups[i].color;
    }

    getBubbleColorForExistingEntity(groupIndex: number) {
        let e: SCPEntity = {
            id: 0,
            name: "",
            description: "",
            groupId: 0,
            groupName: "",
            needsModeration: false,
            labCount: 0,
            connectionsCount: false,
            entityLabelDescription: "",
            usesGlobalDescription: false
        };
        for (let i = 0; i < this.scpEntities.length; i++) {
            if (this.scpEntities[i].name === this.llEntity.name) {
                e = this.scpEntities[i];
                break;
            }
        }

        let i = this.findCurrentGroup(e.groupId);
        if (i === -1) {
            return 'grey';
        }
        if (this.groups[groupIndex].id !== e.groupId) {
            return 'grey';
        }
        return this.groups[i].color;
    }


    contentChanged() {
        return this.initialDescriptionValue !== this.description || this.initialNameValue !== this.name ||
            (this.selectedGroupIdIndex !== this.initialSelectedGroupIndex && this.initialSelectedGroupIndex !== -1);
    }

    canSaveEdited() {
        if (this.nameExists) {
            return false;
        }
        //        console.log(this.contentChanged())
        return this.contentChanged();
        //        return (this.contentChanged() || (this.llEntity === null && this.name.trim() !== '' && this.nameExists === false)) && !this.nameExists && this.selectedGroupIdIndex !== -1;
    }


    onEditMode() {
        return this.uiMode === LLSCPEntityType.EDIT_EXISTING || this.uiMode === LLSCPEntityType.EDIT_NEW;
    }

    onEditNewEntityMode() {
        return this.uiMode === LLSCPEntityType.EDIT_NEW;
    }

    onEditExistingEntityMode() {
        return this.uiMode === LLSCPEntityType.EDIT_EXISTING;
    }

    uiModeChanged(e: MatSelectChange) {
        let oldState = this.uiMode;

        this.uiMode = e.value === "new" ? LLSCPEntityType.NEW : LLSCPEntityType.EXISTING;

        if (oldState !== this.uiMode) {
            this.ready = true;
        }
    }

    getTitle(): string {
        switch (this.uiMode) {
            case LLSCPEntityType.NONE: {
                return "Add SCP Entity";
            }
            case LLSCPEntityType.NEW: {
                return "Add New SCP Entity";
            }
            case LLSCPEntityType.EXISTING: {
                return "Add Existing SCP Entity";
            }
            case LLSCPEntityType.EDIT_EXISTING: {
                return "Edit Existing SCP Entity";
            }
            case LLSCPEntityType.EDIT_NEW: {
                return "Edit SCP Entity";
            }
        }
    }


    ngOnInit() {
        this.entityControl = this.setupForm(this.entityControl);
    }

    canSaveOnExistingMode(): boolean {
        return true;
    }

    canSaveOnAddNewMode(): boolean {
        return this.canSave();
    }

    canSave(): boolean {
        if (this.isOnAddNewSCPEntityMode()) {
            return super.canSave();
        }
        if (this.llEntity === null || this.llEntity.name === undefined) {
            return false;
        }
        return this.llEntity && this.llEntity.name.trim() != "" ? true : false;
    }


    isCurrentEntityEmpty() {
        if (!this.llEntity) return true;
        if (this.llEntity.name === undefined) return true;
        if (this.llEntity.name.trim() === "") return true;
        return false;
    }

    setupForm(f: FormControl) {
        let inst = this;
        f.valueChanges
            .subscribe((model: any) => {
                if (this.isOnAddExistingSCPEntityMode()) {
                    inst.llEntity.name = model;
                }
                //              inst.ready = false;
                /*console.log("Searching for " + model);*/
                inst.service.getSCPEntityLabelsBasedOnName(model).subscribe((response: PageResponse<SCPEntity>) => {
                    inst.scpEntities = inst.getUnSelectedEntities(response.data);
                    // console.log(inst.scpEntities)
                    //                    inst.ready = true;
                });
            });
        return f;
    }

    showAllOptionsOnFocus() {
        let inst = this;
        inst.service.getSCPEntityLabelsBasedOnName("").subscribe((response: PageResponse<SCPEntity>) => {
            inst.scpEntities = inst.getUnSelectedEntities(response.data);
        });
    }

    getUnSelectedEntities(entities: SCPEntity[]) {
        if (Object.keys(this.currentlySelected).length === 0) {
            return entities;
        }
        let keys = Object.keys(this.currentlySelected);
        let selection: SCPEntity[] = [];
        for (let j = 0; j < entities.length; j++) {
            let s = entities[j];
            let found = false;

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let l = this.currentlySelected[parseInt(key)];
                for (let k = 0; k < l.length; k++) {
                    if (l[k].groupId === s.groupId && l[k].name === s.name) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }

            if (!found) {
                selection.push(s);
            }
        }
        return selection;

    }

    isOnAddNewSCPEntityMode() {
        return this.uiMode === LLSCPEntityType.NEW && this.ready === true;
    }

    isOnAddExistingSCPEntityMode() {
        return this.uiMode === LLSCPEntityType.EXISTING && this.ready === true;
    }

    checkIfNameExistsInSelection(): boolean {
        let groupId = this.groups[this.selectedGroupIdIndex].id;
        let name = this.name;
        if (Object.keys(this.currentlySelected).length === 0) {
            return false;
        }
        let keys = Object.keys(this.currentlySelected);
        let found = false;

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let l = this.currentlySelected[parseInt(key)];
            for (let k = 0; k < l.length; k++) {
                if (l[k].groupId === groupId && l[k].name === name) {
                    return true;
                }
            }
        }
        return false;
    }


    checkIfCurrentNameExistsInSelection(currentName: string): boolean {
        let groupId = this.groups[this.selectedGroupIdIndex].id;
        let name = currentName;
        if (Object.keys(this.currentlySelected).length === 0) {
            return false;
        }
        let keys = Object.keys(this.currentlySelected);
        let found = false;

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let l = this.currentlySelected[parseInt(key)];
            for (let k = 0; k < l.length; k++) {
                if (l[k].groupId === groupId && l[k].name === name) {
                    return true;
                }
            }
        }
        return false;
    }

    checkExactSCPEntityExists(): boolean {
        let groupId = this.groups[this.selectedGroupIdIndex].id;
        let name = this.name;
        if (Object.keys(this.currentlySelected).length === 0) {
            return false;
        }
        let keys = Object.keys(this.currentlySelected);
        let found = false;

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let l = this.currentlySelected[parseInt(key)];
            for (let k = 0; k < l.length; k++) {
                if (l[k].groupId === groupId && l[k].name === name) {
                    return true;
                }
            }
        }
        return false;
    }

    checkExactSCPEntityExistsWithDifferentId(id: number): boolean {
        let groupId = this.groups[this.selectedGroupIdIndex].id;
        let name = this.name;
        console.log(id);

        if (Object.keys(this.currentlySelected).length === 0) {
            return false;
        }
        let keys = Object.keys(this.currentlySelected);
        let found = false;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let l = this.currentlySelected[parseInt(key)];
            for (let k = 0; k < l.length; k++) {
                if (l[k].groupId === groupId && l[k].name === name && l[k].id !== id) {
                    return true;
                }
            }
        }
        return false;
    }

    getExactSCPEntityExistsWithValues(name: string, groupId: number): number {
        if (Object.keys(this.currentlySelected).length === 0) {
            return 0;
        }
        let keys = Object.keys(this.currentlySelected);
        let cnt: number = 0;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let l = this.currentlySelected[parseInt(key)];
            for (let k = 0; k < l.length; k++) {
                if (l[k].groupId === groupId && l[k].name === name) {
                    cnt++;
                }
            }
        }
        console.log(cnt);
        return cnt;
    }

    currentObjectDescriptionChanged() {
        if (this.position) {
            console.log(this.position);
            console.log(this.currentlySelected);
            console.log(this.currentlySelected[this.position?.groupId][this.position.i].description);
            console.log(this.description);
            
            if (this.currentlySelected[this.position?.groupId][this.position.i].description !== this.description) {
                return true;
            }
        }
        return false;
    }

    canProceedWithEdit():boolean{
        let name = this.name;
        let groupId = this.groups[this.selectedGroupIdIndex].id;
        let description = this.description;

        if(!this.position) return true;
        let oldGroupId = this.position?.groupId;
        let oldIndex = this.position?.i;

        let oldElement = this.currentlySelected[oldGroupId][oldIndex];
        //check if there is another element that has equal name and group Id in the list and the indices are different than the positional indices
        let keys = Object.keys(this.currentlySelected);
        let cnt: number = 0;
        let node:LLSCPEntity|null = null;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let groupKey = parseInt(key);
            let l = this.currentlySelected[groupKey];
            for (let k = 0; k < l.length; k++) {
                if(groupKey === oldGroupId && oldIndex === k){
                    console.log("we found the current node, skip")
                    continue;
                }
                if (l[k].groupId === groupId && l[k].name === name) {
                    console.log("There is another node");
                    console.log(l[k]);
                    node = l[k];
                    break;
                }
            }
        }
        if(node === null){
            console.log("No node was found");
            console.log("Is description the same?");
            //there is no other node with the same values
            //but we need to check if the description has changed
            if(oldElement.description.trim() === description.trim()){
                console.log("Description equal, no edit");
                return false;
            }            
            console.log("Description not equal, proceed edit");
            return true;
        }
        
        return false;
    }

    save(): void {

        if (this.onEditMode()) {
            /*console.log(this.llEntity);
            console.log(this.groups);
            console.log(this.selectedGroupIdIndex);*/

            if (this.uiMode === LLSCPEntityType.EDIT_EXISTING && (this.checkExactSCPEntityExistsWithDifferentId(this.llEntity.id)
            )) {
                this.servicesProviderService.createNewModal().alert(false, "The current SCP Entity of the same group exists already.");
                return;
            }

            let equalObjects = this.getExactSCPEntityExistsWithValues(this.name, this.groups[this.selectedGroupIdIndex].id);
            if (this.uiMode === LLSCPEntityType.EDIT_NEW && equalObjects > 0) {
                console.log("Can proceed with edit?");
                let canEdit = this.canProceedWithEdit();
                console.log(canEdit);
                if(!canEdit){
                    this.servicesProviderService.createNewModal().alert(false, "The current SCP Entity of the same name and group exists already.");
                    return;
                }
                
            }

            this.llEntity = { name: this.name, id: this.uiMode === LLSCPEntityType.EDIT_EXISTING ? this.llEntity.id : 0, description: this.description, groupId: this.groups[this.selectedGroupIdIndex].id, labelId: this.llEntity.labelId, scpEntityToLivingLabId: this.llEntity.scpEntityToLivingLabId } as SCPEntity;

            /*console.log(this.llEntity);*/


        }
        else if (this.isOnAddNewSCPEntityMode()) {

            if (this.checkIfNameExistsInSelection()) {
                this.servicesProviderService.createNewModal().alert(false, "The current SCP Entity exists already.");
                return;
            }

            this.llEntity = { name: this.name, id: 0, description: this.description, groupId: this.groups[this.selectedGroupIdIndex].id, labelId: 0, needsModeration: true, scpEntityToLivingLabId: 0 } as SCPEntity;
        }
        else if (this.isOnAddExistingSCPEntityMode()) {
            if (this.checkIfCurrentNameExistsInSelection(this.llEntity.name)) {
                this.servicesProviderService.createNewModal().alert(false, "The current SCP Entity is already in your list.");
                return;
            }
            //find entity with that name
            for (let i = 0; i < this.scpEntities.length; i++) {
                if (this.scpEntities[i].name === this.llEntity.name) {
                    //this.llEntity = this.scpEntities[i];

                    this.llEntity.groupId = this.groups[this.selectedGroupIdIndex].id;
                    this.llEntity.description = this.scpEntities[i].description;
                    this.llEntity.id = 0;
                    this.llEntity.labelId = this.scpEntities[i].id;
                    this.llEntity.needsModeration = this.scpEntities[i].needsModeration;
                    this.llEntity.scpEntityToLivingLabId = this.scpEntities[i].scpEntityToLivingLabId;
                    this.llEntity.name = this.scpEntities[i].name;

                    break;
                }
            }

            if (this.description.trim() !== "" && this.description !== this.initialDescriptionValue) {
                this.llEntity.description = this.description;
            }
        }
        else {
            alert("Unhandle Situation");
            return;
        }
        //console.log(this.llEntity)
        this.dialogRef.close(this.llEntity);
    }

    isOnMode() {
        return this.uiMode !== LLSCPEntityType.NONE && this.ready === true;
    }
}