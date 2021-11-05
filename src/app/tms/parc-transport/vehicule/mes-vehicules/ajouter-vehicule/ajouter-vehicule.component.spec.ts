import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterVehiculeComponent } from './ajouter-vehicule.component';

describe('AjouterVehiculeComponent', () => {
  let component: AjouterVehiculeComponent;
  let fixture: ComponentFixture<AjouterVehiculeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterVehiculeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterVehiculeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
