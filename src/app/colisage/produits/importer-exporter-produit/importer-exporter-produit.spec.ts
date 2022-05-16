import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImporterExporterProduitsComponent } from './importer-exporter-produit.component';

describe('AjouterProduitComponent', () => {
  let component: ImporterExporterProduitsComponent;
  let fixture: ComponentFixture<ImporterExporterProduitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImporterExporterProduitsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImporterExporterProduitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
