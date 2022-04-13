import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierEmployeComponent } from './modifier-employe.component';

describe('ModifierEmployeComponent', () => {
  let component: ModifierEmployeComponent;
  let fixture: ComponentFixture<ModifierEmployeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierEmployeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierEmployeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
