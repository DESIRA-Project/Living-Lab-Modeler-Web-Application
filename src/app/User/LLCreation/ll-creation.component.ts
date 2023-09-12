import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {ChangeDetectorRef, Component, NgZone, ViewChild} from "@angular/core";
import {BackendService} from "src/app/backend.service";
import {AttachableButton} from "src/app/ComponentLibrary/attachable-button";
import {DynamicContentItem} from "src/app/ComponentLibrary/DynamicModal/dynamic-content-item.component";
import {DynamicContent} from "src/app/ComponentLibrary/DynamicModal/dynamic-content.component";
import {DynamicItem} from "src/app/ComponentLibrary/DynamicModal/dynamic-item.components";
import {DynamicModalContainer} from "src/app/ComponentLibrary/DynamicModal/dynamic-modal-container";
import {ModalController} from "src/app/ComponentLibrary/DynamicModal/modal-controller";
import {DirtyView} from "src/app/Models/DirtyView";
import {AngularServicesProviderService} from "src/app/Service/angular-services-provider.service";
import {LivingLabService} from "src/app/Service/living-lab.service";
import {environment} from "src/environments/environment";
import {ChildComponent} from "../Admin/LivingLabEntityManagement/child-component";
import {ParentComponent} from "../Admin/LivingLabEntityManagement/parent-component";
import {AlertSupportingComponent} from "../alert-supporting-component";
import {UserManagementService} from "../user-management.service";
import {LLDomainsComponent} from "./LLDomain/ll-domains.component";
import {LLDigitalTechnologiesComponent} from "./LLDts/ll-dts.component";
import {LLGeneralInformationComponent} from "./LLGeneralInformation/ll-general-info.component";
import {LLLocationComponent, MapConfig} from "./LLLocation/ll-location.component";
import {LLSCPEntitiesComponent} from "./LLSCPEntities/ll-scp-entities.component";
import {LLSDGsComponent} from "./LLSDGs/ll-sdgs.component";
import {LLStakeholdersComponent} from "./LLStakeholders/ll-stakeholders.component";
import {Response} from "../../Models/Response/response";
import {ScreenshotService} from "src/app/Service/screenshot.service";
import {LLSCPGraphComponent} from "./LLSCPEntities/ll-scp-graph.component";
import {ActivatedRoute, Router} from "@angular/router";
import {AssetsService} from "../../Service/assets.service";
import {HttpClient} from "@angular/common/http";
import {ActivityService} from "../../Service/activity.service";
import {LLStatusDefs} from "../../Models/LLStatusDefs";
import {LLActivitiesComponent} from "./LLActivities/ll-activities.component";
import {ConfirmationModalComponent} from "../../confirmation-modal/confirmation-modal.component";
import {LocalStorageDefs} from "../../Models/LocalStorageDefs";
import {MessageService} from "../../Service/message.service";
import { DynamicContentParent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content-parent";
import { ObjectOfInterest } from "src/app/Models/ObjectOfInterest";
import { DataContainer } from "../ll-update/data-container";
import { Data } from "popper.js";
import { LLData } from "src/app/Models/LLData";
import {LLOutcomesComponent} from "./LLOutcomes/ll-outcomes.component";
import { LLUserMembershipService } from "src/app/Service/ll-user-membership.service";
import {CardRenderableComponent} from "../../CardRenderableComponent/card-renderable.component";
import {BootstrapBreakpoints} from "../../BootstrapBreakpoints";

export interface LLCreationMenu {
    id: string,
    icon: string;
    tooltip: string,
    componentName?: string,
    name: string,
    matIcon: string,
}

@Component({
    selector: 'll-creation',
    templateUrl: './ll-creation.component.html',
    /*    styleUrls:['../../style/tables.css'],*/
    styleUrls: ['ll-creation.component.css']
})

export class LLCreationComponent extends CardRenderableComponent implements DynamicContent, ParentComponent {
    title = "Organize a Living Lab";
    ready = false;
    amountOfRows = 3;
    menus: LLCreationMenu[][] = [];
    data: any = {};
    currentView: number = -1;
    protected token: string = "";
    childComponent: DynamicItem | null = null;
    currentIcon: string = "";
    actualView: DirtyView | null = null;
    isPublic = false;
    update = false;
    livingLabId: number | undefined;
    submitButtonText = 'Save';
    originalMainPhoto: any;
    isPublished = false;
    beforeUnloadCB: any ;
    @ViewChild('dyn') handle!: DynamicItem;
    smallScreen: boolean = false;
    parent:DynamicContentParent | undefined;
    readyToRender = false;
    onRender = false;
    currentComponentName:string|undefined;
    o:ObjectOfInterest|null = null;
    dataContainer:DataContainer = {} as DataContainer;
    hasPendingAsyncTasks = false;
    dataChanged:boolean = false;
    dataFetched = false;
    onFault:boolean = false;
    debug:boolean = false;

    constructor(private readonly zone: NgZone,
                protected service: BackendService,
                protected userManagementService: UserManagementService,
                protected activatedRoute: ActivatedRoute,
                protected servicesProviderService: AngularServicesProviderService,
                protected livingLabService: LivingLabService,
                public breakpointObserver: BreakpointObserver,
                protected assetsService: AssetsService,
                protected httpClient: HttpClient,
                protected router: Router,
                private screenshotService: ScreenshotService,
                protected activityService: ActivityService,
                protected angularServicesProviderService: AngularServicesProviderService,
                protected messageService: MessageService,
                protected llUserMembership: LLUserMembershipService,
                private cdref: ChangeDetectorRef) {

      super(breakpointObserver,BootstrapBreakpoints.sm + 'px',false);

        this.screenshotService.clearAll();
        this.dataContainer = new DataContainer(this,this.debug);
        this.dataContainer.defaultInitialization();

        if (this.userManagementService !== null) {
            const token = this.userManagementService.getToken();
            if (token !== null) {
                this.token = token;
                this.loadData();
            }
        }

        let inst = this;
        let handleBeforeUnload = (e: any) => {
            // Cancel the event
            if (inst.isDirty()/*true*/) {
                e.preventDefault();
                return e.returnValue = 'Are you sure you would like to refresh the page, all data will be discarded.'
            }
            return;
        };

        inst.beforeUnloadCB = handleBeforeUnload;


        breakpointObserver.observe([
            Breakpoints.XSmall,
            Breakpoints.Small
        ]).subscribe(result => {
            this.smallScreen = result.matches;
        });

        window.addEventListener('beforeunload', handleBeforeUnload);
        //this.selectView(0);
  }

  readDataUpdateValue(){
    this.dataChanged = this.dataContainer.getDataHaveChanged();
    if(this.debug){
        console.log("Do we have a change?");
        console.log(this.dataChanged);
    }
  }
  readhasPendingAsyncTasks(){
    this.hasPendingAsyncTasks = this.dataContainer.getHasPendingAsyncTasks();
  }

  switchIsPublic(){
    this.dataContainer.storeValue("isPublic", this.isPublic);
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  setObjectOfInterest(o: ObjectOfInterest): void {
    this.o = o;
  }

  notify(result: boolean): void {
    console.log("notification")
    console.log(result);
  }

  clearValue(key: string): void {
    if(this.data[key]){
      delete this.data[key];
    }
  }


  assignScreenshots(_data:any) {
    let data:string | undefined = undefined;
    //locationState->latestSelection->data->screenshot

    if(_data.locationState && _data.locationState.latestSelection
      && _data.locationState.latestSelection.data){
      let key = _data.locationState.latestSelection.data.screenshot;
      data = this.screenshotService.get(key);
      this.screenshotService.clearData(key);

      if(_data.locationState.latestSelection && _data.locationState.latestSelection.locationChoice === "gps" ){
        _data.locationState.latestSelection.data.screenshot = data;
      }
    }

    let graphKey = LLSCPGraphComponent.screenshot;
    data = this.screenshotService.get(graphKey);
    this.screenshotService.clearData(graphKey);

    if(data){
      _data.scpGraphScreenshot = data;
    }

    return _data;
  }


  setParent(parent: DynamicContentParent | undefined){
    this.parent = parent;
  }

    saveLivingLab() {

      const inst = this;
        let data = this.filterOurUnesessaryAttributes(this.dataContainer.data);
        data = this.assignScreenshots(data);
        data.public = this.isPublic;
        data.status = this.isPublished ? LLStatusDefs.PUBLISHED : LLStatusDefs.DRAFT;

        this.ready = false;
        inst.livingLabService.createLivingLab(data).subscribe((res: Response<number>) => {

          if (res.data) {
            this.messageService.push("The Living Lab was saved successfully.");
           // localStorage.setItem(LocalStorageDefs.LivingLabUpdateId, String(res.data));
            localStorage.setItem(LocalStorageDefs.LivingLabUpdateTab, String(inst.currentView) );

  /*          this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
              this.router.navigate(['/living-lab-update']));
*/
              this.parent?.goToPage('/living-lab-update' + '/'+res.data);

          }
          else {
            this.servicesProviderService.createModalWithGenericErrorMessage();
            this.ready = true;
          }

        },
          error => {
            inst.servicesProviderService.createModalWithGenericErrorMessage();
            this.ready = true;
          });
    }

    canSave(): boolean {
        return this.isDirty();
    }

    canPublish(): boolean {
        return this.dataContainer.canPublish();
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
          buttonsStyle: [{color: 'var(--blue)'}, {color: 'var(--gray)'}]
        }
      });

      // If confirmed, perform action after closing
      confirmationDialogRef.afterClosed().subscribe(returnedValue => {
        switch (returnedValue) {
          case 0: {
            //this.isPublished = !this.isPublished;
            this.dataContainer.storeValue("isPublished",this.isPublished);
            break;
          }
          default: {
            //this.isPublished = !this.isPublished;
            break;
          }
        }
      });
    }

    hasSelection(boolTable : {[key: string]: boolean}){
          let keys = Object.keys(boolTable);
          for(let i = 0;i<keys.length;i++){
              if(boolTable[keys[i]] === true) return true;
          }
         return false;
      }

    filterOurUnesessaryAttributes(data:LLData):LLData{
      if (data.locationState !== undefined){
        //console.log(data.locationState)
            if (data.locationState.latestSelection !== undefined){
               // data.locationState = {latestSelection : data.locationState.latestSelection};
            }
            if(data.locationState.currentConfig){
              data.locationState.currentConfig = {} as MapConfig;
            }
      }else{
        //console.log(data)
        if(this.debug){
            alert("no loc state??");
        }
        this.onFault = true;
        return data;
      }

      if (data.activities !== undefined) {
        for (const activity of data.activities) {
          activity.mainPhotoUrl = undefined;
        }
      }
      return data;
    }

    setChangeAwareChild(v: DirtyView): void {
        this.actualView = v;
    }

    isDirty(): boolean {
//old impl        return (this.actualView && this.actualView.isDirty()) || !this.sharedDataAreEmpty();
        if(this.dataChanged) return this.dataChanged;
        return !this.hasPendingAsyncTasks && this.dataChanged;
    }

    getSharedData() {
        return this.dataContainer;
    }

    getSharedDataContainer(): DataContainer {
      return this.dataContainer;
    }

    setTitle(title: string): void {
        this.title = title;
    }
    setCloseButtonText(text: string): void {
    }
    closeModal(): void {
    }
    getParent(): ModalController | null {
        return null;
    }
    addButton(b: AttachableButton): void {
    }

    switchView(e: any) {
      //  console.log(e);
        this.selectView(e.selectedIndex);
    }

    protected loadData(viewIndex = 0): void {
        let m: LLCreationMenu[] = environment.env.llCreation.menuButtons;
        let rowNum = 0;
        this.menus[rowNum] = [];

        for (let i = 0; i < m.length; i++) {
            if (i !== 0 && (i) % this.amountOfRows === 0) {
                //    rowNum ++;
                //  this.menus[rowNum] = [];
            }
            this.menus[rowNum].push(m[i]);
        }

        this.data = {};
        this.loadDataExtraTasksAndSetReady(viewIndex);
    }

    protected loadDataExtraTasksAndSetReady(_: number): void {
      this.selectView(0);
      this.dataFetched = true;
     // this.ready = true;
    }

    public storeValue(key: string, value: any) {
        if (this.data === undefined) {
            this.data = {};
        }
        /*console.log(this.data.entities)*/

        this.data[key] = value;
        if(this.dataContainer){
/*          console.log(key);
          console.log(value);*/

          this.dataContainer.storeValue(key, value);
      }
    }

    checkForAuth(){
      if (!this.userManagementService.getUserInfo()) {
          this.angularServicesProviderService.createTokenExpirationModal();
          this.router.navigate(['/']);
          return;
        }
    }

    openLivingLabViewPage(){
      if(this.livingLabId){    
        let u = window.location.href.replace('living-lab-update','living-lab');
          window.open(u, '_blank');
      }
    }

    public selectView(i: number) {
        this.onRender = true;
        this.childComponent = null;
        let inst = this;
        this.currentIcon = inst.menus[0][i].icon;
        inst.currentComponentName = inst.menus[0][i].componentName;

        setTimeout(() => {
            if (inst.currentComponentName) {

                this.checkForAuth();

                inst.childComponent = inst.createDynamicComponent(inst.currentComponentName);
                inst.ready = true;
                inst.currentView = i;
            }
            else {
                inst.childComponent = null;
            }
            inst.onRender = false;
        }, 100);
    }

    setComponent(c: ChildComponent): void {

    }

    initialize(parent: DynamicModalContainer): void {
        throw new Error("Method not implemented.");
    }

    getUserToken(): string | null {
        return this.userManagementService.getToken();
    }

    initializeWithAuthData(userToken: string): void {
    }

    setDependencies(dependencies: DynamicItem[]): void {
        throw new Error("Method not implemented.");
    }

    ngOnDestroy() {
        //leaving the page
        this.actualView = null;
        this.data = {};

    }
    cleanBeforeUnloadCB(){
      if(this.beforeUnloadCB){
           window.removeEventListener('beforeunload', this.beforeUnloadCB);
      }
    }

    createDynamicComponent(name: string): DynamicItem | null {
        switch (name) {
            case "llGeneralInfo": {
                return new DynamicContentItem(LLGeneralInformationComponent, this.service, this.userManagementService);
            }
            case "llDTs": {
                return new DynamicContentItem(LLDigitalTechnologiesComponent, this.service, this.userManagementService);
            }
            case "llSDGs": {
                return new DynamicContentItem(LLSDGsComponent, this.service, this.userManagementService);
            }
            case "llDomains": {
                return new DynamicContentItem(LLDomainsComponent, this.service, this.userManagementService);
            }
            case "llStakeholders": {
                return new DynamicContentItem(LLStakeholdersComponent, this.service, this.userManagementService);
            }
            case "llLocation": {
                return new DynamicContentItem(LLLocationComponent, this.service, this.userManagementService);
            }
            case "llSCPEntities": {
                return new DynamicContentItem(LLSCPEntitiesComponent, this.service, this.userManagementService);
            }
            case "llActivities": {
              return new DynamicContentItem(LLActivitiesComponent, this.service, this.userManagementService);
            }
            case "llOutcomes": {
              return new DynamicContentItem(LLOutcomesComponent, this.service, this.userManagementService);
            }

            default: break;
        }
        return null;
    }

}
