import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LLCreationComponent } from '../LLCreation/ll-creation.component';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { Response } from '../../Models/Response/response';
import { BackendService } from '../../backend.service';
import { UserManagementService } from '../user-management.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AngularServicesProviderService } from '../../Service/angular-services-provider.service';
import { LivingLabService } from '../../Service/living-lab.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AssetsService } from '../../Service/assets.service';
import { HttpClient } from '@angular/common/http';
import { ActivityService } from '../../Service/activity.service';
import { LLStatusDefs } from '../../Models/LLStatusDefs';
import { LocalStorageDefs } from "../../Models/LocalStorageDefs";
import { ScreenshotService } from 'src/app/Service/screenshot.service';
import { MessageService } from "../../Service/message.service";
import { ConfirmationModalComponent } from "../../confirmation-modal/confirmation-modal.component";
import { Observable } from "rxjs/internal/Observable";
import { concatMap, map, switchMap, tap } from "rxjs/operators";
import { DynamicContentParent } from "../../ComponentLibrary/DynamicModal/dynamic-content-parent";
import { Deepcopy } from "../../Utils/deepcopy";
import { LLData, LightWeightLLData } from "../../Models/LLData";
import { Activity } from "../../Models/Activity";
import { MatTabGroup } from '@angular/material/tabs';
import { LLSCPEntity } from '../Admin/LivingLabEntityManagement/scp-entity';
import { SCPConnection } from '../LLCreation/LLSCPEntities/ll-scp-entities.component';
import { DataContainer } from './data-container';
import { Outcome } from "../../Models/Outcome";
import { LLUserMembershipService } from 'src/app/Service/ll-user-membership.service';
import { SDGImpactNode } from '../LLCreation/LLSDGs/sdg-impact-modal/sdg-impact-modal.component';

@Component({
  selector: 'app-ll-update',
  templateUrl: '../LLCreation/ll-creation.component.html',
  styleUrls: ['../LLCreation/ll-creation.component.css', './ll-update.component.css']
})
export class LlUpdateComponent extends LLCreationComponent implements OnInit, OnDestroy {

  @ViewChild("llmTabGroup", { static: false }) llmTabGroup: MatTabGroup | undefined;

  constructor(zone: NgZone,
    service: BackendService,
    userManagementService: UserManagementService,
    activatedRoute: ActivatedRoute,
    servicesProviderService: AngularServicesProviderService,
    livingLabService: LivingLabService,
    breakpointObserver: BreakpointObserver,
    assetsService: AssetsService,
    httpClient: HttpClient,
    router: Router,
    screenshotService: ScreenshotService,
    activityService: ActivityService,
    angularServicesProviderService: AngularServicesProviderService,
    messageService: MessageService,
    llUserMembership: LLUserMembershipService,
    cdref: ChangeDetectorRef) {

    super(zone,
      service,
      userManagementService,
      activatedRoute,
      servicesProviderService,
      livingLabService,
      breakpointObserver,
      assetsService,
      httpClient,
      router,
      screenshotService,
      activityService,
      angularServicesProviderService,
      messageService,
      llUserMembership,
      cdref);
  }


  extractIdFromState(): number {
    let st = history.state;
    if (st && st.u) {
      let currentURL = st.u;
      let tokens = currentURL.split("\/");
      tokens = tokens.filter((e: string) => {
        return e !== ""
      });
      // console.log(tokens[1]);
      if (tokens.length > 1) {
        let id = parseInt(tokens[1]);
        return id === undefined ? -1 : id;
      }
      return -1;
    }
    return -1;
  }

  ngOnInit(): void {
    this.popMessageService();
  }

  popMessageService(): void {
    const message: string | undefined = this.messageService.pop();
    if (message) {
      this.angularServicesProviderService.createNewModal().alert(true, message);
      this.messageService.clear();
    }
  }

