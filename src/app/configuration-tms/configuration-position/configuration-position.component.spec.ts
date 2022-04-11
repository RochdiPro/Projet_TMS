import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationPositionComponent } from './configuration-position.component';

describe('ConfigurationPositionComponent', () => {
  let component: ConfigurationPositionComponent;
  let fixture: ComponentFixture<ConfigurationPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationPositionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
