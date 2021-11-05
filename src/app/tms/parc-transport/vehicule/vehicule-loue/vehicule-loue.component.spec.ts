import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeLoueComponent } from './vehicule-loue.component';

describe('VehiculeLoueComponent', () => {
  let component: VehiculeLoueComponent;
  let fixture: ComponentFixture<VehiculeLoueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehiculeLoueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiculeLoueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
