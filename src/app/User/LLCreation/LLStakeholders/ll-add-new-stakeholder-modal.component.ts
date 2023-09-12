import { ChangeDetectorRef, Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { LLStakeholder } from "src/app/Models/LLStakeholder";
import { PageResponse } from "src/app/Models/Response/response";
import { Stakeholder } from "src/app/Models/Stakeholder";
import { StakeholderService } from "src/app/Service/stakeholder.service";
import { LLComponentMode } from "src/app/stakeholder-management/add-new-stakeholder/add-new-stakeholder.component";
import { LLAddNewStakeholderTypeUnawareComponent } from "./ll-add-new-stakeholder-with-selectable-type.component";
import { LLAddNewStakeholderComponent } from "./ll-add-new-stakeholder.component";

@Component({
    selector: 'll-add-new-stakeholder-modal',
    templateUrl: './ll-add-new-stakeholder-modal.component.html',
    /*    styleUrls: ['./add-new-stakeholder.component.css']*/
})
export class LLAddNewStakeholderModalComponent extends LLAddNewStakeholderTypeUnawareComponent {
    selection: Stakeholder | null = null;
    useGlobalStakeholderDescription: boolean = true;
    showGlobalStakeholderDescription: boolean = false;
    useGlobalStakeholderLink: boolean = true;
    showGlobalStakeholderLink: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, protected dialogRef: MatDialogRef<LLAddNewStakeholderModalComponent>, stakeholderService: StakeholderService, private cdr: ChangeDetectorRef) {
        super(data, dialogRef, stakeholderService);
        this.selection = null;

        if (this.onEditMode() && this.stakeholder.moderated) {
            this.showGlobalStakeholderDescription = true;
            this.useGlobalStakeholderDescription = this.stakeholder.usesGlobalDescription;

            if(this.stakeholder.usesGlobalDescription){
                this.stakeholder.description = this.stakeholder.stakeholderDescription;
            }

            this.showGlobalStakeholderLink = true;
            this.useGlobalStakeholderLink = this.stakeholder.usesGlobalLink;

            if(this.stakeholder.usesGlobalLink){
              this.stakeholder.link = this.stakeholder.stakeholderLink;
            }

            this.initializeStakeholderRole();
        }
        else {
            if (this.onEditMode()) {
                this.useGlobalStakeholderDescription = false;
                this.showGlobalStakeholderDescription = false;
                this.useGlobalStakeholderLink = false;
                this.showGlobalStakeholderLink = false;
                this.initializeStakeholderRole();
            }
            else{
                this.useGlobalStakeholderDescription = false;
                this.useGlobalStakeholderLink = false;
            }
        }
    }

    initializeStakeholderRole() {
        let role = this.stakeholder.role;
        if (role) {
            for (let i = 0; i < this.stakeholderRoles.length; i++) {
                if (this.stakeholderRoles[i].id === (role.id)) {
                    this.selectedRole = this.stakeholderRoles[i].id.toString();
                    break;
                }
            }
        }
    }

    onEditMode() {
        return this.mode === LLComponentMode.EDIT;
    }

    onInputError() {
        return this.showHint || this.newStakeholderExists;
    }

    clearName() {
        this.stakeholder.name = "";
        this.showHint = false;
        this.hintMessage = "";
        if (this.stakeholder.moderated) {
            this.initializeCurrentStakeholder();
        }
        if(this.useGlobalStakeholderDescription){
            this.clearDescription();
            this.useGlobalStakeholderDescription = false;
        }
      if(this.useGlobalStakeholderLink){
        this.clearLink();
        this.useGlobalStakeholderLink = false;
      }
        this.selection = null;
        this.stakeholderControl.setValue("");
        this.stakeholders = [];
    }

    initializeCurrentStakeholder() {
        //we need also to remove the description
        //and disable the matchbox
        if(this.useGlobalStakeholderDescription)
        this.stakeholder.description = "";
        this.stakeholder.stakeholderDescription = "";
        this.useGlobalStakeholderDescription = false;
        if(this.useGlobalStakeholderLink)
          this.stakeholder.link = "";
        this.stakeholder.stakeholderLink = "";
        this.useGlobalStakeholderLink = false;

        this.stakeholder.moderated = false;
        this.stakeholder.id = '';
        //this.stakeholder = {id: '', name: '', moderated: false, lastAddedAt: 0, description : '', role: null, link : null, usesGlobalDescription: false, stakeholderDescription:''};
    }

    clearDescription() {
        this.stakeholder.description = "";
        this.showHint = false;
        this.hintMessage = "";

        if(this.onEditMode()){
            this.descriptionChangedOnEditUpdate("");
        }
        else{
            this.descriptionStateUpdate("");
        }

    }

    clearLink() {
      this.stakeholder.link = "";
      this.showHint = false;
      this.hintMessage = "";

      if(this.onEditMode()){
        this.linkChangedOnEditUpdate("");
      }
      else{
        this.linkStateUpdate("");
      }

    }



    setupForm(f: FormControl) {
        let inst = this;
        if (this.mode === LLComponentMode.EDIT) {
            f.setValue(this.stakeholder.name);
        }

        f.valueChanges
            .subscribe((model: any) => {
                inst.clearMessage();

                model = model.trim();
                if (model.length < 3) {
                   inst.showHint = true;
                    inst.hintMessage = "Length must be greater than or equal to 2";
                    return;
                }
                if (inst.onEditMode()) {
                    inst.initializeCurrentStakeholder();
                }
                inst.checkIfStakeholderExistsWithName(model);
                inst.stakeholder.name = model;
                inst.stakeholderService.getModeratedStakeholders(model,
                    null,
                    null,
                    null,
                    null).subscribe((response: PageResponse<Stakeholder>) => {
                        inst.stakeholders = response.data;
                    });
            });
        return f;
    }

    clearMessage(){
        this.showHint = false;
        this.hintMessage = '';
    }

    descriptionChanged(e: any) {
        let desc = e.target.value;
        if (!this.selection) return;
        this.descriptionStateUpdate(desc);
    }

    descriptionUpdate(e:any){
        if(!this.onEditMode()){
            this.descriptionChanged(e);
        }
        else{
            this.descriptionChangedOnEdit(e);
        }
    }

    descriptionStateUpdate(desc:string){
        if (this.selection === null) return;
        if(this.selection.description === null){
            this.useGlobalStakeholderDescription = false;
            this.stakeholder.description = desc;
            return;
        }
        this.useGlobalStakeholderDescription = desc.trim() === this.selection.description.trim();
        this.stakeholder.description = desc;
    }

    descriptionChangedOnEdit(e: any) {
        let desc = e.target.value;
        if (!this.onEditMode()) return;
        this.descriptionChangedOnEditUpdate(desc);
    }

    descriptionChangedOnEditUpdate(desc:string){
        if (this.selection === null) {
            if(!this.stakeholder.description){
                this.useGlobalStakeholderDescription = false;
            }
            else{
                if(this.stakeholder.description.trim() === desc.trim()){
                    //no change
                    return;
                }
                if(this.stakeholder.stakeholderDescription){
                    if(desc.trim() === this.stakeholder.stakeholderDescription.trim()){
                        this.useGlobalStakeholderDescription = true;
                    }
                    else{
                        this.useGlobalStakeholderDescription = false;
                    }
                }
                else
                this.useGlobalStakeholderDescription = desc.trim() === this.stakeholder.description.trim()
            }
        }
        else {
            if(!this.selection.description){
                this.useGlobalStakeholderDescription = false;
            }
            else{
                this.useGlobalStakeholderDescription = desc.trim() === this.selection.description.trim();
            }
        }
        this.stakeholder.description = desc;
    }

    linkChanged(e: any) {
      let link = e.target.value;
      if (!this.selection) return;
      this.linkStateUpdate(link);
    }

    linkUpdate(e:any){
      if(!this.onEditMode()){
        this.linkChanged(e);
      }
      else{
        this.linkChangedOnEdit(e);
      }
    }

    linkStateUpdate(link:string){
      if (this.selection === null) return;
      if(this.selection.link === null){
        this.useGlobalStakeholderLink = false;
        this.stakeholder.link = link;
        return;
      }
      this.useGlobalStakeholderLink = link?.trim() === this.selection.link?.trim();
      this.stakeholder.link = link;
    }

    linkChangedOnEdit(e: any) {
      let link = e.target.value;
      if (!this.onEditMode()) return;
      this.linkChangedOnEditUpdate(link);
    }

    linkChangedOnEditUpdate(link:string){
      if (this.selection === null) {
        if(!this.stakeholder.link){
          this.useGlobalStakeholderLink = false;
        }
        else{
          if(this.stakeholder.link.trim() === link.trim()){
            //no change
            return;
          }
          if(this.stakeholder.stakeholderLink){
            if(link.trim() === this.stakeholder.stakeholderLink.trim()){
              this.useGlobalStakeholderLink = true;
            }
            else{
              this.useGlobalStakeholderLink = false;
            }
          }
          else
            this.useGlobalStakeholderLink = link.trim() === this.stakeholder.link.trim()
        }
      }
      else {
        if(!this.selection.link){
          this.useGlobalStakeholderLink = false;
        }
        else{
          this.useGlobalStakeholderLink = link.trim() === this.selection.link.trim();
        }
      }
      this.stakeholder.link = link;
    }


  selectStakeholder(name: any) {
        for (let i = 0; i < this.stakeholders.length; i++) {
            if (this.stakeholders[i].name === name) {
                this.selection = this.stakeholders[i];
                this.useGlobalStakeholderDescription = true;
                this.useGlobalStakeholderLink = true;
                this.stakeholder.name = this.stakeholders[i].name;
                console.log(this.selection)
                this.stakeholder.description = this.selection.description;
                this.stakeholder.link = this.selection.link;
                this.checkIfStakeholderExistsWithName(this.selection.name);
                return;
            }
        }
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    noRoleSelected(): boolean {
        return (this.selectedRole === null || this.selectedRole === "" || this.selectedRole === undefined);
    }

    noStakeholderNameSet(): boolean {
        if (this.stakeholder.name.trim() === "") return true;
        return false;
    }

    canSaveEditMode(): boolean {
        if (this.showHint) return false;
        if (this.noStakeholderNameSet()) return false;
        if (this.initialValue.name.trim() !== this.stakeholder.name.trim()) return true;
        if (this.stakeholder.moderated
          && this.initialValue.usesGlobalDescription !== this.useGlobalStakeholderDescription
          && this.initialValue.usesGlobalLink !== this.useGlobalStakeholderLink
          && this.initialValue.moderated === this.stakeholder.moderated) return true;
        if (this.initialValue.description !== this.stakeholder.description) return true;
        if ((this.initialValue.link ?? "") !== (this.stakeholder.link?.trim() ?? "")) return true;
        if (this.initialValue.role && this.selectedRole && this.initialValue.role.id !== parseInt(this.selectedRole)) return true;
        return false;
    }

    canSave(): boolean {
        if (this.onEditMode()) {
            return this.canSaveEditMode();
        }

        if (this.showHint) return false;
        if (this.noStakeholderNameSet() || this.noRoleSelected()) return false;

        return true;
    }

    checkIfStakeholderExistsWithName(name: string): boolean {
        this.showHint = false;
        this.newStakeholderExists = false;
        this.hintMessage = "";

        if (this.existingStakeholders.length > 0) {
            for (let i = 0; i < this.existingStakeholders.length; i++) {
                if (this.existingStakeholders[i].name.trim().toLowerCase() === name.trim().toLowerCase()) {
                    this.newStakeholderExists = true;
                    this.hintMessage = "The current stakeholder exists";
                    this.showHint = true;
                    return true;
                }
            }
        }
        return false;
    }

    checkIfUserFilledNameMatchingStakeholder() {
        if (this.stakeholders.length === 0) return;
        for (let i = 0; i < this.stakeholders.length; i++) {
            let s = this.stakeholders[i];
            if (s.name.trim().toLowerCase() === this.stakeholder.name.trim().toLowerCase()) {
                console.log("User matched an existing selection but didnt click it.." + s.name);
                this.selection = this.stakeholders[i];
                //this.selection.name = this.stakeholder.name;
                this.selection.description = this.stakeholder.description;
                this.selection.link = this.stakeholder.link;
                return;
            }
        }
    }

    save(): void {
        this.showHint = this.newStakeholderExists = this.roleNotSet = false;
        if (this.selectedRole === undefined) {
            this.roleNotSet = true;
            this.showHint = true;
            return;
        }

        if (this.selection === null) {
            this.checkIfUserFilledNameMatchingStakeholder();
        }

        if (this.selection) {
            let exists = this.checkIfStakeholderExistsWithName(this.selection.name);
            if (exists) {
                return;
            }
            let llStakeholder: LLStakeholder = <LLStakeholder>this.selection;
            for (let i = 0; i < this.stakeholderRoles.length; i++) {
                if (this.stakeholderRoles[i].id === parseInt(this.selectedRole)) {
                    llStakeholder.role = this.stakeholderRoles[i];
                    break;
                }
            }
            if (this.useGlobalStakeholderDescription) {
                llStakeholder.usesGlobalDescription = true;
                //llStakeholder.stakeholderDescription = this.selection.description;
                let d = llStakeholder.description;
                if (d)
                    llStakeholder.stakeholderDescription = d;
                llStakeholder.description = "";
            }
            else {
                llStakeholder.usesGlobalDescription = false;
                let d = llStakeholder.description;
                if (d)
                    llStakeholder.stakeholderDescription = d;
                llStakeholder.description = this.stakeholder.description;
            }
            if (this.useGlobalStakeholderLink) {
              llStakeholder.usesGlobalLink = true;
              //llStakeholder.stakeholderLink = this.selection.link;
              let d = llStakeholder.link;
              if (d)
                llStakeholder.stakeholderLink = d;
              llStakeholder.link = "";
            }
            else {
              llStakeholder.usesGlobalLink = false;
              let d = llStakeholder.link;
              if (d)
                llStakeholder.stakeholderLink = d;
              llStakeholder.link = this.stakeholder.link;
            }

            this.dialogRef.close(llStakeholder);
        }
        else {

            if (this.stakeholder.name.trim().length < 2) {
                this.showHint = true;
                this.hintMessage = "Length must be greater than or equal to 2";
                return;
            }

            if (this.checkIfStakeholderExistsWithName(this.stakeholder.name)) {
                return;
            }
            let llStakeholder: LLStakeholder = <LLStakeholder>this.stakeholder;
            for (let i = 0; i < this.stakeholderRoles.length; i++) {
                if (this.stakeholderRoles[i].id === parseInt(this.selectedRole)) {
                    llStakeholder.role = this.stakeholderRoles[i];
                    break;
                }
            }
            llStakeholder.usesGlobalDescription = this.useGlobalStakeholderDescription;
            llStakeholder.stakeholderDescription = this.stakeholder.stakeholderDescription;
            if (this.useGlobalStakeholderDescription) {
                if (this.stakeholder.moderated) {
                    llStakeholder.description = this.stakeholder.stakeholderDescription;
                }
            }
            llStakeholder.usesGlobalLink = this.useGlobalStakeholderLink;
            llStakeholder.stakeholderLink = this.stakeholder.stakeholderLink;
            if (this.useGlobalStakeholderLink) {
              if (this.stakeholder.moderated) {
                llStakeholder.link = this.stakeholder.stakeholderLink;
              }
            }
            else {
            }
            this.dialogRef.close(llStakeholder);
        }

    }
}
