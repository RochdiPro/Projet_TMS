import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParcTransportComponent } from './parc-transport.component';

describe('ParcTransportComponent', () => {
  let component: ParcTransportComponent;
  let fixture: ComponentFixture<ParcTransportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParcTransportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParcTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
