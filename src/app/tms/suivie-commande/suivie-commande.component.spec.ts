import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuivieCommandeComponent } from './suivie-commande.component';

describe('SuivieCommandeComponent', () => {
  let component: SuivieCommandeComponent;
  let fixture: ComponentFixture<SuivieCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuivieCommandeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuivieCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
