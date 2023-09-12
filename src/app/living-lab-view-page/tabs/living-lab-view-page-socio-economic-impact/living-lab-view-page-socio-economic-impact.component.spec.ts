import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivingLabViewPageSocioEconomicImpactComponent } from './living-lab-view-page-socio-economic-impact.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('LivingLabViewPageSocioEconomicImpactComponent', () => {
  let component: LivingLabViewPageSocioEconomicImpactComponent;
  let fixture: ComponentFixture<LivingLabViewPageSocioEconomicImpactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatProgressSpinnerModule],
      declarations: [ LivingLabViewPageSocioEconomicImpactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LivingLabViewPageSocioEconomicImpactComponent);
    component = fixture.componentInstance;
    component.livingLab = {id:1};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
