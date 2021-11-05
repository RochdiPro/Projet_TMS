import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListerCommandeComponent } from './lister-commande.component';

describe('ListerCommandeComponent', () => {
  let component: ListerCommandeComponent;
  let fixture: ComponentFixture<ListerCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListerCommandeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListerCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
