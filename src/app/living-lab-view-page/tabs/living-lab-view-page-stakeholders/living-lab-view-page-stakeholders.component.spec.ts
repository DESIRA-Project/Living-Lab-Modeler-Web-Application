import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LivingLabViewPageStakeholdersComponent } from './living-lab-view-page-stakeholders.component';

describe('LivingLabViewPageStakeholdersComponent', () => {
  let component: LivingLabViewPageStakeholdersComponent;
  let fixture: ComponentFixture<LivingLabViewPageStakeholdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatProgressSpinnerModule], 
      declarations: [ LivingLabViewPageStakeholdersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LivingLabViewPageStakeholdersComponent);
    component = fixture.componentInstance;
    component.livingLab = {
      stakeholders: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
