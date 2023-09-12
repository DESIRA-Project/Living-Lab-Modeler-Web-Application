import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {  UrlSerializer } from '@angular/router'; // CLI imports router
import {APP_BASE_HREF, CommonModule, DatePipe} from '@angular/common';
import { DynamicTooltip } from './ComponentLibrary/DynamicTooltip/dynamic-tooltip.component';
import { DynamicContentService } from './ComponentLibrary/DynamicModal/dynamic-content.service';
import CustomUrlSerializer from './CustomUrlSerializer';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { UserManagementService } from './User/user-management.service';
import { SignInComponent } from './Auth/signin.component';
import { NgbModule, NgbTooltip, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { PageNotFoundComponent } from './PageNotFound/page-not-found.component';
import { UserLandingPageComponent } from './User/user-landing-page.component';
import { UserFunctionContentComponent } from './ComponentLibrary/DynamicSidebar/user-function-content.component';
import { UserFunctionListComponent } from './ComponentLibrary/DynamicSidebar/user-function-list.component';
import { DynamicContentSectionComponent } from './ComponentLibrary/DynamicModal/dynamic-content-section.component';
import { BreadcrumbComponent } from './Breadcrumb/breadcrumb.component';
import { EmptyAuthUserFormComponent } from './Home/empty-auth-user-form.component';
import { DynamicContentDirective } from './ComponentLibrary/DynamicModal/dynamic-content.directive';
import { NavbarComponent } from './Navbar/navbar.component';
import { UserMenuDropdownComponent } from './ComponentLibrary/user-menu-dropdown.component';
import { DynamicModalComponent } from './ComponentLibrary/DynamicModal/dynamic-modal.component';
import { FooterComponent } from './Footer/footer.component';
import { CookieBanner } from './CookieBanner/cookie-banner.component';
import { UserEditProfileComponent } from './User/user-edit-profile.component';
import { SearchableDropDownComponent } from './ComponentLibrary/dropdown-with-search.component';
import { ListValueAttributeComponent } from './ComponentLibrary/list-value-attribute.component';
import { EditableSingleValueAttributeComponent } from './ComponentLibrary/editable-single-value-attribute.component';
import { SingleSelectionListComponent } from './ComponentLibrary/single-selection-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectableDropDownComponent } from './ComponentLibrary/selectable-drop-down.component';
import { OptionsList } from './ComponentLibrary/options-list.component';
import { CancellableOperationComponent } from './ComponentLibrary/DynamicModal/cancellable-operation.component';
import { UsersManagementComponent } from './User/Admin/users-management.component';
import { UserHomePageComponent } from './User/user-home-page.component';
import { LivingLabEntityManagementComponent } from './User/Admin/LivingLabEntityManagement/ll-entity-management.component';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatSelectModule} from '@angular/material/select';
import { SCPGroupsService } from './Service/SCPgroups.service';
import { SCPEntitiesService } from './Service/SCPentities.service';
import { LivingLabEntitySearchComponent } from './User/Admin/LivingLabEntityManagement/ll-entity-search.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import { LivingLabEntityTableComponent } from './User/Admin/LivingLabEntityManagement/ll-entity-table.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { DigitalTechnologyManagementComponent } from './digital-technology-management/digital-technology-management.component';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import { DigitalTechnologyEditComponent } from './digital-technology-management/digital-technology-edit/digital-technology-edit.component';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialog,
  MatDialogModule,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";
