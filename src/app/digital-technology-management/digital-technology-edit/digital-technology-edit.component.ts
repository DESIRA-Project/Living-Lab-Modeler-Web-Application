import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DigitalTechnology } from '../../Models/DigitalTechnology';

@Component({
  selector: 'app-digital-technology-edit',
  templateUrl: './digital-technology-edit.component.html',
  styleUrls: ['./digital-technology-edit.component.css']
})
export class DigitalTechnologyEditComponent implements OnInit {

  digitalTechnology: DigitalTechnology;
  editedDigitalTechnology: DigitalTechnology;
  uploadedFile: File | null = null;
  parentInstance: any;
  callback: (parentInstance: any, digitalTechnology: DigitalTechnology, file: File | null) => Observable<any>;
  nameExists: boolean = false;
  allTechs: DigitalTechnology[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    protected dialogRef: MatDialogRef<DigitalTechnologyEditComponent>) {
    this.digitalTechnology = data.digitalTechnology;
    this.editedDigitalTechnology = JSON.parse(JSON.stringify(this.digitalTechnology));  // Deep copy
    this.callback = data.callback;
    this.allTechs = data.allTechs;
    this.parentInstance = data.parentInstance;
  }


  ngOnInit(): void {
  }


  public save(): void {
    this.close();
    let o: Observable<any> = this.callback(this.parentInstance, this.editedDigitalTechnology, this.uploadedFile);
  }


  public close(): void {
    this.dialogRef.close();
  }


  checkForExistingDTName() {
    this.nameExists = false;

    let s = this.editedDigitalTechnology.name.trim().toLowerCase();
    if (s === '') return;
    for (let i = 0; i < this.allTechs.length; i++) {
      if (this.allTechs[i].name.trim().toLowerCase() === s && s !== this.digitalTechnology.name.trim().toLowerCase()) {
        this.nameExists = true;
        return;
      }
    }
  }

  public inputChange(fileInputEvent: any): void {
    this.uploadedFile = fileInputEvent.target.files[0];
  }

  public canSave() {
    if (this.nameExists) {
      return false;
    }
    if(this.editedDigitalTechnology.name.trim() === '' ) return false;

    if (this.editedDigitalTechnology.name.trim() === this.digitalTechnology.name.trim()
    && this.editedDigitalTechnology.description.trim() === this.digitalTechnology.description.trim() ) {
      return false;
    }
    return true;
  }


}
