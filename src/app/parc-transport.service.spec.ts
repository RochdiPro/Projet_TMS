import { TestBed } from '@angular/core/testing';

import { ParcTransportService } from './parc-transport.service';

describe('ParcTransportService', () => {
  let service: ParcTransportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParcTransportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
