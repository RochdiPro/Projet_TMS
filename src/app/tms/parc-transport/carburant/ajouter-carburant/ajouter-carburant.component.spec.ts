import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterCarburantComponent } from './ajouter-carburant.component';

describe('AjouterCarburantComponent', () => {
  let component: AjouterCarburantComponent;
  let fixture: ComponentFixture<AjouterCarburantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterCarburantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterCarburantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
