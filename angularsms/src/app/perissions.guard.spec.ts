import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { perissionsGuard } from './perissions.guard';

describe('perissionsGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => perissionsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
