import { TestBed } from '@angular/core/testing';

import { PlanChargementService } from './plan-chargement.service';

describe('PlanChargementService', () => {
  let service: PlanChargementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanChargementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
