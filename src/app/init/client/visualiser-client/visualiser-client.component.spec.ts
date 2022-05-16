import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualiserClientComponent } from './visualiser-client.component';

describe('VisualiserClientComponent', () => {
  let component: VisualiserClientComponent;
  let fixture: ComponentFixture<VisualiserClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualiserClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualiserClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
