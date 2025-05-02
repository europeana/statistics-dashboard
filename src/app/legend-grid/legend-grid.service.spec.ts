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
    let result = false;
    service.legendGridReady.subscribe((value: boolean) => {
      result = value;
    });
    expect(result).toBeFalsy();
    service.setLegendGridReady(true);
    expect(result).toBeTruthy();
    service.setLegendGridReady(false);
    expect(result).toBeFalsy();
  });
});
