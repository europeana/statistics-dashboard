import { TestBed, waitForAsync } from '@angular/core/testing';
import { LegendGridService } from '.';

describe('LegendGridService', () => {
  let service: LegendGridService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [LegendGridService]
    }).compileComponents();
    service = TestBed.inject(LegendGridService);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should notify', () => {
    expect(service.legendGridReady()).toBeFalsy();
    service.setLegendGridReady(true);
    expect(service.legendGridReady()).toBeTruthy();
    service.setLegendGridReady(false);
    expect(service.legendGridReady()).toBeFalsy();
  });
});
