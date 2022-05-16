import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserEmployeComponent } from './visualiser-employe.component';

describe('VisualiserEmployeComponent', () => {
  let component: VisualiserEmployeComponent;
  let fixture: ComponentFixture<VisualiserEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualiserEmployeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualiserEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
