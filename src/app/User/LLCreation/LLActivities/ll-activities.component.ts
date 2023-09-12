import {Component, OnDestroy, OnInit, Type} from '@angular/core';
import {DynamicView} from '../../../ComponentLibrary/dynamic-view';
import {DirtyView} from '../../../Models/DirtyView';
import {ParentComponent} from '../../Admin/LivingLabEntityManagement/parent-component';
import {
  LivingLabViewPageActivitiesComponent
} from '../../../living-lab-view-page/tabs/living-lab-view-page-activities/living-lab-view-page-activities.component';
import {AssetsService} from '../../../Service/assets.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ActivityService} from '../../../Service/activity.service';
import {AngularServicesProviderService} from '../../../Service/angular-services-provider.service';
import {Activity} from '../../../Models/Activity';
import {DynamicModalDialogComponent} from '../../../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component';
import {AddNewActivityComponent} from '../../../add-new-activity/add-new-activity.component';
import {ActivityEditComponent} from '../../../activity-edit/activity-edit.component';
import {ConfirmationModalComponent} from "../../../confirmation-modal/confirmation-modal.component";
import {MatDialog} from "@angular/material/dialog";
import { Deepcopy } from 'src/app/Utils/deepcopy';

@Component({
  selector: 'app-llactivities',
  templateUrl: '../../../living-lab-view-page/tabs/living-lab-view-page-activities/living-lab-view-page-activities.component.html',
  styleUrls: ['../../../living-lab-view-page/tabs/living-lab-view-page-activities/living-lab-view-page-activities.component.css', './ll-activities.component.css']
})
export class LLActivitiesComponent extends LivingLabViewPageActivitiesComponent
  implements OnInit, DynamicView, OnDestroy, DirtyView {

  parent: ParentComponent | null = null;
  livingLabId: number | undefined;
  activityIdsToBeDeleted: number[]  = [];

  constructor(assetsService: AssetsService,
              router: Router,
              activatedRoute: ActivatedRoute,
              activityService: ActivityService,
              angularServicesProviderService: AngularServicesProviderService) {
    super(assetsService, router, activatedRoute, activityService, angularServicesProviderService);
    this.canUserEdit = true;
    this.showNoActivitiesMessage = false;
    this.showAddNewButton = true;
    this.showEditButton = true;
    this.showDeleteButton = true;
  }

  ngOnInit(): void {
    this.livingLab = {};
  }

  initialize(parent: ParentComponent): void {
    this.parent = parent;
    this.parent.setChangeAwareChild(this);
    const data = this.parent.getSharedDataContainer();
    if (data === undefined) {
      return;
    }
    let id = data.getLivingLabId();
    if (id !== 0) {
      this.livingLabId = id;
    }
    let activities = data.getActivities();
    let activityIds = data.getActivityIdsToBeDeleted();

/*    console.log(activities);
    console.log(activityIds);*/

    if (activities.length > 0) {
      this.activities = Deepcopy.copy(activities);
      this.initializeTimeline();
    }
    if (activityIds.length > 0) {
      this.activityIdsToBeDeleted = Deepcopy.copy(activityIds);
    }
  }

  isDirty(): boolean {
    return false;
  }

  ngOnDestroy(): void {
   // this.save();
  }

  reset(): boolean {
    return false;
  }

  save(): boolean {
    this.parent?.storeValue('activities', this.activities);
    this.parent?.storeValue('activityIdsToBeDeleted', this.activityIdsToBeDeleted);
    return true;
  }

  handleAddNewActivityReturnData(returnedData: { livingLabId: any, activity: Activity }): any {
    this.activities.push(returnedData.activity);

    // Save
    this.save();

    // Initialize timeline
    this.initializeTimeline();
  }

  onClickHandle(i: number, componentInModal: Type<any>): void {
    // Create modal
    const inst = this;
    const dyn: DynamicModalDialogComponent = inst.angularServicesProviderService.createNewModalWithType(componentInModal);
    const getData = () => {
      return {
        entity: null,
        handle: dyn,
        livingLabId: this.livingLabId,
        activityId: this.activities[i].id,
        activity: this.activities[i]
      };
    };

    // Perform appropriate action upon modal closing
    dyn.performResultStatusMonitoredOperation(getData,
      (returnedData: any) => {
        this.save();
        this.initializeTimeline();
      },
      false,
      '100%'
    );
  }

  onClickView(i: number): void {
    this.onClickHandle(i, this.activities[i].id ? ActivityEditComponent : AddNewActivityComponent);
  }

  onClickEdit(i: number): void {
    this.onClickHandle(i, this.activities[i].id ? ActivityEditComponent : AddNewActivityComponent);
  }

  onClickDelete(i: number): void {

    // Ask for confirmation first
    const confirmationDialogRef = this.angularServicesProviderService.getModalDialog().open(ConfirmationModalComponent, {
      hasBackdrop: true,
      data: {
        text: 'Are you sure you want to delete this activity?',
        buttons: ['CONFIRM', 'CANCEL'],
        buttonsStyle: [{color: 'var(--red)'}, {color: 'var(--gray)'}]
      }
    });

    // If confirmed, perform action after closing
    confirmationDialogRef.afterClosed().subscribe(returnedValue => {
      switch (returnedValue) {
        case 0: {
          if (this.activities[i].id && this.activityIdsToBeDeleted) {
            this.activityIdsToBeDeleted.push(this.activities[i].id);
          }
          this.activities.splice(i, 1);
          this.save();
        }
      }
    });
  }

}
