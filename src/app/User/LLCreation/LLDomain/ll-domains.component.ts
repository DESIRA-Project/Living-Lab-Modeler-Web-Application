import { Component, OnDestroy } from "@angular/core";
import { DynamicView } from "src/app/ComponentLibrary/dynamic-view";
import { DynamicContent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content.component";
import { DynamicItem } from "src/app/ComponentLibrary/DynamicModal/dynamic-item.components";
import { DynamicModalContainer } from "src/app/ComponentLibrary/DynamicModal/dynamic-modal-container";
import { DomainService } from "src/app/Service/domain.service";
import { ParentComponent } from "../../Admin/LivingLabEntityManagement/parent-component";

@Component({
    selector: 'll-domains',
    templateUrl: './ll-domains.component.html',
    styleUrls:['../ll-creation.component.css'],
})

export class LLDomainsComponent implements DynamicView, OnDestroy {
    data: any;
    title: string = "Living Lab Domains";
    parent: ParentComponent | null = null;
    renderInCard = false;
    ready = false;

    datum:any;

    constructor(private domainService:DomainService) {
       this.ready = true;
    }
    ngOnDestroy(): void {

    }

    initialize(parent: ParentComponent): void {

        this.parent = parent;
        this.domainService.getDomains().subscribe((data:any)=>{
            this.data = data;
            //console.log(data)
            this.ready = true;
        });
    }
}
