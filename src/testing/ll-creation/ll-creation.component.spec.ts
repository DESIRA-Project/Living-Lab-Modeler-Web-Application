import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';
import {By} from "@angular/platform-browser";
import {LLCreationComponent} from "../../app/User/LLCreation/ll-creation.component";
import {of} from "rxjs";
import {LocationService} from "../../app/Service/location.service";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Response } from 'src/app/Models/Response/response';
import { TestUtils } from '../test-utils';

import dts from "../mocks/dts.json";
import sdgs from "../mocks/sdgs.json";
import {LlCreateUpdateCommons} from "../ll-create-update-commons";



describe('LLCreationComponent', () => {
  let component: LLCreationComponent;
  let fixture: ComponentFixture<LLCreationComponent>;

  // Commons between LLCreate/LLUpdate
  const c = new LlCreateUpdateCommons();

  // LLCreate specific
  const locationServiceSpy = jasmine.createSpyObj('LocationService', ['search']);

  beforeEach(async () => {

    await TestBed.configureTestingModule({

      // Only common imports here
      imports: c.imports,

      // Merge common declarations with LLCreate specific
      declarations: [
        ...c.declarations,
        ...[LLCreationComponent]
      ],

      // Merge common providers with LLCreate specific
      providers: [
        ...c.providers,
        ...[
          {provide: LocationService, useValue: locationServiceSpy}
        ]
      ],

      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  });


  beforeEach(fakeAsync(() => {
    c.userManagementServiceSpy.getToken.and.returnValue('whatever non null token value');
    c.userManagementServiceSpy.getUserInfo.and.returnValue({id : 1});
    c.llUserMemberServiceSpy.checkUserLivingLabMembership.and.returnValue(of({ data: true, message: '' } as Response<Boolean>));
    c.sdgServiceSpy.getAll.and.returnValue(of({data: sdgs}));
    c.digitalTechnologyServiceSpy.getAll.and.returnValue(of({data: dts}));
    c.angularServicesProviderServiceSpy.createNewModalWithTypeAndWidth.and.returnValue({
      getObservableFromConfirmableOperationWithCustomStyle: (a:any,b:any,s:string)=>{
        return of({});
      }
    });

    locationServiceSpy.search.and.returnValue(of({data: []}));

    fixture = TestBed.createComponent(LLCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(200);
    fixture.detectChanges();
    flush();
  }));


  it('should create, be ready and initially display general info tab', () => {
    expect(component)
      .toBeTruthy();
    expect(component.ready)
      .withContext('ready')
      .toEqual(true);
    expect(component.currentView)
      .withContext('current view')
      .toEqual(0);
    expect(fixture.debugElement.queryAll(By.css('.form-field')).length)
      .withContext('number of form fields in general info tab')
      .toEqual(3);
    expect(fixture.debugElement.queryAll(By.css('.angular-editor-wrapper')).length)
      .withContext('the lls descrption')
      .toEqual(1);
  });

  it('should keep general info (without main photo) between tab changes', fakeAsync(() => {
    let hostElement: HTMLElement = fixture.nativeElement;
    let inputArr = hostElement.querySelectorAll('input');
    let textareaArr = hostElement.querySelectorAll('textarea');
    let titleInput = inputArr[2];
    let focalQuestionInput = textareaArr[0];
    let locationInput = inputArr[6];
    // let photoInput = inputArr[4];

    titleInput.value = 'Title';
    titleInput.dispatchEvent(new Event('input'));

    focalQuestionInput.value = 'Focal Question';
    focalQuestionInput.dispatchEvent(new Event('input'));

    locationInput.value = 'User Defined Location';
    locationInput.dispatchEvent(new Event('input'));
    locationInput.dispatchEvent(new KeyboardEvent('keyup'));

    let desc = hostElement.querySelectorAll('.angular-editor-textarea');
    desc [0].innerHTML = 'Description';
    desc[0].dispatchEvent(new Event('input'));
    desc[0].dispatchEvent(new KeyboardEvent('keyup'));
    // const dataTransfer = new DataTransfer();
    // dataTransfer.items.add(new File([''], 'test-file.jpg'));
    // photoInput.files = dataTransfer.files;
    // photoInput.dispatchEvent(new InputEvent('change'));

    fixture.detectChanges();

    // Needed for location save
    tick(400);
    // fixture.detectChanges();

    TestUtils.goToTab(fixture, 3);
    TestUtils.goToTab(fixture, 0);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    hostElement = fixture.nativeElement;
    inputArr = hostElement.querySelectorAll('input');
    textareaArr = hostElement.querySelectorAll('textarea');

    titleInput = inputArr[2];
    focalQuestionInput = textareaArr[0];
    let descriptionInput =  hostElement.querySelectorAll('.angular-editor-textarea')[0];//textareaArr[1];
    locationInput = inputArr[6];

    expect(titleInput.value).withContext('Title').toBe('Title');
    expect(focalQuestionInput.value).withContext('Focal Question').toBe('Focal Question');
    expect(descriptionInput.textContent).withContext('Description').toBe('Description');
    expect(locationInput.value).withContext('User Defined Location').toBe('User Defined Location');
    // expect(photoInput.files?.item(0)?.name).withContext('Main Photo').toBe('test-file.jpg');

    flush();

  }));


  it('should keep selected sdgs between tab changes', fakeAsync(() => {
    TestUtils.goToTab(fixture, 4);

    // Click on 2nd card
    fixture.debugElement.queryAll(By.css('.selectable-card'))[1].nativeElement.click();
    fixture.detectChanges();

    // Expect to be selected
    expect((fixture.debugElement.queryAll(By.css('.selectable-card'))[1].nativeElement as HTMLElement).style.backgroundColor)
      .withContext('selected card after tab change')
      .toEqual('var(--light-gray)');
    // Change tab
    TestUtils.goToTab(fixture, 0);
    // Change back
    TestUtils.goToTab(fixture, 4);
    // Expect to still be selected
    expect((fixture.debugElement.queryAll(By.css('.selectable-card'))[1].nativeElement as HTMLElement).style.backgroundColor)
      .withContext('selected card after tab change')
      .toEqual('var(--light-gray)');

    flush();
  }));


  it('should keep selected digital technologies between tab changes', fakeAsync(() => {
    TestUtils.goToTab(fixture, 3);

    // Click on 2nd card
    fixture.debugElement.queryAll(By.css('.selectable-card'))[1].nativeElement.click();
    fixture.detectChanges();
    // Expect to be selected
    expect((fixture.debugElement.queryAll(By.css('.selectable-card'))[1].nativeElement as HTMLElement).style.backgroundColor)
      .withContext('selected card after tab change')
      .toEqual('var(--light-gray)');
    // Change tab
    TestUtils.goToTab(fixture, 0);
    // Change back
    TestUtils.goToTab(fixture, 3);
    // Expect to still be selected
    expect((fixture.debugElement.queryAll(By.css('.selectable-card'))[1].nativeElement as HTMLElement).style.backgroundColor)
      .withContext('selected card after tab change')
      .toEqual('var(--light-gray)');

    flush();
  }));
});
