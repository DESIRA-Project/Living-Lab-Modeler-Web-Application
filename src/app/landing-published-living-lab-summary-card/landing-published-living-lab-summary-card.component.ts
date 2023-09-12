import {Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import {AssetsService} from '../Service/assets.service';
import {LLUserPermissionDefs} from '../Models/LLUserPermissionDefs';
import { environment } from '../../environments/environment';
import { UserLivingLab } from '../Models/UserLivingLab';
import { AngularServicesProviderService } from '../Service/angular-services-provider.service';
import { LLMembersComponent } from '../User/LLCreation/LLMembers/ll-members.component';
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
import { LlJoinRequestDispatcherService } from '../Service/ll-join-request-dispatcher.service';
import { LandingPageComponent } from '../landing-page/landing-page.component';

@Component({
  selector: 'landing-published-living-lab-summary-card',
  templateUrl: './landing-published-living-lab-summary-card.component.html',
  styleUrls: [ './landing-published-living-lab-summary-card.component.css']
})
export class LandingPublishedLivingLabSummaryCardComponent implements OnInit {

  @Input() livingLabSummary: UserLivingLab = {} as UserLivingLab;
  @Input() chipText: string | undefined;
  @Input() showButtons = true;
  @Output() onChanges = new EventEmitter<boolean>();
  showEditButton = false;
  showAddMembersButton = false;
  showDownloadPdfReportButton = false;
  showDownloadZipFolderButton = false;
  showLeaveButton = false;
  environment = environment;

  constructor(
              private joinRequestDispatcher:LlJoinRequestDispatcherService,
              private assetsService: AssetsService,
              private angularService: AngularServicesProviderService,
              private userManagementService: UserManagementService,
              private llService: LivingLabService,
              private router: Router,
              private location: Location,
              private llUserMembershipService: LLUserMembershipService,
              private messageService :MessageService) {

  }

  ngOnInit(): void {
    this.livingLabSummary.iconUrl = this.livingLabSummary.iconUrl ? this.assetsService.getAssetLink(this.livingLabSummary.iconUrl) : undefined;
    this.showButtons = true;
  }

  ngOnDestroy(){
  }


  openAddLLUserModal(): void{

    const dyn = this.angularService.createNewModalWithType(LLMembersComponent);
    const inst = this;
    const getData = () => {
      return { ll: inst.livingLabSummary, handle: dyn};
    };
    dyn.getObservableFromConfirmableOperationWithCustomStyle(getData, () => { }, 'membershipModal').subscribe((entity: any) => {});
  }

  navigateToLivingLab(): void {
    this.router.navigate(['living-lab', this.livingLabSummary.id]);
  }

  performJoinRequest(){
      //we need to store the id of the Living Lab in the local storage and redirect to the sign in page
      this.joinRequestDispatcher.storeJoinRequest(this.livingLabSummary.id);
      this.router.navigateByUrl(environment.env.signIn.link);

  }

}
