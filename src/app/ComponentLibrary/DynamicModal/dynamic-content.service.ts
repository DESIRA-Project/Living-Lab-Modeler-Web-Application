import { ComponentFactoryResolver, Injectable } from '@angular/core';
import { BackendService } from '../../backend.service';
import { CancellableOperationComponent } from './cancellable-operation.component';
import { DynamicItem } from './dynamic-item.components';
import { UserManagementService } from 'src/app/User/user-management.service';
import { DynamicContentItem } from './dynamic-content-item.component';
import { EmptyAuthUserFormComponent } from 'src/app/Home/empty-auth-user-form.component';
import { UserEditProfileComponent } from 'src/app/User/user-edit-profile.component';
import { UsersManagementComponent } from 'src/app/User/Admin/users-management.component';
import { UserHomePageComponent } from 'src/app/User/user-home-page.component';
import { LivingLabEntityManagementComponent } from 'src/app/User/Admin/LivingLabEntityManagement/ll-entity-management.component';
import {
  DigitalTechnologyManagementComponent
} from "../../digital-technology-management/digital-technology-management.component";
import {SdgManagementComponent} from "../../sdg-management/sdg-management.component";
import {StakeholderManagementComponent} from "../../stakeholder-management/stakeholder-management.component";
import { LLCreationComponent } from 'src/app/User/LLCreation/ll-creation.component';
import { LLGeneralInformationComponent } from 'src/app/User/LLCreation/LLGeneralInformation/ll-general-info.component';
import {MyLivingLabsComponent} from "../../my-living-labs/my-living-labs.component";
import {LlUpdateComponent} from "../../User/ll-update/ll-update.component";
import {PublicLivingLabsComponent} from "../../public-living-labs/public-living-labs.component";
import { AllLivingLabsComponent } from 'src/app/all-living-labs/all-living-labs.component';
import { LivingLabManagementComponent } from 'src/app/living-lab-management/living-lab-management.component';

@Injectable()
export class DynamicContentService {
  constructor(private service: BackendService, private userManagementService:UserManagementService) {

  }



  public getUserManagementService():UserManagementService{
    return this.userManagementService;
  }

  getUserEditProfileFormComponent():DynamicItem{
    let inst = new DynamicItem(UserEditProfileComponent, this.service);
    let cancellable = this.getCancellableOperationComponent();
    inst.setDependencies([cancellable]);
    return inst;
  }

