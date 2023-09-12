import { Component } from "@angular/core";
import { LLStakeholder } from "src/app/Models/LLStakeholder";
import { AddNewStakeholderComponent, LLComponentMode } from "src/app/stakeholder-management/add-new-stakeholder/add-new-stakeholder.component";

@Component({
    selector: 'll-add-new-stakeholder',
    templateUrl: './ll-add-new-stakeholder.component.html',
    styleUrls: ['./ll-add-new-stakeholder.component.css']
  })
  export class LLAddNewStakeholderComponent extends AddNewStakeholderComponent {
    title = "Add New Stakeholder";
    hintMessage:string = "";
    roleNotSet:boolean = false;
    selectedRole:string|undefined = undefined ;
    noRoleSelectedMessage = "The stakeholder role needs to be provided";

    onInputError(){
         return this.showHint || this.newStakeholderExists;
    }

    isUserDefinedStakeholder(){
      return this.stakeholder.id === '';
    }

    ngOnInit(): void {
      this.selectedRole = this.stakeholder.role ? this.stakeholder.role?.id.toString() : undefined;
    }

    save(): void {
      this.showHint = this.newStakeholderExists = this.roleNotSet  = false;
      if(this.selectedRole === undefined){
        this.roleNotSet = true;
        return;
      }
      if (this.stakeholder.name.trim().length < 2) {
        this.showHint = true;
        this.hintMessage = "Length must be greater than or equal to 2";
        return;
      }

      if(this.existingStakeholders.length > 0){
        for(let i = 0;i<this.existingStakeholders.length;i++){
          if(this.existingStakeholders[i].name.trim() === this.stakeholder.name.trim()){
            this.newStakeholderExists = true;
            this.hintMessage = "The current stakeholder exists";
            return;
          }
        }
      }
      let llStakeholder:LLStakeholder = <LLStakeholder>this.stakeholder;
      for(let i = 0;i<this.stakeholderRoles.length;i++){
        if(this.stakeholderRoles[i].id === parseInt ( this.selectedRole ) ){
          llStakeholder.role = this.stakeholderRoles[i];
             break;
        }
      }
      this.dialogRef.close(llStakeholder);
    }
  }
