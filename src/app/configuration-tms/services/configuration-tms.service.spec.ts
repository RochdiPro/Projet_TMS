import { TestBed } from '@angular/core/testing';

import { ConfigurationTmsService } from './configuration-tms.service';

describe('ConfigurationTmsService', () => {
  let service: ConfigurationTmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurationTmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
