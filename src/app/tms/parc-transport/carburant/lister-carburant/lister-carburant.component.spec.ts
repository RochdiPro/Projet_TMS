import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListerCarburantComponent } from './lister-carburant.component';

describe('ListerCarburantComponent', () => {
  let component: ListerCarburantComponent;
  let fixture: ComponentFixture<ListerCarburantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListerCarburantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListerCarburantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
