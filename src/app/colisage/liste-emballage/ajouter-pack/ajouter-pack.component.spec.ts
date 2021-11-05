import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterPackComponent } from './ajouter-pack.component';

describe('AjouterPackComponent', () => {
  let component: AjouterPackComponent;
  let fixture: ComponentFixture<AjouterPackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterPackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterPackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
