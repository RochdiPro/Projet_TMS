import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierPrixComponent } from './modifier-prix.component';

describe('ModifierPrixComponent', () => {
  let component: ModifierPrixComponent;
  let fixture: ComponentFixture<ModifierPrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierPrixComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierPrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
