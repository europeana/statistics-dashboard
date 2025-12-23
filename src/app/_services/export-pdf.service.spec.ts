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

  it('should download', () => {
    const model = {
      columns: ['series', 'name', 'count', 'percent'],
      tableRows: [
        { series: 'A', name: 'name', count: 0, percent: 0 } as TableRow,
        { series: 'A', name: 'name', count: 1, percent: 2 } as TableRow,
        { series: 'A', name: 'name', count: 2, percent: 2 } as TableRow
      ]
    };
    expect(
      service.download('Title', model, MockExportPDFService.imgDataURL)
    ).toBeFalsy();
  });
});
