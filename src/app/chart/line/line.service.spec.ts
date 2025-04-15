import { TestBed, waitForAsync } from '@angular/core/testing';
import { LineService } from './line.service';

describe('LineService', () => {
  let service: LineService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [LineService]
    }).compileComponents();
    service = TestBed.inject(LineService);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should notify', () => {
    let result = false;
    service.lineChartReady.subscribe(() => {
      result = true;
    });
    expect(result).toBeFalsy();
    service.setLineChartReady();
    expect(result).toBeTruthy();
  });
});
