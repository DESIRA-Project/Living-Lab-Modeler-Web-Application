import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSelectChange } from "@angular/material/select";
import { PageResponse } from "src/app/Models/Response/response";
import { Stakeholder } from "src/app/Models/Stakeholder";
import { StakeholderService } from "src/app/Service/stakeholder.service";
import { LLComponentMode } from "src/app/stakeholder-management/add-new-stakeholder/add-new-stakeholder.component";
import { LLAddNewStakeholderComponent } from "./ll-add-new-stakeholder.component";

enum LLNewStakeholderType{
    NONE,
    NEW,
    EXISTING
}

@Component({
    selector: 'll-add-new-stakeholder-with-type-selection',
    templateUrl: './ll-add-new-stakeholder-with-selectable-type.component.html',
/*    styleUrls: ['./add-new-stakeholder.component.css']*/
  })
  export class LLAddNewStakeholderTypeUnawareComponent extends LLAddNewStakeholderComponent {

    uiMode:LLNewStakeholderType = LLNewStakeholderType.NONE;
    ready = false;
    stakeholderControl = new FormControl('');
    stakeholders:Stakeholder[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, protected dialogRef: MatDialogRef<LLAddNewStakeholderComponent>, stakeholderService:StakeholderService){
      super(data,dialogRef, stakeholderService);
    }

    uiModeChanged(e:MatSelectChange){
        let oldState = this.uiMode;
        this.uiMode = e.value === "new" ? LLNewStakeholderType.NEW : LLNewStakeholderType.EXISTING;

        if(oldState !== this.uiMode){
            this.ready = true;

        }
    }

    showAllOptionsOnFocus(){
        let value = this.stakeholderControl.value;
        if(value.trim().length === 0){
            let inst = this;
            inst.stakeholderService.getModeratedStakeholders("",
                null,
                null,
                null,
                null).subscribe((response:PageResponse<Stakeholder>)=>{
                   inst.stakeholders = response.data;
            });
        }
    }

    ngOnInit() {
        this.stakeholderControl= this.setupForm(this.stakeholderControl) ;
    }

    setupForm(f: FormControl) {
        let inst = this;
        f.valueChanges
            .subscribe((model: any) => {
                if(this.isOnAddExistingStakeholderMode()){
                    for(let i = 0;i<inst.stakeholders.length;i++){
                        if(inst.stakeholders[i].id === model){
                            inst.stakeholder.name = inst.stakeholders[i].name;
                            inst.stakeholder.id = inst.stakeholders[i].id;
                            f.setValue(inst.stakeholder.name)
                            break;

                        }
                    }
                }

                inst.stakeholderService.getModeratedStakeholders(model,
                    null,
                    null,
                    null,
                    null).subscribe((response:PageResponse<Stakeholder>)=>{
                       inst.stakeholders = response.data;
                });
            });
        return f;
    }

    isOnAddNewStakeholderMode(){
        return this.uiMode === LLNewStakeholderType.NEW && this.ready === true;
    }

    isOnAddExistingStakeholderMode(){
        return this.uiMode === LLNewStakeholderType.EXISTING && this.ready === true;
    }

}
