import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { LivingLabSummaryCardComponent } from "src/app/living-lab-summary-card/living-lab-summary-card.component";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { AssetsService } from "src/app/Service/assets.service";
import { LivingLabService } from "src/app/Service/living-lab.service";
import { LlJoinRequestService } from "src/app/Service/ll-join-request.service";
import { LLUserMembershipService } from "src/app/Service/ll-user-membership.service";
import { MessageService } from "src/app/Service/message.service";
import { UserManagementService } from "src/app/User/user-management.service";
import { Location } from '@angular/common';
import { DynamicModalDialogComponent, ModalButton, ModalConfig } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { ErrorResponse } from "src/app/Models/Response/error-response";
import { Response } from 'src/app/Models/Response/response';
import { ManagedLivingLabInfoComponent } from "../managed-living-lab-info/managed-living-lab-info.component";

@Component({
  selector: 'managed-living-lab-summary-card',
  templateUrl: './managed-living-lab-summary-card.component.html',
  styleUrls: ['../../living-lab-summary-card/living-lab-summary-card.component.css', 'managed-living-lab-summary-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagedLivingLabSummaryCardComponent extends LivingLabSummaryCardComponent {
  @Input() showButtons = true;
  @Input() showJoinRequestButtonInput = false;

  constructor(protected assetsService: AssetsService,
    protected angularService: AngularServicesProviderService,
    protected userManagementService: UserManagementService,
    protected llService: LivingLabService,
    protected router: Router,
    protected location: Location,
    protected llUserMembershipService: LLUserMembershipService,
    protected messageService: MessageService,
    protected llJoinRequestService: LlJoinRequestService,
    protected changeDetectorRef: ChangeDetectorRef) {
    super(assetsService, angularService, userManagementService, llService, router, location, llUserMembershipService, messageService, llJoinRequestService, changeDetectorRef);
  }

  openLLInfoModal(){
    const dyn = this.angularService.createNewResponsiveModalWithType(ManagedLivingLabInfoComponent);
   // dyn.setModalWidth("small")
    const inst = this;
    const getData = () => {
      return { ll: inst.livingLabSummary, dyn: dyn };
    };
    dyn.getObservableFromConfirmableOperationWithCustomStyle(getData, () => { }, 'llInfoModal').subscribe((entity: any) => {});

    // After modal is closed, check if the number of pending requests has changed
    dyn.afterClosed(() => {});
  }


  switchActivation() {
    let buttonMessage = "";
    let promptMessage = "";
    let resultMessage = "";
    if (this.livingLabSummary.isActive) {
      buttonMessage = "DEACTIVATE";
      promptMessage = 'Are you sure you want to deactivate the Living Lab with name \'' + this.livingLabSummary.name + '\' ?';
      resultMessage = 'The Living Lab has been deactivated successfully.';
    }
    else {
      buttonMessage = "ACTIVATE";
      promptMessage = 'Are you sure you want to activate the Living Lab with name \'' + this.livingLabSummary.name + '\' ?'
      resultMessage = 'The Living Lab has been activated successfully.';

    }
    const dyn: DynamicModalDialogComponent = this.angularService.createNewResponsiveModal();
    const buttons: ModalButton[] = [{ color: 'red', label: buttonMessage }, { color: 'grey', label: 'CANCEL' }];
    const config: ModalConfig = { text: promptMessage, buttons: buttons };
    let inst = this;
    
    const obs = (i: number) => {
      if (i === undefined) {
        return;
      }

      switch (i) {
        case 0:
          if (inst.livingLabSummary.isActive) {
            inst.llService.deactivateLivingLab(inst.livingLabSummary.id).subscribe(
              (data: Response<boolean>) => {
                inst.parent.redraw();
                inst.angularService.createNewModal().alert(true, resultMessage);
              },
              (error: ErrorResponse) => {
                inst.angularService.createNewModal().alert(false, error.error.message);
              });
          }
          else{
            inst.llService.activateLivingLab(inst.livingLabSummary.id).subscribe(
              (data: Response<boolean>) => {
                inst.parent.redraw();
                inst.angularService.createNewModal().alert(true, resultMessage);
              },
              (error: ErrorResponse) => {
                inst.angularService.createNewModal().alert(false, error.error.message);
              });
          }
          break;
        case 1:
          break;
      }
    };

    dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
      currentDyn.afterClosed(obs);
    });
  }

  deleteLivingLab(): void {
    const dyn: DynamicModalDialogComponent = this.angularService.createNewResponsiveModal(); //this.angularService.createNewModal();
    const buttons: ModalButton[] = [{ color: 'red', label: 'DELETE' }, { color: 'grey', label: 'CANCEL' }];
    const config: ModalConfig = { text: 'Are you sure you want to delete the Living Lab with name \'' + this.livingLabSummary.name + '\' ?', buttons: buttons };
    const inst = this;
    const obs = (i: number) => {
      if (i === undefined) {
        return;
      }

      switch (i) {
        case 0:
          inst.llService.deleteLivingLabPermanently(inst.livingLabSummary.id).subscribe(
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

  editLivingLab(): void {
    this.parent.goToPage('/living-lab-update' + '/' + this.livingLabSummary.id);
  }
}