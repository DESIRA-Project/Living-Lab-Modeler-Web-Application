import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {AssetsService} from '../Service/assets.service';
import {LLUserPermissionDefs} from '../Models/LLUserPermissionDefs';
import { environment } from '../../environments/environment';
import { UserLivingLab } from '../Models/UserLivingLab';
import { AngularServicesProviderService } from '../Service/angular-services-provider.service';
import { UserManagementService } from '../User/user-management.service';
import { DynamicModalDialogComponent, ModalButton, ModalConfig } from '../ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component';
import { MyLivingLabsComponent } from '../my-living-labs/my-living-labs.component';
import { LivingLabService } from '../Service/living-lab.service';
import { ErrorResponse } from '../Models/Response/error-response';
import { Response } from 'src/app/Models/Response/response';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {LocalStorageDefs} from "../Models/LocalStorageDefs";
import { saveAs } from 'file-saver';
import {LLUserMembershipService} from "../Service/ll-user-membership.service";
import {MessageService} from "../Service/message.service";
import {LlUsersManagementComponent} from "../User/LLCreation/LLUsersManagement/ll-users-management.component";
import {LlJoinRequestService} from "../Service/ll-join-request.service";
import {LlJoinRequestFormComponent} from "./ll-join-request-form/ll-join-request-form.component";
import { Navigationable } from '../Models/Navigationable';

