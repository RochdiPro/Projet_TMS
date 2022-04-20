import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImporterExporterComponent } from './importer-exporter.component';

describe('ImporterExporterComponent', () => {
  let component: ImporterExporterComponent;
  let fixture: ComponentFixture<ImporterExporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImporterExporterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImporterExporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
