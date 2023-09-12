import {Component, OnDestroy, OnInit} from '@angular/core';
import {
  LivingLabViewPageOutcomesComponent
} from "../../../living-lab-view-page/tabs/living-lab-view-page-outcomes/living-lab-view-page-outcomes.component";
import {DynamicView} from "../../../ComponentLibrary/dynamic-view";
import {DirtyView} from "../../../Models/DirtyView";
import {ParentComponent} from "../../Admin/LivingLabEntityManagement/parent-component";
import {AngularServicesProviderService} from "../../../Service/angular-services-provider.service";
import {AddNewOutcomeComponent} from "./add-new-outcome/add-new-outcome.component";
import {Outcome} from "../../../Models/Outcome";
import {Deepcopy} from "../../../Utils/deepcopy";
import {ConfirmationModalComponent} from "../../../confirmation-modal/confirmation-modal.component";
import {AssetsService} from "../../../Service/assets.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-ll-outcomes',
  templateUrl: '../../../living-lab-view-page/tabs/living-lab-view-page-outcomes/living-lab-view-page-outcomes.component.html',
  styleUrls: ['../../../living-lab-view-page/tabs/living-lab-view-page-outcomes/living-lab-view-page-outcomes.component.css', './ll-outcomes.component.css']
})
export class LLOutcomesComponent extends LivingLabViewPageOutcomesComponent
  implements OnInit, OnDestroy, DynamicView, DirtyView {

  showAddNewButton = true;
  showEditButton = true;
  showDeleteButton = true;
  showNoOutcomesMessage = false;
  parent: ParentComponent | null = null;
  livingLabId: number | undefined;

  constructor(private angularServicesProviderService: AngularServicesProviderService,
              assetsService: AssetsService,
              sanitizer: DomSanitizer
  ) {
    super(assetsService, sanitizer);
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
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
    let outcomes = data.getOutcomes();
    if (outcomes && outcomes.length > 0) {
      this.outcomes = Deepcopy.copy(outcomes);
    }
  }

  isDirty(): boolean {
    return false;
  }

  reset(): boolean {
    return false;
  }

  save(): boolean {
    this.parent?.storeValue('outcomes', this.outcomes);
    return true;
  }

  onClickAddNew(): void {
    const dyn = this.angularServicesProviderService.createNewModalWithType(AddNewOutcomeComponent);

    dyn.getObservableFromConfirmableOperation(
      () => {},
      () => {}
    ).subscribe(
      (returnedData: Outcome) => {
        if (returnedData) {
          this.outcomes.push(returnedData);
          this.save();
        }
      }
    );
  }

  onClickEdit(i: number): void {
    const dyn = this.angularServicesProviderService.createNewModalWithType(AddNewOutcomeComponent);
    dyn.getObservableFromConfirmableOperation(
      () => ({initialData: this.outcomes[i]}),
      () => {}
    ).subscribe(
      (returnedData: Outcome) => {
        if (returnedData) {
          this.outcomes[i] = returnedData;
          this.save();
        }
      }
    );
  }

  onClickDelete(i: number): void {

    // Ask for confirmation first
    const confirmationDialogRef = this.angularServicesProviderService.getModalDialog().open(ConfirmationModalComponent, {
      hasBackdrop: true,
      data: {
        text: 'Are you sure you want to delete this outcome?',
        buttons: ['CONFIRM', 'CANCEL'],
        buttonsStyle: [{color: 'var(--red)'}, {color: 'var(--gray)'}]
      }
    });

    // If confirmed, remove it from outcomes list
    confirmationDialogRef.afterClosed().subscribe(returnedValue => {
      switch (returnedValue) {
        case 0: {
          this.outcomes.splice(i, 1);
          this.save();
        }
      }
    });
  }
}