  checkForStoredTab() {

    let tab = localStorage.getItem(LocalStorageDefs.LivingLabUpdateTab);
    if (tab === null) {
      //not stored
      return;
    }
    if (this.llmTabGroup) {

      this.currentView = parseInt(tab);
      this.llmTabGroup.selectedIndex = this.currentView;
    }
    else {

    }

  }

  getStoredTabView(): number {
    let tab = localStorage.getItem(LocalStorageDefs.LivingLabUpdateTab);
    return tab === null ? 0 : parseInt(tab);
  }

  hasStoredTabView(): boolean {
    return localStorage.getItem(LocalStorageDefs.LivingLabUpdateTab) !== null;
  }


  loadDataExtraTasksAndSetReady(viewIndex = 0): void {
    let id = this.extractIdFromState();
    if (id !== -1) {
      this.livingLabId = id;
      console.log("Loading Living Lab with id " + this.livingLabId);
      this.loadPage();
      return;
    }
    this.activatedRoute.params.subscribe((e) => {
      let id = e['livingLabId'];
      this.livingLabId = id ? parseInt(id) : -1;
      //console.log(this.livingLabId);
      this.loadPage();
    });
  }

  loadPage() {
    let inst = this;
    if (this.livingLabId === -1) {
      this.router.navigate(['/']);
      return;
    }
    if (!this.livingLabId) {
      this.router.navigate(['/']);
      return;
    }

    else {
      if (!this.hasStoredTabView()) {
        this.selectView(0);
      }


      let inst = this;

      //
      let info = this.userManagementService.getUserInfo();
      if (info === null || info === undefined || info.id === undefined) {
        this.router.navigate(['/']);
        return;
      }
      let userId = info.id;
      let llId = this.livingLabId;
      this.llUserMembership.canModifyLivingLab(userId, this.livingLabId).subscribe((res: Response<Boolean>) => {
        if (res.data === false) {
          this.router.navigate(['/']);
          this.angularServicesProviderService.createNewModal().alert(false, "You don't have sufficient privileges to access that resource.");
          return;
        }
        this.livingLabService.get(llId)
          .subscribe((response: Response<any>) => {
            inst.setup(response.data);
            inst.currentView = inst.getStoredTabView();
            if (inst.currentView === 0)
              this.selectView(inst.currentView);

            inst.ready = true;

            setTimeout(() => {
              inst.checkForStoredTab();
            }, 50);
          });

      });
    }


  }

  ngOnDestroy(): void {
    // Leaving the page
    this.actualView = null;
    this.data = {};
    this.cleanBeforeUnloadCB();
    //localStorage.removeItem(LocalStorageDefs.LivingLabUpdateId);
    localStorage.removeItem(LocalStorageDefs.LivingLabUpdateTab);
  }



  setup(livingLab: any): void {
    if (!this.data) {
      this.data = {};
    }
    this.title = 'Updating ' + livingLab.name;
    this.submitButtonText = 'Update';
    this.isPublic = livingLab.isPublic;
    this.isPublished = livingLab.status === LLStatusDefs.PUBLISHED;
    this.data.livingLabId = livingLab.id;
    this.data.name = livingLab.name;
    this.data.focalQuestion = livingLab.focalQuestion;
    this.data.description = livingLab.description;
    this.data.isPublic = livingLab.isPublic;
    this.data.isPublished = livingLab.status === LLStatusDefs.PUBLISHED;
    this.setupLocation(livingLab.location);
    this.setupDigitalTechnologies(livingLab.digitalTechnologies);
    this.setupSDGs(livingLab.sdgs);
    this.setupTaxonomy(livingLab.domains, livingLab.subdomains, livingLab.applicationScenarios);
    this.setupStakeholders(livingLab.stakeholders);
    this.setupScpEntities(livingLab.scpEntities, livingLab.scpEntityConnections);
    this.data.activityIdsToBeDeleted = [];
    this.setupOutcomes(livingLab.outcomes);

    /*    this.initialData = Deepcopy.copy(this.data);
        this.initialData.isPublic = this.isPublic;
        this.initialData.isPublished = this.isPublished;
        this.data.isPublic = this.isPublic;
        this.data.isPublished = this.isPublished;*/
    // These two update asynchronously the initial data,
    // so call them after having deep copied all of the above
    this.setupActivities(livingLab.id, livingLab.activities, livingLab);

  }

