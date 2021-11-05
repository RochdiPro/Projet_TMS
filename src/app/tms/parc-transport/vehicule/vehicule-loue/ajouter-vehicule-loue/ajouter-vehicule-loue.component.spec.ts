import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterVehiculeLoueComponent } from './ajouter-vehicule-loue.component';

describe('AjouterVehiculeLoueComponent', () => {
  let component: AjouterVehiculeLoueComponent;
  let fixture: ComponentFixture<AjouterVehiculeLoueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterVehiculeLoueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterVehiculeLoueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
