import { BreakpointObserver } from "@angular/cdk/layout";
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LivingLabService } from '../Service/living-lab.service';
import { PageResponse, Response } from '../Models/Response/response';
import { ErrorResponse } from '../Models/Response/error-response';
import { AngularServicesProviderService } from "../Service/angular-services-provider.service";
import { DynamicContent } from '../ComponentLibrary/DynamicModal/dynamic-content.component';
import { DynamicContentParent } from '../ComponentLibrary/DynamicModal/dynamic-content-parent';
import { DynamicItem } from '../ComponentLibrary/DynamicModal/dynamic-item.components';
import { DynamicModalContainer } from '../ComponentLibrary/DynamicModal/dynamic-modal-container';
import { LlJoinRequestDispatcherService } from '../Service/ll-join-request-dispatcher.service';
import { LlJoinRequestFormComponent } from '../living-lab-summary-card/ll-join-request-form/ll-join-request-form.component';
import { Navigationable } from '../Models/Navigationable';
import { UserManagementService } from '../User/user-management.service';
import { Router } from '@angular/router';
import { CardRenderableComponent } from '../CardRenderableComponent/card-renderable.component';

@Component({
  selector: 'all-living-labs',
  templateUrl: './all-living-labs.component.html',
  styleUrls: ['../my-living-labs/my-living-labs.component.css', './all-living-labs.component.css']
})
export class AllLivingLabsComponent extends CardRenderableComponent  implements OnInit, DynamicContent, Navigationable {
  data: any;
  value: string = "";
  page: number = 0;
  perPage: number = 6;
  fetched: number = 0;
  totalCount: number = 0;
  lastSearchValue: string = "";

  parent: DynamicContentParent | undefined;
  ready = false;
  livingLabs: any[] = [];
  showAllPublished: boolean = true;
  showAllOnJoinRequest: boolean = false;

  constructor(public breakpointObserver: BreakpointObserver, protected userManagementService: UserManagementService,
    protected livingLabService: LivingLabService,
    protected router: Router,
    protected angularServicesProviderService: AngularServicesProviderService,
    protected joinRequestDispatcher: LlJoinRequestDispatcherService,
    protected changeDetectorRef: ChangeDetectorRef) {
      super(breakpointObserver,"500px",false);
    if (!this.userManagementService.getUserInfo()) {
      this.router.navigate(['/']);
      return;
    }
    this.handlePendingJoinRequest();
  }

  getFilterLabel(i:number){
      if(i === 0){
        return !this.renderInCard ? "All Published" : "All Published Living Labs";
      }
      if(i === 1){
        return !this.renderInCard ? "All with pending join request" : " All Living Labs with Pending Join Requests";
      }
      return "";
  }
  
  goToPage(name: string): void {
    this.parent?.goToPage(name);
  }

  redraw(): void {
    this.fetchCurrentSelection();
  }

  private handlePendingJoinRequest() {
    if (!this.joinRequestDispatcher.hasJoinRequest()) {
      return;
    }
    let llId: number = this.joinRequestDispatcher.getLastJoinRequest();
    if (llId === -1) {
      return;
    }

    //let open the modal
    this.openLLModal(llId);
  }

  openLLModal(llId: number) {
    let inst = this;
    this.livingLabService.getMiniSummary(llId).subscribe(
      (response: Response<any>) => {
        let lab = response.data;
        const dyn = inst.angularServicesProviderService.createNewModalWithType(LlJoinRequestFormComponent);
        const getData = () => {
          return { ll: lab, numPendingRequests: 0 };
        };
        dyn.getObservableFromConfirmableOperationWithCustomStyle(getData, () => { }, 'membershipModal').subscribe((entity: any) => { });

        dyn.afterClosed(() => {
          inst.redraw();
          inst.joinRequestDispatcher.clearJoinRequest();
          inst.changeDetectorRef.markForCheck()
        });
      },
      (error: ErrorResponse) => {
        console.log("Unable to fetch LL data.");
      });

  }

  initialize(parent: DynamicModalContainer): void {
  }

  initFilters() {
    this.livingLabs = [];
    this.page = 0;
    this.fetched = 0;
    this.totalCount = 0;
  }

  getUserToken(): string | null {
    return null;
  }


  initializeWithAuthData(userToken: string): void {

  }
  setDependencies(dependencies: DynamicItem[]): void {

  }
  setParent(parent: DynamicContentParent | undefined): void {
    this.parent = parent;
  }
  isDirty?(): boolean {
    return false;
  }

  ngOnInit(): void {
    this.fetchAllLivingLabs();
    //this.fetch();
  }

  getUserLLRole(lab: any) {
    if (!lab) return "";
    if (lab.isCreator) return "Creator";
    if (lab.isMember) return "Member";
    return "";
  }

  showMore() {
    this.ready = false;
    this.page++;
    this.fetchAllLivingLabs();
  }

  hasMore(): boolean {
    if (!this.ready) return false;
    if (!this.totalCount) return false;
    if (this.fetched === this.totalCount && this.totalCount > 0) return false;
    return true;
  }

  canSearchAnew() {
    return this.value !== "" && this.value !== this.lastSearchValue;
  }

  performSearch() {
    this.lastSearchValue = this.value;
    this.initFilters();
    this.fetchAllLivingLabs();
  }

  fetchCurrentSelection() {
    this.ready = false;
    let toBeFetched = this.fetched;
    this.livingLabService.getAllLivingLabs(this.showAllOnJoinRequest, this.value, 0, toBeFetched).subscribe(
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

  fetchAllLivingLabs() {
    this.ready = false;
    this.livingLabService.getAllLivingLabs(this.showAllOnJoinRequest, this.value, this.page, this.perPage).subscribe(
      (response: PageResponse<any>) => {
        //console.log(response);
        for (let i = 0; i < response.data.length; i++) {
          this.livingLabs.push(response.data[i]);
        }
        /*console.log(this.livingLabs)*/

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

  onEnterPress() {
    this.performSearch();
  }

  fetch() {
    this.ready = false;
    this.livingLabService.getPublicLivingLabs().subscribe(
      (response: PageResponse<any>) => {
        console.log(response);
        for (let i = 0; i < response.data.length; i++) {
          this.livingLabs.push(response.data[i]);
        }
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

  clearValue() {
    this.lastSearchValue = this.value = "";
    this.initFilters();
    this.fetchAllLivingLabs();
  }

  clearFilter() {
  }

  clearShowAllFilter() {

  }

  clearShowAllOnJoinRequestFilter() {
    this.showAllPublished = true;
    this.showAllOnJoinRequest = false;

    this.initFilters();
    this.fetchAllLivingLabs();

  }

  applyOnJoinRequestFilter() {
    this.showAllPublished = false;
    this.showAllOnJoinRequest = true;

    this.initFilters();
    this.fetchAllLivingLabs();

  }

  applyAllPublishedFilter() {
    this.showAllPublished = true;
    this.showAllOnJoinRequest = false;

    this.initFilters();
    this.fetchAllLivingLabs();
  }

}