  getSharedDataContainer(): DataContainer {
    return this.dataContainer;
  }

  setupLocation(location: any): void {
    if (!location) {
      this.data.locationState = { latestSelection: {}, initializeInUpdateMode: true };
      this.data.locationState.latestSelection = {
        locationChoice: 'userdefinedlocation',
        data: ""
      };
      // alert("loc init")
      return;
    }
    this.data.locationState = { latestSelection: {}, initializeInUpdateMode: true };
    switch (location.locationTypeId) {

      // City
      case 1:
        this.data.locationState.latestSelection = {
          locationChoice: 'city',
          data: {
            id: location.id,
            name: location.text.split(',')[0],
            countryName: location.text.split(',')[1],
            lat: location.latitude,
            lng: location.longitude
          },
        };
        break;

      // Country
      case 2:
        this.data.locationState.latestSelection = {
          locationChoice: 'country',
          data: {
            id: location.id,
            name: location.text,
            lat: location.latitude,
            lng: location.longitude
          },
        };
        break;

      // User Defined
      case 3:
        this.data.locationState.latestSelection = {
          locationChoice: 'userdefinedlocation',
          data: location.text
        };
        break;

      // GPS
      case 4:
        this.data.locationState.latestSelection = {
          locationChoice: 'gps',
          data: {
            lat: location.latitude,
            lng: location.longitude,
          },
          zoom: location.zoom
        };
        break;
    }
  }

  setupDigitalTechnologies(digitalTechnologies: any): void {
    this.data.selectedDTs = {};
    for (const digitalTechnology of digitalTechnologies) {
      this.data.selectedDTs[digitalTechnology.id] = true;
    }
  }

  setupSDGs(SDGs: any): void {
    this.data.selectedSDGs = {};
    this.data.selectedSDGImpact = {};
    for (const sdg of SDGs) {
      this.data.selectedSDGs[sdg.id] = true;
      this.data.selectedSDGImpact[sdg.id] = {
        currentlyPositive: sdg.currentlyPositive === undefined ? null : sdg.currentlyPositive,
        impactDescription: sdg.impactDescription === undefined ? null : sdg.impactDescription,
        futureImpactDescription: sdg.futureImpactDescription === undefined ? null : sdg.futureImpactDescription,
        futurePositive: sdg.futurePositive === undefined ? null : sdg.futurePositive
      } as SDGImpactNode;
    }
    //console.log(this.data.selectedSDGImpact);
  }

  setupTaxonomy(domains: any, subdomains: any, applicationScenarios: any): void {
    this.data.selectedTax = { 0: {}, 1: {}, 2: {} };
    for (const domain of domains) {
      this.data.selectedTax['0'][domain.id] = true;
    }
    for (const subdomain of subdomains) {
      this.data.selectedTax['1'][subdomain.id] = true;
    }
    for (const applicationScenario of applicationScenarios) {
      this.data.selectedTax['2'][applicationScenario.id] = true;
    }
  }

  setupStakeholders(stakeholders: any): void {
    this.data.selectedExistingStakeholders = [];
    for (const stakeholder of stakeholders) {
      this.data.selectedExistingStakeholders.push(stakeholder);
    }
  }

