import {Component, Input, OnInit} from '@angular/core';
import {AssetsService} from '../../../Service/assets.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ActivityService} from '../../../Service/activity.service';
import {LLUserPermissionDefs} from '../../../Models/LLUserPermissionDefs';
import {DynamicModalDialogComponent} from '../../../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component';
import {AngularServicesProviderService} from '../../../Service/angular-services-provider.service';
import {AddNewActivityComponent} from '../../../add-new-activity/add-new-activity.component';
import {ErrorResponse} from '../../../Models/Response/error-response';
import {Activity} from '../../../Models/Activity';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-living-lab-view-page-activities',
  templateUrl: './living-lab-view-page-activities.component.html',
  styleUrls: ['./living-lab-view-page-activities.component.css']
})
export class LivingLabViewPageActivitiesComponent implements OnInit {

  @Input() livingLab: any;
  activities: any[] = [];
  canUserEdit = false;
  showNoActivitiesMessage = true;
  showAddNewButton = false;
  showEditButton = false;
  showDeleteButton = false;
  refreshOnCreation = true;
  environment = environment;

  constructor(protected assetsService: AssetsService,
              protected router: Router,
              protected activatedRoute: ActivatedRoute,
              protected activityService: ActivityService,
              protected angularServicesProviderService: AngularServicesProviderService) {}



  initializeTimeline(): void {
    // Sort activities by date descending
    this.activities.sort((a1, a2) => a2.dateFrom - a1.dateFrom);

    // Now date
    const now = new Date();

    // Prepare fields
    this.activities.forEach((activity: any) => {

      // Get url for image
      if (activity.mainPhotoWrapper && activity.mainPhotoWrapper.content) {
        activity.displayMainPhotoUrl = activity.mainPhotoWrapper.content as string;
      }
      else {
        if (!activity.displayMainPhotoUrl) {
          activity.displayMainPhotoUrl = this.assetsService.getAssetLink(activity.mainPhotoUrl, true);
        }
      }

      // Convert epoch dates to typescript date item
      activity.tempDateFrom = new Date(activity.dateFrom);

      // If dateTo is not defined, mark an activity finished if dateFrom < now
      // TODO: Use UTC field to be added for comparison
      activity.isOver  = activity.dateFrom < now;

      if (activity.dateTo) {
        activity.tempDateTo = new Date(activity.dateTo);

        // If dateTo is defined, mark an activity finished if dateTo < now
        // TODO: Use UTC field to be added for comparison
        activity.isOver  = activity.dateTo < now;
      }
    });
  }



  ngOnInit(): void {
    this.activities = this.livingLab.activities;

    this.initializeTimeline();

    // Check if current authenticated user has the modify_living_lab_info permission
    this.canUserEdit = this.livingLab.llPermissions.indexOf(LLUserPermissionDefs.MODIFY_LIVING_LAB_INFO) > -1;
  }



  onAddNewActivityButtonClick(): void {

    // Create modal
    const inst = this;
    const dyn: DynamicModalDialogComponent = inst.angularServicesProviderService.createNewModalWithType(AddNewActivityComponent);
    const getData = () => {
      return {
        entity: null,
        handle: dyn,
        livingLabId: this.livingLab.id
      };
    };

    // Perform appropriate action upon modal closing
    dyn.performResultStatusMonitoredOperation(getData,
      (returnedData: any) => {
        this.handleAddNewActivityReturnData(returnedData);
      },
      false,
      '100%'
    );
  }



  handleAddNewActivityReturnData(returnedData: { livingLabId: any, activity: Activity }): any {

    // Make the service call
    this.activityService.create(returnedData.livingLabId, returnedData.activity)
      .subscribe(

        // Refresh on success
        () => {
          if (this.refreshOnCreation) {
            location.reload();
          }
        },

        // Show error message on fail
        (error: ErrorResponse) => {
          this.angularServicesProviderService.createNewModal().alert(false, 'Could not create activity!');
          console.error('error: ' + error.error.message);
        }
      );
  }



  onClickView(i: number): void {
    this.router.navigate(['.', 'activity', this.activities[i].id], { relativeTo: this.activatedRoute });
  }



  onClickEdit(i: number): void {
    this.router.navigate(['.', 'activity', this.activities[i].id, 'edit'], { relativeTo: this.activatedRoute });
  }



  onClickDelete(i: number): void {
    this.activities.splice(i, 1);
  }

}
