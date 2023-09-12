import { BreakpointObserver } from "@angular/cdk/layout";
import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import { AllLivingLabsComponent } from "../all-living-labs/all-living-labs.component";
import { ErrorResponse } from "../Models/Response/error-response";
import { PageResponse } from "../Models/Response/response";
import { AngularServicesProviderService } from "../Service/angular-services-provider.service";
import { LivingLabService } from "../Service/living-lab.service";
import { LlJoinRequestDispatcherService } from "../Service/ll-join-request-dispatcher.service";
import { UserManagementService } from "../User/user-management.service";

@Component({
    selector: 'living-lab-management',
    templateUrl: './living-lab-management.component.html',
    styleUrls: ['../my-living-labs/my-living-labs.component.css', '../all-living-labs/all-living-labs.component.css','./living-lab-management.component.css']
  })
  export class LivingLabManagementComponent extends AllLivingLabsComponent {
    showAll: boolean = true;
    showAllDeactivated:boolean = false;

    constructor(public breakpointObserver: BreakpointObserver, protected userManagementService: UserManagementService,
      protected livingLabService: LivingLabService,
      protected router: Router,
      protected angularServicesProviderService: AngularServicesProviderService,
      protected joinRequestDispatcher: LlJoinRequestDispatcherService,
      protected changeDetectorRef: ChangeDetectorRef){
      super(breakpointObserver, userManagementService, livingLabService, router, angularServicesProviderService, joinRequestDispatcher, changeDetectorRef );
      this.perPage = 5;
    }

    ngOnInit(): void {
      this.fetchAllLivingLabs();
    }

    fetchAllLivingLabs(): void {
      this.ready = false;
      this.livingLabService.getAllLivingLabsForManagement(this.showAll, this.value, this.page, this.perPage).subscribe(
        (response: PageResponse<any>) => {
          //console.log(response);
          for (let i = 0; i < response.data.length; i++) {
            this.livingLabs.push(response.data[i]);
          }
          //console.log(this.livingLabs)
  
          this.totalCount = response.totalCount;
          this.fetched = this.livingLabs.length;
          this.ready = true;
        },
        (error: ErrorResponse) => {
          console.log('error: ' + error.error.message);
          this.angularServicesProviderService.createModalWithGenericErrorMessage();
        }
      );
    }

    fetchCurrentSelection() {
      this.ready = false;
      let toBeFetched = this.fetched;
      this.livingLabService.getAllLivingLabsForManagement(this.showAll, this.value, 0, toBeFetched).subscribe(
        (response: PageResponse<any>) => {
          //console.log(response);
          this.livingLabs = [];
          for (let i = 0; i < response.data.length; i++) {
            this.livingLabs.push(response.data[i]);
          }
          this.ready = true;
        },
        (error: ErrorResponse) => {
          console.log('error: ' + error.error.message);
          this.angularServicesProviderService.createModalWithGenericErrorMessage();
        }
      );
    }

    applyFilters(){
      this.showAll = true;
      this.showAllDeactivated = false;

      this.initFilters();
      this.fetchAllLivingLabs();
    }

    applyDeactivated(){
      this.showAll = false;
      this.showAllDeactivated = true;

      this.initFilters();
      this.fetchAllLivingLabs();
    }
  }