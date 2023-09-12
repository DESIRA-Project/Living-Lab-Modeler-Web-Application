import {ActivatedRouteStub} from "./activated-route-stub";
import {MatButtonModule} from "@angular/material/button";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MatTabsModule} from "@angular/material/tabs";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatRippleModule} from "@angular/material/core";
import {MatMenuModule} from "@angular/material/menu";
import {AngularEditorModule} from "@kolkov/angular-editor";
import {NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {DynamicContentSectionComponent} from "../app/ComponentLibrary/DynamicModal/dynamic-content-section.component";
import {DynamicContentDirective} from "../app/ComponentLibrary/DynamicModal/dynamic-content.directive";
import {LLGeneralInformationComponent} from "../app/User/LLCreation/LLGeneralInformation/ll-general-info.component";
import {LLLocationComponent} from "../app/User/LLCreation/LLLocation/ll-location.component";
import {LLDigitalTechnologiesComponent} from "../app/User/LLCreation/LLDts/ll-dts.component";
import {LLSDGsComponent} from "../app/User/LLCreation/LLSDGs/ll-sdgs.component";
import {LLDomainsComponent} from "../app/User/LLCreation/LLDomain/ll-domains.component";
import {LLStakeholdersComponent} from "../app/User/LLCreation/LLStakeholders/ll-stakeholders.component";
import {LLSCPEntitiesComponent} from "../app/User/LLCreation/LLSCPEntities/ll-scp-entities.component";
import {LLActivitiesComponent} from "../app/User/LLCreation/LLActivities/ll-activities.component";
import {NavbarComponent} from "../app/Navbar/navbar.component";
import {BreadcrumbComponent} from "../app/Breadcrumb/breadcrumb.component";
import {BackendService} from "../app/backend.service";
import {UserManagementService} from "../app/User/user-management.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AngularServicesProviderService} from "../app/Service/angular-services-provider.service";
import {LivingLabService} from "../app/Service/living-lab.service";
import {AssetsService} from "../app/Service/assets.service";
import {ScreenshotService} from "../app/Service/screenshot.service";
import {ActivityService} from "../app/Service/activity.service";
import {MessageService} from "../app/Service/message.service";
import {SdgService} from "../app/Service/sdg.service";
import {DigitalTechnologyService} from "../app/Service/digital-technology.service";
import {DomSanitizer} from "@angular/platform-browser";
import {LLUserMembershipService} from "../app/Service/ll-user-membership.service";



export class LlCreateUpdateCommons {
  activatedRouteStub = new ActivatedRouteStub;
  screenshotServiceSpy = jasmine.createSpyObj('ScreenshotService', ['clearAll', 'add', 'isServiceDisabled']);
  livingLabServiceSpy = jasmine.createSpyObj('LivingLabService', ['get']);
  assetsServiceSpy = jasmine.createSpyObj('AssetsService', ['getAssetLink']);
  userManagementServiceSpy = jasmine.createSpyObj('UserManagementService', ['getToken','getUserInfo']);
  messageServiceSpy = jasmine.createSpyObj('MessageService', ['push', 'pop', 'clear']);
  sdgServiceSpy = jasmine.createSpyObj('SdgService', ['getAll']);
  digitalTechnologyServiceSpy = jasmine.createSpyObj('DigitalTechnologyService', ['getAll']);
  llUserMemberServiceSpy = jasmine.createSpyObj('LLUserMembershipService', ['checkUserLivingLabMembership','canModifyLivingLab']);
  sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);
  angularServicesProviderServiceSpy = jasmine.createSpyObj('AngularServicesProviderService',['createNewModalWithTypeAndWidth'])

  imports = [
    MatButtonModule,
    HttpClientTestingModule, MatTabsModule, BrowserAnimationsModule,
    MatSlideToggleModule, FormsModule, MatTooltipModule, MatFormFieldModule,
    MatAutocompleteModule, MatInputModule,  MatCardModule, MatProgressSpinnerModule, MatRippleModule,
    MatMenuModule, AngularEditorModule, NgbTooltipModule,
  ];

  declarations = [
    DynamicContentSectionComponent, DynamicContentDirective,
    LLGeneralInformationComponent, LLLocationComponent,
    LLDigitalTechnologiesComponent, LLSDGsComponent, LLDomainsComponent,
    LLStakeholdersComponent, LLSCPEntitiesComponent, LLActivitiesComponent,
    NavbarComponent, BreadcrumbComponent
  ];

  providers = [
    {provide: BackendService, useValue: {}},
    {provide: UserManagementService, useValue: this.userManagementServiceSpy},
    {provide: ActivatedRoute, useValue: this.activatedRouteStub},
    {provide: AngularServicesProviderService, useValue: this.angularServicesProviderServiceSpy},
    {provide: LivingLabService, useValue: this.livingLabServiceSpy},
    {provide: AssetsService, useValue: this.assetsServiceSpy},
    {provide: Router, useValue: {}},
    {provide: ScreenshotService, useValue: this.screenshotServiceSpy},
    {provide: ActivityService, useValue: {}},
    {provide: MessageService, useValue: this.messageServiceSpy},
    {provide: SdgService, useValue: this.sdgServiceSpy},
    {provide: DigitalTechnologyService, useValue: this.digitalTechnologyServiceSpy},
    {provide: DomSanitizer, useValue: this.sanitizerSpy},
    {provide: LLUserMembershipService, useValue: this.llUserMemberServiceSpy},
  ];
}
