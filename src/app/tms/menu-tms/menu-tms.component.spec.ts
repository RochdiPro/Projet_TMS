import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTmsComponent } from './menu-tms.component';

describe('MenuTmsComponent', () => {
  let component: MenuTmsComponent;
  let fixture: ComponentFixture<MenuTmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuTmsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
