import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DigitalTechnology } from '../../Models/DigitalTechnology';
import { DigitalTechnologyEditComponent } from '../digital-technology-edit/digital-technology-edit.component';

@Component({
    selector: 'app-digital-technology-add',
    templateUrl: './digital-technology-add.component.html',
    styleUrls: ['./digital-technology-add.component.css']
})
export class DigitalTechnologyAddComponent extends DigitalTechnologyEditComponent {
    tech:DigitalTechnology;
    allTechs:DigitalTechnology[];
    nameExists:boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
        protected dialogRef: MatDialogRef<DigitalTechnologyEditComponent>) {
        super(data, dialogRef);
        this.tech = {id:'',name:'',description:'', originalIconName:''} as DigitalTechnology;
        this.callback = data.callback;
        this.allTechs = data.allTechs;
        this.parentInstance = data.parentInstance;
    }

    checkForExistingDTName(){
        this.nameExists = false;

        let s = this.tech.name.trim().toLowerCase();
        if(s === '') return;
         for(let i = 0;i<this.allTechs.length;i++){
            if(this.allTechs[i].name.trim().toLowerCase() === s){
                this.nameExists = true;
                return;
            }
         }
    }

    public canSave(){
        if(this.nameExists){
            return false;
        }

        if(this.tech.name.trim() === '' || this.tech.description.trim() === '' || this.uploadedFile === null){
            return false;
        }
        return true;
    }
    
  public save(): void {
    this.close();
    let o:Observable<any> = this.callback(this.parentInstance, this.tech, this.uploadedFile);
  }
}