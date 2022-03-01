import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationTmsComponent } from './configuration-tms.component';

describe('ConfigurationTmsComponent', () => {
  let component: ConfigurationTmsComponent;
  let fixture: ComponentFixture<ConfigurationTmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationTmsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationTmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
