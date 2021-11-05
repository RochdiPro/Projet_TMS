import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeEmballageComponent } from './liste-emballage.component';

describe('ListeColisageComponent', () => {
  let component: ListeEmballageComponent;
  let fixture: ComponentFixture<ListeEmballageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeEmballageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeEmballageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
