import { TestBed } from '@angular/core/testing';

import { ClientServiceServiceService } from './client-service-service.service';

describe('ClientServiceServiceService', () => {
  let service: ClientServiceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientServiceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
