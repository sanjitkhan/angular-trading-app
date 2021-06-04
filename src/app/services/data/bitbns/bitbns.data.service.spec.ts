import { TestBed } from '@angular/core/testing';

import { BitbnsDataService } from './bitbns.data.service';

describe('BitbnsDataService', () => {
  let service: BitbnsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BitbnsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
