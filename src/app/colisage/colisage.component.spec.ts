import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColisageComponent } from './colisage.component';

describe('ColisageComponent', () => {
  let component: ColisageComponent;
  let fixture: ComponentFixture<ColisageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColisageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColisageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
