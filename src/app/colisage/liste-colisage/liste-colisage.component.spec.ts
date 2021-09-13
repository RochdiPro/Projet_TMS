import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeColisageComponent } from './liste-colisage.component';

describe('ListeColisageComponent', () => {
  let component: ListeColisageComponent;
  let fixture: ComponentFixture<ListeColisageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeColisageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeColisageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
