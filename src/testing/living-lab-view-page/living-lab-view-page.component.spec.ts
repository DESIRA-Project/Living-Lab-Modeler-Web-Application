import {ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync} from '@angular/core/testing';

import { LivingLabViewPageComponent } from '../../app/living-lab-view-page/living-lab-view-page.component';
import {ActivatedRoute, Router} from "@angular/router";
import {ActivatedRouteStub} from "../activated-route-stub";
import {of} from "rxjs";
import {LivingLabService} from "../../app/Service/living-lab.service";
import mockLivingLab from '../../app/Service/mock-living-lab.json';
import {MatTabsModule} from "@angular/material/tabs";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LivingLabViewPageAboutComponent} from "../../app/living-lab-view-page/tabs/living-lab-view-page-about/living-lab-view-page-about.component";
import {By} from "@angular/platform-browser";
import {
  LivingLabViewPageScpSystemComponent
} from "../../app/living-lab-view-page/tabs/living-lab-view-page-scp-system/living-lab-view-page-scp-system.component";
import {AssetsService} from "../../app/Service/assets.service";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import {  AngularEditorModule } from '@kolkov/angular-editor';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BreadcrumbComponent } from 'src/app/Breadcrumb/breadcrumb.component';
import { NavbarComponent } from 'src/app/Navbar/navbar.component';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { UserManagementService } from 'src/app/User/user-management.service';
import { DynamicContentService } from 'src/app/ComponentLibrary/DynamicModal/dynamic-content.service';
import { LivingLabViewPageActivitiesComponent } from 'src/app/living-lab-view-page/tabs/living-lab-view-page-activities/living-lab-view-page-activities.component';
import { LivingLabViewPageOutcomesComponent } from 'src/app/living-lab-view-page/tabs/living-lab-view-page-outcomes/living-lab-view-page-outcomes.component';
import { AngularServicesProviderService } from 'src/app/Service/angular-services-provider.service';
import { FooterComponent } from 'src/app/Footer/footer.component';
import { LivingLabViewPageStakeholdersComponent } from 'src/app/living-lab-view-page/tabs/living-lab-view-page-stakeholders/living-lab-view-page-stakeholders.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterExtService } from 'src/app/Service/router-ext.service';

