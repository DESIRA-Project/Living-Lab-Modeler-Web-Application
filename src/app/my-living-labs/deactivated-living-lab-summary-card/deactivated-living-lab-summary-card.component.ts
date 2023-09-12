import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { LivingLabSummaryCardComponent } from "src/app/living-lab-summary-card/living-lab-summary-card.component";
import { Navigationable } from "src/app/Models/Navigationable";
import { UserLivingLab } from "src/app/Models/UserLivingLab";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { AssetsService } from "src/app/Service/assets.service";
import { LivingLabService } from "src/app/Service/living-lab.service";
import { LlJoinRequestService } from "src/app/Service/ll-join-request.service";
import { LLUserMembershipService } from "src/app/Service/ll-user-membership.service";
import { MessageService } from "src/app/Service/message.service";
import { UserManagementService } from "src/app/User/user-management.service";
import {Location} from '@angular/common';

@Component({
    selector: 'deactivated-living-lab-summary-card',
    templateUrl: './deactivated-living-lab-summary-card.component.html',
    styleUrls: ['./deactivated-living-lab-summary-card.component.css','../../living-lab-summary-card/living-lab-summary-card.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class DeactivatedLivingLabSummaryCardComponent extends LivingLabSummaryCardComponent {
  
    @Input() livingLabSummary: UserLivingLab = {} as UserLivingLab;
    chipText: string | undefined;
    showButtons = false;
    showEditButton = false;
    showAddMembersButton = false;
    showDownloadPdfReportButton = false;
    showDownloadZipFolderButton = false;
    showLeaveButton = false;
    showJoinRequestButtonInput = false;
    showJoinRequestButton = false;
  
    parent: Navigationable = {} as Navigationable;
    canRequestJoin:boolean = false;
  
    privacyShown:boolean = false;
  
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
        super(assetsService, angularService,userManagementService,llService,router,location,llUserMembershipService,messageService,llJoinRequestService,changeDetectorRef);
    }
}