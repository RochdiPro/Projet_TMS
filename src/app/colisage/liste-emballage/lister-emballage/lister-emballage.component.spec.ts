import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListerEmballageComponent } from './lister-emballage.component';

describe('ListerEmballageComponent', () => {
  let component: ListerEmballageComponent;
  let fixture: ComponentFixture<ListerEmballageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListerEmballageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListerEmballageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
