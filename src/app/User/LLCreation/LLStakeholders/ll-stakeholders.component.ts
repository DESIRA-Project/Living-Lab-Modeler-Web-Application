import { Component, OnDestroy } from "@angular/core";
import { DynamicView } from "src/app/ComponentLibrary/dynamic-view";
import { DynamicModalDialogComponent, ModalButton, ModalConfig } from "src/app/ComponentLibrary/DynamicModalDialog/dynamic-modal-dialog.component";
import { DirtyView } from "src/app/Models/DirtyView";
import { IconResource, IconResourceListComponent } from "src/app/Models/IconResource";
import { LLStakeholder } from "src/app/Models/LLStakeholder";
import { Stakeholder } from "src/app/Models/Stakeholder";
import { StakeholderRole } from "src/app/Models/StakeholderRole";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { AssetsService } from "src/app/Service/assets.service";
import { StakeholderService } from "src/app/Service/stakeholder.service";
import { AddNewStakeholderComponent, LLComponentMode } from "src/app/stakeholder-management/add-new-stakeholder/add-new-stakeholder.component";
import { Deepcopy } from "src/app/Utils/deepcopy";
import { PageResponse, Response } from '../../../Models/Response/response';
import { ParentComponent } from "../../Admin/LivingLabEntityManagement/parent-component";
import { LLAddNewStakeholderModalComponent } from "./ll-add-new-stakeholder-modal.component";
import { LLAddNewStakeholderTypeUnawareComponent } from "./ll-add-new-stakeholder-with-selectable-type.component";
import { LLAddNewStakeholderComponent } from "./ll-add-new-stakeholder.component";
import { StakeholderPaginatedTableComponent } from "./stakeholder-paginated-table.component";
import {BootstrapBreakpoints} from "../../../BootstrapBreakpoints";

@Component({
  selector: 'll-stakeholders',
  templateUrl: './ll-stakeholders.component.html',
  styleUrls: ['../ll-creation.component.css', '../../../living-lab-view-page/tabs/living-lab-view-page-stakeholders/living-lab-view-page-stakeholders.component.css', 'll-stakeholders.component.css'],
})

export class LLStakeholdersComponent extends IconResourceListComponent implements DynamicView, OnDestroy, DirtyView {

  //stakeholders: Stakeholder[] = [];
  stakeholdersMap: any = {};
  static numStakeholdersPerRow = 4;

  stakeholdersPerRow: LLStakeholder[][] = [];
  userStakeholdersPerRow: LLStakeholder[][] = [];

  modalWidth = window.innerWidth < BootstrapBreakpoints.sm ? '75%' : '45%';
  ready = false;
  title = "Stakeholders"
  parent: ParentComponent | null = null;

  selectedExistingStakeholders: LLStakeholder[] = [];
  newlyCreatedStakeholders: LLStakeholder[] = [];

  stakeholderRoles: StakeholderRole[] = [];

  mainStakeholders: LLStakeholder[] = [];
  contributors: LLStakeholder[] = [];

  constructor(public stakeholderService: StakeholderService,
    protected assetsService: AssetsService,
    protected angularServicesProviderService: AngularServicesProviderService) {
    super(assetsService, LLStakeholdersComponent.numStakeholdersPerRow);
    //    this.fetchData();
    this.fetchStakeholderRoles();
  }
  save(): boolean {
/*    console.log("stakeholder save")
    console.log(JSON.stringify(this.newlyCreatedStakeholders));
    console.log(JSON.stringify(this.selectedExistingStakeholders));*/

    this.parent?.storeValue("selectedExistingStakeholders", this.selectedExistingStakeholders);
    this.parent?.storeValue("newlyCreatedStakeholders", this.newlyCreatedStakeholders);
    return true;

  }

  reset(): boolean {
    this.stakeholdersMap = {};
    this.stakeholdersPerRow = [];
    this.userStakeholdersPerRow = [];
    this.selectedExistingStakeholders = [];
    this.newlyCreatedStakeholders = [];
    this.stakeholderRoles = [];
    return true;
  }



  public isDirty(): boolean {
    return (this.selectedExistingStakeholders.length !== 0 || this.newlyCreatedStakeholders.length !== 0)
  }



  fetchStakeholderRoles() {
    let inst = this;
    this.stakeholderService.getStakeholderRoles().subscribe((response: Response<StakeholderRole[]>) => {
      inst.stakeholderRoles = response.data;
      /*console.log(inst.stakeholderRoles)*/
      inst.ready = true;
    });
  }

