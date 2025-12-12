import { TestBed, waitForAsync } from '@angular/core/testing';
import { ExportPDFService } from './';

describe('ExportPDFService', () => {
  let service: ExportPDFService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ExportPDFService]
    }).compileComponents();
    service = TestBed.inject(ExportPDFService);
  }));

  it('should create', () => {
    expect(service).toBeTruthy();
  });
});
