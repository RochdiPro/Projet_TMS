import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationGeneraleComponent } from './configuration-generale.component';

describe('ConfigurationGeneraleComponent', () => {
  let component: ConfigurationGeneraleComponent;
  let fixture: ComponentFixture<ConfigurationGeneraleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationGeneraleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationGeneraleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
