import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListerVehiculesLoueComponent } from './lister-vehicules-loue.component';

describe('ListerVehiculesComponent', () => {
  let component: ListerVehiculesLoueComponent;
  let fixture: ComponentFixture<ListerVehiculesLoueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListerVehiculesLoueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListerVehiculesLoueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
