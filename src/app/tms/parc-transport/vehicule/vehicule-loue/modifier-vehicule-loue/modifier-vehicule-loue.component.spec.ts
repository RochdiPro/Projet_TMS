import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierVehiculeLoueComponent } from './modifier-vehicule-loue.component';

describe('ModifierVehiculeLoueComponent', () => {
  let component: ModifierVehiculeLoueComponent;
  let fixture: ComponentFixture<ModifierVehiculeLoueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierVehiculeLoueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierVehiculeLoueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
