import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuTMSComponent } from './menu-tms.component';

describe('MenuTMSComponent', () => {
  let component: MenuTMSComponent;
  let fixture: ComponentFixture<MenuTMSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuTMSComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuTMSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