import {Overlay} from "@angular/cdk/overlay";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { AngularServicesProviderService } from './Service/angular-services-provider.service';
import { LivingLabEntityBulkOperationsComponent } from './User/Admin/LivingLabEntityManagement/ll-entity-bulk-operations.component';
import { SCPEntityEditComponent } from './User/Admin/LivingLabEntityManagement/scp-entity-edit.component';
import {AuthInterceptor} from './Auth/auth.interceptor';
import { SdgManagementComponent } from './sdg-management/sdg-management.component';
import { SdgEditComponent } from './sdg-management/sdg-edit/sdg-edit.component';
import { StakeholderManagementComponent } from './stakeholder-management/stakeholder-management.component';
import {MatSortModule} from "@angular/material/sort";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatPaginatorModule} from "@angular/material/paginator";
import { StakeholderDetailsComponent } from './stakeholder-management/stakeholder-details/stakeholder-details.component';
import { AddNewStakeholderComponent } from './stakeholder-management/add-new-stakeholder/add-new-stakeholder.component';
import {MatRadioModule} from "@angular/material/radio";
import { DigitalTechnologyService } from './Service/digital-technology.service';
import { LivingLabViewPageComponent } from './living-lab-view-page/living-lab-view-page.component';
import {MatTabsModule} from "@angular/material/tabs";
import { LivingLabViewPageAboutComponent } from './living-lab-view-page/tabs/living-lab-view-page-about/living-lab-view-page-about.component';
import { LivingLabViewPageStakeholdersComponent } from './living-lab-view-page/tabs/living-lab-view-page-stakeholders/living-lab-view-page-stakeholders.component';
import { LivingLabViewPageScpSystemComponent } from './living-lab-view-page/tabs/living-lab-view-page-scp-system/living-lab-view-page-scp-system.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { SnackBarComponent } from './ComponentLibrary/snack-bar/snack-bar.component';
import { LLCreationComponent } from './User/LLCreation/ll-creation.component';
import { LLGeneralInformationComponent } from './User/LLCreation/LLGeneralInformation/ll-general-info.component';
import { LLDigitalTechnologiesComponent } from './User/LLCreation/LLDts/ll-dts.component';
import { LLSDGsComponent } from './User/LLCreation/LLSDGs/ll-sdgs.component';
import { LLDomainsComponent } from './User/LLCreation/LLDomain/ll-domains.component';
import { MatTree, MatTreeModule } from '@angular/material/tree';
import { LLTaxTreeComponent } from './User/LLCreation/LLDomain/ll-taxtree.component';
import { DomainService } from './Service/domain.service';
import { LLStakeholdersComponent } from './User/LLCreation/LLStakeholders/ll-stakeholders.component';
import { LLLocationComponent } from './User/LLCreation/LLLocation/ll-location.component';
import { LocationService } from './Service/location.service';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { StakeholderPaginatedTableComponent } from './User/LLCreation/LLStakeholders/stakeholder-paginated-table.component';
import { LLAddNewStakeholderComponent } from './User/LLCreation/LLStakeholders/ll-add-new-stakeholder.component';
import {MatStepperModule} from '@angular/material/stepper';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { LLAddNewStakeholderTypeUnawareComponent } from './User/LLCreation/LLStakeholders/ll-add-new-stakeholder-with-selectable-type.component';
import { LLSCPEntitiesComponent } from './User/LLCreation/LLSCPEntities/ll-scp-entities.component';
import { LLSCPEntityEditComponent } from './User/LLCreation/LLSCPEntities/ll-scp-entity-edit.component';
import { LLSCPGraphComponent } from './User/LLCreation/LLSCPEntities/ll-scp-graph.component';
import { LLNewSCPEntityConnectionComponent } from './User/LLCreation/LLSCPEntities/ll-new-connection.component';
import { LivingLabViewPageActivitiesComponent } from './living-lab-view-page/tabs/living-lab-view-page-activities/living-lab-view-page-activities.component';
import { ActivityViewPageComponent } from './activity-view-page/activity-view-page.component';
import { AddNewActivityComponent } from './add-new-activity/add-new-activity.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule, MatRippleModule} from "@angular/material/core";
import { MyLivingLabsComponent } from './my-living-labs/my-living-labs.component';
import { LivingLabSummaryCardComponent } from './living-lab-summary-card/living-lab-summary-card.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ActivityEditComponent } from './activity-edit/activity-edit.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { LLMembersComponent } from './User/LLCreation/LLMembers/ll-members.component';
import { LLActivitiesComponent } from './User/LLCreation/LLActivities/ll-activities.component';
import { LlUpdateComponent } from './User/ll-update/ll-update.component';
import { ScreenshotService } from './Service/screenshot.service';
import { PublicLivingLabsComponent } from './public-living-labs/public-living-labs.component';
import {MatMenuModule} from "@angular/material/menu";
import { LandingPublishedLivingLabSummaryCardComponent } from './landing-published-living-lab-summary-card/landing-published-living-lab-summary-card.component';
import { AllLivingLabsComponent } from './all-living-labs/all-living-labs.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AboutComponent } from './about/about.component';
import { ToUComponent } from './tou/tou.component';
import { ContactComponent } from './contact/contact.component';
import { LlJoinRequestsComponent } from './User/LLCreation/LLJoinRequests/ll-join-requests.component';
import { LlUsersManagementComponent } from './User/LLCreation/LLUsersManagement/ll-users-management.component';
import { LlJoinRequestFormComponent } from './living-lab-summary-card/ll-join-request-form/ll-join-request-form.component';
import { LlJoinRequestDispatcherService } from './Service/ll-join-request-dispatcher.service';
import { LlJoinRequestAccompanyingTextPopupComponent } from './User/LLCreation/LLJoinRequests/ll-join-request-accompanying-text-popup/ll-join-request-accompanying-text-popup.component';
import { ReCaptchaService } from './ReCaptchaService/recaptcha.service';
import { LivingLabViewPageOutcomesComponent } from './living-lab-view-page/tabs/living-lab-view-page-outcomes/living-lab-view-page-outcomes.component';
import { LLSCPEntityModalComponent } from './User/LLCreation/LLSCPEntities/ll-scp-entity-modal.component';
import { LLAddNewStakeholderModalComponent } from './User/LLCreation/LLStakeholders/ll-add-new-stakeholder-modal.component';
import { LLOutcomesComponent } from './User/LLCreation/LLOutcomes/ll-outcomes.component';
import { AddNewOutcomeComponent } from './User/LLCreation/LLOutcomes/add-new-outcome/add-new-outcome.component';
import { LLUserMembershipService } from './Service/ll-user-membership.service';
import { LLEditConnectionComponent } from './User/LLCreation/LLSCPEntities/ll-edit-connection.component';
import { DigitalTechnologyAddComponent } from './digital-technology-management/digital-technology-add/digital-technology-add.component';
import { SDGImpactModalComponent } from './User/LLCreation/LLSDGs/sdg-impact-modal/sdg-impact-modal.component';
import { LivingLabViewPageSocioEconomicImpactComponent } from './living-lab-view-page/tabs/living-lab-view-page-socio-economic-impact/living-lab-view-page-socio-economic-impact.component';
import { LivingLabManagementComponent } from './living-lab-management/living-lab-management.component';
import { ManagedLivingLabSummaryCardComponent } from './living-lab-management/managed-living-lab-summary-card/managed-living-lab-summary-card.component';
import { DeactivatedLivingLabSummaryCardComponent } from './my-living-labs/deactivated-living-lab-summary-card/deactivated-living-lab-summary-card.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import { AngularEditorModule } from '@kolkov/angular-editor';
import { RouterExtService } from './Service/router-ext.service';
import { SafeClickableLinksPipe } from './Utils/safe-clickable-links.pipe';
import { ManagedLivingLabInfoComponent } from './living-lab-management/managed-living-lab-info/managed-living-lab-info.component';

