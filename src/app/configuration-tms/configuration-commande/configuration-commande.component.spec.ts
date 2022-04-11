import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationCommandeComponent } from './configuration-commande.component';

describe('ConfigurationCommandeComponent', () => {
  let component: ConfigurationCommandeComponent;
  let fixture: ComponentFixture<ConfigurationCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationCommandeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
