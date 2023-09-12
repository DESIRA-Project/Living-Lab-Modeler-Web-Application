import {Component, ElementRef, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-ll-join-request-accompanying-text-popup',
  templateUrl: './ll-join-request-accompanying-text-popup.component.html',
  styleUrls: ['./ll-join-request-accompanying-text-popup.component.css'],
})
export class LlJoinRequestAccompanyingTextPopupComponent implements OnInit {

  private readonly _matDialogRef: MatDialogRef<LlJoinRequestAccompanyingTextPopupComponent>;
  private readonly triggerElementRef: ElementRef;
  public text: string = '';
  constructor(_matDialogRef: MatDialogRef<LlJoinRequestAccompanyingTextPopupComponent>,
              @Inject(MAT_DIALOG_DATA) data: { trigger: ElementRef, text: string }) {
    this._matDialogRef = _matDialogRef;
    this.triggerElementRef = data.trigger;
    this.text = data.text;
  }

  ngOnInit() {
    const matDialogConfig: MatDialogConfig = new MatDialogConfig();
    const rect = this.triggerElementRef.nativeElement.getBoundingClientRect();
    matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom + 20}px` };
    // matDialogConfig.width = '400px';
    // matDialogConfig.height = '400px';
    // this._matDialogRef.updateSize(matDialogConfig.width, matDialogConfig.height);
    this._matDialogRef.updatePosition(matDialogConfig.position);
  }

}
