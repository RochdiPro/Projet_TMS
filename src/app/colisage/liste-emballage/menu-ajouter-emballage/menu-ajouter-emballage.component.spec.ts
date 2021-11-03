import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuAjouterEmballageComponent } from './menu-ajouter-emballage.component';

describe('MenuAjouterEmballageComponent', () => {
  let component: MenuAjouterEmballageComponent;
  let fixture: ComponentFixture<MenuAjouterEmballageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuAjouterEmballageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuAjouterEmballageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
