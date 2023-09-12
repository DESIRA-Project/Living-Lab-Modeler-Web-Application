import {Component, Inject, Input, OnInit} from '@angular/core';
import {Stakeholder} from '../../Models/Stakeholder';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { StakeholderRole } from 'src/app/Models/StakeholderRole';
import { LLStakeholder } from 'src/app/Models/LLStakeholder';
import {StakeholderService} from "../../Service/stakeholder.service";
import {Response} from "../../Models/Response/response";
import {ErrorResponse} from "../../Models/Response/error-response";
export enum LLComponentMode{
  ADD,
  EDIT
}

@Component({
  selector: 'app-add-new-stakeholder',
  templateUrl: './add-new-stakeholder.component.html',
  styleUrls: ['./add-new-stakeholder.component.css']
})
export class AddNewStakeholderComponent implements OnInit {

  stakeholder: LLStakeholder = {} as LLStakeholder;
  showHint = false;
  newStakeholderExists = false;
  existingStakeholders:LLStakeholder[] = [];
  stakeholderRoles:StakeholderRole[] = [];
  mode:LLComponentMode = LLComponentMode.ADD;
  initialValue: LLStakeholder = {} as LLStakeholder;
  typingTimer: NodeJS.Timeout | null = null;
  doneTypingInterval = 500;
  errorMessage: string | undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              protected dialogRef: MatDialogRef<AddNewStakeholderComponent>,
              protected stakeholderService: StakeholderService) {
    if(data){
      if(data.existing){
        this.existingStakeholders = data.existing;
      }
      if(data.mode){
           this.mode = data.mode;
      }
      if(data.current){
          this.stakeholder = data.current;
      }
      else{
        this.stakeholder = {id: '',
          name: '',
          moderated: false,
          lastAddedAt: 0,
          description : '',
          role: null,
          link : '',
          usesGlobalDescription: false,
          stakeholderDescription:'',
          usesGlobalLink: false,
          stakeholderLink:''
        };
      }
      if(data.roles){
        this.stakeholderRoles = data.roles;
      }
    }
    else{
        this.stakeholder = {id: '',
          name: '',
          moderated: false,
          lastAddedAt: 0,
          description : '',
          role:null,
          link:null,
          usesGlobalDescription: false,
          stakeholderDescription:'',
          usesGlobalLink: false,
          stakeholderLink:''
        };
    }

    this.initialValue = {...this.stakeholder};
  }

  ngOnInit(): void {}

  onKeyUp(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    if (this.stakeholder.name) {
      this.typingTimer = setTimeout(() => this.checkIfNameExists(), this.doneTypingInterval);
    }
  }

  checkIfNameExists(): void {
    this.stakeholderService.checkIfNameExists(this.stakeholder.name).subscribe(
      (response: Response<boolean>) => {
        this.errorMessage = response.data ? 'Stakeholder name already exists!' : undefined;
        this.errorMessage = this.stakeholder.name.trim().length < 2 ? 'Length must be greater than or equal to 2' : this.errorMessage;
      },
      (error: ErrorResponse) => {
        console.error(error.error.message);
      }
    );
  }

  save(): void {
    if (this.stakeholder.name.trim().length >= 2) {
      this.dialogRef.close(this.stakeholder);
    }
    else {
      this.errorMessage = 'Length must be greater than or equal to 2';
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