  getAmountOfSelectedStakeholders() {
    return Object.keys(this.stakeholdersMap).length;
  }

  initialize(parent: ParentComponent): void {
    this.parent = parent;
    this.parent.setChangeAwareChild(this);

    let data = this.parent.getSharedDataContainer();
    if (data === undefined) return;

    let stakeholders = data.getSelectedExistingStakeholders();
    if (stakeholders.length > 0) {
      this.selectedExistingStakeholders = Deepcopy.copy(stakeholders);
    }
    stakeholders = data.getNewlyCreatedStakeholders();
    if (stakeholders.length > 0) {
      this.newlyCreatedStakeholders = Deepcopy.copy(stakeholders);
    }

    this.ready = false;
    this.refreshStakeholders();
    this.ready = true;
  }

  ngOnDestroy(): void {
    //this.save();
  }

  ngOnInit(): void {
  }



  resetIcons(s: LLStakeholder[]): LLStakeholder[] {
    for (let i = 0; i < s.length; i++) {
      s[i].iconUrl = undefined;
    }
    return s;
  }

  removeExistingStakeholder(stakeholder: LLStakeholder) {
    let dyn: DynamicModalDialogComponent = this.angularServicesProviderService.createNewModal();
    let buttons: ModalButton[] = [{ color: 'red', label: 'REMOVE' }, { color: 'grey', label: 'CANCEL' }];
    let config: ModalConfig = { text: 'Are you sure you want to remove the stakeholder with name ' + stakeholder.name + "'?", buttons: buttons };
    let inst = this;
    let obs = (i: number) => {
      if (i === undefined) {
        return;
      }

      switch (i) {
        case 0:
          inst.ready = false;
          delete inst.stakeholdersMap[stakeholder.id];
          for (let i = 0; i < inst.selectedExistingStakeholders.length; i++) {
            if (inst.selectedExistingStakeholders[i].id === stakeholder.id) {
              inst.selectedExistingStakeholders.splice(i, 1);
              /*console.log(inst.selectedExistingStakeholders);*/
              break;
            }
          }
          inst.selectedExistingStakeholders = inst.resetIcons(inst.selectedExistingStakeholders);
          inst.stakeholdersPerRow = <LLStakeholder[][]>this.setupIconResourcesPerRow(<IconResource[]>inst.selectedExistingStakeholders);
          inst.stakeholdersPerRow = <LLStakeholder[][]>this.recalculateImages(<IconResource[][]>this.stakeholdersPerRow);
          inst.angularServicesProviderService.createNewModal().alert(true, "The stakeholder was removed successfully.");
          inst.refreshMainStakeholdersAndContributorsList();
          inst.save();
          inst.ready = true;

          break;
        case 1:
          break;
      }
    };

    dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
      currentDyn.afterClosed(obs);
    });

  }

  removeStakeholderWithNameFromList(name: string, l: LLStakeholder[]): LLStakeholder[] {
    for (let i = 0; i < l.length; i++) {
      if (l[i].name.trim() === name.trim()) {
        l.splice(i, 1);
        return l;
      }
    }
    return l;
  }

  removeUserDefinedStakeholder(stakeholder: Stakeholder) {
    let dyn: DynamicModalDialogComponent = this.angularServicesProviderService.createNewModal();
    let buttons: ModalButton[] = [{ color: 'red', label: 'DELETE' }, { color: 'grey', label: 'CANCEL' }];
    let config: ModalConfig = { text: 'Are you sure you want to delete the stakeholder with name ' + stakeholder.name + "'?", buttons: buttons };
    let inst = this;
    let obs = (i: number) => {
      if (i === undefined) {
        return;
      }

      switch (i) {
        case 0:
          inst.ready = false;
          for (let j = 0; j < inst.newlyCreatedStakeholders.length; j++) {
            if (inst.newlyCreatedStakeholders[j].name === stakeholder.name) {
              inst.newlyCreatedStakeholders.splice(j, 1);
              break;
            }
          }
          inst.newlyCreatedStakeholders = inst.resetIcons(inst.newlyCreatedStakeholders);
          inst.userStakeholdersPerRow = <LLStakeholder[][]>this.setupIconResourcesPerRow(<IconResource[]>inst.newlyCreatedStakeholders);
          inst.userStakeholdersPerRow = <LLStakeholder[][]>this.recalculateImages(<IconResource[][]>this.userStakeholdersPerRow);

          inst.angularServicesProviderService.createNewModal().alert(true, "The stakeholder was deleted successfully.");
          inst.refreshMainStakeholdersAndContributorsList();
          inst.save();
          inst.ready = true;

          break;
        case 1:
          break;
      }
    };

    dyn.performAction(config, (currentDyn: DynamicModalDialogComponent) => {
      currentDyn.afterClosed(obs);
    });
  }


  getStakeholderRoleString(stakeholder: LLStakeholder): string {
    if (stakeholder.role === null || stakeholder.role === undefined) {
      return "";
    }
    return "(" + stakeholder.role.name + ")";
  }

  addNewStakeholder(): void {
    let inst = this;
    inst.ready = true;
    this.angularServicesProviderService.createNewModalWithType(LLAddNewStakeholderModalComponent).afterClosedOnResultWithData(
      { existing: /*inst.newlyCreatedStakeholders*/[...inst.newlyCreatedStakeholders, ...inst.selectedExistingStakeholders], roles: inst.stakeholderRoles, mode: LLComponentMode.ADD }
    )?.subscribe((stakeholder: LLStakeholder) => {
      if (!stakeholder) return;

      if (stakeholder.id === '' || stakeholder.id === '0') {
        inst.newlyCreatedStakeholders.push(stakeholder);
      }
      else {
        inst.selectedExistingStakeholders.push(stakeholder);
      }

      inst.refreshStakeholders();
      inst.save();

      inst.angularServicesProviderService.createNewModal().alert(true, "The stakeholder was added successfully.");
      inst.ready = true;
    });
  }

  getAllStakeholders(): LLStakeholder[] {
    return [...this.newlyCreatedStakeholders, ...this.selectedExistingStakeholders];
  }

  refreshStakeholders() {

    this.newlyCreatedStakeholders = this.resetIcons(this.newlyCreatedStakeholders);
    this.userStakeholdersPerRow = <LLStakeholder[][]>this.setupIconResourcesPerRow(<IconResource[]>this.newlyCreatedStakeholders);
    this.userStakeholdersPerRow = <LLStakeholder[][]>this.recalculateImages(<IconResource[][]>this.userStakeholdersPerRow);


    this.stakeholdersMap = {};
    for (const item of this.selectedExistingStakeholders) {
      this.stakeholdersMap[item.id] = item;
    }

    this.selectedExistingStakeholders = this.resetIcons(this.selectedExistingStakeholders);
    this.stakeholdersPerRow = <LLStakeholder[][]>this.setupIconResourcesPerRow(<IconResource[]>this.selectedExistingStakeholders);
    this.stakeholdersPerRow = <LLStakeholder[][]>this.recalculateImages(<IconResource[][]>this.stakeholdersPerRow);

    this.refreshMainStakeholdersAndContributorsList();
  }


  editUserDefinedStakeholder(stakeholder: LLStakeholder) {
    let inst = this;
    let oldStakeholder = stakeholder;
    inst.ready = true;
    this.newlyCreatedStakeholders = this.removeStakeholderWithNameFromList(stakeholder.name, this.newlyCreatedStakeholders);

    this.angularServicesProviderService.createNewModalWithType(LLAddNewStakeholderModalComponent).afterClosedOnResultWithData(
      { existing: /*inst.newlyCreatedStakeholders*/ this.getAllStakeholders(), current: { ...stakeholder }, roles: inst.stakeholderRoles, mode: LLComponentMode.EDIT })?.subscribe((stakeholder: LLStakeholder) => {
        if (!stakeholder) {
          this.newlyCreatedStakeholders.push(oldStakeholder);
          return;
        }
        if (stakeholder.id === '' || stakeholder.id === '0') {
          inst.newlyCreatedStakeholders.push(stakeholder);
        }
        else {
          inst.selectedExistingStakeholders.push(stakeholder);
        }

        inst.newlyCreatedStakeholders = inst.resetIcons(inst.newlyCreatedStakeholders);
        inst.userStakeholdersPerRow = <LLStakeholder[][]>this.setupIconResourcesPerRow(<IconResource[]>inst.newlyCreatedStakeholders);
        inst.userStakeholdersPerRow = <LLStakeholder[][]>this.recalculateImages(<IconResource[][]>inst.userStakeholdersPerRow);

        inst.angularServicesProviderService.createNewModal().alert(true, "The stakeholder was edited successfully.");
        inst.refreshMainStakeholdersAndContributorsList();
        inst.save();
        inst.ready = true;
      });
  }

  updateStakeholderLists() {

  }

  editExistingStakeholder(stakeholder: LLStakeholder) {
    let inst = this;
    let oldStakeholder = stakeholder;
    inst.ready = true;
    this.selectedExistingStakeholders = this.removeStakeholderWithNameFromList(stakeholder.name, this.selectedExistingStakeholders);

    this.angularServicesProviderService.createNewModalWithType(LLAddNewStakeholderModalComponent).afterClosedOnResultWithData(
      { existing: /*inst.newlyCreatedStakeholders*/this.getAllStakeholders(), current: { ...stakeholder }, roles: inst.stakeholderRoles, mode: LLComponentMode.EDIT })?.subscribe((stakeholder: LLStakeholder) => {
        if (!stakeholder){
          console.log(oldStakeholder)
          this.selectedExistingStakeholders.push(oldStakeholder);
          return;
        }
        console.log(stakeholder);
        //if it wasnt found, maybe it became a newly created one, or switched to
        if (stakeholder.id === '' || stakeholder.id === '0') {
          inst.newlyCreatedStakeholders.push(stakeholder);
          inst.refreshMainStakeholdersAndContributorsList();
          inst.save();
/*          for (let i = 0; i < inst.selectedExistingStakeholders.length; i++) {
            if (inst.selectedExistingStakeholders[i].id === oldStakeholder.id) {
              inst.selectedExistingStakeholders.splice(i, 1);
              inst.refreshMainStakeholdersAndContributorsList();
              inst.save();
              break;
            }
          }*/
        }
        else {
          inst.selectedExistingStakeholders.push(stakeholder);
          inst.refreshMainStakeholdersAndContributorsList();
          inst.save();
          /*
          for (let i = 0; i < inst.selectedExistingStakeholders.length; i++) {
            if (stakeholder.id === inst.selectedExistingStakeholders[i].id) {
              // change the role
              inst.selectedExistingStakeholders[i].role = stakeholder.role;
              inst.selectedExistingStakeholders[i].description = stakeholder.description;
              alert(stakeholder.description)
              inst.selectedExistingStakeholders[i].usesGlobalDescription = stakeholder.usesGlobalDescription;
              inst.refreshMainStakeholdersAndContributorsList();
              inst.save();
              break;
            }
          }*/
        }

        inst.angularServicesProviderService.createNewModal().alert(true, "The stakeholder was edited successfully.");
        inst.ready = true;
      });

  }


  showExistingStakeholders() {

    let dyn: DynamicModalDialogComponent = this.angularServicesProviderService.createNewModalWithType(StakeholderPaginatedTableComponent);
    let inst = this;

    let onSuccess = () => {
      inst.ready = false;
      //    inst.loadData(null);
    };

    let onSelection = (data: LLStakeholder[]) => {
      dyn.close();
      inst.addSelectionFromExistingStakeholders(data);
    }

    let getData = () => {
      return {
        initialData: inst.selectedExistingStakeholders,
        roles: inst.stakeholderRoles,
        parentCB: onSelection,
        onEditErrorCallback: () => { }, onEditSuccessCallback: onSuccess
      }
    };

    dyn.showModal(getData, () => { }, () => {
      dyn.close();
      inst.ready = true;
    });


  }

  addSelectionFromExistingStakeholders(data: LLStakeholder[]) {
    this.ready = true;
    let inst = this;
    this.selectedExistingStakeholders = data;

    for (const item of data) {
      this.stakeholdersMap[item.id] = item;
    }
    this.stakeholdersPerRow = <LLStakeholder[][]>this.setupIconResourcesPerRow(<IconResource[]>data);
    this.stakeholdersPerRow = <LLStakeholder[][]>this.recalculateImages(<IconResource[][]>this.stakeholdersPerRow);
    inst.angularServicesProviderService.createNewModal().alert(true, "The stakeholder was added successfully.");
    this.ready = true;
  }

  refreshMainStakeholdersAndContributorsList(): void {
    this.mainStakeholders = [...this.newlyCreatedStakeholders, ...this.selectedExistingStakeholders]
      .filter((s: LLStakeholder) => s.role?.id === 1);
    this.contributors = [...this.newlyCreatedStakeholders, ...this.selectedExistingStakeholders]
      .filter((s: LLStakeholder) => s.role?.id === 2);
    // this.save();
  }
}
