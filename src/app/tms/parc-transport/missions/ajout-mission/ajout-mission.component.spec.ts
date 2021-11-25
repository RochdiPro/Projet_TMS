import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutMissionComponent } from './ajout-mission.component';

describe('AjoutMissionComponent', () => {
  let component: AjoutMissionComponent;
  let fixture: ComponentFixture<AjoutMissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjoutMissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjoutMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
