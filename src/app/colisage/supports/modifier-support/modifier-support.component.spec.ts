import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierSupportComponent } from './modifier-support.component';

describe('ModifierSupportComponent', () => {
  let component: ModifierSupportComponent;
  let fixture: ComponentFixture<ModifierSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierSupportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
