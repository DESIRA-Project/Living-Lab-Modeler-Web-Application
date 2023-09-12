import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-ll-users-management',
  templateUrl: './ll-users-management.component.html',
  styleUrls: ['./ll-users-management.component.css']
})
export class LlUsersManagementComponent implements OnInit {

  ready = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<LlUsersManagementComponent>) {
  }

  ngOnInit(): void {
    this.ready = true;
  }

}