@NgModule({
  declarations: [
    DynamicContentDirective,
    NavbarComponent,
    DynamicModalComponent,
    DynamicContentSectionComponent,
    UserMenuDropdownComponent,
    CancellableOperationComponent,
    AppComponent,
    SignInComponent,
    UserLandingPageComponent,
    UserFunctionContentComponent,
    UserFunctionListComponent,
    EmptyAuthUserFormComponent,
    CookieBanner,
    BreadcrumbComponent,
    PageNotFoundComponent,
    FooterComponent,
    EditableSingleValueAttributeComponent,
    SearchableDropDownComponent,
    OptionsList,
    UserEditProfileComponent,
    ListValueAttributeComponent,
    SingleSelectionListComponent,
    SelectableDropDownComponent,
    UsersManagementComponent,
    UserHomePageComponent,
    LivingLabEntityManagementComponent,
    LivingLabEntitySearchComponent,
    LivingLabEntityTableComponent,
    DigitalTechnologyManagementComponent,
    DigitalTechnologyEditComponent,
    ConfirmationModalComponent,
    LivingLabEntityBulkOperationsComponent,
    SCPEntityEditComponent,
    SdgManagementComponent,
    SdgEditComponent,
    StakeholderManagementComponent,
    StakeholderDetailsComponent,
    AddNewStakeholderComponent,
    LivingLabViewPageComponent,
    LivingLabViewPageAboutComponent,
    LivingLabViewPageStakeholdersComponent,
    LivingLabViewPageScpSystemComponent,
    SnackBarComponent,
    LLCreationComponent,
    LLGeneralInformationComponent,
    LLDigitalTechnologiesComponent,
    LLSDGsComponent,
    LLDomainsComponent,
    LLTaxTreeComponent,
    LLStakeholdersComponent,
    LLLocationComponent,
    StakeholderPaginatedTableComponent,
    LLAddNewStakeholderComponent,
    LLAddNewStakeholderTypeUnawareComponent,
    LLSCPEntitiesComponent,
    LLSCPEntityEditComponent,
    LLSCPGraphComponent,
    LLNewSCPEntityConnectionComponent,
    LivingLabViewPageActivitiesComponent,
    ActivityViewPageComponent,
    AddNewActivityComponent,
    MyLivingLabsComponent,
    LivingLabSummaryCardComponent,
    LandingPageComponent,
    ActivityEditComponent,
    LLMembersComponent,
    LLActivitiesComponent,
    LlUpdateComponent,
    PublicLivingLabsComponent,
    LandingPublishedLivingLabSummaryCardComponent,
    AllLivingLabsComponent,
    PrivacyComponent,
    AboutComponent,
    ToUComponent,
    ContactComponent,
    LlJoinRequestsComponent,
    LlUsersManagementComponent,
    LlJoinRequestFormComponent,
    LlJoinRequestAccompanyingTextPopupComponent,
    LivingLabViewPageOutcomesComponent,
    LLSCPEntityModalComponent,
    LLAddNewStakeholderModalComponent,
    LLOutcomesComponent,
    AddNewOutcomeComponent,
    LLEditConnectionComponent,
    DigitalTechnologyAddComponent,
    SDGImpactModalComponent,
    LivingLabViewPageSocioEconomicImpactComponent,
    LivingLabManagementComponent,
    ManagedLivingLabSummaryCardComponent,
    DeactivatedLivingLabSummaryCardComponent,
    SafeClickableLinksPipe,
    ManagedLivingLabInfoComponent,
   ],


    imports: [
        NgbModule,
        BrowserModule,
        CommonModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        OAuthModule.forRoot(),
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatExpansionModule,
        MatDividerModule,
        MatBadgeModule,
        MatChipsModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatCheckboxModule,
        MatDialogModule,
        MatPaginatorModule,
        MatSortModule,
        MatTabsModule,
        MatTooltipModule,
        MatRadioModule,
        MatSnackBarModule,
        MatTreeModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatRippleModule,
        MatSlideToggleModule,
        MatMenuModule,
        MatSidenavModule,
        AngularEditorModule ,
    ],
  providers: [
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false} },
    CookieService,
    DynamicContentService,
    UserManagementService,
    CookieService,
    SCPGroupsService,
    SCPEntitiesService,
    AngularServicesProviderService,
    DigitalTechnologyService,
    DomainService,
    LocationService,
    ScreenshotService,
    LlJoinRequestDispatcherService,
    LLUserMembershipService,
    ReCaptchaService,
    RouterExtService,
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
    { provide: APP_BASE_HREF, useValue: '/llm' },
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MatDialogRef, useValue: {} },
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  bootstrap: [AppComponent],
  entryComponents: [DynamicTooltip],
  exports: [ NgbTooltipModule, DynamicContentDirective, NgbTooltip ]
})
export class AppModule {
  constructor(private routerExtService: RouterExtService){}
}
