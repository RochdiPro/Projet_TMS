import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListerSupportsComponent } from './lister-supports.component';

describe('ListerSupportsComponent', () => {
  let component: ListerSupportsComponent;
  let fixture: ComponentFixture<ListerSupportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListerSupportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListerSupportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
