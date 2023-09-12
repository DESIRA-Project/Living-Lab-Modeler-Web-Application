import { Component, OnDestroy } from "@angular/core";
import { DynamicContent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content.component";
import { DynamicItem } from "src/app/ComponentLibrary/DynamicModal/dynamic-item.components";
import { DynamicModalContainer } from "src/app/ComponentLibrary/DynamicModal/dynamic-modal-container";
import { DirtyView } from "src/app/Models/DirtyView";
import { SdgManagementComponent } from "src/app/sdg-management/sdg-management.component";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { AssetsService } from "src/app/Service/assets.service";
import { SdgService } from "src/app/Service/sdg.service";
import { Deepcopy } from "src/app/Utils/deepcopy";
import { ParentComponent } from "../../Admin/LivingLabEntityManagement/parent-component";
import { SDGImpactModalComponent, SDGImpactModalData, SDGImpactNode } from "./sdg-impact-modal/sdg-impact-modal.component";


@Component({
    selector: 'll-sdgs',
    templateUrl: './ll-sdgs.component.html',
    styleUrls: ['../ll-creation.component.css'],
})

export class LLSDGsComponent extends SdgManagementComponent implements OnDestroy, DirtyView {
    data: any;
    parent: ParentComponent | null = null;
    renderInCard: boolean = false;
    title = "SDGs*";
    selectedEntityIds: { [key: string]: boolean } = {};
    selectedImpactEntityIds: { [key: string]: SDGImpactNode } = {};

    static numIconsPerRow = 3;
    constructor(public sdgService: SdgService,
        public assetsService: AssetsService,
        protected angularServicesProviderService: AngularServicesProviderService) {

        super(sdgService, assetsService, angularServicesProviderService);
    }

    initializeSDGImpactNode(): SDGImpactNode {
        return {
            currentlyPositive: null,
            impactDescription: '',
            futureImpactDescription: '',
            futurePositive: null
        } as SDGImpactNode;
    }

    filterSDGWithImpactContent(spec: { [key: string]: boolean }, all: { [key: string]: SDGImpactNode }): { [key: string]: SDGImpactNode } {
        let subset: { [key: string]: SDGImpactNode } = {};
        let keys = Object.keys(spec);
        //console.log(all);

        for (let i = 0; i < keys.length; i++) {
            let v = spec[keys[i]];
            if (v === undefined || v === false) continue;
            subset[keys[i]] = all[keys[i]];
        }
        //console.log(subset);
        return subset;
    }

    save(): boolean {
        this.parent?.storeValue("selectedSDGs", this.selectedEntityIds);
        this.parent?.storeValue("selectedSDGImpact", this.filterSDGWithImpactContent(this.selectedEntityIds, this.selectedImpactEntityIds));

        return true;
    }

    openSDGImpactModal(id: string) {
        let inst = this;
        let dyn = this.angularServicesProviderService.createNewModalWithTypeAndWidth(SDGImpactModalComponent, "80%");

        if (this.selectedImpactEntityIds[id] === undefined) {
            this.selectedImpactEntityIds[id] = this.initializeSDGImpactNode();
        }

        let getData = () => {
            return { handle: dyn, id: id, node: Deepcopy.copy(  this.selectedImpactEntityIds[id] ) } as SDGImpactModalData
        };

        dyn.getObservableFromConfirmableOperationWithCustomStyle(getData, () => { }, 'customModal').subscribe((node: SDGImpactNode) => {
            if (node) {
                inst.selectedImpactEntityIds[id] = node;
                inst.save();
            }
        });
    }

    reset(): boolean {
        this.data = {};
        this.selectedEntityIds = {};
        return true;
    }
    ngOnDestroy(): void {
        // this.save();
    }

    public isDirty(): boolean {
        let keys = Object.keys(this.selectedEntityIds);
        for (let i = 0; i < keys.length; i++) {
            if (this.selectedEntityIds[keys[i]] === true) {
                return true;
            }
        }
        return false;
    }

    hasValue(): boolean {
        let keys = Object.keys(this.selectedEntityIds);
        for (let i = 0; i < keys.length; i++) {
            let v = this.selectedEntityIds[keys[i]];
            if (v === true) return true;
        }
        return false;
    }

    initialize(parent: ParentComponent): void {
        this.parent = parent;
        this.parent.setChangeAwareChild(this);

        let data = this.parent.getSharedDataContainer();
        if (data === undefined) return;
        this.ready = false;

        let sdgs = data.getSelectedSDGs();
        if (Object.keys(sdgs).length > 0) {
            this.selectedEntityIds = Deepcopy.copy(sdgs);
        }
        let imp = data.getSelectedSDGImpactNode();
        if(Object.keys(imp).length > 0){
            this.selectedImpactEntityIds = Deepcopy.copy(imp);        
        }
        this.ready = true;
    }

    selectEntity(id: string) {
        let shouldOpenModalForImpactInfoProvision = false;
        if (this.selectedEntityIds[id] === undefined) {
            this.selectedEntityIds[id] = true;
            //open for the first time
            if (this.selectedImpactEntityIds[id] === undefined)
                shouldOpenModalForImpactInfoProvision = true;
        }
        else {
            this.selectedEntityIds[id] = !this.selectedEntityIds[id];
        }
        if (shouldOpenModalForImpactInfoProvision) {
            this.openSDGImpactModal(id);
        }
        this.save();
    }
}
