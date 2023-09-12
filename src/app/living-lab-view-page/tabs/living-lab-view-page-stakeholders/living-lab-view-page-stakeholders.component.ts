import {Component, Input, OnInit} from '@angular/core';
import { LLStakeholder } from 'src/app/Models/LLStakeholder';
import { StakeholderDetailsComponent } from 'src/app/stakeholder-management/stakeholder-details/stakeholder-details.component';
import {Stakeholder} from '../../../Models/Stakeholder';

@Component({
  selector: 'app-living-lab-view-page-stakeholders',
  templateUrl: './living-lab-view-page-stakeholders.component.html',
  styleUrls: ['./living-lab-view-page-stakeholders.component.css']
})
export class LivingLabViewPageStakeholdersComponent implements OnInit {

  mainStakeholders: LLStakeholder[] = [];
  contributors: Stakeholder[] = [];

  @Input() livingLab: any;

  constructor() { }

  ngOnInit(): void {
    this.livingLab.stakeholders.forEach((stakeholder: LLStakeholder) =>
    stakeholder.role?.name === 'Main Stakeholder' ? this.mainStakeholders.push(stakeholder) : this.contributors.push(stakeholder)        
    );
  }

}
