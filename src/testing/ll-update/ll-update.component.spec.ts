import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LlUpdateComponent } from "../../app/User/ll-update/ll-update.component";
import { of } from "rxjs";
import mockLivingLab from "../../app/Service/mock-living-lab.json";
import { By } from "@angular/platform-browser";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { DebugElement } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DomainService } from 'src/app/Service/domain.service';
import { SCPGroupsService } from 'src/app/Service/SCPgroups.service';
import domains from "../mocks/domains.json";
import dts from "../mocks/dts.json";
import sdgs from "../mocks/sdgs.json";
import scpgroups from "../mocks/scpgroups.json";

import { LLTaxTreeComponent } from 'src/app/User/LLCreation/LLDomain/ll-taxtree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DigitalTechnology } from 'src/app/Models/DigitalTechnology';
import { Response } from 'src/app/Models/Response/response';
import { SDG } from 'src/app/Models/SDG';
import { LLSCPGraphComponent } from 'src/app/User/LLCreation/LLSCPEntities/ll-scp-graph.component';
import { ValueLogger } from './value-logger';
import { TestUtils } from '../test-utils';
import { LLOutcomesComponent } from 'src/app/User/LLCreation/LLOutcomes/ll-outcomes.component';
import {LlCreateUpdateCommons} from "../ll-create-update-commons";



