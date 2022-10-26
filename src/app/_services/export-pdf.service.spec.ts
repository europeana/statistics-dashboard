import { TestBed, waitForAsync } from '@angular/core/testing';
import { MockExportPDFService } from '../_mocked';
import { TableRow } from '../_models';
import { ExportPDFService } from './';

describe('ExportPDFService', () => {
  let service: ExportPDFService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ExportPDFService]
    }).compileComponents();
    service = TestBed.inject(ExportPDFService);
  }));

  it('should get the fill colour', () => {
    expect(service.getFillColour(0)).toBeTruthy();
    expect(service.getFillColour(1)).toBeFalsy();
  });

  it('should download', () => {
    const model = {
      columns: ['name', 'count', 'percent'],
      tableRows: [
        { name: 'name', count: 1, percent: 1 } as TableRow,
        { name: 'name', count: 2, percent: 2 } as TableRow
      ]
    };
    expect(
      service.download(model, MockExportPDFService.imgDataURL)
    ).toBeFalsy();
  });
});