  setupScpEntities(scpEntities: any, scpEntityConnections: any): void {
    const scpEntitiesIdMap: { [index: number]: any } = {};

    this.data.entities = { 1: [], 2: [], 3: [] };
    for (const scpEntity of scpEntities) {
      scpEntity.groupName = scpEntity.group;
      this.data.entities[scpEntity.groupId].push(scpEntity);

      scpEntitiesIdMap[scpEntity.id] = scpEntity;
    }

    this.data.connections = [];
    for (const scpEntityConnection of scpEntityConnections) {
      this.data.connections.push({
        source: scpEntitiesIdMap[scpEntityConnection.source],
        dest: scpEntitiesIdMap[scpEntityConnection.destination],
        description: scpEntityConnection.description ? scpEntityConnection.description : ''
      });
    }
  }

  notify(result: boolean): void {
    console.log("notification")
    console.log(result);
  }


  setupActivities(livingLabId: number, activities: any, livingLab: any): void {
    let inst = this;
    let finalizeSetup = () => {

      inst.setupMainPhoto(livingLab.iconUrl, () => {
        // console.log(inst.data.activities);
        inst.dataContainer = new DataContainer(inst, inst.debug);
        inst.dataContainer.initialize(inst.data);
        inst.dataContainer.storeValue("logo", this.data.logo);

        inst.dataFetched = true;
      });
    };

    if (activities && activities.length === 0) {
      inst.data.activities = [];
      inst.data.activityIdsToBeDeleted = [];

      finalizeSetup();
      return;
    }
    // Get full activity data for each activity
    forkJoin(activities.map((activity: any) => inst.activityService.get(livingLabId, activity.id)))
      .subscribe((responseDataAsArray: any) => {
        inst.data.activities = [];

        responseDataAsArray.forEach((response: any) => {
          inst.data.activities.push(Deepcopy.copy(response.data));
        });

      }).add(() => {
        finalizeSetup();
      });
  }

  setupMainPhoto(iconUrl: string, cb: Function): void {

    if (!iconUrl) {
      this.data.hasLogo = false;
      if (cb) {
        cb();
      }
      return;
    }

    // Get full asset link
    iconUrl = this.assetsService.getAssetLink(iconUrl);
    this.data.hasLogo = true;

    // Get image from backend
    this.httpClient.get(iconUrl, { responseType: 'blob' }).subscribe(
      response => {

        // And read it as base64 into this.data.logo
        const reader = new FileReader();
        reader.readAsDataURL(response);
        reader.onload = () => {
          this.originalMainPhoto = reader.result;
          this.data.logo = reader.result;
          if (this.o && this.o.notify) {
            this.o.notify();
          }
          if (cb) {
            cb();
          }

        };

      },

      error => {
        console.error('error');
        console.error(error);
        this.angularServicesProviderService.createNewModal().alert(false, "Something went wrong, please try again later!");
      }
    );
  }

  setupOutcomes(outcomes: Outcome[]): void {
    if (!outcomes || outcomes.length === 0) {
      return;
    }
    outcomes.forEach(
      outcome => outcome.assetResourceDetails.forEach(
        assetResourceDetail => assetResourceDetail.fileWrapper = {
          name: assetResourceDetail.originalFilename,
          content: this.assetsService.getDownloadableAssetLink(assetResourceDetail.assetResourceName as string)
        }

      )
    );
    this.data.outcomes = outcomes;
  }

  setPublishedConfirmation(): void {

    if (!this.canPublish()) {
      return;
    }

    // Ask for confirmation first
    const confirmationDialogRef = this.servicesProviderService.getModalDialog().open(ConfirmationModalComponent, {
      hasBackdrop: true,
      width: ConfirmationModalComponent.width,
      data: {
        text: 'Are you sure you want to change the published status of your living lab?',
        buttons: ['CONFIRM', 'CANCEL'],
        buttonsStyle: [{ color: 'var(--blue)' }, { color: 'var(--gray)' }]
      }
    });

    // If confirmed, perform action after closing
    confirmationDialogRef.afterClosed().subscribe(returnedValue => {
      switch (returnedValue) {
        case 0: {
          //this.isPublished = !this.isPublished;
          this.dataContainer.storeValue("isPublished", this.isPublished);
          break;
        }
        default: {
          //this.isPublished = !this.isPublished;
          break;
        }
      }
    });
  }