describe('LivingLabViewPageComponent', () => {
  let component: LivingLabViewPageComponent;
  let fixture: ComponentFixture<LivingLabViewPageComponent>;
  const activatedRouteStub = new ActivatedRouteStub();
  const livingLabServiceSpy = jasmine.createSpyObj('LivingLabService', ['get']);
  const assetsServiceSpy = jasmine.createSpyObj('AssetsService', ['getAssetLink']);
  const userManagementServiceSpy = jasmine.createSpyObj('UserManagementService', ['getToken','getUserInfo']);
  const routerExtServiceSply = jasmine.createSpyObj('RouterExtService', ['getCurrentUrl']);
  const angularServicesProviderServiceSpy = jasmine.createSpyObj('AngularServicesProviderService',['createNewModalWithTypeAndWidth'])

  beforeEach(waitForAsync (() => {

    TestBed.configureTestingModule({

      // Imports needed for tab change
      imports: [HttpClientTestingModule, MatTabsModule, BrowserAnimationsModule,MatTooltipModule, MatCardModule, AngularEditorModule,

        BrowserDynamicTestingModule,
            FormsModule ,
      ],

      // Declare components that will need to be rendered
      declarations: [LivingLabViewPageComponent, LivingLabViewPageAboutComponent, LivingLabViewPageScpSystemComponent,
        LivingLabViewPageActivitiesComponent, LivingLabViewPageOutcomesComponent, LivingLabViewPageStakeholdersComponent,
        NavbarComponent, BreadcrumbComponent,FooterComponent],
        schemas: [ NO_ERRORS_SCHEMA ],

      // Replace actual dependencies here
      providers: [
        {provide: ActivatedRoute, useValue: activatedRouteStub},
        {provide: Router, useValue: {url:'/living-lab'}},
        {provide: LivingLabService, useValue: livingLabServiceSpy},
        {provide: AssetsService, useValue: assetsServiceSpy},
        {provide: RouterExtService, useValue: routerExtServiceSply},
        {provide: DynamicContentService, useValue: {}},
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        {provide: AngularServicesProviderService, useValue: angularServicesProviderServiceSpy},
        { provide: UserManagementService, useValue: userManagementServiceSpy },

        JwtHelperService
      ]

    })
      .compileComponents();

  }));




  beforeEach(() => {
    // Create basic component, constructor of LivingLabViewPageComponent gets called here
    fixture = TestBed.createComponent(LivingLabViewPageComponent);
    component = fixture.componentInstance;

    // Dummy initial values
    activatedRouteStub.setParams({livingLabId: 1});
    activatedRouteStub.setQueryParams({tabNo: 0});
    activatedRouteStub.setFragment('mainScreen');
    // assetsServiceSpy.and.returnValue('');
  });


  it('should create and be ready', () => {

    let ll = getMockLLWithPermissions();
    // Setup/Modify initial living lab data
    livingLabServiceSpy.get.and.returnValue(of({ data:ll}));

    // ngOnInit gets called here
    fixture.detectChanges();

    // Make sure component has loaded and is ready
    expect(component).toBeTruthy();
    expect(component.ready).toEqual(true);
  });


  it('should display default photo when none provided', () => {
    let ll = getMockLLWithPermissions();
    ll.iconUrl = undefined;
    // Setup/Modify initial living lab data
    //Object.assign(ll, {iconUrl: undefined});
    livingLabServiceSpy.get.and.returnValue(of({data: ll}));

    fixture.detectChanges();

    // Make sure variables related to default photo are set appropriately
    expect(component.defaultMainPhoto).toEqual(true);
    expect(component.livingLab.iconUrl).toEqual(undefined);
    expect(component.mainPhotoHeight).toEqual('500px');
    expect(component.mainPhotoWidth).toEqual('auto');
  });


  it('should display description', waitForAsync(() => {
    // Setup/Modify initial living lab data
    Object.assign(mockLivingLab, {description: 'Description Text'});
    livingLabServiceSpy.get.and.returnValue(of({data: getMockLLWithPermissions() }));

    fixture.detectChanges();

    fixture.whenStable().then(async()=>{
    // Find element based on its css class
    const descriptionDe = fixture.debugElement.query(By.css('.angular-editor-wrapper'));
    const descriptionEl = descriptionDe.nativeElement;

    // And assert it contains appropriate text
    expect(descriptionEl.textContent).toContain('Description Text');
    });
  }))


  it('should switch tab', fakeAsync(() => {
    // Setup/Modify initial living lab data
    livingLabServiceSpy.get.and.returnValue(of({data: getMockLLWithPermissions() }));

    fixture.detectChanges();

    // Find tab and click on it
    const tabsDe = fixture.debugElement.queryAll(By.css('.tab-title'));
    const tabEl = tabsDe[4].nativeElement;
    tabEl.click();

    // This line performs the tab change
    fixture.detectChanges();

    // This line sets up the input values of the component inside the tab and calls its ngOnInit
    tick();

    // Now the screen displays the new tab content
    const scpDescDe = fixture.debugElement.query(By.css('.scp-general-description'));
    const scpDescEl = scpDescDe.nativeElement;
    expect(scpDescEl.textContent).toContain('The concept of Socio-Cyber-Physical Systems (SCPSs) is introduced');

    // Needed because we used tick()
    flush();
  }))

  function getMockLLWithPermissions(){
    let cp = JSON.stringify( mockLivingLab );
    let ccp = JSON.parse(cp);
    ccp.llPermissions = [];
    ccp.outcomes = [];
    ccp.activityOutcomes = [];
    return ccp;
  }
});

