import { TestBed } from '@angular/core/testing';

import { ColisageService } from './colisage.service';

describe('ColisageService', () => {
  let service: ColisageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColisageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
