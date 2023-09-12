import { Component, OnDestroy } from "@angular/core";
import { DigitalTechnologyManagementComponent } from "src/app/digital-technology-management/digital-technology-management.component";
import { DirtyView } from "src/app/Models/DirtyView";
import { AngularServicesProviderService } from "src/app/Service/angular-services-provider.service";
import { AssetsService } from "src/app/Service/assets.service";
import { DigitalTechnologyService } from "src/app/Service/digital-technology.service";
import { Deepcopy } from "src/app/Utils/deepcopy";
import { ParentComponent } from "../../Admin/LivingLabEntityManagement/parent-component";

@Component({
    selector: 'll-dts',
    templateUrl: './ll-dts.component.html',
    styleUrls:['../ll-creation.component.css'],
})

export class LLDigitalTechnologiesComponent extends DigitalTechnologyManagementComponent implements OnDestroy, DirtyView {
    data: any;
    parent: ParentComponent | null = null;
    renderInCard: boolean = false;
    title = "Digital Technologies";
    selectedEntityIds: { [key: string]: boolean } = {};

    static numIconsPerRow = 3;
    constructor(public digitalTechnologyService: DigitalTechnologyService,
        protected assetsService: AssetsService,
        protected angularServicesProviderService: AngularServicesProviderService) {

        super(digitalTechnologyService, assetsService, angularServicesProviderService);
    }
    reset(): boolean {
        this.selectedEntityIds = {};
        this.ready = false;
        return true;
    }

    isEmpty():void{
          console.log(this.isDirty());
    }
    save():boolean{
        //console.log("ll dts save")
        this.parent?.storeValue("selectedDTs", this.selectedEntityIds);
        return true;
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

    hasValue():boolean{
         let keys = Object.keys(this.selectedEntityIds);
         for(let i = 0;i<keys.length;i++){
            let v = this.selectedEntityIds[keys[i]];
            if(v === true) return true;
         }
         return false;
    }

    ngOnDestroy(): void {
        //this.save();
    }

    initialize(parent: ParentComponent): void {
        this.parent = parent;
        this.parent.setChangeAwareChild(this);

        let data = this.parent.getSharedDataContainer();
        if (data === undefined) return;
        this.ready = false;

        let dts = data.getSelectedDTs();
        if (Object.keys ( dts ).length > 0 ) {
            this.selectedEntityIds = Deepcopy.copy(dts);
        }
        this.ready = true;
    }

    selectEntity(id: string) {
        if (this.selectedEntityIds[id] === undefined) {
            this.selectedEntityIds[id] = true;
        }
        else {
            this.selectedEntityIds[id] = !this.selectedEntityIds[id];
        }
        this.save();
        //console.log(this.selectedEntityIds)
    }
}
