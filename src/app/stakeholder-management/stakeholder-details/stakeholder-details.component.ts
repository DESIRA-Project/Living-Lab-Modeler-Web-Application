import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {StakeholderLivingLab} from '../../Models/StakeholderLivingLab';
import {Stakeholder} from '../../Models/Stakeholder';
import {MatInput} from '@angular/material/input';
import { getLimitedString } from 'src/app/Service/common';

@Component({
  selector: 'app-living-labs-per-stakeholder',
  templateUrl: './stakeholder-details.component.html',
  styleUrls: ['./stakeholder-details.component.css']
})
export class StakeholderDetailsComponent implements OnInit {

  stakeholderLivingLabs: StakeholderLivingLab[] = [];
  displayedColumns = ['addedByUserName', 'addedAt', 'livingLabName'];
  title: string;
  moderated: boolean;
  editing = false;
  stakeholder: Stakeholder;
  @ViewChild('name') name: MatInput | undefined;


  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private dialogRef: MatDialogRef<StakeholderDetailsComponent>) {
    this.stakeholderLivingLabs = data.livingLabsPerStakeholder;
    this.stakeholderLivingLabs.forEach(x => x.addedAt = new Date(x.addedAt));
    this.title = data.stakeholder.name;
    this.moderated = data.stakeholder.moderated;
    this.stakeholder = data.stakeholder;
  }


  ngOnInit(): void {
  }

  moderate(): void {
    this.dialogRef.close('moderate');
  }

  delete(): void {
    this.dialogRef.close('delete');
  }

  getLimitedDescription(value: string | null): string {
    if (value === null) { return ''; }
    return getLimitedString(value, 20);
  }

  getLimitedLink(value: string | null): string {
    if (value === null) { return ''; }
    return getLimitedString(value, 50);
  }

  edit(): void {
    this.editing = true;
    this.name?.focus();
  }

  save(): void {
    this.dialogRef.close('edit');
  }

}
