import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionsChauffeurComponent } from './missions-chauffeur.component';

describe('MissionsChauffeurComponent', () => {
  let component: MissionsChauffeurComponent;
  let fixture: ComponentFixture<MissionsChauffeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionsChauffeurComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionsChauffeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
