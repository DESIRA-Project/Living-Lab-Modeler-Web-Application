import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserLivingLab } from "src/app/Models/UserLivingLab";

@Component({
    selector: 'managed-living-lab-info',
    templateUrl: './managed-living-lab-info.component.html',
    styleUrls: ['./managed-living-lab-info.component.css'],
})
export class ManagedLivingLabInfoComponent implements OnInit {

    livingLabSummary : UserLivingLab = {} as UserLivingLab;
    displayedColumns: string[] = ['name', 'role',];
  dataSource = [];
    ready = false;
  
    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<ManagedLivingLabInfoComponent>) {
                 this.livingLabSummary =   data.ll;
                 this.dataSource = data.ll.members;
    }
  
    ngOnInit(): void {
      this.ready = true;
    }

}