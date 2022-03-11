import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationServeurComponent } from './configuration-application.component';

describe('ConfigurationServeurComponent', () => {
  let component: ConfigurationServeurComponent;
  let fixture: ComponentFixture<ConfigurationServeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationServeurComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationServeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
