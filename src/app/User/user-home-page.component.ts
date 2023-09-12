import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { BackendService } from "src/app/backend.service";
import { DynamicContent } from "src/app/ComponentLibrary/DynamicModal/dynamic-content.component";
import { DynamicItem } from "src/app/ComponentLibrary/DynamicModal/dynamic-item.components";
import { DynamicModalContainer } from "src/app/ComponentLibrary/DynamicModal/dynamic-modal-container";
import { AlertSupportingComponent } from "./alert-supporting-component";
import { UserManagementService } from "./user-management.service";
import { Location } from '@angular/common';
import { DynamicContentParent } from "../ComponentLibrary/DynamicModal/dynamic-content-parent";
import { BootstrapBreakpoints } from "../BootstrapBreakpoints";

@Component({
    selector: 'user-home-page',
    templateUrl: './user-home-page.component.html',
    styleUrls:["../style/user-home-page.css"]
})

export class UserHomePageComponent extends AlertSupportingComponent implements DynamicContent{
    data: any;
    title="Home";
    renderInCard = false;
    ready = false;
    parent:DynamicContentParent | undefined;

    constructor(protected service:BackendService,protected userManagementService:UserManagementService,private router: Router){
        super();
        this.ready = true;
    }
    setParent(parent: DynamicContentParent | undefined){
        //console.log("set parent called user home page "+parent)
        this.parent = parent;
    }

    initialize(parent: DynamicModalContainer): void {
        this.renderInCard = true;

    }
    getUserToken(): string | null {
        return this.userManagementService.getToken();
    }

    initializeWithAuthData(userToken: string): void {
        this.renderInCard = window.innerWidth > BootstrapBreakpoints.sm;
    }

    setDependencies(dependencies: DynamicItem[]): void {

    }

    userCanAccessPage(){
        return this.userManagementService === null ? false : this.userManagementService.userHasPermission("create_living_lab");
    }

    singleTransition(){
        this.router.navigate(['/living-lab-creation']);
    }

    organizeLivingLab(){
        this.parent?.goToPage('/living-lab-creation');
    }
}
