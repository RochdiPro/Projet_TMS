import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListerEmployeComponent } from './lister-employe.component';

describe('ListerEmployeComponent', () => {
  let component: ListerEmployeComponent;
  let fixture: ComponentFixture<ListerEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListerEmployeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListerEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
