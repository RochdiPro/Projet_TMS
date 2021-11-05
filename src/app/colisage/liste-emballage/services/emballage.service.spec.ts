import { TestBed } from '@angular/core/testing';

import { EmballageService } from './emballage.service';

describe('EmballageService', () => {
  let service: EmballageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmballageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