describe('LlUpdateComponent', () => {
  let component: LlUpdateComponent;
  let fixture: ComponentFixture<LlUpdateComponent>;

  // Commons between LLCreate/LLUpdate
  const c = new LlCreateUpdateCommons();

  // LLUpdate specific
  const domainServiceSpy = jasmine.createSpyObj('DomainService', ['getUrl', 'getDomains']);
  const scpGroupsServiceSpy = jasmine.createSpyObj('SCPGroupsService', ['getSCPGroups']);

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      // Merge common imports with LLUpdate specific
      imports: [
        ...c.imports,
        ...[MatIconModule, MatTableModule, MatSlideToggleModule,
        MatTreeModule, MatCheckboxModule]
      ],

      // Merge common declarations with LLUpdate specific
      declarations: [
        ...c.declarations,
        ...[LlUpdateComponent, LLSCPGraphComponent, LLTaxTreeComponent, LLOutcomesComponent]
      ],

      // Merge common providers with LLUpdate specific
      providers: [
        ...c.providers,
        ...[
          { provide: SCPGroupsService, useValue: scpGroupsServiceSpy },
          { provide: DomainService, useValue: domainServiceSpy },
        ]
      ]

    })
      .compileComponents();
  });

  beforeEach(fakeAsync(() => {

    c.activatedRouteStub.setParams({ livingLabId: 1 });
    c.userManagementServiceSpy.getToken.and.returnValue('whatever non null token value');
    c.userManagementServiceSpy.getUserInfo.and.returnValue({id : 1});
    c.llUserMemberServiceSpy.checkUserLivingLabMembership.and.returnValue(of({ data: true, message: '' } as Response<Boolean>));
    c.llUserMemberServiceSpy.canModifyLivingLab.and.returnValue(of({ data: true, message: '' } as Response<Boolean>));
    c.livingLabServiceSpy.get.and.returnValue(of({ data: mockLivingLab }));
    c.screenshotServiceSpy.isServiceDisabled.and.returnValue(true);
    c.messageServiceSpy.pop.and.returnValue('');
    c.sdgServiceSpy.getAll.and.returnValue(of({ data: sdgs, message: '' } as Response<SDG[]>));
    c.digitalTechnologyServiceSpy.getAll.and.returnValue(of({ data: dts, message: '' } as Response<DigitalTechnology[]>));

    domainServiceSpy.getDomains.and.returnValue(of(domains));
    scpGroupsServiceSpy.getSCPGroups.and.returnValue(of(scpgroups));

    Object.assign(mockLivingLab, { iconUrl: '' });

    fixture = TestBed.createComponent(LlUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();
  }));


  it('should create and initially display general info tab', fakeAsync(() => {
    expect(component).toBeTruthy();
    expect(component.ready).toEqual(true);
    expect(component.currentView).withContext('current view').toEqual(0);

    expect(fixture.debugElement.queryAll(By.css('.form-field')).length)
      .withContext('number of form fields in general info')
      .toEqual(3);

    expect(fixture.debugElement.queryAll(By.css('.angular-editor-wrapper')).length)
      .withContext('the lls descrption')
      .toEqual(1);
  }));

  it('should add text under name in the general info tab, the update button should be enabled. ', fakeAsync(() => {
    expect(component).toBeTruthy();
    expect(component.ready).toEqual(true);
    expect(component.currentView).withContext('current view').toEqual(0);

    let formFields = fixture.debugElement.queryAll(By.css('.form-field'));
    expect(formFields.length)
      .withContext('number of form fields in general info')
      .toEqual(3);

    let saveButton = fixture.debugElement.query(By.css('.save-button'));

    expect(saveButton).toBeTruthy();
    expect(saveButton.attributes.disabled).not.toBeUndefined();

    for (let i = 0; i < formFields.length; i++) {
      TestUtils.addStringToInput(formFields[i], "text", fixture);
    }
    expect(saveButton.attributes.disabled).toBeUndefined();

  }));

  it('should add text under name in the general info tab, the update button should be enabled, then remove the chars one by one, the update should be enabled until there is at least one char. ', fakeAsync(() => {
    expect(component).toBeTruthy();
    expect(component.ready).toEqual(true);
    expect(component.currentView).withContext('current view').toEqual(0);

    let formFields = fixture.debugElement.queryAll(By.css('.form-field'));
    expect(formFields.length)
      .withContext('number of form fields in general info')
      .toEqual(3);

    expect(fixture.debugElement.queryAll(By.css('.angular-editor-wrapper')).length)
      .withContext('the lls descrption')
      .toEqual(1);

    let saveButton = fixture.debugElement.query(By.css('.save-button'));

    expect(saveButton).toBeTruthy();
    expect(saveButton.attributes.disabled).not.toBeUndefined();

    let elms: { debugElement: DebugElement, initialValue: string }[] = [];

    for (let i = 0; i < formFields.length; i++) {
      elms = TestUtils.setGeneralInfoValuesAndCollectInitialOnes(formFields[i], "text", fixture, elms);
    }
    expect(saveButton.attributes.disabled).toBeUndefined();
    //lets revert
    TestUtils.setGeneralInfoValues(fixture, elms, (i: number, max: number) => {
      if (i === max) {
        expect(saveButton.attributes.disabled).not.toBeUndefined();
      }
      else if (i < max) {
        expect(saveButton.attributes.disabled).toBeUndefined();
      }
    });
  }));


  it('should navigate to the right, then to the left, the update button should be disabled at all times. Utilizes a loop. ', fakeAsync(() => {

    expect(component).toBeTruthy();
    expect(component.ready).toEqual(true);
    expect(component.currentView).withContext('current view').toEqual(0);

    //for loop, to go to next tab group
    let tabs = fixture.debugElement.queryAll(By.css('.tab-title'))
    let amountOfTabs = tabs.length;
    let initialView = component.currentView;
    let currentView = initialView;
    let vl1: ValueLogger = new ValueLogger();
    let vl2: ValueLogger = new ValueLogger();
    component.dataContainer.setOnTestMode();

    while (currentView < amountOfTabs) {
      TestUtils.goToTab(fixture, currentView);
      currentView++;
      let saveButton = fixture.debugElement.query(By.css('.save-button'));
      expect(saveButton.attributes.disabled).toEqual("true");
      vl1.logValue(component, fixture);
    }

    currentView = amountOfTabs - 1;

    while (currentView >= 0) {
      TestUtils.goToTab(fixture, currentView);
      currentView--;
      let saveButton = fixture.debugElement.query(By.css('.save-button'));
      expect(saveButton.attributes.disabled).toEqual("true");
      vl2.logValue(component, fixture);
    }
    expect(vl1.diff(vl2)).toEqual(false);

  }));


  it('should change sth on general info, then go right, then left, the update button should be still enabled. Check all tab values while traversing.' +
    ' The general info field that changed needs to have the updated value. ', fakeAsync(() => {

      expect(component).toBeTruthy();
      expect(component.ready).toEqual(true);
      expect(component.currentView).withContext('current view').toEqual(0);

      //for loop, to go to next tab group
      let tabs = fixture.debugElement.queryAll(By.css('.tab-title'))
      let amountOfTabs = tabs.length;
      let initialView = component.currentView;
      let currentView = initialView;
      let vl1: ValueLogger = new ValueLogger();
      let vl2: ValueLogger = new ValueLogger();
      component.dataContainer.setOnTestMode();

      let saveButton = fixture.debugElement.query(By.css('.save-button'));
      //console.log(saveButton.attributes.disabled)
      vl1.logValue(component, fixture);

      const updateValue = "updated field";
      let formFields = fixture.debugElement.queryAll(By.css('.form-field'));
      let elm = TestUtils.setGeneralInfoValuesAndCollectInitialOnes(formFields[0], updateValue, fixture, []);
      expect(saveButton.attributes.disabled).toBeUndefined();

      currentView++;
      while (currentView < amountOfTabs - 1) {
        //change general info
        TestUtils.goToTab(fixture, currentView);
        currentView++;
        let saveButton = fixture.debugElement.query(By.css('.save-button'));
        expect(saveButton.attributes.disabled).toBeUndefined();
        vl1.logValue(component, fixture);
      }

      currentView = amountOfTabs - 1;

      while (currentView >= 0) {
        TestUtils.goToTab(fixture, currentView);
        currentView--;
        let saveButton = fixture.debugElement.query(By.css('.save-button'));
        expect(saveButton.attributes.disabled).toBeUndefined();
        vl2.logValue(component, fixture);
      }
      expect(vl1.diff(vl2)).toEqual(true);
      let changes = vl1.diffExplained(vl2);
      expect(changes.length).toEqual(1);
      expect(changes[0]).toEqual("llGeneralInfo:name:" + elm[0].initialValue + "!=" + updateValue);

    }));


  it('should click on public and the update button to be enabled. CLick again, it should be disabled.', fakeAsync(() => {
    expect(component).toBeTruthy();
    expect(component.ready).toEqual(true);
    expect(component.currentView).withContext('current view').toEqual(0);

    let isPublic = TestUtils.clickElement(fixture,'mat-slide-toggle input');
    let tabs = fixture.debugElement.queryAll(By.css('.tab-title'))
    let amountOfTabs = tabs.length;
    let initialView = component.currentView;
    let currentView = initialView;
    let vl1: ValueLogger = new ValueLogger();
    let vl2: ValueLogger = new ValueLogger();
    component.dataContainer.setOnTestMode();

    while (currentView < amountOfTabs) {
      TestUtils.goToTab(fixture, currentView);
      currentView++;
      let saveButton = fixture.debugElement.query(By.css('.save-button'));
      expect(saveButton.attributes.disabled).toBeUndefined();
      vl1.logValue(component, fixture);
    }

    currentView = amountOfTabs - 1;

    while (currentView >= 0) {
      TestUtils.goToTab(fixture, currentView);
      currentView--;
      let saveButton = fixture.debugElement.query(By.css('.save-button'));
      expect(saveButton.attributes.disabled).toBeUndefined();
      vl2.logValue(component, fixture);
    }
    expect(vl1.diff(vl2)).toEqual(false);


  }));

  /*
    it('should go to the right, then left, the update button should be still disabled. Check all tab values while traversing, they should be identical as the mock data ', fakeAsync(() => {

    }));

    it('should add an entity, then the update button should be enabled, also a screenshot should have been created.', fakeAsync(() => {

    }));

    it('should add an entity, then the update button should be enabled, then delete the entity, the update button should be disabled.', fakeAsync(() => {

    }));*/
});

TestUtils.loadMaterialIcons();