@Component({
  selector: 'app-living-lab-summary-card',
  templateUrl: './living-lab-summary-card.component.html',
  styleUrls: ['./living-lab-summary-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LivingLabSummaryCardComponent implements OnInit {

  @Input() livingLabSummary: UserLivingLab = {} as UserLivingLab;
  @Input() chipText: string | undefined;
  @Input() showButtons = true;
  @Output() onChanges = new EventEmitter<boolean>();
  showEditButton = false;
  showAddMembersButton = false;
  showDownloadPdfReportButton = false;
  showDownloadZipFolderButton = false;
  showLeaveButton = false;
  @Input() showJoinRequestButtonInput = true;
  showJoinRequestButton = false;
  environment = environment;
  numPendingRequests = 0;

  parent: Navigationable = {} as Navigationable;
  canRequestJoin:boolean = false;

  privacyShown:boolean = false;

  @Input()
  set setParent(p: Navigationable){
    this.parent = p;
  }

  @Input()
  set showPrivacy(privacyShown:boolean){
      this.privacyShown = privacyShown;
  }

  constructor(protected assetsService: AssetsService,
    protected angularService: AngularServicesProviderService,
    protected userManagementService: UserManagementService,
              protected llService: LivingLabService,
              protected router: Router,
              protected location: Location,
              protected llUserMembershipService: LLUserMembershipService,
              protected messageService :MessageService,
              protected llJoinRequestService: LlJoinRequestService,
              protected changeDetectorRef: ChangeDetectorRef) {

  }

  prepare():void{
    this.livingLabSummary.iconUrl = this.livingLabSummary.iconUrl ? this.assetsService.getAssetLink(this.livingLabSummary.iconUrl) : undefined;
    this.showEditButton = this.livingLabSummary.llPermissions.indexOf(LLUserPermissionDefs.MODIFY_LIVING_LAB_INFO) > -1;
    this.showAddMembersButton = this.livingLabSummary.llPermissions.indexOf(LLUserPermissionDefs.ADD_LIVING_LAB_USERS) > -1;
    this.showDownloadPdfReportButton = this.livingLabSummary.llPermissions.indexOf(LLUserPermissionDefs.VIEW_LIVING_LAB) > -1;
    this.showDownloadZipFolderButton = this.livingLabSummary.llPermissions.indexOf(LLUserPermissionDefs.VIEW_LIVING_LAB) > -1;
    this.showLeaveButton = !this.isCreator() && this.livingLabSummary.llPermissions.indexOf(LLUserPermissionDefs.VIEW_LIVING_LAB) > -1;

    if(this.showAddMembersButton){
         this.getNumberOfPendingRequests();
    }

    if(this.livingLabSummary.llPermissions.length === 0){
      this.canRequestJoin = true;
    }
    // Show join request button only if
    // 1. It was allowed by @Input() and
    // 2. User is not a member of ll
    if (this.showJoinRequestButtonInput) {
      this.showJoinRequestButton = !(this.livingLabSummary.llPermissions.indexOf(LLUserPermissionDefs.VIEW_LIVING_LAB) > -1);
    }

  }

  ngOnInit(): void {
    this.prepare();
  }

  getNumberOfPendingRequests(): void {
    this.llJoinRequestService.getNumberOfPendingRequests(this.livingLabSummary.id).subscribe(
      (response: Response<number>) => {
        this.numPendingRequests = response.data;
        this.changeDetectorRef.markForCheck();
      },
      (error: ErrorResponse) => console.log(error.error.message)
    );
  }

  openAddLLUserModal(): void {
    const dyn = this.angularService.createNewModalWithType(LlUsersManagementComponent);
    const inst = this;
    const getData = () => {
      return { ll: inst.livingLabSummary, dyn: dyn, numPendingRequests: this.numPendingRequests };
    };
    dyn.getObservableFromConfirmableOperationWithCustomStyle(getData, () => { }, 'membershipModal').subscribe((entity: any) => {});

    // After modal is closed, check if the number of pending requests has changed
    dyn.afterClosed(() => this.getNumberOfPendingRequests());
  }

  openRequestToJoinLivingLabModal(): void {
    const dyn = this.angularService.createNewModalWithType(LlJoinRequestFormComponent);
    const inst = this;
    const getData = () => {
      return { ll: inst.livingLabSummary, numPendingRequests: this.numPendingRequests };
    };
    dyn.getObservableFromConfirmableOperationWithCustomStyle(getData, () => { }, 'membershipModal').subscribe((entity: any) => {});

    // After modal is closed, check if for dom changes
    dyn.afterClosed(() => {
      inst.parent?.redraw();
      this.changeDetectorRef.markForCheck();
    });
  }

  deleteLivingLab(): void {
    const dyn: DynamicModalDialogComponent = this.angularService.createNewModal();
    const buttons: ModalButton[] = [{ color: 'red', label: 'DELETE' }, { color: 'grey', label: 'CANCEL' }];
    const config: ModalConfig = { text: 'Are you sure you want to delete the Living Lab with name ' + this.livingLabSummary.name + ' ?', buttons: buttons };
    const inst = this;
    const obs = (i: number) => {
      if (i === undefined) {
        return;
      }

      switch (i) {
        case 0:
          inst.llService.deleteLivingLab(inst.livingLabSummary.id).subscribe(
            (data: Response<boolean>) => {
              inst.parent.redraw();
              inst.angularService.createNewModal().alert(true, 'The Living Lab was deleted successfully.');
            },
            (error: ErrorResponse) => {
              inst.angularService.createNewModal().alert(false, error.error.message);
            });
          break;
        case 1:
          break;
      }
    };

    dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
      currentDyn.afterClosed(obs);
    });
  }

  isCreator(): boolean {
    return this.userManagementService.getUserInfo() !== null && this.userManagementService.getUserInfo().id === this.livingLabSummary.creatorId;
  }

  getReport(){
    let inst = this;
    inst.angularService.createNewModal().alert(true, "Your download is starting...");
    this.llService.downloadReport(this.livingLabSummary.id).subscribe(res=>{
      const file = res;
      let name = this.getFileNameForStorage ( inst.livingLabSummary.name );
      saveAs(res, `pdf `+"ll-report-"+name+`.pdf`);
      inst.angularService.createNewModal().alert(true, "The download is complete.");
    }, error=>{
      inst.angularService.createNewModal().alert(false, "Couldn't download the report..");
    });
  }

  private getFileNameForStorage(name:string|null){
    if(name === null) return "";
    if(name.length === 0){
      return "";
    }
    let regex = /[/\\?%*:|"<>]/g;
    name = name.replace(regex, "");

    if(name.length > 50){
      name = name.substring(0,50);
    }
    return name;
  }

  getLivingLabMaterial(){
    let inst = this;
    inst.angularService.createNewModal().alert(true, "Your download is starting...");
    this.llService.downloadMaterial(this.livingLabSummary.id).subscribe(res=>{
      const file = res;
      let name = this.getFileNameForStorage ( inst.livingLabSummary.name );
      saveAs(res, "ll-material-"+name+`.zip`);
      inst.angularService.createNewModal().alert(true, "The download is complete.");
    }, error=>{
      inst.angularService.createNewModal().alert(false, "Couldn't download the Living Lab's material..");
    });
  }

  navigateToLivingLab(): void {
    this.router.navigate(['living-lab', this.livingLabSummary.id]);
  }

  editLivingLab(): void {
    //localStorage.setItem(LocalStorageDefs.LivingLabUpdateId, String(this.livingLabSummary.id));
    this.parent.goToPage('/living-lab-update'+'/'+this.livingLabSummary.id);
  }

  leaveLivingLab(): void {
    this.angularService.createNewModal().performServiceCallAndShowResponseWithConfirmation(
      this.llUserMembershipService.removeLLMembership(this.livingLabSummary.id),
      (inst: any) => inst.onChanges.emit(true),
      this,
      'Are you sure you want to leave living lab ' + this.livingLabSummary.name + '?'
    );
  }
}
