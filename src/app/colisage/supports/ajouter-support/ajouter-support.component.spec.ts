import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterSupportComponent } from './ajouter-support.component';

describe('AjouterSupportComponent', () => {
  let component: AjouterSupportComponent;
  let fixture: ComponentFixture<AjouterSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjouterSupportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjouterSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
