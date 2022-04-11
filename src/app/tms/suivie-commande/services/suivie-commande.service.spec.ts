import { TestBed } from '@angular/core/testing';

import { SuivieCommandeService } from './suivie-commande.service';

describe('SuivieCommandeService', () => {
  let service: SuivieCommandeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuivieCommandeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