  getCancellableOperationComponent(): DynamicItem {
    return new DynamicItem(
      CancellableOperationComponent, this.service
    );
  }

/*  getModalComponent():DynamicItem {
    return new DynamicItem(DynamicModalDialogComponent, this.service);
  }
*/
  getUserAuthorizedComponent(componentName:string):DynamicItem | null {
    switch (componentName) {
      case "userHomePage":{
        return new DynamicContentItem(UserHomePageComponent, this.service, this.userManagementService);
      }
      case "livingLabEntityManagement":{
        let inst = new DynamicContentItem(LivingLabEntityManagementComponent, this.service, this.userManagementService);
        inst.setDependencies([this.getCancellableOperationComponent()]);
        return inst;
      }
      case "editUserProfile": {
        let inst = new DynamicContentItem(UserEditProfileComponent, this.service, this.userManagementService);
        inst.setDependencies([this.getCancellableOperationComponent()]);
        return inst;
      }
      case "usersManagement": {
        let inst =  new DynamicContentItem(UsersManagementComponent, this.service, this.userManagementService);
        inst.setDependencies([this.getCancellableOperationComponent(),this.getUserEditProfileFormComponent()]);
        return inst;
      }
      case "digitalTechnologyManagement": {
        let inst = new DynamicContentItem(DigitalTechnologyManagementComponent, this.service, this.userManagementService);
        //inst.setDependencies([this.getModalComponent() ]);
        return inst;
      }
      case "sdgManagement": {
        return new DynamicContentItem(SdgManagementComponent, this.service, this.userManagementService);
      }
      case "stakeholderManagement": {
        return new DynamicContentItem(StakeholderManagementComponent, this.service, this.userManagementService);
      }
      case "livingLabCreation":{
        return new DynamicContentItem(LLCreationComponent, this.service, this.userManagementService);
      }
      case "livingLabUpdate":{
        return new DynamicContentItem(LlUpdateComponent, this.service, this.userManagementService);
      }
      case "userLivingLabManagement":{
        return new DynamicContentItem(MyLivingLabsComponent, this.service, this.userManagementService);
      }
/*      case "publicLivingLabs":{
        return new DynamicContentItem(PublicLivingLabsComponent, this.service, this.userManagementService);
      }*/
      case "allLivingLabs":{
        return new DynamicContentItem(AllLivingLabsComponent, this.service, this.userManagementService);
      }
      case "livingLabManagement":{
        return new DynamicContentItem(LivingLabManagementComponent, this.service, this.userManagementService);
      }

      default:{
        let inst = new DynamicContentItem(
          EmptyAuthUserFormComponent, this.service, this.userManagementService
        );
        inst.setDependencies([this.getCancellableOperationComponent()]);
        return inst;
      }
    }
    return null;
  }
/*
  getToolSuggestionFormComponent(): DynamicItem {
    return new DynamicItem(
      ToolSuggestionFormComponent, this.service
    );
  }

  getDigitalToolFormComponent(): DynamicItem{
    let inst = new DynamicItem(
      DigitalToolFormComponent, this.service
    );

    let cancellable = this.getCancellableOperationComponent();
    inst.setDependencies([cancellable]);
    return inst;
  }

  getAdminToolSuggestionModerationFormComponent(): DynamicItem {
    return new DynamicItem(
      AdminToolSuggestionModerationFormComponent, this.service
    );
  }

  getUserEditProfileFormComponent():DynamicItem{
    let inst = new DynamicItem(UserEditProfileComponent, this.service);
    let cancellable = this.getCancellableOperationComponent();
    inst.setDependencies([cancellable]);
    return inst;
  }


  getUserAuthorizedComponent(componentName: string): DynamicItem | null {

    switch (componentName) {
      case "toolSuggestion": {
        let inst = new DynamicContentItem(
          ToolSuggestionFormComponent, this.service, this.userManagementService
        );
        inst.setDependencies([this.getCancellableOperationComponent()]);
        return inst;

      }
      case "showUserToolSuggestions": {
        let inst = new DynamicContentItem(
          UserToolSuggestionsComponent, this.service, this.userManagementService
        );

        let cancellable = this.getCancellableOperationComponent();
        let form = this.getToolSuggestionFormComponent();
        form.setDependencies([cancellable]);

        inst.setDependencies([this.getCancellableOperationComponent(), form]);
        return inst;
      }
      case "editUserProfile": {
        let inst = new DynamicContentItem(UserEditProfileComponent, this.service, this.userManagementService);
        inst.setDependencies([this.getCancellableOperationComponent()]);
        return inst;
      }
      case "usersManagement": {
        let inst =  new DynamicContentItem(UsersManagementComponent, this.service, this.userManagementService);
        inst.setDependencies([this.getCancellableOperationComponent(),this.getUserEditProfileFormComponent()]);
        return inst;
      }
      case "viewAllSuggestedTools": {
        let inst = new DynamicContentItem(
          AdminToolSuggestionsComponent, this.service, this.userManagementService
        );
        inst.setDependencies([this.getCancellableOperationComponent(), this.getAdminToolSuggestionModerationFormComponent()]);

        let form = this.getAdminToolSuggestionModerationFormComponent();
        let cancellable = this.getCancellableOperationComponent();
        form.setDependencies([cancellable]);

        inst.setDependencies([this.getCancellableOperationComponent(), form]);

        return inst;
      }
      case "userHomePage":{
        return new DynamicContentItem(UserHomePageComponent, this.service, this.userManagementService);
      }
      case "dtManagement":{
        let inst = new DynamicContentItem(DigitalToolManagementComponent, this.service, this.userManagementService);
        inst.setDependencies([this.getCancellableOperationComponent(), this.getDigitalToolFormComponent()]);
        return inst;
      }

      default: return null;
    }
    return null;
  }

*/
}
