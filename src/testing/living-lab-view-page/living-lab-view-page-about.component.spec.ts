import {ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {LivingLabViewPageAboutComponent} from '../../app/living-lab-view-page/tabs/living-lab-view-page-about/living-lab-view-page-about.component';
import {By} from "@angular/platform-browser";
import {DebugElement} from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';

describe('LivingLabViewPageAboutComponent', () => {
  let component: LivingLabViewPageAboutComponent;
  let fixture: ComponentFixture<LivingLabViewPageAboutComponent>;
  let descriptionDe: DebugElement;
  let descriptionEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule,
            MatTooltipModule, MatCardModule, AngularEditorModule, MatProgressSpinnerModule,
            BrowserDynamicTestingModule,
            FormsModule ,
      ],
      declarations: [ LivingLabViewPageAboutComponent ],
      providers: [
        { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
        JwtHelperService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LivingLabViewPageAboutComponent);
    component = fixture.componentInstance;

    component.livingLab = {
      description: 'Description text'
    };

    fixture.detectChanges();
    
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display description', waitForAsync(() => {
    fixture.detectChanges();

    fixture.whenStable().then(async()=>{
      descriptionDe = fixture.debugElement.query(By.css('.angular-editor-wrapper'));
      descriptionEl = descriptionDe.nativeElement;
      expect(descriptionEl.textContent).toContain('Description text');  
    });
  }))
});

