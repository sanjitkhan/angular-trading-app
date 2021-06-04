import { TestBed } from '@angular/core/testing';

import { WazirxDataService } from './wazirx.data.service';

describe('WazirxDataService', () => {
  let service: WazirxDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WazirxDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
