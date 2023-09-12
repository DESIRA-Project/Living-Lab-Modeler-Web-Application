import { Component } from "@angular/core";
import { DynamicContentParent } from "../ComponentLibrary/DynamicModal/dynamic-content-parent";
import { DynamicContent } from "../ComponentLibrary/DynamicModal/dynamic-content.component";
import { DynamicItem } from "../ComponentLibrary/DynamicModal/dynamic-item.components";
import { DynamicModalContainer } from "../ComponentLibrary/DynamicModal/dynamic-modal-container";
import { AlertSupportingComponent } from "../User/alert-supporting-component";

@Component({
    selector: 'empty-auth-user-form',
    templateUrl: './empty-auth-user-form.component.html'
})

export class EmptyAuthUserFormComponent extends AlertSupportingComponent implements DynamicContent{
    data: any;
    initialize(parent: DynamicModalContainer): void {
    }
    getUserToken(): string | null {
        return null;
    }
    initializeWithAuthData(userToken: string): void {
    }
    setDependencies(dependencies: DynamicItem[]): void {
    }

    setParent(parent: DynamicContentParent | undefined){

    }

}