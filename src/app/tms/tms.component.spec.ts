import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TMSComponent } from './tms.component';

describe('TMSComponent', () => {
  let component: TMSComponent;
  let fixture: ComponentFixture<TMSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TMSComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
