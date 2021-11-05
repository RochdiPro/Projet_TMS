import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListerVehiculesComponent } from './lister-vehicules.component';

describe('ListerVehiculesComponent', () => {
  let component: ListerVehiculesComponent;
  let fixture: ComponentFixture<ListerVehiculesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListerVehiculesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListerVehiculesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
