import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {

  public static width = '45%';

  text = 'An error has occurred';
  textStyle: any[] = [];
  buttons: string[] = [];
  buttonsStyle: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<ConfirmationModalComponent>) {
    this.text = data ? data.text : this.text;
    this.textStyle = data ? data.textStyle : this.textStyle;
    this.buttons = data ? data.buttons : this.buttons;
    this.buttonsStyle = data ? data.buttonsStyle : this.buttonsStyle;
  }

  ngOnInit(): void {
  }

  clickedOn(i: number): void {
    this.dialogRef.close(i);
  }

}