  saveLivingLab(): void {

    of({}).pipe(

      concatMap(() => {

        // If current ll is published
        // and user updated a field and now ll is not allowed to be published,
        // open modal to inform user that if he proceeds, ll will be set unpublished
        if (this.isPublished && !this.canPublish()) {

          // Ask for confirmatioin
          return this.confirmUnpublish().pipe(

            // Take result
            tap((confirmed: boolean) => {

              // And if user confirmed, mark isPublished = false
              if (confirmed) {
                this.isPublished = false;
              }
            })
          );
        }

        // If ll is unpublished, or if user did not remove a mandatory field, proceed normally
        else {
          return of(true);
        }
      })

    ).subscribe((proceed: boolean) => {

      //
      // Actual save Living Lab code
      //

      if (proceed) {
        const inst = this;
        let data = this.filterOurUnesessaryAttributes(this.dataContainer.data);
        data = this.assignScreenshots(data);
        data.public = this.isPublic;
        data.status = this.isPublished ? LLStatusDefs.PUBLISHED : LLStatusDefs.DRAFT;
        // If this.data.logo is in url mode then it means that original photo has not changed
        /*        if (this.data.logo && !this.data.logo.startsWith('data')) {
                  this.data.logo = this.originalMainPhoto;
                } */
        //console.log(data);
        this.ready = false;
        // Make the call
        data.changes = this.dataContainer.changes;

        let lld = data.changes ? this.dataContainer.buildLightWeightLLDataObject(data) : data;
        if(this.debug) {
            console.log("Initial data object");
            console.log(data);

            console.log("Light weight data object");
            console.log(lld);
        }
        
        inst.livingLabService.updateLivingLab(this.livingLabId ?? -1, /*data*/ lld ).subscribe(
          (res: Response<boolean>) => {
            // console.log(res);
            if (res.data) {
              this.messageService.push("The Living Lab was updated successfully.");
              localStorage.setItem(LocalStorageDefs.LivingLabUpdateTab, String(inst.currentView));
              this.reset();
            }
            else {
              this.ready = true;
              this.servicesProviderService.createModalWithGenericErrorMessage();
            }
          },
          error => {
            console.error('error');
            console.error(error);
            this.ready = true;
            this.servicesProviderService.createModalWithGenericErrorMessage();
          }
        );
      }
    });
  }


  reset(): void {
    this.ready = false;
    this.dataFetched = false;
    this.dataChanged = false;
    this.hasPendingAsyncTasks = false;
    if (this.dataContainer) {
      this.dataContainer.clear();
    }
    this.data = {};
    this.loadData(this.currentView);
    this.popMessageService();
  }

  canSave(): boolean {
    return this.ready && this.isDirty();
  }


  // If user updated a field and now ll is not allowed to be published,
  // open modal to inform user that if he proceeds, ll will be set unpublished
  confirmUnpublish(): Observable<boolean> {

    // Ask for confirmation
    const confirmationDialogRef = this.servicesProviderService.getModalDialog().open(ConfirmationModalComponent, {
      hasBackdrop: true,
      width: ConfirmationModalComponent.width,
      data: {
        text: 'The minimum requirements for a living lab to be published are its title, description ,focal question, location & relevant SDGs. Because one or more of these attributes are not set in your living lab, it will be unpublished if you proceed.',
        buttons: ['CONFIRM', 'CANCEL'],
        buttonsStyle: [{ color: 'var(--blue)' }, { color: 'var(--gray)' }]
      }
    });

    // Return true if user pressed button 0 (confirm button), false otherwise
    return confirmationDialogRef.afterClosed().pipe(
      map(returnValue => returnValue === 0)
    );
  }


  isDirty(): boolean {
    if (!this.dataFetched) {
      return false;
    }
    return !this.hasPendingAsyncTasks && this.dataChanged;
  }

}
