import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SDG} from '../../Models/SDG';


@Component({
  selector: 'app-sdg-edit',
  templateUrl: './sdg-edit.component.html',
  styleUrls: ['./sdg-edit.component.css']
})
export class SdgEditComponent implements OnInit {

  sdg: SDG;
  editedSdg: SDG;
  uploadedFile: File | null = null;
  parentInstance: any;
  callback: (parentInstance: any, sdg: SDG, file: File | null) => void;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<SdgEditComponent>) {
    this.sdg = data.sdg;
    this.editedSdg = JSON.parse(JSON.stringify(this.sdg));  // Deep copy
    this.callback = data.callback;
    this.parentInstance = data.parentInstance;
  }


  ngOnInit(): void {
  }


  public save(): void {
    this.close();
    this.callback(this.parentInstance, this.editedSdg, this.uploadedFile);
  }


  public close(): void {
    this.dialogRef.close();
  }


  public inputChange(fileInputEvent: any): void {
    this.uploadedFile = fileInputEvent.target.files[0];
  }

}
