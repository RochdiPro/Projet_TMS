import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanChargementComponent } from './plan-chargement.component';

describe('PlanChargementComponent', () => {
  let component: PlanChargementComponent;
  let fixture: ComponentFixture<PlanChargementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanChargementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanChargementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
