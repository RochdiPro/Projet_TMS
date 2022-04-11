import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationProduitComponent } from './configuration-produit.component';

describe('ConfigurationProduitComponent', () => {
  let component: ConfigurationProduitComponent;
  let fixture: ComponentFixture<ConfigurationProduitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigurationProduitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationProduitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
